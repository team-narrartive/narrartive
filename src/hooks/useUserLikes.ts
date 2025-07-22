import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const useUserLikes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: likedStoryIds = [], isLoading } = useQuery({
    queryKey: ['user-likes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('user_story_likes').select('story_id').eq('user_id', user.id);
      if (error) throw error;
      return data.map(like => like.story_id);
    },
    enabled: !!user,
  });

  const isLiked = (storyId: string) => likedStoryIds.includes(storyId);

  const likeStoryMutation = useMutation({
    mutationFn: async ({ storyId, shouldLike }: { storyId: string; shouldLike: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      const rpc = shouldLike ? 'increment_story_likes' : 'decrement_story_likes';
      const { data, error } = await supabase.rpc(rpc, { p_story_id: storyId });
      if (error) throw error;
      return { story: data?.[0], action: shouldLike ? 'liked' : 'unliked' };
    },
    onSuccess: ({ story, action }, { storyId, shouldLike }) => {
      // Update local likes cache
      queryClient.setQueryData(['user-likes', user?.id], (old: string[] = []) => 
        shouldLike ? [...old, storyId] : old.filter(id => id !== storyId)
      );
      // Update story cache
      if (story) queryClient.setQueryData(['story', storyId], story);
      // Update stories lists
      queryClient.setQueriesData({ queryKey: ['stories'] }, (old: any[] = []) => 
        old.map(s => s.id === storyId ? story : s)
      );
      toast({ title: action === 'liked' ? 'Liked!' : 'Unliked' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update like', description: error.message, variant: 'destructive' });
    },
  });

  return { isLiked, isLoading, likeStory: likeStoryMutation.mutateAsync, isLiking: likeStoryMutation.isPending };
};