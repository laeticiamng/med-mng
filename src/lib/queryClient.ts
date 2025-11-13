/**
 * Configuration du client React Query
 * Optimisé pour l'application EDN avec cache intelligent
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pendant 5 minutes par défaut
      staleTime: 5 * 60 * 1000,
      
      // Garde les données en cache pendant 10 minutes même si non utilisées
      gcTime: 10 * 60 * 1000, // Anciennement cacheTime
      
      // Retry 3 fois en cas d'erreur avec backoff exponentiel
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Ne pas refetch automatiquement au focus de la fenêtre
      // (évite les requêtes inutiles quand l'utilisateur revient sur l'app)
      refetchOnWindowFocus: false,
      
      // Refetch au montage seulement si les données sont stale
      refetchOnMount: true,
      
      // Refetch à la reconnexion réseau
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry une seule fois pour les mutations
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Types de clés de query pour type-safety
export const queryKeys = {
  ednItems: {
    all: ['edn-items'] as const,
    unified: (page: number) => [...queryKeys.ednItems.all, 'unified', page] as const,
    fullItem: (itemCode: string) => [...queryKeys.ednItems.all, 'full', itemCode] as const,
    stats: () => [...queryKeys.ednItems.all, 'stats'] as const,
  },
} as const;
