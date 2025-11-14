/**
 * Hook pour détecter les tendances et créer des notifications
 */

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { getTopViewedItems, getPopularSearches } from '@/lib/indexedDB';

interface TrendingConfig {
  checkInterval?: number; // ms entre chaque vérification
  viewThreshold?: number; // nombre de vues pour considérer un item comme tendance
  searchThreshold?: number; // nombre de recherches pour considérer un terme comme tendance
}

export function useTrendingDetection(config: TrendingConfig = {}) {
  const {
    checkInterval = 5 * 60 * 1000, // 5 minutes par défaut
    viewThreshold = 10,
    searchThreshold = 5,
  } = config;
  
  const addNotification = useNotificationStore((state) => state.addNotification);
  const lastCheckRef = useRef<{ views: string[]; searches: string[] }>({
    views: [],
    searches: [],
  });
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const checkTrends = async () => {
      try {
        // Vérifier les items tendances
        const topViewed = await getTopViewedItems(5);
        const trendingItems = topViewed.filter(item => item.viewCount >= viewThreshold);
        
        trendingItems.forEach(item => {
          // Notifier seulement si c'est nouveau
          if (!lastCheckRef.current.views.includes(item.itemCode)) {
            addNotification({
              type: 'trending-item',
              title: '🔥 Item Tendance',
              message: `${item.itemCode} est consulté fréquemment (${item.viewCount} vues)`,
              data: item,
            });
            lastCheckRef.current.views.push(item.itemCode);
          }
        });
        
        // Vérifier les recherches tendances
        const popularSearches = await getPopularSearches(5);
        const trendingSearches = popularSearches.filter(s => s.count >= searchThreshold);
        
        trendingSearches.forEach(search => {
          if (!lastCheckRef.current.searches.includes(search.term)) {
            addNotification({
              type: 'popular-search',
              title: '🔍 Recherche Populaire',
              message: `"${search.term}" est recherché fréquemment (${search.count} fois)`,
              data: search,
            });
            lastCheckRef.current.searches.push(search.term);
          }
        });
        
        // Nettoyer les anciens items (garder seulement les 20 derniers)
        lastCheckRef.current.views = lastCheckRef.current.views.slice(-20);
        lastCheckRef.current.searches = lastCheckRef.current.searches.slice(-20);
      } catch (error) {
        console.error('[Trending Detection] Error checking trends:', error);
      }
    };
    
    // Vérification initiale
    checkTrends();
    
    // Vérifications périodiques
    intervalId = setInterval(checkTrends, checkInterval);
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [checkInterval, viewThreshold, searchThreshold, addNotification]);
}
