
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session check:', session?.user?.email || 'No session');
          setSession(session);
          if (session?.user) {
            await fetchUserWithProfile(session.user);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          await fetchUserWithProfile(session.user);
        } else {
          setUser(null);
        }
        
        setLoading(false);

        if (event === 'SIGNED_IN') {
          console.log('User successfully signed in:', session?.user?.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserWithProfile = async (authUser: User) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('minutes_spent, stories_generated, likes_received, first_name, last_name, email')
        .eq('id', authUser.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        setUser(authUser);
        return;
      }

      if (profileData) {
        const enhancedUser = {
          ...authUser,
          user_metadata: {
            ...authUser.user_metadata,
            minutes_spent: profileData.minutes_spent || 0,
            stories_generated: profileData.stories_generated || 0,
            likes_received: profileData.likes_received || 0,
            first_name: profileData.first_name || authUser.user_metadata?.first_name,
            last_name: profileData.last_name || authUser.user_metadata?.last_name
          }
        };
        setUser(enhancedUser);
      } else {
        setUser(authUser);
      }
    } catch (error) {
      console.error('Error in fetchUserWithProfile:', error);
      setUser(authUser);
    }
  };

  const signOut = async () => {
    console.log('Starting sign out process');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      console.log('Sign out successful');
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signOut,
  };
};
