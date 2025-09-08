/**
 * 🏪 SIMPLE APP STORE - MED-MNG v3.0
 * Store simplifié sans immer pour corriger les erreurs
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SimpleAppState {
  user: any;
  isAuthenticated: boolean;
  theme: 'light' | 'dark' | 'system';
  
  setUser: (user: any) => void;
  setAuthenticated: (auth: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  reset: () => void;
}

export const useSimpleAppStore = create<SimpleAppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      theme: 'system',
      
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setTheme: (theme) => set({ theme }),
      reset: () => set({ user: null, isAuthenticated: false, theme: 'system' })
    }),
    {
      name: 'simple-app-store'
    }
  )
);