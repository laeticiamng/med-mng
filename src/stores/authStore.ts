/**
 * 🔐 AUTH STORE - MED-MNG v3.0 PREMIUM
 * Store d'authentification centralisé avec Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setAuth: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State initial
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      // Actions
      setAuth: (user, session) => {
        set({
          user,
          session,
          isAuthenticated: !!user,
          error: null
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            get().setAuth(data.user, data.session);
            set({ isLoading: false });
            return { success: true };
          }

          return { success: false, error: 'Erreur de connexion' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      signUp: async (email, password, fullName) => {
        set({ isLoading: true, error: null });
        
        try {
          const redirectUrl = `${window.location.origin}/med-mng/dashboard`;
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectUrl,
              data: {
                full_name: fullName,
              }
            }
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            get().setAuth(data.user, data.session);
            set({ isLoading: false });
            return { success: true };
          }

          return { success: false, error: 'Erreur d\'inscription' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        
        try {
          await supabase.auth.signOut();
          get().setAuth(null, null);
        } catch (error) {
          // Même en cas d'erreur, on déconnecte localement
          get().setAuth(null, null);
        } finally {
          set({ isLoading: false });
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        
        try {
          // Configuration du listener d'auth
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
              get().setAuth(session?.user ?? null, session);
              set({ isLoading: false });
            }
          );

          // Vérification de la session existante
          const { data: { session } } = await supabase.auth.getSession();
          get().setAuth(session?.user ?? null, session);
          
          set({ isLoading: false });
          
          // Retourner via une Promise résolue
          return Promise.resolve();
        } catch (error) {
          set({ error: 'Erreur d\'initialisation', isLoading: false });
          return Promise.resolve();
        }
      },
    }),
    {
      name: 'med-mng-auth',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);