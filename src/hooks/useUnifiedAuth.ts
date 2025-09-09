/**
 * Hook d'authentification unifié - Consolidation des hooks auth existants
 * Combine les fonctionnalités de AuthProvider et useAuth
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { analyticsService } from '@/services/UnifiedAnalyticsService';
import { logger } from '@/lib/logger';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types';

// Types unifiés
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  subscription?: any;
  profile?: any;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshAuth: () => Promise<void>;
}

// Context pour le provider pattern
const UnifiedAuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook principal d'authentification unifié
 * Peut être utilisé standalone ou avec le provider
 */
export function useUnifiedAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    subscription: null,
    profile: null
  });

  // Conversion Supabase User vers notre type User
  const convertSupabaseUser = useCallback((supabaseUser: SupabaseUser, profile?: any): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profile?.full_name || profile?.display_name || supabaseUser.email?.split('@')[0] || 'Utilisateur',
      role: profile?.role || 'user',
      subscription_status: profile?.subscription_status || 'free',
      avatar_url: profile?.avatar_url,
      preferences: {
        theme: profile?.preferences?.theme || 'system',
        language: profile?.preferences?.language || 'fr',
        notifications: profile?.preferences?.notifications ?? true,
        auto_play: profile?.preferences?.auto_play ?? false,
        volume: profile?.preferences?.volume ?? 0.8
      },
      created_at: supabaseUser.created_at,
      updated_at: profile?.updated_at
    };
  }, []);

  // Récupérer le profil utilisateur depuis Supabase
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erreur récupération profil', { error });
        return null;
      }

      return profile;
    } catch (error) {
      logger.error('Erreur fetchUserProfile', { error });
      return null;
    }
  }, []);

  // Login avec email/password
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        const convertedUser = convertSupabaseUser(data.user, profile);
        
        setState({
          user: convertedUser,
          isLoading: false,
          isAuthenticated: true,
          error: null,
          profile
        });

        // Analytics
        analyticsService.trackUserAction('auth', 'login_success', { email }, data.user.id);
        
        logger.info('Connexion réussie', {
          component: 'useUnifiedAuth',
          action: 'login',
          metadata: { userId: data.user.id }
        });
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      // Analytics
      analyticsService.trackError(error as Error, { action: 'login', email });

      logger.error('Erreur de connexion', {
        component: 'useUnifiedAuth',
        action: 'login',
        metadata: { email, error: errorMessage }
      });

      return { success: false, error: errorMessage };
    }
  }, [convertSupabaseUser, fetchUserProfile]);

  // Signup avec email/password
  const signup = useCallback(async (email: string, password: string, name?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            display_name: name
          }
        }
      });

      if (error) throw error;

      // Analytics
      if (data.user) {
        analyticsService.trackUserAction('auth', 'signup_success', { email }, data.user.id);
      }

      logger.info('Inscription réussie', {
        component: 'useUnifiedAuth',
        action: 'signup',
        metadata: { email, name }
      });

      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'inscription';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      // Analytics
      analyticsService.trackError(error as Error, { action: 'signup', email });

      logger.error('Erreur d\'inscription', {
        component: 'useUnifiedAuth',
        action: 'signup',
        metadata: { email, error: errorMessage }
      });

      return { success: false, error: errorMessage };
    }
  }, []);

  // Login avec Google
  const signInWithGoogle = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur connexion Google';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        subscription: null,
        profile: null
      });

      // Analytics
      analyticsService.trackUserAction('auth', 'logout', {});

      logger.info('Déconnexion réussie', {
        component: 'useUnifiedAuth',
        action: 'logout'
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de déconnexion';
      
      logger.error('Erreur de déconnexion', {
        component: 'useUnifiedAuth',
        action: 'logout',
        metadata: { error: errorMessage }
      });

      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur reset password';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!state.user) return { success: false, error: 'Utilisateur non connecté' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.name,
          display_name: data.name,
          avatar_url: data.avatar_url,
          preferences: data.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id);

      if (error) throw error;

      // Mettre à jour l'état local
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } : null
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur mise à jour profil';
      return { success: false, error: errorMessage };
    }
  }, [state.user]);

  // Refresh auth state
  const refreshAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const profile = await fetchUserProfile(user.id);
        const convertedUser = convertSupabaseUser(user, profile);
        
        setState({
          user: convertedUser,
          isLoading: false,
          isAuthenticated: true,
          error: null,
          profile
        });
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
          subscription: null,
          profile: null
        });
      }
    } catch (error) {
      logger.error('Erreur refresh auth', { error });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [convertSupabaseUser, fetchUserProfile]);

  // Initialisation et écoute des changements d'auth
  useEffect(() => {
    // Check initial auth state
    refreshAuth();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.debug('Auth state changed', { event, hasSession: !!session });
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          const convertedUser = convertSupabaseUser(session.user, profile);
          
          setState({
            user: convertedUser,
            isLoading: false,
            isAuthenticated: true,
            error: null,
            profile
          });
        } else {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
            subscription: null,
            profile: null
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [convertSupabaseUser, fetchUserProfile, refreshAuth]);

  return {
    ...state,
    login,
    logout,
    signup,
    signInWithGoogle,
    resetPassword,
    updateProfile,
    refreshAuth
  };
}

/**
 * Provider component pour l'authentification unifiée
 */
export function UnifiedAuthProvider({ children }: { children: React.ReactNode }) {
  const authValue = useUnifiedAuth();
  
  return (
    <UnifiedAuthContext.Provider value={authValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

/**
 * Hook pour utiliser le context d'authentification
 * Compatible avec l'ancien useAuth de AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(UnifiedAuthContext);
  
  // Si pas de context, utiliser le hook standalone
  if (!context) {
    // Retourner le hook unifié directement pour compatibilité
    return useUnifiedAuth();
  }
  
  return context;
}

// Export par défaut pour compatibilité
export default useUnifiedAuth;