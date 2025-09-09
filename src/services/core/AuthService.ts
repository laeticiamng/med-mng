/**
 * Service centralisé d'authentification
 * Gère toute la logique métier auth de façon unifiée
 */

import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  data?: { user: User; session: Session };
}

class AuthService {
  private static instance: AuthService;
  private listeners: Array<(state: AuthState) => void> = [];
  private currentState: AuthState = {
    user: null,
    session: null,
    loading: true,
    error: null,
  };

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeAuth() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        this.updateState({ 
          user: null, 
          session: null, 
          loading: false, 
          error: error.message 
        });
        return;
      }

      this.updateState({ 
        user: session?.user || null, 
        session: session || null, 
        loading: false, 
        error: null 
      });

      // Écouter les changements d'auth
      supabase.auth.onAuthStateChange((event, session) => {
        this.updateState({ 
          user: session?.user || null, 
          session: session || null, 
          loading: false, 
          error: null 
        });

        // Logs de sécurité
        console.info('🔐 Auth Event:', { event, userId: session?.user?.id });
      });

    } catch (error) {
      this.updateState({ 
        user: null, 
        session: null, 
        loading: false, 
        error: 'Erreur initialisation authentification' 
      });
    }
  }

  private updateState(newState: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.listeners.forEach(listener => listener(this.currentState));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    listener(this.currentState); // État initial
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): AuthState {
    return this.currentState;
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      this.updateState({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (error) {
        const errorMessage = this.getReadableError(error);
        this.updateState({ loading: false, error: errorMessage });
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur MED-MNG !",
      });

      return { success: true, data };

    } catch (error) {
      const errorMessage = "Erreur de connexion inattendue";
      this.updateState({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  async signup(credentials: SignupCredentials): Promise<AuthResult> {
    try {
      // Validation côté client
      if (credentials.password !== credentials.confirmPassword) {
        const error = "Les mots de passe ne correspondent pas";
        toast({
          variant: "destructive",
          title: "Erreur validation",
          description: error,
        });
        return { success: false, error };
      }

      if (credentials.password.length < 8) {
        const error = "Le mot de passe doit contenir au moins 8 caractères";
        toast({
          variant: "destructive",
          title: "Mot de passe faible",
          description: error,
        });
        return { success: false, error };
      }

      this.updateState({ loading: true, error: null });

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName?.trim(),
            last_name: credentials.lastName?.trim(),
          }
        }
      });

      if (error) {
        const errorMessage = this.getReadableError(error);
        this.updateState({ loading: false, error: errorMessage });
        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte",
      });

      return { success: true, data };

    } catch (error) {
      const errorMessage = "Erreur d'inscription inattendue";
      this.updateState({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  async logout(): Promise<AuthResult> {
    try {
      this.updateState({ loading: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        const errorMessage = this.getReadableError(error);
        this.updateState({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
      }

      toast({
        title: "Déconnexion",
        description: "À bientôt sur MED-MNG !",
      });

      return { success: true };

    } catch (error) {
      const errorMessage = "Erreur de déconnexion";
      this.updateState({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (error) {
        const errorMessage = this.getReadableError(error);
        toast({
          variant: "destructive",
          title: "Erreur réinitialisation",
          description: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte email pour réinitialiser votre mot de passe",
      });

      return { success: true };

    } catch (error) {
      const errorMessage = "Erreur lors de la réinitialisation";
      return { success: false, error: errorMessage };
    }
  }

  private getReadableError(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Email ou mot de passe incorrect';
      case 'Email not confirmed':
        return 'Veuillez confirmer votre email avant de vous connecter';
      case 'User already registered':
        return 'Un compte existe déjà avec cet email';
      case 'Password should be at least 6 characters':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'Unable to validate email address: invalid format':
        return 'Format d\'email invalide';
      case 'Signup is disabled':
        return 'Les inscriptions sont temporairement désactivées';
      case 'Too many requests':
        return 'Trop de tentatives, réessayez dans quelques minutes';
      default:
        return error.message || 'Une erreur inattendue s\'est produite';
    }
  }

  // Méthodes utilitaires
  isAuthenticated(): boolean {
    return !!this.currentState.user;
  }

  getCurrentUser(): User | null {
    return this.currentState.user;
  }

  getCurrentSession(): Session | null {
    return this.currentState.session;
  }

  getUserId(): string | null {
    return this.currentState.user?.id || null;
  }

  getUserEmail(): string | null {
    return this.currentState.user?.email || null;
  }

  hasRole(role: string): boolean {
    return this.currentState.user?.app_metadata?.role === role;
  }
}

export const authService = AuthService.getInstance();
export default authService;