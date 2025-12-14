// IndexedDB Audio Cache for PWA offline support with quota management

const DB_NAME = 'medmng_offline';
const DB_VERSION = 2;
const AUDIO_STORE = 'offline_content';
const MAX_CACHE_SIZE_MB = 200; // Maximum cache size in MB

interface CachedAudio {
  id: string;
  type: 'music' | 'voice' | 'podcast';
  title: string;
  audioBlob: Uint8Array;
  size: number;
  downloadedAt: Date;
  lastSynced: Date;
  lastAccessed: Date;
  duration?: number;
}

interface CacheStats {
  totalItems: number;
  totalSizeMB: number;
  oldestItem: Date | null;
  newestItem: Date | null;
}

class AudioCacheManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(AUDIO_STORE)) {
          const store = db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
    
    return this.initPromise;
  }

  async getCachedAudio(audioId: string): Promise<string | null> {
    try {
      await this.init();
      return new Promise((resolve) => {
        const transaction = this.db!.transaction(AUDIO_STORE, 'readwrite');
        const store = transaction.objectStore(AUDIO_STORE);
        const request = store.get(audioId);
        request.onerror = () => resolve(null);
        request.onsuccess = () => {
          const result = request.result as CachedAudio | undefined;
          if (result?.audioBlob) {
            // Update last accessed time
            result.lastAccessed = new Date();
            store.put(result);
            
            const blob = new Blob([new Uint8Array(result.audioBlob)], { type: 'audio/mpeg' });
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(null);
          }
        };
      });
    } catch {
      return null;
    }
  }

  async cacheAudio(
    audioId: string, 
    audioUrl: string, 
    title: string, 
    type: 'music' | 'voice' | 'podcast' = 'music',
    duration?: number
  ): Promise<boolean> {
    try {
      await this.init();
      
      // Check if we need to free up space
      await this.ensureStorageSpace();
      
      const response = await fetch(audioUrl);
      if (!response.ok) return false;
      const arrayBuffer = await response.arrayBuffer();
      const audioBlob = new Uint8Array(arrayBuffer);
      
      const cachedData: CachedAudio = {
        id: audioId,
        type,
        title,
        audioBlob,
        size: audioBlob.length,
        downloadedAt: new Date(),
        lastSynced: new Date(),
        lastAccessed: new Date(),
        duration
      };

      return new Promise((resolve) => {
        const transaction = this.db!.transaction(AUDIO_STORE, 'readwrite');
        const store = transaction.objectStore(AUDIO_STORE);
        const request = store.put(cachedData);
        request.onerror = () => resolve(false);
        request.onsuccess = () => resolve(true);
      });
    } catch {
      return false;
    }
  }

  async isAudioCached(audioId: string): Promise<boolean> {
    try {
      await this.init();
      return new Promise((resolve) => {
        const transaction = this.db!.transaction(AUDIO_STORE, 'readonly');
        const store = transaction.objectStore(AUDIO_STORE);
        const request = store.get(audioId);
        request.onerror = () => resolve(false);
        request.onsuccess = () => resolve(!!request.result?.audioBlob);
      });
    } catch {
      return false;
    }
  }

  async getCacheStats(): Promise<CacheStats> {
    try {
      await this.init();
      return new Promise((resolve) => {
        const transaction = this.db!.transaction(AUDIO_STORE, 'readonly');
        const store = transaction.objectStore(AUDIO_STORE);
        const request = store.getAll();
        
        request.onerror = () => resolve({ totalItems: 0, totalSizeMB: 0, oldestItem: null, newestItem: null });
        request.onsuccess = () => {
          const items = request.result as CachedAudio[];
          const totalSize = items.reduce((sum, item) => sum + item.size, 0);
          const dates = items.map(i => new Date(i.downloadedAt)).sort((a, b) => a.getTime() - b.getTime());
          
          resolve({
            totalItems: items.length,
            totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
            oldestItem: dates[0] || null,
            newestItem: dates[dates.length - 1] || null
          });
        };
      });
    } catch {
      return { totalItems: 0, totalSizeMB: 0, oldestItem: null, newestItem: null };
    }
  }

  async getAllCachedItems(): Promise<{ id: string; title: string; type: string; sizeMB: number; downloadedAt: Date }[]> {
    try {
      await this.init();
      return new Promise((resolve) => {
        const transaction = this.db!.transaction(AUDIO_STORE, 'readonly');
        const store = transaction.objectStore(AUDIO_STORE);
        const request = store.getAll();
        
        request.onerror = () => resolve([]);
        request.onsuccess = () => {
          const items = request.result as CachedAudio[];
          resolve(items.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            sizeMB: Math.round(item.size / (1024 * 1024) * 100) / 100,
            downloadedAt: new Date(item.downloadedAt)
          })));
        };
      });
    } catch {
      return [];
    }
  }

  async removeFromCache(audioId: string): Promise<boolean> {
    try {
      await this.init();
      return new Promise((resolve) => {
        const transaction = this.db!.transaction(AUDIO_STORE, 'readwrite');
        const store = transaction.objectStore(AUDIO_STORE);
        const request = store.delete(audioId);
        request.onerror = () => resolve(false);
        request.onsuccess = () => resolve(true);
      });
    } catch {
      return false;
    }
  }

  async clearCache(): Promise<boolean> {
    try {
      await this.init();
      return new Promise((resolve) => {
        const transaction = this.db!.transaction(AUDIO_STORE, 'readwrite');
        const store = transaction.objectStore(AUDIO_STORE);
        const request = store.clear();
        request.onerror = () => resolve(false);
        request.onsuccess = () => resolve(true);
      });
    } catch {
      return false;
    }
  }

  private async ensureStorageSpace(): Promise<void> {
    const stats = await this.getCacheStats();
    
    // If we're over the limit, remove oldest accessed items
    if (stats.totalSizeMB > MAX_CACHE_SIZE_MB) {
      try {
        await this.init();
        const transaction = this.db!.transaction(AUDIO_STORE, 'readwrite');
        const store = transaction.objectStore(AUDIO_STORE);
        const index = store.index('lastAccessed');
        
        // Get all items sorted by last accessed (oldest first)
        const request = index.openCursor();
        let freedSpace = 0;
        const targetFreeSpace = (stats.totalSizeMB - MAX_CACHE_SIZE_MB * 0.8) * 1024 * 1024;
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor && freedSpace < targetFreeSpace) {
            const item = cursor.value as CachedAudio;
            freedSpace += item.size;
            cursor.delete();
            cursor.continue();
          }
        };
      } catch (e) {
        console.error('Error freeing cache space:', e);
      }
    }
  }
}

export const audioCache = new AudioCacheManager();
