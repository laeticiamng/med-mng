/**
 * Service centralisé de cache intelligent
 * Gestion mémoire, localStorage, sessionStorage avec TTL
 */

import { errorService } from '@/services/core/ErrorService';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live en millisecondes
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  compress?: boolean;
}

class CacheService {
  private static instance: CacheService;
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxMemoryItems = 100;

  private constructor() {
    this.setupCleanupInterval();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private setupCleanupInterval() {
    // Nettoyage automatique toutes les 10 minutes
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): void {
    const {
      ttl = this.defaultTTL,
      storage = 'memory',
      compress = false
    } = options;

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    };

    try {
      switch (storage) {
        case 'memory':
          this.setMemory(key, item);
          break;
        case 'localStorage':
          this.setLocalStorage(key, item, compress);
          break;
        case 'sessionStorage':
          this.setSessionStorage(key, item, compress);
          break;
      }
    } catch (error) {
      errorService.handleWarning('Cache set failed', 'system', error);
      // Fallback vers memory si storage échoue
      if (storage !== 'memory') {
        this.setMemory(key, item);
      }
    }
  }

  get<T>(key: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): T | null {
    try {
      let item: CacheItem<T> | null = null;

      switch (storage) {
        case 'memory':
          item = this.getMemory<T>(key);
          break;
        case 'localStorage':
          item = this.getLocalStorage<T>(key);
          break;
        case 'sessionStorage':
          item = this.getSessionStorage<T>(key);
          break;
      }

      if (!item) {
        return null;
      }

      // Vérifier si l'item a expiré
      if (Date.now() - item.timestamp > item.ttl) {
        this.delete(key, storage);
        return null;
      }

      return item.data;
    } catch (error) {
      errorService.handleWarning('Cache get failed', 'system', error);
      return null;
    }
  }

  private setMemory<T>(key: string, item: CacheItem<T>): void {
    // Limiter la taille du cache mémoire
    if (this.memoryCache.size >= this.maxMemoryItems) {
      // Supprimer l'élément le plus ancien
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
    
    this.memoryCache.set(key, item);
  }

  private getMemory<T>(key: string): CacheItem<T> | null {
    return this.memoryCache.get(key) || null;
  }

  private setLocalStorage<T>(key: string, item: CacheItem<T>, compress: boolean): void {
    const serialized = JSON.stringify(item);
    const finalData = compress ? this.compress(serialized) : serialized;
    localStorage.setItem(`cache_${key}`, finalData);
  }

  private getLocalStorage<T>(key: string): CacheItem<T> | null {
    const data = localStorage.getItem(`cache_${key}`);
    if (!data) return null;

    try {
      // Détecter si c'est compressé (commence par un caractère spécial)
      const decompressed = data.startsWith('_compressed_') 
        ? this.decompress(data) 
        : data;
      
      return JSON.parse(decompressed);
    } catch {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
  }

  private setSessionStorage<T>(key: string, item: CacheItem<T>, compress: boolean): void {
    const serialized = JSON.stringify(item);
    const finalData = compress ? this.compress(serialized) : serialized;
    sessionStorage.setItem(`cache_${key}`, finalData);
  }

  private getSessionStorage<T>(key: string): CacheItem<T> | null {
    const data = sessionStorage.getItem(`cache_${key}`);
    if (!data) return null;

    try {
      const decompressed = data.startsWith('_compressed_') 
        ? this.decompress(data) 
        : data;
      
      return JSON.parse(decompressed);
    } catch {
      sessionStorage.removeItem(`cache_${key}`);
      return null;
    }
  }

  delete(key: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): void {
    switch (storage) {
      case 'memory':
        this.memoryCache.delete(key);
        break;
      case 'localStorage':
        localStorage.removeItem(`cache_${key}`);
        break;
      case 'sessionStorage':
        sessionStorage.removeItem(`cache_${key}`);
        break;
    }
  }

  // Vérifier si une clé existe et n'a pas expiré
  has(key: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): boolean {
    return this.get(key, storage) !== null;
  }

  // Nettoyer tous les éléments expirés
  cleanup(): void {
    // Nettoyage mémoire
    for (const [key, item] of this.memoryCache.entries()) {
      if (Date.now() - item.timestamp > item.ttl) {
        this.memoryCache.delete(key);
      }
    }

    // Nettoyage localStorage
    this.cleanupStorage(localStorage);
    
    // Nettoyage sessionStorage
    this.cleanupStorage(sessionStorage);
  }

  private cleanupStorage(storage: Storage): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith('cache_')) {
        try {
          const data = storage.getItem(key);
          if (data) {
            const decompressed = data.startsWith('_compressed_') 
              ? this.decompress(data) 
              : data;
            
            const item = JSON.parse(decompressed);
            if (Date.now() - item.timestamp > item.ttl) {
              keysToRemove.push(key);
            }
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => storage.removeItem(key));
  }

  // Vider tout le cache
  clear(storage?: 'memory' | 'localStorage' | 'sessionStorage'): void {
    if (!storage || storage === 'memory') {
      this.memoryCache.clear();
    }
    
    if (!storage || storage === 'localStorage') {
      this.clearStorageCache(localStorage);
    }
    
    if (!storage || storage === 'sessionStorage') {
      this.clearStorageCache(sessionStorage);
    }
  }

  private clearStorageCache(storage: Storage): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  // Compression simple pour économiser l'espace
  private compress(data: string): string {
    try {
      // Compression basique par substitution de patterns fréquents
      return '_compressed_' + data
        .replace(/{"data":/g, '{"d":')
        .replace(/"timestamp":/g, '"t":')
        .replace(/"ttl":/g, '"l":')
        .replace(/,"key":/g, ',"k":');
    } catch {
      return data;
    }
  }

  private decompress(data: string): string {
    try {
      return data
        .replace('_compressed_', '')
        .replace(/{"d":/g, '{"data":')
        .replace(/"t":/g, '"timestamp":')
        .replace(/"l":/g, '"ttl":')
        .replace(/,"k":/g, ',"key":');
    } catch {
      return data;
    }
  }

  // Méthodes utilitaires pour React Query
  getQueryKey(baseKey: string, params?: Record<string, unknown>): string {
    if (!params) return baseKey;
    
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, unknown>);
    
    return `${baseKey}_${JSON.stringify(sortedParams)}`;
  }

  // Cache pour les API calls avec deduplication
  async cachedFetch<T>(
    url: string,
    options: RequestInit = {},
    cacheOptions: CacheOptions = {}
  ): Promise<T> {
    const cacheKey = this.getQueryKey('api_' + url, { 
      method: options.method || 'GET',
      body: options.body 
    });

    // Vérifier le cache d'abord
    const cached = this.get<T>(cacheKey, cacheOptions.storage);
    if (cached) {
      return cached;
    }

    // Faire l'appel API
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Mettre en cache
    this.set(cacheKey, data, cacheOptions);
    
    return data;
  }

  // Statistiques du cache
  getStats() {
    const memorySize = this.memoryCache.size;
    const localStorageKeys = this.countStorageKeys(localStorage);
    const sessionStorageKeys = this.countStorageKeys(sessionStorage);

    return {
      memory: {
        size: memorySize,
        maxSize: this.maxMemoryItems,
        usage: (memorySize / this.maxMemoryItems * 100).toFixed(1) + '%'
      },
      localStorage: { keys: localStorageKeys },
      sessionStorage: { keys: sessionStorageKeys },
    };
  }

  private countStorageKeys(storage: Storage): number {
    let count = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith('cache_')) {
        count++;
      }
    }
    return count;
  }
}

export const cacheService = CacheService.getInstance();
export default cacheService;