// IndexedDB Audio Cache for PWA offline support

const DB_NAME = 'medmng_offline';
const DB_VERSION = 1;
const AUDIO_STORE = 'offline_content';

interface CachedAudio {
  id: string;
  type: 'music';
  title: string;
  audioBlob: Uint8Array;
  size: number;
  downloadedAt: Date;
  lastSynced: Date;
}

class AudioCacheManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    
    return new Promise((resolve, reject) => {
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
        }
      };
    });
  }

  async getCachedAudio(audioId: string): Promise<string | null> {
    try {
      await this.init();
      return new Promise((resolve) => {
        const transaction = this.db!.transaction(AUDIO_STORE, 'readonly');
        const store = transaction.objectStore(AUDIO_STORE);
        const request = store.get(audioId);
        request.onerror = () => resolve(null);
        request.onsuccess = () => {
          const result = request.result as CachedAudio | undefined;
          if (result?.audioBlob) {
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

  async cacheAudio(audioId: string, audioUrl: string, title: string): Promise<boolean> {
    try {
      await this.init();
      const response = await fetch(audioUrl);
      if (!response.ok) return false;
      const arrayBuffer = await response.arrayBuffer();
      const audioBlob = new Uint8Array(arrayBuffer);
      
      const cachedData: CachedAudio = {
        id: audioId,
        type: 'music',
        title,
        audioBlob,
        size: audioBlob.length,
        downloadedAt: new Date(),
        lastSynced: new Date()
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
}

export const audioCache = new AudioCacheManager();
