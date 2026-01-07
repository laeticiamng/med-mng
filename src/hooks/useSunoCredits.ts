/**
 * Hook pour récupérer et afficher les crédits Suno restants
 */

import { useState, useEffect, useCallback } from 'react';
import { secureSunoClient } from '@/lib/secureApiClient';

interface SunoCreditsState {
  credits: number;
  plan: string;
  used: number;
  total: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useSunoCredits = (autoRefresh: boolean = false) => {
  const [state, setState] = useState<SunoCreditsState>({
    credits: -1,
    plan: 'unknown',
    used: 0,
    total: 0,
    loading: false,
    error: null,
    lastUpdated: null
  });

  const fetchCredits = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await secureSunoClient.getRemainingCredits();
      
      setState({
        credits: result.credits ?? -1,
        plan: result.plan ?? 'unknown',
        used: 0, // L'API ne retourne pas toujours ces infos
        total: 0,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (err) {
      console.error('[useSunoCredits] Erreur:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erreur lors de la récupération des crédits'
      }));
    }
  }, []);

  // Auto-refresh optionnel (toutes les 5 minutes)
  useEffect(() => {
    if (autoRefresh) {
      fetchCredits();
      const interval = setInterval(fetchCredits, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchCredits]);

  const hasLowCredits = state.credits >= 0 && state.credits < 10;
  const hasNoCredits = state.credits === 0;
  const creditsUnknown = state.credits < 0;

  return {
    ...state,
    fetchCredits,
    hasLowCredits,
    hasNoCredits,
    creditsUnknown,
    // Helper pour affichage
    displayCredits: state.credits < 0 ? '—' : state.credits.toString()
  };
};
