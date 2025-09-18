import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { isTestEnvironment } from '@/utils/environment';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithFacebook: () => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { sendWelcomeEmail } = useEmailNotifications();
  const testEnvironment = isTestEnvironment();

  const testUser = useMemo<User>(() => ({
    id: 'test-user-id',
    app_metadata: { provider: 'cypress', providers: ['cypress'] },
    user_metadata: { name: 'QA Tester' },
    aud: 'authenticated',
    confirmation_sent_at: null,
    confirmed_at: null,
    created_at: new Date().toISOString(),
    email: 'qa.tester@med-mng.test',
    email_confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    phone: null,
    phone_confirmed_at: null,
    role: 'authenticated',
    updated_at: new Date().toISOString(),
    factors: [],
    identities: [],
    invited_at: null,
    recovery_sent_at: null,
  } as unknown as User), []);

  useEffect(() => {
    if (testEnvironment) {
      setUser(testUser);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, session?.user?.email);
        
        setUser(session?.user ?? null);
        setLoading(false);

        // Send welcome email for new users - check if user was just created
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this is a new user by looking at created_at timestamp
          const userCreatedAt = new Date(session.user.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - userCreatedAt.getTime();
          const isNewUser = timeDiff < 60000; // User created within last minute
          
          if (isNewUser) {
            const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || '';
            console.log('👤 Nouvel utilisateur inscrit, envoi email de bienvenue...');
            
            // Delay to allow profile creation trigger to complete
            setTimeout(async () => {
              await sendWelcomeEmail(session.user.email!, name);
            }, 2000);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [sendWelcomeEmail, testEnvironment, testUser]);

  const signIn = async (email: string, password: string) => {
    if (testEnvironment) {
      setUser(testUser);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (testEnvironment) {
      setUser(testUser);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/med-mng/library`,
        data: {
          name,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    if (testEnvironment) {
      setUser(null);
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear user state immediately
      setUser(null);
      setLoading(false);
      
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (testEnvironment) {
      setUser(testUser);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/med-mng/library`,
      },
    });
    return { error };
  };

  const signInWithFacebook = async () => {
    if (testEnvironment) {
      setUser(testUser);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/med-mng/library`,
      },
    });
    return { error };
  };

  const signInWithApple = async () => {
    if (testEnvironment) {
      setUser(testUser);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/med-mng/library`,
      },
    });
    return { error };
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
