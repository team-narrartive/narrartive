
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
        .maybeSingle();
      
      if (error) throw error;
      return data as Story | null;
    }
  });
};

export const useLikeStory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (storyId: string) => {
      console.log('Liking story:', storyId);
      
      // Use the database function to increment likes
      const { data, error } = await supabase.rpc('increment_story_likes', {
        story_id: storyId
      });

      if (error) {
        console.error('Error incrementing likes:', error);
        throw error;
      }

      console.log('Like increment result:', data);
      return data?.[0] || null;
    },
    onSuccess: (updatedStory) => {
      if (updatedStory) {
        console.log('Like success, invalidating queries for story:', updatedStory.id);
        
        // Invalidate and refetch all related queries
        queryClient.invalidateQueries({ queryKey: ['story', updatedStory.id] });
        queryClient.invalidateQueries({ queryKey: ['stories', 'community'] });
        queryClient.invalidateQueries({ queryKey: ['stories', 'personal'] });

        toast({
          title: "Story liked! ❤️",
          description: "Thank you for your support!"
        });
      }
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
    onSuccess: (updatedStory) => {
      if (updatedStory) {
        console.log('View increment success, invalidating queries for story:', updatedStory.id);
        
        // Invalidate and refetch all related queries
        queryClient.invalidateQueries({ queryKey: ['story', updatedStory.id] });
        queryClient.invalidateQueries({ queryKey: ['stories', 'community'] });
        queryClient.invalidateQueries({ queryKey: ['stories', 'personal'] });
      }
    },
    onError: (error: any) => {
      console.error('View increment error:', error);
      // Don't show toast for view errors as they're silent
    }
  });
};
