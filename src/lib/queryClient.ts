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
      
      // ⚡ RETRY AUTOMATIQUE avec exponential backoff
      // Retry jusqu'à 3 fois en cas d'erreur
      retry: (failureCount, error: any) => {
        // Ne pas retry sur les erreurs 4xx (erreurs client)
        if (error?.status && error.status >= 400 && error.status < 500) {
          return false;
        }
        // Retry max 3 fois pour les autres erreurs (network, 5xx, etc.)
        return failureCount < 3;
      },
      
      // Exponential backoff: 1s, 2s, 4s, puis max 30s
      retryDelay: (attemptIndex) => {
        const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
        console.log(`[React Query] Retry attempt ${attemptIndex + 1}, waiting ${delay}ms`);
        return delay;
      },
      
      // Ne pas refetch automatiquement au focus de la fenêtre
      // (évite les requêtes inutiles quand l'utilisateur revient sur l'app)
      refetchOnWindowFocus: false,
      
      // Refetch au montage seulement si les données sont stale
      refetchOnMount: true,
      
      // Refetch à la reconnexion réseau (important pour la résilience)
      refetchOnReconnect: true,
      
      // Network mode: toujours essayer de fetch, même hors ligne
      // (permet de déclencher les retry même avec connexion instable)
      networkMode: 'always',
    },
    mutations: {
      // Retry une seule fois pour les mutations (pour éviter duplicatas)
      retry: 1,
      retryDelay: 1000,
      
      // Network mode pour mutations
      networkMode: 'online', // Les mutations doivent avoir une connexion
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
