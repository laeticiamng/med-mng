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
          logger.error('Erreur lors de la récupération de la session');
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        logger.error('Erreur critique lors de l\'initialisation de l\'auth');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info(`Événement d'authentification: ${event}`);

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Actions spécifiques selon l'événement
      switch (event) {
        case 'SIGNED_IN':
          logger.info('Utilisateur connecté avec succès');
          break;
        case 'SIGNED_OUT':
          logger.info('Utilisateur déconnecté');
          break;
        case 'TOKEN_REFRESHED':
          logger.debug('Token d\'authentification rafraîchi');
          break;
        case 'USER_UPDATED':
          logger.info('Profil utilisateur mis à jour');
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
        logger.error('Erreur de connexion');
      } else {
        logger.info('Connexion réussie');
      }

      return result;
    } catch (error) {
      logger.error('Erreur critique lors de la connexion');
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
        logger.error('Erreur d\'inscription');
      } else {
        logger.info('Inscription réussie');
      }

      return result;
    } catch (error) {
      logger.error('Erreur critique lors de l\'inscription');
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
        logger.error('Erreur de déconnexion');
      } else {
        logger.info('Déconnexion réussie');
      }

      return result;
    } catch (error) {
      logger.error('Erreur critique lors de la déconnexion');
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
        logger.error('Erreur de réinitialisation de mot de passe');
      } else {
        logger.info('Email de réinitialisation envoyé');
      }

      return result;
    } catch (error) {
      logger.error('Erreur critique lors de la réinitialisation');
      return { data: null, error };
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const result = await supabase.auth.updateUser(updates);

      if (result.error) {
        logger.error('Erreur de mise à jour du profil');
      } else {
        logger.info('Profil mis à jour avec succès');
      }

      return result;
    } catch (error) {
      logger.error('Erreur critique lors de la mise à jour du profil');
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