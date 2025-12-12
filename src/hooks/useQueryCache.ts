import { useState, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

class QueryCacheManager extends QueryCache {
  private pendingRequests = new Map<string, Promise<any>>();
  private subscriptions = new Map<string, Set<(data: any) => void>>();

  // Évite les requêtes en double
  async fetchWithDedup<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    // Vérifier le cache d'abord
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    // Vérifier s'il y a une requête en cours
    const pending = this.pendingRequests.get(key);
    if (pending) return pending as Promise<T>;

    // Créer une nouvelle requête
    const request = fetcher().then(result => {
      this.set(key, result, ttl);
      this.pendingRequests.delete(key);
      this.notifySubscribers(key, result);
      return result;
    }).catch(err => {
      this.pendingRequests.delete(key);
      throw err;
    });

    this.pendingRequests.set(key, request);
    return request;
  }

  // Subscription pour updates en temps réel
  subscribe<T>(key: string, callback: (data: T) => void): () => void {
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(callback);

    return () => {
      this.subscriptions.get(key)?.delete(callback);
    };
  }

  private notifySubscribers(key: string, data: any) {
    this.subscriptions.get(key)?.forEach(cb => cb(data));
  }

  // Précharger plusieurs clés
  async prefetch<T>(keys: string[], fetcher: (key: string) => Promise<T>, ttl?: number): Promise<void> {
    await Promise.all(
      keys.map(key => this.fetchWithDedup(key, () => fetcher(key), ttl))
    );
  }

  // Obtenir la taille du cache
  size(): number {
    return (this as any).cache.size;
  }

  // Statistiques du cache
  getStats() {
    const entries = Array.from((this as any).cache.entries());
    const now = Date.now();

    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([_, e]) => e.expires > now).length,
      expiredEntries: entries.filter(([_, e]) => e.expires <= now).length,
      pendingRequests: this.pendingRequests.size,
      subscriptions: this.subscriptions.size
    };
  }

  // Invalider par pattern
  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    Array.from((this as any).cache.keys()).forEach(key => {
      if (pattern.test(key)) {
        this.invalidate(key);
        count++;
      }
    });
    return count;
  }
}

export const queryCache = new QueryCacheManager();

export interface UseQueryCacheOptions<T> {
  ttl?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
}

export const useQueryCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseQueryCacheOptions<T> = {}
) => {
  const {
    ttl,
    enabled = true,
    onSuccess,
    onError,
    retry = 0,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const fetchingRef = useRef(false);
  const retryCountRef = useRef(0);

  const executeWithRetry = async (): Promise<T> => {
    try {
      const result = await fetcher();
      retryCountRef.current = 0;
      return result;
    } catch (err) {
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));
        return executeWithRetry();
      }
      throw err;
    }
  };

  useEffect(() => {
    if (!enabled || fetchingRef.current) return;

    const cachedData = queryCache.get<T>(key);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    executeWithRetry()
      .then((result) => {
        queryCache.set(key, result, ttl);
        setData(result);
        onSuccess?.(result);
      })
      .catch((err) => {
        setError(err);
        onError?.(err);
      })
      .finally(() => {
        setLoading(false);
        fetchingRef.current = false;
      });
  }, [key, enabled, ttl]);

  // Subscription aux mises à jour
  useEffect(() => {
    const unsubscribe = queryCache.subscribe<T>(key, (newData) => {
      setData(newData);
      setIsStale(false);
    });
    return unsubscribe;
  }, [key]);

  const refetch = async () => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    queryCache.invalidate(key);

    try {
      const result = await executeWithRetry();
      queryCache.set(key, result, ttl);
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      setError(err as Error);
      onError?.(err as Error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const invalidate = () => {
    queryCache.invalidate(key);
    setIsStale(true);
  };

  const update = (newData: T | ((prev: T | null) => T)) => {
    const updatedData = typeof newData === 'function'
      ? (newData as (prev: T | null) => T)(data)
      : newData;
    queryCache.set(key, updatedData, ttl);
    setData(updatedData);
  };

  return {
    data,
    loading,
    error,
    isStale,
    refetch,
    invalidate,
    update
  };
};