import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('stories_generated, minutes_spent, likes_received, total_views')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }
      
      return {
        stories_generated: profile?.stories_generated || 0,
        minutes_spent: profile?.minutes_spent || 0,
        likes_received: profile?.likes_received || 0,
        total_views: profile?.total_views || 0,
      };
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
};