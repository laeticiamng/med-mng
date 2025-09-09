/**
 * Hook unifié d'authentification
 * Interface unique pour toute l'application
 */

import { useState, useEffect } from 'react';
import { authService, type AuthState, type LoginCredentials, type SignupCredentials } from '@/services/core/AuthService';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials) => {
    return await authService.login(credentials);
  };

  const signup = async (credentials: SignupCredentials) => {
    return await authService.signup(credentials);
  };

  const logout = async () => {
    return await authService.logout();
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  return {
    // État
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    
    // État dérivé
    isAuthenticated: authService.isAuthenticated(),
    userId: authService.getUserId(),
    userEmail: authService.getUserEmail(),
    
    // Actions
    login,
    signup,
    logout,
    resetPassword,
    
    // Utilitaires
    hasRole: authService.hasRole.bind(authService),
  };
};