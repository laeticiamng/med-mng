/**
 * Hook pour tracker les analytics des items EDN
 * Enregistre les consultations, recherches et temps passé
 */

import { useEffect, useRef, useCallback } from 'react';
import { 
  trackItemView, 
  trackSearch, 
  getTopViewedItems,
  getPopularSearches,
  getRecentSearches,
  getItemStats 
} from '@/lib/indexedDB';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook pour tracker la consultation d'un item
 */
export function useTrackItemView(itemCode: string | null) {
  const startTimeRef = useRef<number>(0);
  const trackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!itemCode) {
      trackedRef.current = false;
      return;
    }

    // Démarrer le chrono
    startTimeRef.current = Date.now();
    trackedRef.current = false;

    return () => {
      // Enregistrer le temps passé à la fermeture
      if (startTimeRef.current && !trackedRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        trackItemView(itemCode, timeSpent);
        trackedRef.current = true;
        console.log(`[Analytics] Item ${itemCode} viewed for ${timeSpent}s`);
      }
    };
  }, [itemCode]);
}

/**
 * Hook pour tracker les recherches
 */
export function useTrackSearch() {
  const lastSearchRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const trackSearchTerm = useCallback((searchTerm: string, resultsCount: number) => {
    // Ne pas tracker les recherches vides ou identiques
    if (!searchTerm.trim() || searchTerm === lastSearchRef.current) {
      return;
    }

    // Debounce pour éviter de tracker chaque frappe
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      trackSearch(searchTerm, resultsCount);
      lastSearchRef.current = searchTerm;
    }, 1000); // Attendre 1s après la dernière frappe
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return trackSearchTerm;
}

/**
 * Hook pour récupérer les items les plus consultés
 */
export function useTopViewedItems(limit: number = 10) {
  return useQuery({
    queryKey: ['analytics', 'top-viewed', limit],
    queryFn: () => getTopViewedItems(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour récupérer les recherches populaires
 */
export function usePopularSearches(limit: number = 10) {
  return useQuery({
    queryKey: ['analytics', 'popular-searches', limit],
    queryFn: () => getPopularSearches(limit),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour récupérer l'historique de recherche
 */
export function useRecentSearches(limit: number = 10) {
  return useQuery({
    queryKey: ['analytics', 'recent-searches', limit],
    queryFn: () => getRecentSearches(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour récupérer les stats d'un item spécifique
 */
export function useItemStats(itemCode: string | null) {
  return useQuery({
    queryKey: ['analytics', 'item-stats', itemCode],
    queryFn: () => (itemCode ? getItemStats(itemCode) : null),
    enabled: !!itemCode,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook combiné pour toutes les analytics de la page EDN
 */
export function useEdnPageAnalytics() {
  const topViewed = useTopViewedItems(10);
  const popularSearches = usePopularSearches(10);
  const recentSearches = useRecentSearches(5);

  return {
    topViewed: topViewed.data || [],
    popularSearches: popularSearches.data || [],
    recentSearches: recentSearches.data || [],
    isLoading: topViewed.isLoading || popularSearches.isLoading || recentSearches.isLoading,
  };
}
