/**
 * ⚡ PERFORMANCE OPTIMIZER - MED-MNG v3.0 ENHANCED
 * Système complet d'optimisation des performances
 */

import { logger } from '@/lib/logger';

// ==========================================
// MONITORING DES PERFORMANCES
// ==========================================

class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Garder seulement les 100 dernières mesures
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, any> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      if (values.length > 0) {
        result[name] = {
          avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
          min: Math.round(Math.min(...values)),
          max: Math.round(Math.max(...values)),
          count: values.length
        };
      }
    }
    
    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ==========================================
// UTILITAIRES DE BASE
// ==========================================

// Debounce pour éviter les appels trop fréquents
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle pour limiter la fréquence d'exécution
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Cache simple pour éviter les recalculs
class SimpleCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Instance globale du cache
export const performanceCache = new SimpleCache<string, any>(50);

// Fonction pour nettoyer les logs en production
export const cleanupLogs = () => {
  if (import.meta.env.PROD) {
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    // Garder console.warn et console.error pour les erreurs importantes
  }
};

// Optimisation des re-rendus avec memoization
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = performanceCache;
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(null, args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Cleanup automatique au démarrage de l'app
if (typeof window !== 'undefined') {
  cleanupLogs();
}