
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
      
      let query = supabase.from('stories').select('*');
      
      if (status === 'personal' && user) {
        query = query.eq('user_id', user.id);
      } else if (status === 'community') {
        query = query.eq('is_public', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      console.log('Stories query result:', { data, error, status });
      
      if (error) {
        console.error('Error fetching stories:', error);
        throw error;
      }
      return data as Story[];
    },
    enabled: !!user
  });
};

export const useStory = (id: string) => {
  return useQuery({
    queryKey: ['story', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Story;
    }
  });
};

export const useLikeStory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (storyId: string) => {
      console.log('Liking story:', storyId);
      
      // First get the current story
      const { data: currentStory, error: fetchError } = await supabase
        .from('stories')
        .select('like_count')
        .eq('id', storyId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching story for like:', fetchError);
        throw fetchError;
      }

      if (!currentStory) {
        throw new Error('Story not found');
      }

      const currentLikeCount = currentStory.like_count || 0;
      const newLikeCount = currentLikeCount + 1;

      console.log('Updating like count from', currentLikeCount, 'to', newLikeCount);

      // Update the like count
      const { data: updatedStory, error: updateError } = await supabase
        .from('stories')
        .update({ like_count: newLikeCount })
        .eq('id', storyId)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error updating like count:', updateError);
        throw updateError;
      }

      console.log('Like update successful:', updatedStory);
      return updatedStory;
    },
    onSuccess: (updatedStory) => {
      console.log('Like success, invalidating queries for story:', updatedStory.id);
      
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['story', updatedStory.id] });
      queryClient.invalidateQueries({ queryKey: ['stories', 'community'] });
      queryClient.invalidateQueries({ queryKey: ['stories', 'personal'] });

      toast({
        title: "Story liked! ❤️",
        description: "Thank you for your support!"
      });
    },
    onError: (error: any) => {
      console.error('Like error:', error);
      toast({
        title: "Failed to like story",
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
      console.log('Incrementing views for story:', storyId);
      
      // First get the current story
      const { data: currentStory, error: fetchError } = await supabase
        .from('stories')
        .select('view_count')
        .eq('id', storyId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching story for view increment:', fetchError);
        throw fetchError;
      }

      if (!currentStory) {
        throw new Error('Story not found');
      }

      const currentViewCount = currentStory.view_count || 0;
      const newViewCount = currentViewCount + 1;

      console.log('Updating view count from', currentViewCount, 'to', newViewCount);

      // Update the view count
      const { data: updatedStory, error: updateError } = await supabase
        .from('stories')
        .update({ view_count: newViewCount })
        .eq('id', storyId)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error updating view count:', updateError);
        throw updateError;
      }

      console.log('View increment successful:', updatedStory);
      return updatedStory;
    },
    onSuccess: (updatedStory) => {
      console.log('View increment success, invalidating queries for story:', updatedStory.id);
      
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['story', updatedStory.id] });
      queryClient.invalidateQueries({ queryKey: ['stories', 'community'] });
      queryClient.invalidateQueries({ queryKey: ['stories', 'personal'] });
    },
    onError: (error: any) => {
      console.error('View increment error:', error);
      // Don't show toast for view errors as they're silent
    }
  });
};
