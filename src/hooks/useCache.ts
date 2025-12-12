import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live en millisecondes
  maxSize?: number; // Taille max du cache
  persistent?: boolean; // Utiliser localStorage
}

export function useCache<T = any>(namespace = 'app-cache') {
  const [cache, setCache] = useState<Map<string, CacheItem<T>>>(new Map());

  const defaultOptions: CacheOptions = {
    ttl: 5 * 60 * 1000, // 5 minutes par défaut
    maxSize: 100,
    persistent: false
  };

  const set = useCallback(<K extends T>(
    key: string,
    data: K,
    options: CacheOptions = {}
  ) => {
    const opts = { ...defaultOptions, ...options };
    const now = Date.now();
    const item: CacheItem<K> = {
      data,
      timestamp: now,
      expiresAt: now + opts.ttl!
    };

    setCache(prev => {
      const newCache = new Map(prev);
      
      // Gérer la taille max
      if (opts.maxSize && newCache.size >= opts.maxSize) {
        const oldestKey = Array.from(newCache.keys())[0];
        newCache.delete(oldestKey);
      }

      newCache.set(key, item as CacheItem<T>);

      // Persistance localStorage
      if (opts.persistent) {
        try {
          localStorage.setItem(
            `${namespace}:${key}`,
            JSON.stringify(item)
          );
        } catch (error) {
          console.warn('Erreur sauvegarde cache localStorage:', error);
        }
      }

      return newCache;
    });
  }, [namespace]);

  const get = useCallback(<K extends T>(key: string): K | null => {
    const item = cache.get(key) as CacheItem<K> | undefined;
    
    if (!item) {
      // Essayer de récupérer depuis localStorage
      try {
        const stored = localStorage.getItem(`${namespace}:${key}`);
        if (stored) {
          const parsedItem: CacheItem<K> = JSON.parse(stored);
          if (parsedItem.expiresAt > Date.now()) {
            setCache(prev => new Map(prev).set(key, parsedItem as CacheItem<T>));
            return parsedItem.data;
          } else {
            localStorage.removeItem(`${namespace}:${key}`);
          }
        }
      } catch (error) {
        console.warn('Erreur lecture cache localStorage:', error);
      }
      return null;
    }

    // Vérifier l'expiration
    if (item.expiresAt <= Date.now()) {
      remove(key);
      return null;
    }

    return item.data;
  }, [cache, namespace]);

  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });

    // Supprimer de localStorage
    try {
      localStorage.removeItem(`${namespace}:${key}`);
    } catch (error) {
      console.warn('Erreur suppression cache localStorage:', error);
    }
  }, [namespace]);

  const clear = useCallback(() => {
    setCache(new Map());

    // Vider localStorage pour ce namespace
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${namespace}:`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erreur vidage cache localStorage:', error);
    }
  }, [namespace]);

  const has = useCallback((key: string): boolean => {
    return get(key) !== null;
  }, [get]);

  const keys = useCallback((): string[] => {
    return Array.from(cache.keys());
  }, [cache]);

  const size = useCallback((): number => {
    return cache.size;
  }, [cache]);

  const getStats = useCallback(() => {
    const now = Date.now();
    const items = Array.from(cache.values());
    
    return {
      size: cache.size,
      expired: items.filter(item => item.expiresAt <= now).length,
      avgAge: items.length > 0 
        ? items.reduce((sum, item) => sum + (now - item.timestamp), 0) / items.length
        : 0
    };
  }, [cache]);

  // Nettoyage automatique des éléments expirés
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCache(prev => {
        const newCache = new Map();
        prev.forEach((item, key) => {
          if (item.expiresAt > now) {
            newCache.set(key, item);
          } else {
            // Supprimer de localStorage aussi
            try {
              localStorage.removeItem(`${namespace}:${key}`);
            } catch (error) {
              // Ignorer les erreurs
            }
          }
        });
        return newCache;
      });
    }, 60000); // Nettoyage toutes les minutes

    return () => clearInterval(cleanupInterval);
  }, [namespace]);

  // Get multiple items
  const getMultiple = useCallback(<K extends T>(keyList: string[]): Record<string, K | null> => {
    const result: Record<string, K | null> = {};
    keyList.forEach(key => {
      result[key] = get<K>(key);
    });
    return result;
  }, [get]);

  // Set multiple items
  const setMultiple = useCallback(<K extends T>(
    items: Record<string, K>,
    options: CacheOptions = {}
  ) => {
    Object.entries(items).forEach(([key, value]) => {
      set(key, value as any, options);
    });
  }, [set]);

  // Get or set (fetch if not in cache)
  const getOrSet = useCallback(async <K extends T>(
    key: string,
    fetcher: () => Promise<K>,
    options: CacheOptions = {}
  ): Promise<K> => {
    const cached = get<K>(key);
    if (cached !== null) return cached;

    const data = await fetcher();
    set(key, data as any, options);
    return data;
  }, [get, set]);

  // Update existing item
  const update = useCallback(<K extends T>(
    key: string,
    updater: (current: K | null) => K
  ) => {
    const current = get<K>(key);
    const updated = updater(current);
    set(key, updated as any);
  }, [get, set]);

  // Touch (refresh TTL)
  const touch = useCallback((key: string, options: CacheOptions = {}) => {
    const item = get(key);
    if (item !== null) {
      set(key, item, options);
    }
  }, [get, set]);

  // Get all items
  const getAll = useCallback((): Record<string, T> => {
    const result: Record<string, T> = {};
    cache.forEach((item, key) => {
      if (item.expiresAt > Date.now()) {
        result[key] = item.data;
      }
    });
    return result;
  }, [cache]);

  // Find keys by pattern
  const findKeys = useCallback((pattern: RegExp): string[] => {
    return Array.from(cache.keys()).filter(key => pattern.test(key));
  }, [cache]);

  // Remove by pattern
  const removeByPattern = useCallback((pattern: RegExp) => {
    const keysToRemove = findKeys(pattern);
    keysToRemove.forEach(key => remove(key));
    return keysToRemove.length;
  }, [findKeys, remove]);

  // Get cache age for a key
  const getAge = useCallback((key: string): number | null => {
    const item = cache.get(key);
    if (!item) return null;
    return Date.now() - item.timestamp;
  }, [cache]);

  // Get remaining TTL
  const getRemainingTTL = useCallback((key: string): number | null => {
    const item = cache.get(key);
    if (!item) return null;
    const remaining = item.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }, [cache]);

  // Export cache as JSON
  const exportCache = useCallback((): string => {
    const exportData: Record<string, any> = {};
    cache.forEach((item, key) => {
      if (item.expiresAt > Date.now()) {
        exportData[key] = {
          data: item.data,
          timestamp: item.timestamp,
          expiresAt: item.expiresAt
        };
      }
    });
    return JSON.stringify({
      namespace,
      exportedAt: new Date().toISOString(),
      itemCount: Object.keys(exportData).length,
      items: exportData
    }, null, 2);
  }, [cache, namespace]);

  // Import cache from JSON
  const importCache = useCallback((jsonData: string, options: CacheOptions = {}) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.items) {
        Object.entries(data.items).forEach(([key, item]: [string, any]) => {
          if (item.expiresAt > Date.now()) {
            set(key, item.data, options);
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Error importing cache:', error);
      return false;
    }
  }, [set]);

  // Get expired count
  const getExpiredCount = useCallback((): number => {
    const now = Date.now();
    return Array.from(cache.values()).filter(item => item.expiresAt <= now).length;
  }, [cache]);

  // Prune expired items
  const prune = useCallback((): number => {
    const now = Date.now();
    let pruned = 0;
    cache.forEach((item, key) => {
      if (item.expiresAt <= now) {
        remove(key);
        pruned++;
      }
    });
    return pruned;
  }, [cache, remove]);

  // Get total memory estimate (rough)
  const getMemoryEstimate = useCallback((): number => {
    let bytes = 0;
    cache.forEach((item, key) => {
      bytes += key.length * 2; // UTF-16
      bytes += JSON.stringify(item.data).length * 2;
      bytes += 16; // timestamps
    });
    return bytes;
  }, [cache]);

  return {
    set,
    get,
    remove,
    clear,
    has,
    keys,
    size,
    getStats,
    getMultiple,
    setMultiple,
    getOrSet,
    update,
    touch,
    getAll,
    findKeys,
    removeByPattern,
    getAge,
    getRemainingTTL,
    exportCache,
    importCache,
    getExpiredCount,
    prune,
    getMemoryEstimate
  };
}