import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Story = Tables<'stories'>;

export const useStories = (status?: 'personal' | 'community') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['stories', status, user?.id],
    queryFn: async () => {
      console.log('Fetching stories with status:', status, 'user:', user?.id);
      
      let query = supabase.from('stories').select(`
        id,
        title,
        description,
        story_content,
        main_image,
        additional_images,
        view_count,
        like_count,
        is_public,
        category,
        created_at,
        updated_at,
        user_id,
        profiles:user_id (
          id,
          first_name,
          last_name,
          display_name
        )
      `);
      
      if (status === 'personal' && user) {
        query = query.eq('user_id', user.id);
      } else if (status === 'community') {
        query = query.eq('is_public', true);
      }
      
      // Add limit to prevent timeout on large datasets
      query = query.order('created_at', { ascending: false }).limit(50);
      
      const { data, error } = await query;
      
      console.log('Stories query result:', { data, error, status, count: data?.length });
      
      if (error) {
        console.error('Error fetching stories:', error);
        throw new Error(`Failed to fetch stories: ${error.message}`);
      }
      return data as any[];
    },
    enabled: !!user,
    staleTime: 30000, // Keep data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useStory = (id: string) => {
  return useQuery({
    queryKey: ['story', id],
    queryFn: async () => {
      console.log('Fetching single story:', id);
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching story:', error);
        throw new Error(`Failed to fetch story: ${error.message}`);
      }
      console.log('Single story result:', data);
      return data as Story | null;
    },
    staleTime: 30000,
    enabled: !!id,
    retry: 2,
  });
};

export const useLikeStory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ storyId, shouldLike }: { storyId: string; shouldLike: boolean }) => {
      console.log('useLikeStory mutation:', storyId, 'shouldLike:', shouldLike);
      
      if (shouldLike) {
        // Call increment function for liking
        const { data, error } = await supabase.rpc('increment_story_likes', {
          p_story_id: storyId
        });

        if (error) {
          console.error('Error incrementing likes:', error);
          throw error;
        }

        console.log('Like increment result:', data);
        return { story: data?.[0] || null, action: 'liked' };
      } else {
        // Call decrement function for unliking
        const { data, error } = await supabase.rpc('decrement_story_likes', {
          p_story_id: storyId
        });

        if (error) {
          console.error('Error decrementing likes:', error);
          throw error;
        }

        console.log('Like decrement result:', data);
        return { story: data?.[0] || null, action: 'unliked' };
      }
    },
    onSuccess: ({ story, action }, { storyId }) => {
      console.log('useLikeStory onSuccess:', { story, action, storyId });
      
      if (story) {
        console.log('Updating cache for story:', story.id, 'new like count:', story.like_count);
        
        // Update the individual story query
        queryClient.setQueryData(['story', story.id], story);
        
        // Update stories in all lists by modifying each cached query
        queryClient.setQueriesData(
          { queryKey: ['stories'] },
          (oldData: Story[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(s => s.id === story.id ? story : s);
          }
        );

        toast({
          title: action === 'liked' ? "Story liked! ❤️" : "Story unliked",
          description: action === 'liked' ? "Thank you for your support!" : "Like removed"
        });
      } else {
        // If no story returned, force refetch to get updated data
        queryClient.invalidateQueries({ queryKey: ['stories'] });
        queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      }
    },
    onError: (error: any) => {
      console.error('useLikeStory error:', error);
      toast({
        title: "Failed to update like",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });
};

export const useIncrementViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      console.log('useIncrementViews mutation for story:', storyId);
      
      // Use the database function to increment views
      const { data, error } = await supabase.rpc('increment_story_views', {
        story_id: storyId
      });

      if (error) {
        console.error('Error incrementing views:', error);
        throw error;
      }

      console.log('View increment result:', data);
      return data?.[0] || null;
    },
    onSuccess: (updatedStory, storyId) => {
      console.log('useIncrementViews onSuccess:', updatedStory);
      
      if (updatedStory) {
        console.log('Updating cache for story views:', updatedStory.id, 'new view count:', updatedStory.view_count);
        
        // Update the individual story query
        queryClient.setQueryData(['story', updatedStory.id], updatedStory);
        
        // Update stories in all lists
        queryClient.setQueriesData(
          { queryKey: ['stories'] },
          (oldData: Story[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(s => s.id === updatedStory.id ? updatedStory : s);
          }
        );
      } else {
        // Force refetch if no data returned
        queryClient.invalidateQueries({ queryKey: ['stories'] });
        queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      }
    },
    onError: (error: any) => {
      console.error('useIncrementViews error:', error);
      // Don't show toast for view errors as they're silent
    }
  });
};
