import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        console.log('Full session object:', session);
        console.log('User metadata:', session?.user?.user_metadata);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          console.log('User successfully signed in:', session?.user?.email);
          toast({
            title: "Welcome back!",
            description: `Signed in as ${session?.user?.email}`
          });
        }

        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Ensure complete cleanup on sign out
          setSession(null);
          setUser(null);
          toast({
            title: "Signed out",
            description: "You have been signed out successfully."
          });
        }
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session check:', session?.user?.email || 'No session');
          console.log('Initial session object:', session);
          if (session?.user) {
            console.log('User metadata from initial session:', session.user.user_metadata);
          }
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    console.log('Attempting to sign up user:', email);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      console.log('Sign up response:', { data, error });

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Sign up successful for:', email);
        toast({
          title: "Sign up successful",
          description: "Please check your email to confirm your account before signing in."
        });
      }

      return { error };
    } catch (err: any) {
      console.error('Unexpected sign up error:', err);
      const error = { message: err.message || 'An unexpected error occurred during sign up' };
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in user:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Sign in response:', { data, error });
      if (data.user) {
        console.log('Sign in user metadata:', data.user.user_metadata);
      }

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Sign in successful for:', email);
      }

      return { error };
    } catch (err: any) {
      console.error('Unexpected sign in error:', err);
      const error = { message: err.message || 'An unexpected error occurred during sign in' };
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    console.log('Attempting to sign out user');
    
    try {
      // Clear local state immediately
      setUser(null);
      setSession(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Sign out successful');
        // Force clear any remaining session data
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }
    } catch (err: any) {
      console.error('Unexpected sign out error:', err);
      // Even if there's an error, clear the local state
      setUser(null);
      setSession(null);
      toast({
        title: "Sign out failed",
        description: err.message || 'An unexpected error occurred during sign out',
        variant: "destructive"
      });
    }
  };

  const resetPassword = async (email: string) => {
    console.log('Attempting password reset for:', email);
    
    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      console.log('Password reset response:', { error });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Password reset email sent to:', email);
        toast({
          title: "Password reset email sent",
          description: "Please check your email for password reset instructions."
        });
      }

      return { error };
    } catch (err: any) {
      console.error('Unexpected password reset error:', err);
      const error = { message: err.message || 'An unexpected error occurred during password reset' };
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
