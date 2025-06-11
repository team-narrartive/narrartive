
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
      
      // Get current story data
      const { data: story, error: fetchError } = await supabase
        .from('stories')
        .select('like_count')
        .eq('id', storyId)
        .single();

      if (fetchError) throw fetchError;

      const newLikeCount = (story.like_count || 0) + 1;

      const { data: updatedData, error: updateError } = await supabase
        .from('stories')
        .update({ like_count: newLikeCount })
        .eq('id', storyId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedData;
    },
    onSuccess: (updatedStory) => {
      console.log('Like success:', updatedStory);
      
      // Update all relevant queries with the new data
      queryClient.setQueryData(['story', updatedStory.id], updatedStory);
      
      // Update stories lists
      queryClient.setQueryData(['stories', 'community'], (oldData: Story[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(story => 
          story.id === updatedStory.id ? updatedStory : story
        );
      });

      queryClient.setQueryData(['stories', 'personal'], (oldData: Story[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(story => 
          story.id === updatedStory.id ? updatedStory : story
        );
      });

      toast({
        title: "Story liked! ❤️",
        description: "Thank you for your support!"
      });
    },
    onError: (error: any) => {
      console.error('Like error:', error);
      toast({
        title: "Failed to like story",
        description: error.message,
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
      
      // Get current story data
      const { data: story, error: fetchError } = await supabase
        .from('stories')
        .select('view_count')
        .eq('id', storyId)
        .single();

      if (fetchError) throw fetchError;

      const newViewCount = (story.view_count || 0) + 1;

      const { data: updatedData, error: updateError } = await supabase
        .from('stories')
        .update({ view_count: newViewCount })
        .eq('id', storyId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedData;
    },
    onSuccess: (updatedStory) => {
      console.log('View increment success:', updatedStory);
      
      // Update all relevant queries with the new data
      queryClient.setQueryData(['story', updatedStory.id], updatedStory);
      
      // Update stories lists
      queryClient.setQueryData(['stories', 'community'], (oldData: Story[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(story => 
          story.id === updatedStory.id ? updatedStory : story
        );
      });

      queryClient.setQueryData(['stories', 'personal'], (oldData: Story[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(story => 
          story.id === updatedStory.id ? updatedStory : story
        );
      });
    },
    onError: (error: any) => {
      console.error('View increment error:', error);
    }
  });
};
