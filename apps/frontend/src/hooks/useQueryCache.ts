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

export const queryCache = new QueryCache();

export const useQueryCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; enabled?: boolean } = {}
) => {
  const { ttl, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);

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

    fetcher()
      .then((result) => {
        queryCache.set(key, result, ttl);
        setData(result);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
        fetchingRef.current = false;
      });
  }, [key, enabled, ttl]);

  const refetch = async () => {
    if (fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    queryCache.invalidate(key);

    try {
      const result = await fetcher();
      queryCache.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};