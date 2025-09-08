/**
 * Système de cache intelligent pour optimiser les performances
 */

import React from 'react';
import { logger } from '@/lib/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hitCount: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  // Générer une clé de cache
  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  // Obtenir une entrée du cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      logger.debug('Cache miss', { key });
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      logger.debug('Cache expired', { key });
      return null;
    }

    entry.hitCount++;
    logger.debug('Cache hit', { key, hitCount: entry.hitCount });
    return entry.data;
  }

  // Définir une entrée dans le cache
  set<T>(key: string, data: T, ttl?: number): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hitCount: 0
    };

    this.cache.set(key, entry);
    logger.debug('Cache set', { key, size: this.cache.size });
  }

  // Supprimer les entrées les moins utilisées
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let minHitCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hitCount < minHitCount) {
        minHitCount = entry.hitCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      logger.debug('Cache evicted', { key: leastUsedKey });
    }
  }

  // Nettoyer les entrées expirées
  cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    logger.info('Cache cleanup completed', { deletedCount, remainingSize: this.cache.size });
  }

  // Statistiques du cache
  getStats() {
    let totalHits = 0;
    let expiredCount = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      totalHits += entry.hitCount;
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      totalHits,
      expiredCount,
      hitRate: totalHits / Math.max(this.cache.size, 1)
    };
  }

  // Vider le cache
  clear(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }
}

// Instance globale du cache
export const performanceCache = new PerformanceCache();

// Hook React pour utiliser le cache
export const useCache = <T>(
  key: string,
  fetchFn: () => Promise<T> | T,
  ttl?: number
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const cachedData = performanceCache.get<T>(key);
    
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.resolve(fetchFn())
      .then((result) => {
        performanceCache.set(key, result, ttl);
        setData(result);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, ttl]);

  return { data, loading, error };
};

// Décorateur de cache pour les fonctions
export function cached<T extends (...args: any[]) => any>(
  ttl: number = 5 * 60 * 1000
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]): any {
      const cacheKey = `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;
      const cachedResult = performanceCache.get(cacheKey);
      
      if (cachedResult !== null) {
        return cachedResult;
      }
      
      const result = originalMethod.apply(this, args);
      performanceCache.set(cacheKey, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
}

// Nettoyage automatique du cache
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceCache.cleanup();
  }, 5 * 60 * 1000); // Toutes les 5 minutes
}