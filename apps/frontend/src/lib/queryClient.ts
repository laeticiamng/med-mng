/**
 * Configuration du client React Query
 * Optimisé pour l'application EDN avec cache intelligent
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ⚡ OPTIMIZED CACHE STRATEGY
      // Différents staleTime selon la criticité des données
      staleTime: 5 * 60 * 1000, // 5 min par défaut

      // Garde les données en cache pendant 24h pour la persistance
      // (sera sauvé dans IndexedDB via PersistQueryClientProvider)
      gcTime: 24 * 60 * 60 * 1000,

      // ⚡ INTELLIGENT RETRY avec exponential backoff
      retry: (failureCount, error: any) => {
        // Ne pas retry sur les erreurs 4xx (erreurs client)
        if (error?.status && error.status >= 400 && error.status < 500) {
          return false;
        }
        // Retry max 3 fois pour les autres erreurs (network, 5xx, etc.)
        return failureCount < 3;
      },

      // Exponential backoff avec jitter pour éviter thundering herd
      retryDelay: (attemptIndex) => {
        const baseDelay = 1000 * Math.pow(2, attemptIndex);
        const jitter = Math.random() * 1000;
        const delay = Math.min(baseDelay + jitter, 30000);
        return delay;
      },

      // Refetch behavior optimisé
      refetchOnWindowFocus: 'stale', // Refetch only if data is stale
      refetchOnMount: 'stale', // Refetch only if data is stale
      refetchOnReconnect: 'stale', // Refetch only if data is stale

      // Network mode: toujours essayer
      networkMode: 'always',

      // ⚡ PERFORMANCE: Structural sharing activé (défaut)
      // Identités de référence preservées pour memoi/selectors
      notifyOnChangeProps: 'tracked', // Optimisation du rendu

      // ⚡ ABORT comportement
      cancelRefetch: true, // Cancel previous requests if new one initiated
    },
    mutations: {
      // Retry une seule fois pour éviter les duplicatas
      retry: (failureCount, error: any) => {
        if (error?.status && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 1;
      },

      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

// ⚡ QUERY KEY FACTORY - Type-safe query keys for all endpoints
// Enables efficient cache invalidation and prefetching
export const queryKeys = {
  // EDN System (Medical Education)
  ednItems: {
    all: ['edn-items'] as const,
    unified: (page: number) => [...queryKeys.ednItems.all, 'unified', page] as const,
    fullItem: (itemCode: string) => [...queryKeys.ednItems.all, 'full', itemCode] as const,
    stats: () => [...queryKeys.ednItems.all, 'stats'] as const,
    search: (query: string) => [...queryKeys.ednItems.all, 'search', query] as const,
    filters: (filters: any) => [...queryKeys.ednItems.all, 'filters', JSON.stringify(filters)] as const,
  },

  // User & Auth
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
    user: (userId: string) => [...queryKeys.auth.all, 'user', userId] as const,
  },

  // Challenges
  challenges: {
    all: ['challenges'] as const,
    daily: () => [...queryKeys.challenges.all, 'daily'] as const,
    detail: (id: string) => [...queryKeys.challenges.all, 'detail', id] as const,
    history: () => [...queryKeys.challenges.all, 'history'] as const,
  },

  // Journal
  journal: {
    all: ['journal'] as const,
    entries: () => [...queryKeys.journal.all, 'entries'] as const,
    entry: (id: string) => [...queryKeys.journal.all, 'entry', id] as const,
  },

  // Leaderboards
  leaderboard: {
    all: ['leaderboard'] as const,
    global: () => [...queryKeys.leaderboard.all, 'global'] as const,
    focus: () => [...queryKeys.leaderboard.all, 'focus'] as const,
    learning: () => [...queryKeys.leaderboard.all, 'learning'] as const,
    weekly: () => [...queryKeys.leaderboard.all, 'weekly'] as const,
  },

  // Community
  community: {
    all: ['community'] as const,
    posts: () => [...queryKeys.community.all, 'posts'] as const,
    post: (id: string) => [...queryKeys.community.all, 'post', id] as const,
    activity: () => [...queryKeys.community.all, 'activity'] as const,
  },

  // Dashboard & Analytics
  dashboard: {
    all: ['dashboard'] as const,
    overview: () => [...queryKeys.dashboard.all, 'overview'] as const,
    analytics: () => [...queryKeys.dashboard.all, 'analytics'] as const,
    performance: () => [...queryKeys.dashboard.all, 'performance'] as const,
  },

  // Sessions & Activities
  sessions: {
    all: ['sessions'] as const,
    study: () => [...queryKeys.sessions.all, 'study'] as const,
    focus: () => [...queryKeys.sessions.all, 'focus'] as const,
    meditation: () => [...queryKeys.sessions.all, 'meditation'] as const,
  },

  // Generic list queries
  list: (resource: string, params?: any) =>
    ['list', resource, ...(params ? [JSON.stringify(params)] : [])] as const,

  // Generic detail queries
  detail: (resource: string, id: string) =>
    ['detail', resource, id] as const,
} as const;
