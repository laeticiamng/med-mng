/**
 * Hook unifié pour le cache intelligent
 * Interface simple pour toutes les données de l'app
 */

import { useState, useEffect, useCallback } from 'react';
import { cacheService, type CacheOptions } from '@/services/core/CacheService';

export const useCache = <T>(
  key: string,
  fetcher: () => Promise<T> | T,
  options: CacheOptions & {
    enabled?: boolean;
    refetchInterval?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  const {
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
    storage = 'memory',
    ttl = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Vérifier le cache d'abord (sauf si forceRefresh)
      if (!forceRefresh) {
        const cached = cacheService.get<T>(key, storage);
        if (cached) {
          setData(cached);
          setLoading(false);
          onSuccess?.(cached);
          return cached;
        }
      }

      // Fetch les nouvelles données
      const result = await fetcher();
      
      // Mettre en cache
      cacheService.set(key, result, { storage, ttl });
      
      setData(result);
      onSuccess?.(result);
      
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur de récupération');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, enabled, storage, ttl, onSuccess, onError]);

  // Chargement initial
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  // Intervalle de refetch
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(() => {
        fetchData();
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval, enabled]);

  const mutate = useCallback(async (
    updater?: ((current: T | null) => T) | T,
    shouldRevalidate = true
  ) => {
    if (updater) {
      const newData = typeof updater === 'function' 
        ? (updater as (current: T | null) => T)(data)
        : updater;
      
      setData(newData);
      cacheService.set(key, newData, { storage, ttl });
    }

    if (shouldRevalidate) {
      return fetchData(true);
    }
  }, [data, key, storage, ttl, fetchData]);

  const invalidate = useCallback(() => {
    cacheService.delete(key, storage);
    return fetchData(true);
  }, [key, storage, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    mutate,
    invalidate,
    
    // États dérivés
    isValidating: loading,
    isError: !!error,
    isSuccess: !loading && !error && data !== null,
  };
};

// Hook spécialisé pour les API calls
export const useAPICache = <T>(
  url: string,
  options: CacheOptions & {
    enabled?: boolean;
    method?: string;
    body?: any;
    headers?: HeadersInit;
    refetchInterval?: number;
  } = {}
) => {
  const {
    enabled = true,
    method = 'GET',
    body,
    headers = {},
    refetchInterval,
    ...cacheOptions
  } = options;

  const fetcher = useCallback(async (): Promise<T> => {
    const response = await fetch(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }, [url, method, body, headers]);

  return useCache<T>(
    cacheService.getQueryKey(url, { method, body }),
    fetcher,
    { ...cacheOptions, enabled, refetchInterval }
  );
};

// Hook pour les données utilisateur (cache localStorage)
export const useUserCache = <T>(
  key: string,
  fetcher: () => Promise<T> | T,
  options: Omit<CacheOptions, 'storage'> = {}
) => {
  return useCache<T>(key, fetcher, {
    ...options,
    storage: 'localStorage',
    ttl: options.ttl || 30 * 60 * 1000, // 30 minutes par défaut
  });
};

// Hook pour les données de session (cache sessionStorage)
export const useSessionCache = <T>(
  key: string,
  fetcher: () => Promise<T> | T,
  options: Omit<CacheOptions, 'storage'> = {}
) => {
  return useCache<T>(key, fetcher, {
    ...options,
    storage: 'sessionStorage',
    ttl: options.ttl || 60 * 60 * 1000, // 1 heure par défaut
  });
};

// Hook pour vider le cache
export const useCacheManager = () => {
  const clearAll = useCallback((storage?: 'memory' | 'localStorage' | 'sessionStorage') => {
    cacheService.clear(storage);
  }, []);

  const clearByPattern = useCallback((pattern: RegExp, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory') => {
    // Pour la mémoire cache
    if (storage === 'memory') {
      const stats = cacheService.getStats();
      // Note: getCacheKeys n'existe pas, on devrait l'ajouter au service
      // Simplification pour l'instant
      cacheService.clear('memory');
      return;
    }

    // Pour localStorage/sessionStorage
    const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storageObj.length; i++) {
      const key = storageObj.key(i);
      if (key?.startsWith('cache_') && pattern.test(key)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => storageObj.removeItem(key));
  }, []);

  const getStats = useCallback(() => {
    return cacheService.getStats();
  }, []);

  return {
    clearAll,
    clearByPattern,
    getStats,
  };
};