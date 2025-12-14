// Hook to use audio with IndexedDB caching for offline support
import { useState, useCallback, useEffect } from 'react';
import { audioCache } from '@/lib/audioCache';
import { useToast } from '@/hooks/use-toast';

interface UseAudioWithCacheOptions {
  autoCache?: boolean;
  type?: 'music' | 'voice' | 'podcast';
}

export function useAudioWithCache(options: UseAudioWithCacheOptions = {}) {
  const { autoCache = false, type = 'music' } = options;
  const [cachedUrls, setCachedUrls] = useState<Map<string, string>>(new Map());
  const [cacheLoading, setCacheLoading] = useState<Set<string>>(new Set());
  const [cacheStats, setCacheStats] = useState<{ totalItems: number; totalSizeMB: number } | null>(null);
  const { toast } = useToast();

  // Load cache stats on mount
  useEffect(() => {
    audioCache.getCacheStats().then(setCacheStats);
  }, []);

  // Get audio URL (from cache or original)
  const getAudioUrl = useCallback(async (audioId: string, originalUrl: string): Promise<string> => {
    // Check if already in memory cache
    if (cachedUrls.has(audioId)) {
      return cachedUrls.get(audioId)!;
    }

    // Try to get from IndexedDB cache
    const cachedUrl = await audioCache.getCachedAudio(audioId);
    if (cachedUrl) {
      setCachedUrls(prev => new Map(prev).set(audioId, cachedUrl));
      return cachedUrl;
    }

    // Return original URL and optionally cache it
    if (autoCache) {
      cacheAudio(audioId, originalUrl, `Audio ${audioId}`);
    }

    return originalUrl;
  }, [cachedUrls, autoCache]);

  // Cache audio file
  const cacheAudio = useCallback(async (
    audioId: string,
    audioUrl: string,
    title: string,
    duration?: number
  ): Promise<boolean> => {
    if (cacheLoading.has(audioId)) return false;

    setCacheLoading(prev => new Set(prev).add(audioId));

    try {
      const success = await audioCache.cacheAudio(audioId, audioUrl, title, type, duration);
      
      if (success) {
        const cachedUrl = await audioCache.getCachedAudio(audioId);
        if (cachedUrl) {
          setCachedUrls(prev => new Map(prev).set(audioId, cachedUrl));
        }
        
        // Update stats
        const stats = await audioCache.getCacheStats();
        setCacheStats(stats);
        
        toast({
          title: '📥 Audio mis en cache',
          description: `"${title}" disponible hors-ligne`,
        });
      }
      
      return success;
    } catch (error) {
      console.error('Cache error:', error);
      toast({
        title: 'Erreur de cache',
        description: 'Impossible de mettre en cache cet audio',
        variant: 'destructive'
      });
      return false;
    } finally {
      setCacheLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(audioId);
        return newSet;
      });
    }
  }, [type, cacheLoading, toast]);

  // Check if audio is cached
  const isAudioCached = useCallback(async (audioId: string): Promise<boolean> => {
    if (cachedUrls.has(audioId)) return true;
    return audioCache.isAudioCached(audioId);
  }, [cachedUrls]);

  // Remove from cache
  const removeFromCache = useCallback(async (audioId: string): Promise<boolean> => {
    const success = await audioCache.removeFromCache(audioId);
    if (success) {
      setCachedUrls(prev => {
        const newMap = new Map(prev);
        newMap.delete(audioId);
        return newMap;
      });
      const stats = await audioCache.getCacheStats();
      setCacheStats(stats);
    }
    return success;
  }, []);

  // Clear entire cache
  const clearCache = useCallback(async (): Promise<boolean> => {
    const success = await audioCache.clearCache();
    if (success) {
      setCachedUrls(new Map());
      setCacheStats({ totalItems: 0, totalSizeMB: 0 });
      toast({
        title: 'Cache vidé',
        description: 'Tous les audios hors-ligne ont été supprimés'
      });
    }
    return success;
  }, [toast]);

  // Get all cached items
  const getCachedItems = useCallback(async () => {
    return audioCache.getAllCachedItems();
  }, []);

  return {
    getAudioUrl,
    cacheAudio,
    isAudioCached,
    removeFromCache,
    clearCache,
    getCachedItems,
    cacheStats,
    isCaching: (audioId: string) => cacheLoading.has(audioId)
  };
}
