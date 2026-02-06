import { useState, useEffect, useCallback } from 'react';
import { offlineSyncService } from '@/services/offlineSyncService';
import { useToast } from '@/hooks/use-toast';

interface OfflineSyncState {
  isOnline: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  storageUsed: number;
}

export function useOfflineSync() {
  const { toast } = useToast();
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    pendingCount: offlineSyncService.getQueueLength(),
    lastSyncTime: null,
    isSyncing: false,
    storageUsed: 0
  });

  useEffect(() => {
    // Listen to online/offline status changes
    const unsubscribe = offlineSyncService.onStatusChange((online) => {
      setState(prev => ({ ...prev, isOnline: online }));

      if (online) {
        toast({
          title: '🌐 Connexion rétablie',
          description: 'Synchronisation des données en cours...',
        });
        // Auto-sync offline progress on reconnect
        offlineSyncService.syncOfflineProgress().catch(console.error);
      } else {
        toast({
          title: '📴 Mode hors ligne',
          description: 'Vos modifications seront synchronisées à la reconnexion.',
          variant: 'destructive',
        });
      }
    });

    // Initialize IndexedDB
    offlineSyncService.initIndexedDB().catch(console.error);

    // Update storage stats periodically
    const updateStats = async () => {
      const stats = await offlineSyncService.getStorageStats();
      setState(prev => ({
        ...prev,
        pendingCount: stats.queueLength,
        storageUsed: stats.localStorage.used + stats.indexedDB.used
      }));
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [toast]);

  const syncNow = useCallback(async () => {
    if (!state.isOnline) {
      toast({
        title: 'Impossible de synchroniser',
        description: 'Vous êtes actuellement hors ligne.',
        variant: 'destructive',
      });
      return { success: 0, failed: 0 };
    }

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      const result = await offlineSyncService.processSyncQueue();

      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        pendingCount: offlineSyncService.getQueueLength()
      }));

      if (result.success > 0) {
        toast({
          title: 'Synchronisation terminée',
          description: `${result.success} opération(s) synchronisée(s)${result.failed > 0 ? `, ${result.failed} échec(s)` : ''}.`,
        });
      }

      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isSyncing: false }));
      toast({
        title: 'Erreur de synchronisation',
        description: 'Une erreur est survenue lors de la synchronisation.',
        variant: 'destructive',
      });
      return { success: 0, failed: 0 };
    }
  }, [state.isOnline, toast]);

  const addToQueue = useCallback(async (
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: any
  ) => {
    const id = await offlineSyncService.addToQueue(table, operation, data);
    setState(prev => ({ ...prev, pendingCount: offlineSyncService.getQueueLength() }));
    return id;
  }, []);

  const cacheEdnItem = useCallback(async (itemCode: string, data: any) => {
    await offlineSyncService.cacheEdnItem(itemCode, data);
    await offlineSyncService.storeEdnContent(itemCode, data);
  }, []);

  const getCachedEdnItem = useCallback(async (itemCode: string) => {
    // Try localStorage first (faster)
    let cached = offlineSyncService.getCachedEdnItem(itemCode);
    if (cached) return cached;

    // Fall back to IndexedDB (larger storage)
    cached = await offlineSyncService.getEdnContent(itemCode);
    return cached;
  }, []);

  const cacheOicCompetences = useCallback(async (
    itemCode: string,
    rang: string,
    data: any[]
  ) => {
    await offlineSyncService.cacheOicCompetences(itemCode, rang, data);
  }, []);

  const getCachedOicCompetences = useCallback((itemCode: string, rang: string) => {
    return offlineSyncService.getCachedOicCompetences(itemCode, rang);
  }, []);

  const clearCache = useCallback(() => {
    offlineSyncService.clearAllCache();
    setState(prev => ({ ...prev, storageUsed: 0 }));
    toast({
      title: 'Cache vidé',
      description: 'Toutes les données en cache ont été supprimées.',
    });
  }, [toast]);

  const getStorageStats = useCallback(async () => {
    return offlineSyncService.getStorageStats();
  }, []);

  return {
    ...state,
    syncNow,
    addToQueue,
    cacheEdnItem,
    getCachedEdnItem,
    cacheOicCompetences,
    getCachedOicCompetences,
    clearCache,
    getStorageStats
  };
}
