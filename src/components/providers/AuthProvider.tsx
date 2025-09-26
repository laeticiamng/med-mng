import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updateProfile: (updates: any) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Erreur lors de la récupération de la session', {
            component: 'AuthProvider'
          });
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        logger.error('Erreur critique lors de l\'initialisation de l\'auth', {
          component: 'AuthProvider'
        });
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info(`Événement d'authentification: ${event}`, {
        component: 'AuthProvider'
      });

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Actions spécifiques selon l'événement
      switch (event) {
        case 'SIGNED_IN':
          logger.info('Utilisateur connecté avec succès', {
            component: 'AuthProvider',
            metadata: { userId: session?.user?.id, email: session?.user?.email }
          });
          break;
        case 'SIGNED_OUT':
          logger.info('Utilisateur déconnecté', {
            component: 'AuthProvider'
          });
          break;
        case 'TOKEN_REFRESHED':
          logger.debug('Token d\'authentification rafraîchi', {
            component: 'AuthProvider',
            metadata: { userId: session?.user?.id }
          });
          break;
        case 'USER_UPDATED':
          logger.info('Profil utilisateur mis à jour', {
            component: 'AuthProvider',
            metadata: { userId: session?.user?.id }
          });
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        logger.error('Erreur de connexion', {
          component: 'AuthProvider',
          action: 'signIn',
          email,
          error: result.error
        });
      } else {
        logger.info('Connexion réussie', {
          component: 'AuthProvider',
          action: 'signIn',
          userId: result.data.user?.id
        });
      }

      return result;
    } catch (error) {
      logger.error('Erreur critique lors de la connexion', {
        component: 'AuthProvider',
        action: 'signIn',
        error
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (result.error) {
        logger.error('Erreur d\'inscription', {
          component: 'AuthProvider',
          action: 'signUp',
          email,
          error: result.error
        });
      } else {
        logger.info('Inscription réussie', {
          component: 'AuthProvider',
          action: 'signUp',
          userId: result.data.user?.id
        });
      }

      return result;
    } catch (error) {
      logger.error('Erreur critique lors de l\'inscription', {
        component: 'AuthProvider',
        action: 'signUp',
        error
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const result = await supabase.auth.signOut();
      
      if (result.error) {
        logger.error('Erreur de déconnexion', {
          component: 'AuthProvider',
          action: 'signOut',
          error: result.error
        });
      } else {
        logger.info('Déconnexion réussie', {
          component: 'AuthProvider',
          action: 'signOut'
        });
      }

      return result;
    } catch (error) {
      logger.error('Erreur critique lors de la déconnexion', {
        component: 'AuthProvider',
        action: 'signOut',
        error
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (result.error) {
        logger.error('Erreur de réinitialisation de mot de passe', {
          component: 'AuthProvider',
          action: 'resetPassword',
          email,
          error: result.error
        });
      } else {
        logger.info('Email de réinitialisation envoyé', {
          component: 'AuthProvider',
          action: 'resetPassword',
          email
        });
      }

      return result;
    } catch (error) {
      logger.error('Erreur critique lors de la réinitialisation', {
        component: 'AuthProvider',
        action: 'resetPassword',
        error
      });
      return { data: null, error };
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const result = await supabase.auth.updateUser(updates);

      if (result.error) {
        logger.error('Erreur de mise à jour du profil', {
          component: 'AuthProvider',
          action: 'updateProfile',
          error: result.error
        });
      } else {
        logger.info('Profil mis à jour avec succès', {
          component: 'AuthProvider',
          action: 'updateProfile',
          userId: result.data.user?.id
        });
      }

      return result;
    } catch (error) {
      logger.error('Erreur critique lors de la mise à jour du profil', {
        component: 'AuthProvider',
        action: 'updateProfile',
        error
      });
      return { data: null, error };
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};