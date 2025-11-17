/**
 * Service IndexedDB pour cache persistant et analytics
 * Permet le mode offline et accélère les chargements
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { EdnItemUnified } from '@shared/types/edn';

// Schéma de la base de données
interface EdnDB extends DBSchema {
  // Cache des items EDN
  'edn-cache': {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiresAt: number;
    };
  };
  // Analytics des consultations
  'item-views': {
    key: string; // item_code
    value: {
      itemCode: string;
      viewCount: number;
      lastViewed: number;
      totalTimeSpent: number; // en secondes
      averageTimeSpent: number;
    };
    indexes: { 'by-views': number; 'by-date': number };
  };
  // Recherches populaires
  'search-history': {
    key: number; // auto-increment
    value: {
      searchTerm: string;
      timestamp: number;
      resultsCount: number;
    };
    indexes: { 'by-term': string; 'by-date': number };
  };
  // Métriques de performance
  'performance-metrics': {
    key: number;
    value: {
      metric: 'FCP' | 'LCP' | 'TTI' | 'CLS' | 'FID' | 'TTFB';
      value: number;
      timestamp: number;
      route: string;
    };
    indexes: { 'by-metric': string; 'by-date': number };
  };
}

const DB_NAME = 'edn-offline-db';
const DB_VERSION = 1;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

let dbInstance: IDBPDatabase<EdnDB> | null = null;

/**
 * Initialise la base de données IndexedDB
 */
export async function initDB(): Promise<IDBPDatabase<EdnDB>> {
  if (dbInstance) return dbInstance;

  try {
    dbInstance = await openDB<EdnDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Store pour le cache
        if (!db.objectStoreNames.contains('edn-cache')) {
          db.createObjectStore('edn-cache');
        }

        // Store pour les vues d'items
        if (!db.objectStoreNames.contains('item-views')) {
          const itemViewsStore = db.createObjectStore('item-views', { keyPath: 'itemCode' });
          itemViewsStore.createIndex('by-views', 'viewCount');
          itemViewsStore.createIndex('by-date', 'lastViewed');
        }

        // Store pour l'historique de recherche
        if (!db.objectStoreNames.contains('search-history')) {
          const searchStore = db.createObjectStore('search-history', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          searchStore.createIndex('by-term', 'searchTerm');
          searchStore.createIndex('by-date', 'timestamp');
        }

        // Store pour les métriques de performance
        if (!db.objectStoreNames.contains('performance-metrics')) {
          const metricsStore = db.createObjectStore('performance-metrics', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          metricsStore.createIndex('by-metric', 'metric');
          metricsStore.createIndex('by-date', 'timestamp');
        }
      },
    });

    console.log('[IndexedDB] Database initialized successfully');
    return dbInstance;
  } catch (error) {
    console.error('[IndexedDB] Failed to initialize database:', error);
    throw error;
  }
}

// ============================================
// CACHE MANAGEMENT
// ============================================

/**
 * Enregistre des données dans le cache
 */
export async function setCacheItem(key: string, data: any): Promise<void> {
  try {
    const db = await initDB();
    const expiresAt = Date.now() + CACHE_DURATION;
    
    await db.put('edn-cache', {
      data,
      timestamp: Date.now(),
      expiresAt,
    }, key);
    
    console.log(`[IndexedDB] Cached item: ${key}`);
  } catch (error) {
    console.error('[IndexedDB] Error caching item:', error);
  }
}

/**
 * Récupère des données du cache
 */
export async function getCacheItem<T>(key: string): Promise<T | null> {
  try {
    const db = await initDB();
    const cached = await db.get('edn-cache', key);
    
    if (!cached) return null;
    
    // Vérifier l'expiration
    if (Date.now() > cached.expiresAt) {
      await db.delete('edn-cache', key);
      console.log(`[IndexedDB] Cache expired: ${key}`);
      return null;
    }
    
    console.log(`[IndexedDB] Cache hit: ${key}`);
    return cached.data as T;
  } catch (error) {
    console.error('[IndexedDB] Error getting cached item:', error);
    return null;
  }
}

/**
 * Supprime un élément du cache
 */
export async function deleteCacheItem(key: string): Promise<void> {
  try {
    const db = await initDB();
    await db.delete('edn-cache', key);
  } catch (error) {
    console.error('[IndexedDB] Error deleting cached item:', error);
  }
}

/**
 * Vide tout le cache
 */
export async function clearCache(): Promise<void> {
  try {
    const db = await initDB();
    await db.clear('edn-cache');
    console.log('[IndexedDB] Cache cleared');
  } catch (error) {
    console.error('[IndexedDB] Error clearing cache:', error);
  }
}

// ============================================
// ANALYTICS - ITEM VIEWS
// ============================================

/**
 * Enregistre une consultation d'item
 */
export async function trackItemView(itemCode: string, timeSpent: number = 0): Promise<void> {
  try {
    const db = await initDB();
    const existing = await db.get('item-views', itemCode);
    
    if (existing) {
      const newViewCount = existing.viewCount + 1;
      const newTotalTime = existing.totalTimeSpent + timeSpent;
      
      await db.put('item-views', {
        itemCode,
        viewCount: newViewCount,
        lastViewed: Date.now(),
        totalTimeSpent: newTotalTime,
        averageTimeSpent: newTotalTime / newViewCount,
      });
    } else {
      await db.put('item-views', {
        itemCode,
        viewCount: 1,
        lastViewed: Date.now(),
        totalTimeSpent: timeSpent,
        averageTimeSpent: timeSpent,
      });
    }
    
    console.log(`[Analytics] Tracked view for ${itemCode}`);
  } catch (error) {
    console.error('[Analytics] Error tracking item view:', error);
  }
}

/**
 * Récupère les items les plus consultés
 */
export async function getTopViewedItems(limit: number = 10) {
  try {
    const db = await initDB();
    const tx = db.transaction('item-views', 'readonly');
    const index = tx.store.index('by-views');
    
    let items = await index.getAll();
    items.sort((a, b) => b.viewCount - a.viewCount);
    
    return items.slice(0, limit);
  } catch (error) {
    console.error('[Analytics] Error getting top viewed items:', error);
    return [];
  }
}

/**
 * Récupère les statistiques d'un item
 */
export async function getItemStats(itemCode: string) {
  try {
    const db = await initDB();
    return await db.get('item-views', itemCode);
  } catch (error) {
    console.error('[Analytics] Error getting item stats:', error);
    return null;
  }
}

// ============================================
// ANALYTICS - SEARCH HISTORY
// ============================================

/**
 * Enregistre une recherche
 */
export async function trackSearch(searchTerm: string, resultsCount: number): Promise<void> {
  try {
    const db = await initDB();
    
    await db.add('search-history', {
      searchTerm: searchTerm.toLowerCase().trim(),
      timestamp: Date.now(),
      resultsCount,
    });
    
    console.log(`[Analytics] Tracked search: "${searchTerm}"`);
  } catch (error) {
    console.error('[Analytics] Error tracking search:', error);
  }
}

/**
 * Récupère les recherches les plus populaires
 */
export async function getPopularSearches(limit: number = 10) {
  try {
    const db = await initDB();
    const allSearches = await db.getAll('search-history');
    
    // Compter les occurrences
    const searchCounts = new Map<string, number>();
    allSearches.forEach(search => {
      const count = searchCounts.get(search.searchTerm) || 0;
      searchCounts.set(search.searchTerm, count + 1);
    });
    
    // Trier par popularité
    const sorted = Array.from(searchCounts.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count);
    
    return sorted.slice(0, limit);
  } catch (error) {
    console.error('[Analytics] Error getting popular searches:', error);
    return [];
  }
}

/**
 * Récupère l'historique de recherche récent
 */
export async function getRecentSearches(limit: number = 10) {
  try {
    const db = await initDB();
    const tx = db.transaction('search-history', 'readonly');
    const index = tx.store.index('by-date');
    
    let searches = await index.getAll();
    searches.sort((a, b) => b.timestamp - a.timestamp);
    
    // Dédupliquer
    const unique = new Map<string, typeof searches[0]>();
    searches.forEach(search => {
      if (!unique.has(search.searchTerm)) {
        unique.set(search.searchTerm, search);
      }
    });
    
    return Array.from(unique.values()).slice(0, limit);
  } catch (error) {
    console.error('[Analytics] Error getting recent searches:', error);
    return [];
  }
}

// ============================================
// PERFORMANCE METRICS
// ============================================

/**
 * Enregistre une métrique de performance
 */
export async function trackPerformanceMetric(
  metric: 'FCP' | 'LCP' | 'TTI' | 'CLS' | 'FID' | 'TTFB',
  value: number,
  route: string = window.location.pathname
): Promise<void> {
  try {
    const db = await initDB();
    
    await db.add('performance-metrics', {
      metric,
      value,
      timestamp: Date.now(),
      route,
    });
    
    console.log(`[Performance] Tracked ${metric}: ${value.toFixed(2)}ms`);
  } catch (error) {
    console.error('[Performance] Error tracking metric:', error);
  }
}

/**
 * Récupère les métriques de performance moyennes
 */
export async function getAverageMetrics(route?: string) {
  try {
    const db = await initDB();
    let metrics = await db.getAll('performance-metrics');
    
    if (route) {
      metrics = metrics.filter(m => m.route === route);
    }
    
    const grouped = metrics.reduce((acc, m) => {
      if (!acc[m.metric]) acc[m.metric] = [];
      acc[m.metric].push(m.value);
      return acc;
    }, {} as Record<string, number[]>);
    
    const averages: Record<string, number> = {};
    Object.entries(grouped).forEach(([metric, values]) => {
      averages[metric] = values.reduce((sum, v) => sum + v, 0) / values.length;
    });
    
    return averages;
  } catch (error) {
    console.error('[Performance] Error getting average metrics:', error);
    return {};
  }
}

/**
 * Nettoie les anciennes métriques (garde les 7 derniers jours)
 */
export async function cleanupOldMetrics(): Promise<void> {
  try {
    const db = await initDB();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const tx = db.transaction('performance-metrics', 'readwrite');
    const index = tx.store.index('by-date');
    
    let cursor = await index.openCursor();
    while (cursor) {
      if (cursor.value.timestamp < sevenDaysAgo) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
    
    console.log('[Performance] Cleaned up old metrics');
  } catch (error) {
    console.error('[Performance] Error cleaning up metrics:', error);
  }
}
