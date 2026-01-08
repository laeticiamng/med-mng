import { useState, useEffect, useCallback } from 'react';

interface OfflineTrack {
  id: string;
  title: string;
  audioUrl: string;
  style: string;
  rang: string;
  itemCode: string;
  createdAt: string;
  cachedAt?: string;
  isOfflineAvailable: boolean;
}

const OFFLINE_STORAGE_KEY = 'med-mng-offline-tracks';
const MAX_OFFLINE_TRACKS = 20;

export const useOfflineHistory = () => {
  const [offlineTracks, setOfflineTracks] = useState<OfflineTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState<number>(0);

  // Charger les tracks hors-ligne au démarrage
  useEffect(() => {
    loadOfflineTracks();
  }, []);

  const loadOfflineTracks = useCallback(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OfflineTrack[];
        setOfflineTracks(parsed);
        calculateStorageUsed();
      }
    } catch (err) {
      console.error('Erreur chargement tracks hors-ligne:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateStorageUsed = useCallback(() => {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage.getItem(key)?.length || 0;
        }
      }
      setStorageUsed(total);
    } catch {
      setStorageUsed(0);
    }
  }, []);

  // Sauvegarder un track pour utilisation hors-ligne
  const saveForOffline = useCallback(async (track: Omit<OfflineTrack, 'cachedAt' | 'isOfflineAvailable'>) => {
    try {
      // Vérifier si le track existe déjà
      const existing = offlineTracks.find(t => t.id === track.id);
      if (existing?.isOfflineAvailable) {
        return { success: true, message: 'Déjà disponible hors-ligne' };
      }

      // Limiter le nombre de tracks hors-ligne
      if (offlineTracks.length >= MAX_OFFLINE_TRACKS) {
        // Supprimer le plus ancien
        const sorted = [...offlineTracks].sort(
          (a, b) => new Date(a.cachedAt || a.createdAt).getTime() - new Date(b.cachedAt || b.createdAt).getTime()
        );
        await removeFromOffline(sorted[0].id);
      }

      const offlineTrack: OfflineTrack = {
        ...track,
        cachedAt: new Date().toISOString(),
        isOfflineAvailable: true,
      };

      const newTracks = [...offlineTracks.filter(t => t.id !== track.id), offlineTrack];
      
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(newTracks));
      setOfflineTracks(newTracks);
      calculateStorageUsed();

      return { success: true, message: 'Sauvegardé pour utilisation hors-ligne' };
    } catch (err) {
      console.error('Erreur sauvegarde hors-ligne:', err);
      return { success: false, message: 'Espace de stockage insuffisant' };
    }
  }, [offlineTracks, calculateStorageUsed]);

  // Supprimer un track du stockage hors-ligne
  const removeFromOffline = useCallback(async (trackId: string) => {
    try {
      const newTracks = offlineTracks.filter(t => t.id !== trackId);
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(newTracks));
      setOfflineTracks(newTracks);
      calculateStorageUsed();
      return { success: true };
    } catch (err) {
      console.error('Erreur suppression hors-ligne:', err);
      return { success: false };
    }
  }, [offlineTracks, calculateStorageUsed]);

  // Vérifier si un track est disponible hors-ligne
  const isAvailableOffline = useCallback((trackId: string): boolean => {
    return offlineTracks.some(t => t.id === trackId && t.isOfflineAvailable);
  }, [offlineTracks]);

  // Vider tout le cache hors-ligne
  const clearOfflineCache = useCallback(() => {
    try {
      localStorage.removeItem(OFFLINE_STORAGE_KEY);
      setOfflineTracks([]);
      calculateStorageUsed();
      return { success: true };
    } catch {
      return { success: false };
    }
  }, [calculateStorageUsed]);

  // Statistiques
  const stats = {
    totalTracks: offlineTracks.length,
    maxTracks: MAX_OFFLINE_TRACKS,
    storageUsedKB: Math.round(storageUsed / 1024),
    storageUsedMB: (storageUsed / (1024 * 1024)).toFixed(2),
  };

  return {
    offlineTracks,
    isLoading,
    saveForOffline,
    removeFromOffline,
    isAvailableOffline,
    clearOfflineCache,
    refreshOfflineTracks: loadOfflineTracks,
    stats,
  };
};
