/**
 * Hook pour récupérer et afficher les crédits Suno restants
 * ✅ Corrigé: Appel au montage + cache localStorage + retry automatique
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { secureSunoClient } from '@/lib/secureApiClient';

const CACHE_KEY = 'suno_credits_cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedCredits {
  credits: number;
  plan: string;
  used: number;
  total: number;
  timestamp: number;
}

interface SunoCreditsState {
  credits: number;
  plan: string;
  used: number;
  total: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isFromCache: boolean;
}

export const useSunoCredits = (autoRefresh: boolean = false) => {
  const [state, setState] = useState<SunoCreditsState>(() => {
    // ✅ Initialiser avec le cache si disponible
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedCredits = JSON.parse(cached);
        const isValid = Date.now() - parsed.timestamp < CACHE_DURATION_MS;
        if (isValid) {
          return {
            credits: parsed.credits,
            plan: parsed.plan,
            used: parsed.used,
            total: parsed.total,
            loading: false,
            error: null,
            lastUpdated: new Date(parsed.timestamp),
            isFromCache: true
          };
        }
      }
    } catch {}
    
    return {
      credits: -1,
      plan: 'unknown',
      used: 0,
      total: 0,
      loading: false,
      error: null,
      lastUpdated: null,
      isFromCache: false
    };
  });

  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchCredits = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      retryCountRef.current = 0;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await secureSunoClient.getRemainingCredits();
      
      const credits = result.credits ?? (result.remaining !== undefined ? result.remaining : -1);
      const plan = result.plan ?? 'standard';
      const used = result.used ?? 0;
      const total = result.total ?? result.credits ?? 0;
      const now = new Date();
      
      // ✅ Sauvegarder en cache
      const cacheData: CachedCredits = {
        credits,
        plan,
        used,
        total,
        timestamp: now.getTime()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      setState({
        credits,
        plan,
        used,
        total,
        loading: false,
        error: null,
        lastUpdated: now,
        isFromCache: false
      });
      
      retryCountRef.current = 0;
    } catch (err) {
      console.error('[useSunoCredits] Erreur:', err);
      
      // ✅ Retry automatique avec backoff exponentiel
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = Math.pow(2, retryCountRef.current) * 1000;
        console.log(`[useSunoCredits] Retry ${retryCountRef.current}/${maxRetries} dans ${delay}ms`);
        setTimeout(() => fetchCredits(true), delay);
        return;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erreur lors de la récupération des crédits',
        isFromCache: false
      }));
    }
  }, []);

  // ✅ Appeler au montage (correction critique)
  useEffect(() => {
    // Si les données sont du cache, rafraîchir en arrière-plan
    if (state.isFromCache || state.credits < 0) {
      fetchCredits();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh optionnel (toutes les 5 minutes)
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchCredits, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchCredits]);

  const hasLowCredits = state.credits >= 0 && state.credits < 10;
  const hasNoCredits = state.credits === 0;
  const creditsUnknown = state.credits < 0;
  
  // ✅ Calcul du pourcentage utilisé
  const usagePercentage = state.total > 0 ? Math.round((state.used / state.total) * 100) : 0;

  // ✅ Invalider le cache (à appeler après une génération)
  const invalidateCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {}
    // Rafraîchir immédiatement
    fetchCredits();
  }, [fetchCredits]);

  // ✅ Rafraîchir après génération (délai pour laisser l'API se mettre à jour)
  const refreshAfterGeneration = useCallback(() => {
    setTimeout(() => {
      invalidateCache();
    }, 2000);
  }, [invalidateCache]);

  return {
    ...state,
    fetchCredits,
    refetch: fetchCredits, // ✅ Alias pour compatibilité
    hasLowCredits,
    hasNoCredits,
    creditsUnknown,
    usagePercentage,
    invalidateCache,
    refreshAfterGeneration,
    // Helper pour affichage
    displayCredits: state.credits < 0 ? '—' : state.credits.toString(),
    // ✅ Helper pour formater le temps depuis dernière mise à jour
    lastUpdatedText: state.lastUpdated 
      ? `Mis à jour ${Math.round((Date.now() - state.lastUpdated.getTime()) / 1000 / 60)} min` 
      : 'Non chargé'
  };
};
