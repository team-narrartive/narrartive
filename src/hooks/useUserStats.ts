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
        .select('stories_generated, minutes_spent')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }

      // Also fetch likes_received and total_views separately for now
      const { data: likesData } = await supabase
        .from('profiles')
        .select('likes_received, total_views')
        .eq('id', user.id)
        .maybeSingle();
      
      return {
        stories_generated: profile?.stories_generated || 0,
        minutes_spent: profile?.minutes_spent || 0,
        likes_received: (likesData as any)?.likes_received || 0,
        total_views: (likesData as any)?.total_views || 0,
      };
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
};