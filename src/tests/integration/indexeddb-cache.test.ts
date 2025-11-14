/**
 * Tests d'intégration pour le système de cache IndexedDB
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  initDB, 
  setCacheItem, 
  getCacheItem, 
  deleteCacheItem,
  clearCache,
  trackItemView,
  getTopViewedItems,
  trackSearch,
  getPopularSearches,
  trackPerformanceMetric,
  getAverageMetrics
} from '@/lib/indexedDB';

describe('IndexedDB Cache System', () => {
  beforeEach(async () => {
    await initDB();
  });

  afterEach(async () => {
    await clearCache();
  });

  describe('Cache Management', () => {
    it('devrait enregistrer et récupérer un item du cache', async () => {
      const testData = { id: '1', name: 'Test Item', value: 123 };
      
      await setCacheItem('test-key', testData);
      const cached = await getCacheItem('test-key');
      
      expect(cached).toEqual(testData);
    });

    it('devrait retourner null pour un item inexistant', async () => {
      const cached = await getCacheItem('non-existent');
      expect(cached).toBeNull();
    });

    it('devrait supprimer un item du cache', async () => {
      await setCacheItem('test-key', { data: 'test' });
      await deleteCacheItem('test-key');
      
      const cached = await getCacheItem('test-key');
      expect(cached).toBeNull();
    });

    it('devrait vider tout le cache', async () => {
      await setCacheItem('key1', { data: 'test1' });
      await setCacheItem('key2', { data: 'test2' });
      
      await clearCache();
      
      const cached1 = await getCacheItem('key1');
      const cached2 = await getCacheItem('key2');
      
      expect(cached1).toBeNull();
      expect(cached2).toBeNull();
    });
  });

  describe('Analytics - Item Views', () => {
    it('devrait tracker une consultation d\'item', async () => {
      await trackItemView('IC-001', 30);
      
      const stats = await getTopViewedItems(10);
      const item = stats.find(s => s.itemCode === 'IC-001');
      
      expect(item).toBeDefined();
      expect(item?.viewCount).toBe(1);
      expect(item?.totalTimeSpent).toBe(30);
    });

    it('devrait accumuler les consultations', async () => {
      await trackItemView('IC-001', 30);
      await trackItemView('IC-001', 45);
      await trackItemView('IC-001', 60);
      
      const stats = await getTopViewedItems(10);
      const item = stats.find(s => s.itemCode === 'IC-001');
      
      expect(item?.viewCount).toBe(3);
      expect(item?.totalTimeSpent).toBe(135); // 30 + 45 + 60
      expect(item?.averageTimeSpent).toBe(45); // 135 / 3
    });

    it('devrait retourner les items triés par popularité', async () => {
      await trackItemView('IC-001', 10);
      await trackItemView('IC-002', 20);
      await trackItemView('IC-002', 20);
      await trackItemView('IC-003', 30);
      await trackItemView('IC-003', 30);
      await trackItemView('IC-003', 30);
      
      const topItems = await getTopViewedItems(3);
      
      expect(topItems[0].itemCode).toBe('IC-003'); // 3 vues
      expect(topItems[1].itemCode).toBe('IC-002'); // 2 vues
      expect(topItems[2].itemCode).toBe('IC-001'); // 1 vue
    });
  });

  describe('Analytics - Search History', () => {
    it('devrait tracker une recherche', async () => {
      await trackSearch('cardiologie', 10);
      
      const searches = await getPopularSearches(10);
      const search = searches.find(s => s.term === 'cardiologie');
      
      expect(search).toBeDefined();
      expect(search?.count).toBe(1);
    });

    it('devrait compter les recherches identiques', async () => {
      await trackSearch('Neurologie', 5);
      await trackSearch('NEUROLOGIE', 8);
      await trackSearch('neurologie', 3);
      
      const searches = await getPopularSearches(10);
      const search = searches.find(s => s.term === 'neurologie');
      
      expect(search?.count).toBe(3); // Normalisé en minuscules
    });

    it('devrait retourner les recherches triées par popularité', async () => {
      await trackSearch('cardio', 10);
      await trackSearch('neuro', 5);
      await trackSearch('neuro', 8);
      await trackSearch('pneumo', 3);
      await trackSearch('pneumo', 4);
      await trackSearch('pneumo', 2);
      
      const popular = await getPopularSearches(3);
      
      expect(popular[0].term).toBe('pneumo'); // 3 fois
      expect(popular[1].term).toBe('neuro');  // 2 fois
      expect(popular[2].term).toBe('cardio'); // 1 fois
    });
  });

  describe('Performance Metrics', () => {
    it('devrait tracker une métrique de performance', async () => {
      await trackPerformanceMetric('FCP', 1234.5, '/edn-complete');
      
      const metrics = await getAverageMetrics('/edn-complete');
      
      expect(metrics.FCP).toBe(1234.5);
    });

    it('devrait calculer la moyenne de plusieurs métriques', async () => {
      await trackPerformanceMetric('FCP', 1000, '/edn-complete');
      await trackPerformanceMetric('FCP', 1200, '/edn-complete');
      await trackPerformanceMetric('FCP', 1400, '/edn-complete');
      
      const metrics = await getAverageMetrics('/edn-complete');
      
      expect(metrics.FCP).toBe(1200); // (1000 + 1200 + 1400) / 3
    });

    it('devrait filtrer par route', async () => {
      await trackPerformanceMetric('LCP', 2000, '/edn-complete');
      await trackPerformanceMetric('LCP', 3000, '/other-page');
      
      const metricsEdn = await getAverageMetrics('/edn-complete');
      const metricsOther = await getAverageMetrics('/other-page');
      
      expect(metricsEdn.LCP).toBe(2000);
      expect(metricsOther.LCP).toBe(3000);
    });

    it('devrait gérer plusieurs types de métriques', async () => {
      await trackPerformanceMetric('FCP', 1000);
      await trackPerformanceMetric('LCP', 2000);
      await trackPerformanceMetric('CLS', 0.05);
      await trackPerformanceMetric('FID', 50);
      await trackPerformanceMetric('TTFB', 300);
      
      const metrics = await getAverageMetrics();
      
      expect(metrics.FCP).toBe(1000);
      expect(metrics.LCP).toBe(2000);
      expect(metrics.CLS).toBe(0.05);
      expect(metrics.FID).toBe(50);
      expect(metrics.TTFB).toBe(300);
    });
  });

  describe('Error Handling', () => {
    it('ne devrait pas throw sur une erreur de cache', async () => {
      // Ne devrait pas throw même si la clé est invalide
      await expect(getCacheItem('')).resolves.toBeNull();
    });

    it('devrait gérer gracieusement les erreurs de tracking', async () => {
      // Ne devrait pas throw
      await expect(trackItemView('', 0)).resolves.toBeUndefined();
      await expect(trackSearch('', 0)).resolves.toBeUndefined();
    });
  });
});
