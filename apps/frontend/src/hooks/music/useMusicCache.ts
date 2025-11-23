/**
 * 🎵 Hook pour utiliser le système de cache musical
 */

import logger from '@/lib/logger';
import { useState, useCallback } from 'react';
import { MusicCacheService } from '@shared/services/musicCacheService';
import { useToast } from '@/hooks/use-toast';

interface CacheParams {
  itemCode: string;
  rang: 'A' | 'B' | 'AB';
  style: string;
  language?: string;
}

export const useMusicCache = () => {
  const [isCheckingCache, setIsCheckingCache] = useState(false);
  const { toast } = useToast();

  /**
   * Vérifier si un track existe en cache
   */
  const checkCache = useCallback(async (params: CacheParams) => {
    setIsCheckingCache(true);
    logger.debug('🔍 Vérification cache pour:', params);

    try {
      const cachedTrack = await MusicCacheService.findCachedTrack(params);

      if (cachedTrack) {
        logger.debug('✅ CACHE HIT!', cachedTrack);

        toast({
          title: "🎵 Musique trouvée en cache",
          description: `${params.itemCode} Rang ${params.rang} déjà généré - Chargement instantané !`,
          duration: 3000,
        });

        return cachedTrack;
      } else {
        logger.debug('❌ Cache miss, génération nécessaire');
        return null;
      }
    } catch (error) {
      logger.error('❌ Erreur vérification cache:', error);
      return null;
    } finally {
      setIsCheckingCache(false);
    }
  }, [toast]);

  /**
   * Enregistrer un track en cache après génération
   */
  const saveToCache = useCallback(async (params: CacheParams, trackId: string) => {
    logger.debug('💾 Sauvegarde en cache:', params, trackId);

    try {
      await MusicCacheService.cacheTrack(params, trackId);
      logger.debug('✅ Track sauvegardé en cache');
    } catch (error) {
      logger.error('❌ Erreur sauvegarde cache:', error);
    }
  }, []);

  /**
   * Invalider le cache pour un item
   */
  const invalidateCache = useCallback(async (params: CacheParams) => {
    logger.debug('🗑️ Invalidation cache:', params);

    try {
      await MusicCacheService.invalidateCache(params);

      toast({
        title: "Cache invalidé",
        description: "Le cache a été supprimé, une nouvelle génération sera effectuée",
      });
    } catch (error) {
      logger.error('❌ Erreur invalidation cache:', error);

      toast({
        title: "Erreur",
        description: "Impossible d'invalider le cache",
        variant: "destructive",
      });
    }
  }, [toast]);

  /**
   * Obtenir les statistiques du cache
   */
  const getCacheStats = useCallback(async () => {
    try {
      const stats = await MusicCacheService.getCacheStats();
      return stats;
    } catch (error) {
      logger.error('❌ Erreur récupération stats cache:', error);
      return null;
    }
  }, []);

  /**
   * Nettoyer les caches expirés
   */
  const cleanExpiredCache = useCallback(async () => {
    try {
      const cleanedCount = await MusicCacheService.cleanExpiredCache();

      if (cleanedCount > 0) {
        toast({
          title: "Cache nettoyé",
          description: `${cleanedCount} entrées expirées supprimées`,
        });
      }

      return cleanedCount;
    } catch (error) {
      logger.error('❌ Erreur nettoyage cache:', error);

      toast({
        title: "Erreur",
        description: "Impossible de nettoyer le cache",
        variant: "destructive",
      });

      return 0;
    }
  }, [toast]);

  return {
    checkCache,
    saveToCache,
    invalidateCache,
    getCacheStats,
    cleanExpiredCache,
    isCheckingCache
  };
};
