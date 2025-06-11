
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
      let query = supabase.from('stories').select('*');
      
      if (status === 'personal' && user) {
        query = query.eq('user_id', user.id);
      } else if (status === 'community') {
        query = query.eq('is_public', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
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
      // First get current like count
      const { data: story, error: fetchError } = await supabase
        .from('stories')
        .select('like_count')
        .eq('id', storyId)
        .single();

      if (fetchError) throw fetchError;

      // Increment like count
      const { error } = await supabase
        .from('stories')
        .update({ like_count: (story.like_count || 0) + 1 })
        .eq('id', storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast({
        title: "Story liked!",
        description: "Thank you for your support!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to like story",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useIncrementViews = () => {
  return useMutation({
    mutationFn: async (storyId: string) => {
      // Get current view count
      const { data: story, error: fetchError } = await supabase
        .from('stories')
        .select('view_count')
        .eq('id', storyId)
        .single();

      if (fetchError) throw fetchError;

      // Increment view count
      const { error } = await supabase
        .from('stories')
        .update({ view_count: (story.view_count || 0) + 1 })
        .eq('id', storyId);

      if (error) throw error;
    }
  });
};
