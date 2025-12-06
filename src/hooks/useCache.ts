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

  return {
    set,
    get,
    remove,
    clear,
    has,
    keys,
    size,
    getStats
  };
}