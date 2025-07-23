import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserLikes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: likedStoryIds = [], isLoading } = useQuery({
    queryKey: ['user-likes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Use type assertion to bypass TypeScript errors for missing table types
      const { data, error } = await (supabase as any).from('user_story_likes').select('story_id').eq('user_id', user.id);
      if (error) throw error;
      return data?.map((like: any) => like.story_id) || [];
    },
    enabled: !!user,
  });

  const isLiked = (storyId: string) => likedStoryIds.includes(storyId);

  const likeStoryMutation = useMutation({
    mutationFn: async ({ storyId, shouldLike }: { storyId: string; shouldLike: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      const rpc = shouldLike ? 'increment_story_likes' : 'decrement_story_likes';
      const { data, error } = await (supabase as any).rpc(rpc, { p_story_id: storyId });
      if (error) throw error;
      return { story: data?.[0] || null, action: shouldLike ? 'liked' : 'unliked' };
    },
    onMutate: async ({ storyId, shouldLike }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-likes', user?.id] });
      await queryClient.cancelQueries({ queryKey: ['stories'] });
      
      // Snapshot the previous values for rollback
      const previousLikes = queryClient.getQueryData(['user-likes', user?.id]);
      const previousStories = queryClient.getQueriesData({ queryKey: ['stories'] });
      
      // Optimistically update likes
      queryClient.setQueryData(['user-likes', user?.id], (old: string[] = []) => 
        shouldLike ? [...old, storyId] : old.filter(id => id !== storyId)
      );
      
      // Optimistically update story like counts in all story caches
      queryClient.setQueriesData({ queryKey: ['stories'] }, (old: any[] = []) => {
        if (!old) return old;
        return old.map(s => {
          if (s.id === storyId) {
            return {
              ...s,
              like_count: Math.max((s.like_count || 0) + (shouldLike ? 1 : -1), 0)
            };
          }
          return s;
        });
      });
      
      return { previousLikes, previousStories };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousLikes) {
        queryClient.setQueryData(['user-likes', user?.id], context.previousLikes);
      }
      if (context?.previousStories) {
        context.previousStories.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Like update failed:', err);
    },
    onSuccess: ({ story }, { storyId }) => {
      // Update with server data if available
      if (story) {
        queryClient.setQueryData(['story', storyId], story);
        queryClient.setQueriesData({ queryKey: ['stories'] }, (old: any[] = []) => {
          if (!old) return old;
          return old.map(s => s.id === storyId ? story : s);
        });
      }
    },
  });

  return { isLiked, isLoading, likeStory: likeStoryMutation.mutateAsync, isLiking: likeStoryMutation.isPending };
};