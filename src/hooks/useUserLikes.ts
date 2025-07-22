import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const useUserLikes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user's liked stories from the database
  const {
    data: likedStoryIds = [],
    isLoading
  } = useQuery({
    queryKey: ['user-likes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_story_likes')
        .select('story_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user likes:', error);
        throw error;
      }
      
      return data.map(like => like.story_id);
    },
    enabled: !!user,
    staleTime: 30000,
  });

  // Check if a story is liked by the current user
  const isLiked = (storyId: string) => {
    return likedStoryIds.includes(storyId);
  };

  // Like/unlike mutation
  const likeStoryMutation = useMutation({
    mutationFn: async ({ storyId, shouldLike }: { storyId: string; shouldLike: boolean }) => {
      if (!user) throw new Error('User not authenticated');
      
      if (shouldLike) {
        // Call increment function for liking
        const { data, error } = await supabase.rpc('increment_story_likes', {
          story_id: storyId
        });

        if (error) {
          console.error('Error incrementing likes:', error);
          throw error;
        }

        return { story: data?.[0] || null, action: 'liked' as const };
      } else {
        // Call decrement function for unliking
        const { data, error } = await supabase.rpc('decrement_story_likes', {
          story_id: storyId
        });

        if (error) {
          console.error('Error decrementing likes:', error);
          throw error;
        }

        return { story: data?.[0] || null, action: 'unliked' as const };
      }
    },
    onSuccess: ({ story, action }, { storyId, shouldLike }) => {
      // Update user likes cache
      queryClient.setQueryData(
        ['user-likes', user?.id],
        (oldLikes: string[] | undefined) => {
          if (!oldLikes) return shouldLike ? [storyId] : [];
          
          if (shouldLike) {
            return oldLikes.includes(storyId) ? oldLikes : [...oldLikes, storyId];
          } else {
            return oldLikes.filter(id => id !== storyId);
          }
        }
      );

      // Update story data in cache if available
      if (story) {
        queryClient.setQueryData(['story', story.id], story);
        
        // Update stories in all lists
        queryClient.setQueriesData(
          { queryKey: ['stories'] },
          (oldData: any[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(s => s.id === story.id ? story : s);
          }
        );
      }

      toast({
        title: action === 'liked' ? "Story liked!" : "Story unliked",
        description: action === 'liked' ? "Thank you for your support!" : "Like removed"
      });
    },
    onError: (error: any) => {
      console.error('Like/unlike error:', error);
      toast({
        title: "Failed to update like",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  return {
    isLiked,
    isLoading,
    likeStory: likeStoryMutation.mutateAsync,
    isLiking: likeStoryMutation.isPending
  };
};