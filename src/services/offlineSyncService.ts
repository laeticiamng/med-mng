import { supabase } from '@/integrations/supabase/client';

interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

const SYNC_QUEUE_KEY = 'med_mng_sync_queue';
const CACHE_PREFIX = 'med_mng_cache_';
const MAX_RETRIES = 3;

class OfflineSyncService {
  private syncQueue: SyncQueueItem[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });

    // Sync when app regains focus
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }

  public onStatusChange(callback: (online: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      this.syncQueue = stored ? JSON.parse(stored) : [];
    } catch {
      this.syncQueue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('[OfflineSync] Failed to save queue:', error);
    }
  }

  public async addToQueue(
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: any
  ): Promise<string> {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? `sync_${crypto.randomUUID().slice(0, 8)}` 
      : `sync_${Date.now()}_${(++this.syncQueue.length).toString(36).padStart(6, '0')}`;

    const item: SyncQueueItem = {
      id,
      table,
      operation,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    this.syncQueue.push(item);
    this.saveQueue();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }

    return id;
  }

  public getQueueLength(): number {
    return this.syncQueue.length;
  }

  public getPendingOperations(): SyncQueueItem[] {
    return [...this.syncQueue];
  }

  public async processSyncQueue(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let success = 0;
    let failed = 0;

    const itemsToProcess = [...this.syncQueue];

    for (const item of itemsToProcess) {
      try {
        await this.processQueueItem(item);
        this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
        success++;
      } catch (error) {
        console.error(`[OfflineSync] Failed to sync item ${item.id}:`, error);

        // Increment retries
        const queueItem = this.syncQueue.find(i => i.id === item.id);
        if (queueItem) {
          queueItem.retries++;
          if (queueItem.retries >= MAX_RETRIES) {
            this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
            failed++;
          }
        }
      }
    }

    this.saveQueue();
    this.syncInProgress = false;

    return { success, failed };
  }

  private async processQueueItem(item: SyncQueueItem): Promise<void> {
    const { table, operation, data } = item;

    switch (operation) {
      case 'insert':
        const { error: insertError } = await (supabase as any).from(table).insert(data);
        if (insertError) throw insertError;
        break;

      case 'update':
        const { id, ...updateData } = data;
        const { error: updateError } = await (supabase as any)
          .from(table)
          .update(updateData)
          .eq('id', id);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await (supabase as any)
          .from(table)
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        break;
    }
  }

  // Cache management for offline data access
  public async cacheData<T>(key: string, data: T, ttlSeconds: number = 3600): Promise<void> {
    const cacheItem: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlSeconds * 1000)
    };

    try {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      // If localStorage is full, try to clear old cache
      this.clearExpiredCache();
      try {
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
      } catch {
        console.error('[OfflineSync] Failed to cache data:', error);
      }
    }
  }

  public getCachedData<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!stored) return null;

      const cacheItem: CachedData = JSON.parse(stored);

      // Check if expired
      if (Date.now() > cacheItem.expiresAt) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return cacheItem.data as T;
    } catch {
      return null;
    }
  }

  public clearExpiredCache(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const cacheItem: CachedData = JSON.parse(stored);
            if (Date.now() > cacheItem.expiresAt) {
              keysToRemove.push(key);
            }
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  public clearAllCache(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Cache EDN items for offline access
  public async cacheEdnItem(itemCode: string, data: any): Promise<void> {
    await this.cacheData(`edn_item_${itemCode}`, data, 86400); // 24 hours
  }

  public getCachedEdnItem(itemCode: string): any | null {
    return this.getCachedData(`edn_item_${itemCode}`);
  }

  // Cache OIC competences for offline access
  public async cacheOicCompetences(itemCode: string, rang: string, data: any[]): Promise<void> {
    await this.cacheData(`oic_${itemCode}_${rang}`, data, 86400); // 24 hours
  }

  public getCachedOicCompetences(itemCode: string, rang: string): any[] | null {
    return this.getCachedData(`oic_${itemCode}_${rang}`);
  }

  // Cache user progress
  public async cacheUserProgress(userId: string, data: any): Promise<void> {
    await this.cacheData(`user_progress_${userId}`, data, 300); // 5 minutes
  }

  public getCachedUserProgress(userId: string): any | null {
    return this.getCachedData(`user_progress_${userId}`);
  }

  // IndexedDB for larger data (audio files, full EDN items, etc.)
  private dbName = 'med_mng_offline_db';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;

  public async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Audio cache store
        if (!db.objectStoreNames.contains('audio_cache')) {
          db.createObjectStore('audio_cache', { keyPath: 'id' });
        }

        // EDN content store
        if (!db.objectStoreNames.contains('edn_content')) {
          db.createObjectStore('edn_content', { keyPath: 'item_code' });
        }

        // User data store
        if (!db.objectStoreNames.contains('user_data')) {
          db.createObjectStore('user_data', { keyPath: 'key' });
        }

        // Full EDN items for offline mode (v2)
        if (!db.objectStoreNames.contains('edn_items_offline')) {
          const store = db.createObjectStore('edn_items_offline', { keyPath: 'item_code' });
          store.createIndex('downloaded_at', 'downloaded_at', { unique: false });
        }

        // Offline progress queue (quiz results, flashcard reviews done offline)
        if (!db.objectStoreNames.contains('offline_progress')) {
          const progressStore = db.createObjectStore('offline_progress', { keyPath: 'id' });
          progressStore.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  }

  public async storeAudioBlob(id: string, blob: Blob): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audio_cache'], 'readwrite');
      const store = transaction.objectStore('audio_cache');

      const request = store.put({ id, blob, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getAudioBlob(id: string): Promise<Blob | null> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audio_cache'], 'readonly');
      const store = transaction.objectStore('audio_cache');

      const request = store.get(id);
      request.onsuccess = () => {
        resolve(request.result?.blob || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async storeEdnContent(itemCode: string, content: any): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['edn_content'], 'readwrite');
      const store = transaction.objectStore('edn_content');

      const request = store.put({ item_code: itemCode, content, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getEdnContent(itemCode: string): Promise<any | null> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['edn_content'], 'readonly');
      const store = transaction.objectStore('edn_content');

      const request = store.get(itemCode);
      request.onsuccess = () => {
        resolve(request.result?.content || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ===== Full EDN Item Offline Storage (Phase 2) =====

  /** Download a full EDN item for offline access */
  public async downloadEdnItemOffline(item: any): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) throw new Error('IndexedDB not available');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['edn_items_offline'], 'readwrite');
      const store = transaction.objectStore('edn_items_offline');

      const record = {
        item_code: item.item_code,
        data: item,
        downloaded_at: Date.now(),
      };

      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /** Get a downloaded EDN item */
  public async getOfflineEdnItem(itemCode: string): Promise<any | null> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['edn_items_offline'], 'readonly');
      const store = transaction.objectStore('edn_items_offline');
      const request = store.get(itemCode);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }

  /** Remove a downloaded EDN item */
  public async removeOfflineEdnItem(itemCode: string): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['edn_items_offline'], 'readwrite');
      const store = transaction.objectStore('edn_items_offline');
      const request = store.delete(itemCode);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /** Get all downloaded item codes */
  public async getDownloadedItemCodes(): Promise<string[]> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['edn_items_offline'], 'readonly');
      const store = transaction.objectStore('edn_items_offline');
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }

  /** Get count of downloaded items */
  public async getDownloadedCount(): Promise<number> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['edn_items_offline'], 'readonly');
      const store = transaction.objectStore('edn_items_offline');
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ===== Offline Progress Tracking =====

  /** Store progress made while offline (quiz, flashcard results) */
  public async storeOfflineProgress(progressData: {
    type: 'quiz' | 'flashcard' | 'study';
    itemCode: string;
    data: any;
  }): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_progress'], 'readwrite');
      const store = transaction.objectStore('offline_progress');
      const record = {
        id: crypto.randomUUID?.() ?? `prog_${Date.now()}`,
        ...progressData,
        timestamp: Date.now(),
        synced: false,
      };
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /** Get all unsynced progress entries */
  public async getUnsyncedProgress(): Promise<any[]> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_progress'], 'readonly');
      const store = transaction.objectStore('offline_progress');
      const results: any[] = [];
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (cursor.value.synced === false) {
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /** Mark progress as synced */
  public async markProgressSynced(id: string): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_progress'], 'readwrite');
      const store = transaction.objectStore('offline_progress');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        if (getReq.result) {
          getReq.result.synced = true;
          store.put(getReq.result);
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  /** Sync all offline progress to Supabase */
  public async syncOfflineProgress(): Promise<{ success: number; failed: number }> {
    const unsyncedItems = await this.getUnsyncedProgress();
    let success = 0;
    let failed = 0;

    for (const item of unsyncedItems) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) break;

        await (supabase as any).from('user_activity_log').insert({
          user_id: user.id,
          activity_type: item.type,
          action: `offline_${item.type}`,
          metadata: { ...item.data, item_code: item.itemCode, offline: true },
          session_id: `offline_${item.timestamp}`,
        });

        await this.markProgressSynced(item.id);
        success++;
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }

  // Get storage usage stats
  public async getStorageStats(): Promise<{
    localStorage: { used: number; available: number };
    indexedDB: { used: number };
    queueLength: number;
    downloadedEdnItems: number;
  }> {
    let localStorageUsed = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageUsed += (localStorage.getItem(key)?.length || 0) * 2; // UTF-16
      }
    }

    let indexedDBUsed = 0;
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      indexedDBUsed = estimate.usage || 0;
    }

    const downloadedEdnItems = await this.getDownloadedCount();

    return {
      localStorage: {
        used: localStorageUsed,
        available: 5 * 1024 * 1024 - localStorageUsed // ~5MB typical limit
      },
      indexedDB: { used: indexedDBUsed },
      queueLength: this.syncQueue.length,
      downloadedEdnItems,
    };
  }
}

export const offlineSyncService = new OfflineSyncService();
