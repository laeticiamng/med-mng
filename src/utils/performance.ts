// Utilitaires d'optimisation des performances
import React from 'react';

// Debounce pour les recherches et inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle pour les événements fréquents (scroll, resize)
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Optimisation des images
export const optimizeImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return '';
  
  // Si c'est une URL Supabase Storage, on peut ajouter des paramètres d'optimisation
  if (url.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', '80');
    
    return `${url}?${params.toString()}`;
  }
  
  return url;
};

// Lazy loading pour les composants lourds
export const createLazyComponent = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
) => {
  return React.lazy(importFn);
};

// Cache simple pour éviter les recalculs
class SimpleCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private ttl: number; // Time to live en ms

  constructor(ttl: number = 5 * 60 * 1000) { // 5 minutes par défaut
    this.ttl = ttl;
  }

  get(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

export const cache = new SimpleCache();

// Mesure de performance pour le développement
export const measurePerformance = (name: string) => {
  const start = performance.now();
  
  return {
    end: () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
  };
};

// Optimisation mémoire - nettoyage des listeners
export const createCleanupTracker = () => {
  const cleanupFunctions: (() => void)[] = [];
  
  return {
    add: (cleanup: () => void) => {
      cleanupFunctions.push(cleanup);
    },
    cleanup: () => {
      cleanupFunctions.forEach(fn => fn());
      cleanupFunctions.length = 0;
    }
  };
};