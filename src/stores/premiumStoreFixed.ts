/**
 * 🏪 PREMIUM STORE - MED-MNG v3.0 FIXED
 * Store global premium avec imports corrigés
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { logger } from '@/lib/logger';

// Interface simplifiée pour corriger rapidement
interface PremiumStoreSimple {
  isAuthenticated: boolean;
  user: any;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
}

export const usePremiumStore = create<PremiumStoreSimple>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      
      signIn: async (email: string, password: string) => {
        try {
          // Simulation auth simple
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ 
            isAuthenticated: true,
            user: { id: '1', email, name: 'Test User' }
          });
          
          return { success: true };
        } catch (error) {
          return { success: false, error: 'Erreur de connexion' };
        }
      },
      
      signOut: () => {
        set({ isAuthenticated: false, user: null });
      }
    }),
    {
      name: 'premium-store',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user 
      })
    }
  )
);