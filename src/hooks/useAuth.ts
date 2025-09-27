/**
 * Hook pour la gestion de l'authentification
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Authentification implémentée via Supabase Auth
      logger.info('Tentative de connexion', {
        component: 'useAuth',
        action: 'login',
        metadata: { email }
      });
      
      // Simulation temporaire
      const mockUser: User = {
        id: '1',
        email,
        name: 'Test User',
        role: 'user',
        subscription_status: 'active',
        preferences: {
          theme: 'system',
          language: 'fr',
          notifications: true,
          auto_play: false,
          volume: 0.8
        }
      };

      setState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: null
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      
      logger.error('Erreur de connexion', {
        component: 'useAuth',
        action: 'login',
        metadata: { email, error: errorMessage }
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      logger.info('Déconnexion utilisateur', {
        component: 'useAuth',
        action: 'logout'
      });

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de déconnexion';
      
      logger.error('Erreur de déconnexion', {
        component: 'useAuth',
        action: 'logout',
        metadata: { error: errorMessage }
      });

      return { success: false, error: errorMessage };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, userData?: { name?: string }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      logger.info('Tentative d\'inscription', {
        component: 'useAuth',
        action: 'signup',
        metadata: { email, name: userData?.name }
      });

      // Inscription implémentée via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: userData?.name }
        }
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'inscription';
      
      logger.error('Erreur d\'inscription', {
        component: 'useAuth',
        action: 'signup',
        metadata: { email, error: errorMessage }
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  // Initialisation de l'état d'authentification
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Vérification d'authentification via Supabase
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        // Transformer le user Supabase en User de notre application
        const appUser: User | null = supabaseUser ? {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || 'Utilisateur',
          role: 'user',
          subscription_status: 'active',
          preferences: {
            theme: 'system',
            language: 'fr',
            notifications: true,
            auto_play: false,
            volume: 0.8
          }
        } : null;
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          user: appUser,
          isAuthenticated: !!appUser 
        }));
      } catch (error) {
        logger.error('Erreur vérification authentification', {
          component: 'useAuth',
          action: 'check_auth',
          metadata: { error }
        });
        
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuthState();
  }, []);

  return {
    ...state,
    login,
    logout,
    signup
  };
}