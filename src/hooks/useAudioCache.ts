import { useState, useEffect, useCallback } from 'react';

interface AudioCacheStats {
  totalEntries: number;
  totalSize: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

const CACHE_NAME = 'med-mng-audio-cache';
const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB

export const useAudioCache = () => {
  const [cacheStats, setCacheStats] = useState<AudioCacheStats>({
    totalEntries: 0,
    totalSize: 0,
    oldestEntry: null,
    newestEntry: null
  });
  const [isSupported, setIsSupported] = useState(false);

  // Check if Cache API is supported
  useEffect(() => {
    const checkSupport = async () => {
      try {
        if ('caches' in window) {
          await caches.open(CACHE_NAME);
          setIsSupported(true);
          refreshStats();
        }
      } catch (error) {
        console.warn('Cache API not supported:', error);
        setIsSupported(false);
      }
    };
    checkSupport();
  }, []);

  // Refresh cache stats
  const refreshStats = useCallback(async () => {
    if (!isSupported) return;

    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      
      let totalSize = 0;
      let oldest: number | null = null;
      let newest: number | null = null;

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const headers = response.headers;
          const cachedAt = parseInt(headers.get('x-cached-at') || '0');
          const size = parseInt(headers.get('x-size') || '0');
          
          totalSize += size;
          if (!oldest || cachedAt < oldest) oldest = cachedAt;
          if (!newest || cachedAt > newest) newest = cachedAt;
        }
      }

      setCacheStats({
        totalEntries: keys.length,
        totalSize,
        oldestEntry: oldest,
        newestEntry: newest
      });
    } catch (error) {
      console.error('Error refreshing cache stats:', error);
    }
  }, [isSupported]);

  // Get cached audio
  const getCachedAudio = useCallback(async (url: string): Promise<string | null> => {
    if (!isSupported || !url) return null;

    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);
      
      if (!response) return null;

      // Check expiry
      const expiresAt = parseInt(response.headers.get('x-expires-at') || '0');
      if (expiresAt && Date.now() > expiresAt) {
        // Expired, delete and return null
        await cache.delete(url);
        return null;
      }

      // Return blob URL
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error getting cached audio:', error);
      return null;
    }
  }, [isSupported]);

  // Cache audio
  const cacheAudio = useCallback(async (
    url: string, 
    title?: string,
    expiryMs: number = DEFAULT_EXPIRY_MS
  ): Promise<boolean> => {
    if (!isSupported || !url) return false;

    try {
      // Check if already cached
      const existing = await getCachedAudio(url);
      if (existing) {
        URL.revokeObjectURL(existing);
        return true;
      }

      // Fetch the audio
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const size = blob.size;

      // Check cache size limit
      if (cacheStats.totalSize + size > MAX_CACHE_SIZE) {
        // Clean up oldest entries
        await cleanupOldest(size);
      }

      // Create response with metadata headers
      const now = Date.now();
      const cachedResponse = new Response(blob, {
        headers: {
          'Content-Type': blob.type,
          'x-cached-at': now.toString(),
          'x-expires-at': (now + expiryMs).toString(),
          'x-size': size.toString(),
          'x-title': title || ''
        }
      });

      // Store in cache
      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, cachedResponse);

      refreshStats();
      return true;
    } catch (error) {
      console.error('Error caching audio:', error);
      return false;
    }
  }, [isSupported, cacheStats.totalSize, getCachedAudio, refreshStats]);

  // Remove from cache
  const removeFromCache = useCallback(async (url: string): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const cache = await caches.open(CACHE_NAME);
      const deleted = await cache.delete(url);
      if (deleted) refreshStats();
      return deleted;
    } catch (error) {
      console.error('Error removing from cache:', error);
      return false;
    }
  }, [isSupported, refreshStats]);

  // Cleanup oldest entries
  const cleanupOldest = useCallback(async (requiredSpace: number) => {
    if (!isSupported) return;

    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      
      // Get all entries with timestamps
      const entries: { url: string; cachedAt: number; size: number }[] = [];
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          entries.push({
            url: request.url,
            cachedAt: parseInt(response.headers.get('x-cached-at') || '0'),
            size: parseInt(response.headers.get('x-size') || '0')
          });
        }
      }

      // Sort by age (oldest first)
      entries.sort((a, b) => a.cachedAt - b.cachedAt);

      // Delete until we have enough space
      let freedSpace = 0;
      for (const entry of entries) {
        if (freedSpace >= requiredSpace) break;
        await cache.delete(entry.url);
        freedSpace += entry.size;
      }

      refreshStats();
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }, [isSupported, refreshStats]);

  // Cleanup expired entries
  const cleanupExpired = useCallback(async (): Promise<number> => {
    if (!isSupported) return 0;

    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      const now = Date.now();
      let deletedCount = 0;

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const expiresAt = parseInt(response.headers.get('x-expires-at') || '0');
          if (expiresAt && now > expiresAt) {
            await cache.delete(request);
            deletedCount++;
          }
        }
      }

      if (deletedCount > 0) refreshStats();
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired:', error);
      return 0;
    }
  }, [isSupported, refreshStats]);

  // Clear entire cache
  const clearCache = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      await caches.delete(CACHE_NAME);
      setCacheStats({
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null
      });
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }, [isSupported]);

  // Format size for display
  const formatSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    // State
    isSupported,
    cacheStats,
    
    // Actions
    getCachedAudio,
    cacheAudio,
    removeFromCache,
    cleanupExpired,
    cleanupOldest,
    clearCache,
    refreshStats,
    
    // Helpers
    formatSize,
    maxCacheSize: MAX_CACHE_SIZE,
    formattedMaxSize: formatSize(MAX_CACHE_SIZE),
    formattedCurrentSize: formatSize(cacheStats.totalSize),
    usagePercent: Math.round((cacheStats.totalSize / MAX_CACHE_SIZE) * 100)
  };
};
