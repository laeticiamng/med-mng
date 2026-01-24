/**
 * Hook pour gérer la file d'attente hors-ligne
 * ✅ NOUVEAU: Stocke les requêtes en IndexedDB et les synchronise quand online
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface QueuedRequest {
  id: string;
  type: 'generate-music' | 'save-favorite' | 'delete-track';
  payload: any;
  createdAt: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  retryCount: number;
  error?: string;
}

const DB_NAME = 'med-mng-offline';
const STORE_NAME = 'generation-queue';

// Ouvrir la base IndexedDB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueuedRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Charger la queue depuis IndexedDB
  const loadQueue = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      return new Promise<QueuedRequest[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erreur chargement queue:', error);
      return [];
    }
  }, []);

  // Sauvegarder une requête dans la queue
  const saveToQueue = useCallback(async (item: QueuedRequest) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.put(item);
      
      // Mettre à jour l'état local
      setQueue(prev => {
        const exists = prev.find(p => p.id === item.id);
        if (exists) {
          return prev.map(p => p.id === item.id ? item : p);
        }
        return [...prev, item];
      });
    } catch (error) {
      console.error('Erreur sauvegarde queue:', error);
    }
  }, []);

  // Supprimer de la queue
  const removeFromQueue = useCallback(async (id: string) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id);
      
      setQueue(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erreur suppression queue:', error);
    }
  }, []);

  // Ajouter une requête de génération
  const addGenerationRequest = useCallback(async (payload: any) => {
    const item: QueuedRequest = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
        ? `gen_${crypto.randomUUID().slice(0, 8)}` 
        : `gen_${Date.now()}_${queue.length.toString(36).padStart(6, '0')}`,
      type: 'generate-music',
      payload,
      createdAt: Date.now(),
      status: 'pending',
      retryCount: 0
    };
    
    await saveToQueue(item);
    
    toast.info('Requête mise en file d\'attente', {
      description: 'Elle sera traitée dès que vous serez en ligne'
    });
    
    return item.id;
  }, [saveToQueue]);

  // Traiter une requête
  const processRequest = useCallback(async (item: QueuedRequest): Promise<boolean> => {
    try {
      await saveToQueue({ ...item, status: 'uploading' });
      
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: item.payload
      });
      
      if (error) throw error;
      
      await removeFromQueue(item.id);
      
      toast.success('Génération synchronisée !', {
        description: data.trackId ? 'Musique en cours de génération' : 'Requête traitée'
      });
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      
      if (item.retryCount >= 3) {
        await saveToQueue({ ...item, status: 'failed', error: errorMsg });
        return false;
      }
      
      await saveToQueue({ ...item, status: 'pending', retryCount: item.retryCount + 1 });
      return false;
    }
  }, [saveToQueue, removeFromQueue]);

  // Synchroniser toutes les requêtes en attente
  const syncAll = useCallback(async () => {
    if (isProcessing || !isOnline) return;
    
    const pending = queue.filter(q => q.status === 'pending');
    if (pending.length === 0) return;
    
    setIsProcessing(true);
    
    let successCount = 0;
    
    for (const item of pending) {
      const success = await processRequest(item);
      if (success) successCount++;
    }
    
    setIsProcessing(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} requête(s) synchronisée(s)`);
    }
  }, [queue, isProcessing, isOnline, processRequest]);

  // Retenter les requêtes échouées
  const retryFailed = useCallback(async () => {
    const failed = queue.filter(q => q.status === 'failed');
    
    for (const item of failed) {
      await saveToQueue({ ...item, status: 'pending', retryCount: 0, error: undefined });
    }
    
    await syncAll();
  }, [queue, saveToQueue, syncAll]);

  // Vider la queue
  const clearQueue = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      
      setQueue([]);
      toast.info('File d\'attente vidée');
    } catch (error) {
      console.error('Erreur clear queue:', error);
    }
  }, []);

  // Écouter les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Synchroniser automatiquement quand on revient en ligne
      syncAll();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncAll]);

  // Charger la queue au montage
  useEffect(() => {
    loadQueue().then(setQueue);
  }, [loadQueue]);

  // Stats
  const stats = {
    pending: queue.filter(q => q.status === 'pending').length,
    uploading: queue.filter(q => q.status === 'uploading').length,
    completed: queue.filter(q => q.status === 'completed').length,
    failed: queue.filter(q => q.status === 'failed').length,
    total: queue.length
  };

  return {
    queue,
    stats,
    isOnline,
    isProcessing,
    addGenerationRequest,
    syncAll,
    retryFailed,
    clearQueue,
    removeFromQueue
  };
};
