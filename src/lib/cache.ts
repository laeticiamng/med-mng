/**
 * 🎯 CACHE LRU INTELLIGENT - MED-MNG v3.0
 * Système de cache avancé avec éviction LRU et statistiques
 */

import { logger } from '@/lib/logger';
import type { JSONValue } from '@/types/core';

// ==========================================
// INTERFACES CACHE
// ==========================================

export interface CacheEntry<T = JSONValue> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
  size: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  currentSize: number;
  maxSize: number;
  hitRate: number;
  totalRequests: number;
  avgAccessTime: number;
}

export interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  cleanupInterval?: number;
  enableStats?: boolean;
  enableCompression?: boolean;
}

// ==========================================
// LRU CACHE IMPLEMENTATION
// ==========================================

export class LRUCache<T = JSONValue> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;
  private cleanupInterval: number;
  private enableStats: boolean;
  private enableCompression: boolean;
  
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    currentSize: 0,
    maxSize: 0,
    hitRate: 0,
    totalRequests: 0,
    avgAccessTime: 0
  };

  private cleanupTimer?: NodeJS.Timeout;
  private accessTimes: number[] = [];

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute
    this.enableStats = options.enableStats ?? true;
    this.enableCompression = options.enableCompression ?? false;

    this.stats.maxSize = this.maxSize;

    // Démarrer le nettoyage automatique
    this.startCleanup();

    logger.info('cache', `LRU Cache initialized with max size: ${this.maxSize}`);
  }

  // ==========================================
  // CORE METHODS
  // ==========================================

  set(key: string, value: T, ttl?: number): void {
    const startTime = performance.now();
    
    try {
      const now = Date.now();
      const entryTTL = ttl || this.defaultTTL;
      const size = this.calculateSize(value);

      // Supprimer l'ancienne entrée si elle existe
      if (this.cache.has(key)) {
        this.cache.delete(key);
      }

      // Éviction LRU si nécessaire
      this.evictIfNecessary();

      const entry: CacheEntry<T> = {
        key,
        value,
        timestamp: now,
        ttl: entryTTL,
        accessCount: 0,
        lastAccess: now,
        size
      };

      this.cache.set(key, entry);
      this.updateStats('set', startTime);
      
      logger.debug('cache', `Set key: ${key}, TTL: ${entryTTL}ms`);
      
    } catch (error) {
      logger.error('cache', `Failed to set key: ${key}`, error);
    }
  }

  get(key: string): T | null {
    const startTime = performance.now();
    
    try {
      const entry = this.cache.get(key);

      if (!entry) {
        this.recordMiss();
        this.updateStats('get', startTime);
        return null;
      }

      // Vérifier expiration
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.recordMiss();
        this.updateStats('get', startTime);
        return null;
      }

      // Mettre à jour les statistiques d'accès
      entry.accessCount++;
      entry.lastAccess = Date.now();

      // Déplacer à la fin (LRU)
      this.cache.delete(key);
      this.cache.set(key, entry);

      this.recordHit();
      this.updateStats('get', startTime);
      
      return entry.value;
      
    } catch (error) {
      logger.error('cache', `Failed to get key: ${key}`, error);
      this.recordMiss();
      this.updateStats('get', startTime);
      return null;
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      logger.debug('cache', `Deleted key: ${key}`);
    }
    
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.resetStats();
    logger.info('cache', 'Cache cleared');
  }

  // ==========================================
  // EVICTION & CLEANUP
  // ==========================================

  private evictIfNecessary(): void {
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.stats.evictions++;
        logger.debug('cache', `Evicted key: ${firstKey}`);
      } else {
        break;
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expired.push(key);
      }
    }

    expired.forEach(key => {
      this.cache.delete(key);
      logger.debug('cache', `Cleaned up expired key: ${key}`);
    });

    if (expired.length > 0) {
      logger.info('cache', `Cleaned up ${expired.length} expired entries`);
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private calculateSize(value: T): number {
    try {
      // Estimation approximative de la taille en bytes
      return JSON.stringify(value).length * 2; // UTF-16 = 2 bytes per char
    } catch {
      return 1; // Fallback
    }
  }

  private recordHit(): void {
    if (this.enableStats) {
      this.stats.hits++;
      this.updateHitRate();
    }
  }

  private recordMiss(): void {
    if (this.enableStats) {
      this.stats.misses++;
      this.updateHitRate();
    }
  }

  private updateHitRate(): void {
    this.stats.totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
  }

  private updateStats(operation: string, startTime: number): void {
    if (!this.enableStats) return;

    const duration = performance.now() - startTime;
    this.accessTimes.push(duration);

    // Garder seulement les 100 derniers temps d'accès
    if (this.accessTimes.length > 100) {
      this.accessTimes.shift();
    }

    this.stats.avgAccessTime = this.accessTimes.reduce((a, b) => a + b, 0) / this.accessTimes.length;
    this.stats.currentSize = this.cache.size;
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      currentSize: 0,
      maxSize: this.maxSize,
      hitRate: 0,
      totalRequests: 0,
      avgAccessTime: 0
    };
    this.accessTimes = [];
  }

  // ==========================================
  // PUBLIC API
  // ==========================================

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  getEntries(): Array<{ key: string; value: T; meta: Omit<CacheEntry<T>, 'value'> }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      value: entry.value,
      meta: {
        key: entry.key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        accessCount: entry.accessCount,
        lastAccess: entry.lastAccess,
        size: entry.size
      }
    }));
  }

  getSize(): number {
    return this.cache.size;
  }

  getMaxSize(): number {
    return this.maxSize;
  }

  setMaxSize(newSize: number): void {
    this.maxSize = newSize;
    this.stats.maxSize = newSize;
    this.evictIfNecessary();
    logger.info('cache', `Max size updated to: ${newSize}`);
  }

  // Méthodes pour les patterns courants
  getOrSet(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        const cached = this.get(key);
        
        if (cached !== null) {
          resolve(cached);
          return;
        }

        const value = await factory();
        this.set(key, value, ttl);
        resolve(value);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Bulk operations
  setMany(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  getMany(keys: string[]): Array<{ key: string; value: T | null }> {
    return keys.map(key => ({
      key,
      value: this.get(key)
    }));
  }

  deleteMany(keys: string[]): number {
    let deleted = 0;
    keys.forEach(key => {
      if (this.delete(key)) {
        deleted++;
      }
    });
    return deleted;
  }

  // Nettoyage manuel
  destroy(): void {
    this.stopCleanup();
    this.clear();
    logger.info('cache', 'Cache destroyed');
  }
}

// ==========================================
// CACHE GLOBAL INSTANCES
// ==========================================

// Cache principal pour l'application
export const appCache = new LRUCache({
  maxSize: 200,
  defaultTTL: 300000, // 5 minutes
  enableStats: true
});

// Cache pour les images
export const imageCache = new LRUCache({
  maxSize: 50,
  defaultTTL: 3600000, // 1 heure
  enableStats: true
});

// Cache pour les données API
export const apiCache = new LRUCache({
  maxSize: 100,
  defaultTTL: 600000, // 10 minutes
  enableStats: true
});

// ==========================================
// UTILITIES FUNCTIONS
// ==========================================

export const createCacheKey = (...parts: Array<string | number>): string => {
  return parts.map(String).join(':');
};

export const getCacheStats = (): { [cacheName: string]: CacheStats } => {
  return {
    app: appCache.getStats(),
    image: imageCache.getStats(),
    api: apiCache.getStats()
  };
};

export const clearAllCaches = (): void => {
  appCache.clear();
  imageCache.clear();
  apiCache.clear();
  logger.info('cache', 'All caches cleared');
};

export default {
  LRUCache,
  appCache,
  imageCache,
  apiCache,
  createCacheKey,
  getCacheStats,
  clearAllCaches
};