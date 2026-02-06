import { useState, useEffect, useCallback } from 'react';
import { offlineSyncService } from '@/services/offlineSyncService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseEdnOfflineReturn {
  downloadedCodes: Set<string>;
  isDownloading: string | null;
  downloadItem: (item: any) => Promise<void>;
  removeItem: (itemCode: string) => Promise<void>;
  isAvailableOffline: (itemCode: string) => boolean;
  getOfflineItem: (itemCode: string) => Promise<any | null>;
  downloadedCount: number;
  syncProgress: () => Promise<{ success: number; failed: number }>;
}

export function useEdnOffline(): UseEdnOfflineReturn {
  const { toast } = useToast();
  const [downloadedCodes, setDownloadedCodes] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadDownloadedCodes();
  }, []);

  const loadDownloadedCodes = async () => {
    try {
      await offlineSyncService.initIndexedDB();
      const codes = await offlineSyncService.getDownloadedItemCodes();
      setDownloadedCodes(new Set(codes));
    } catch (err) {
      console.debug('[EdnOffline] Failed to load codes:', err);
    }
  };

  const downloadItem = useCallback(async (item: any) => {
    setIsDownloading(item.item_code);
    try {
      // If item is incomplete, fetch full data from Supabase
      let fullItem = item;
      if (!item.tableau_rang_a && !item.quiz_questions) {
        const { data } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('item_code', item.item_code)
          .single();
        if (data) fullItem = data;
      }

      await offlineSyncService.downloadEdnItemOffline(fullItem);
      setDownloadedCodes(prev => new Set([...prev, item.item_code]));

      toast({
        title: '📥 Téléchargé pour hors-ligne',
        description: `${item.title} est disponible sans connexion.`,
      });
    } catch (err) {
      console.error('[EdnOffline] Download failed:', err);
      toast({
        title: 'Erreur de téléchargement',
        description: 'Impossible de sauvegarder cet item hors-ligne.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(null);
    }
  }, [toast]);

  const removeItem = useCallback(async (itemCode: string) => {
    try {
      await offlineSyncService.removeOfflineEdnItem(itemCode);
      setDownloadedCodes(prev => {
        const next = new Set(prev);
        next.delete(itemCode);
        return next;
      });
      toast({
        title: '🗑️ Supprimé du hors-ligne',
        description: 'L\'item a été retiré du stockage local.',
      });
    } catch (err) {
      console.error('[EdnOffline] Remove failed:', err);
    }
  }, [toast]);

  const isAvailableOffline = useCallback((itemCode: string) => {
    return downloadedCodes.has(itemCode);
  }, [downloadedCodes]);

  const getOfflineItem = useCallback(async (itemCode: string) => {
    return offlineSyncService.getOfflineEdnItem(itemCode);
  }, []);

  const syncProgress = useCallback(async () => {
    const result = await offlineSyncService.syncOfflineProgress();
    if (result.success > 0) {
      toast({
        title: '🔄 Progression synchronisée',
        description: `${result.success} activité(s) hors-ligne synchronisée(s).`,
      });
    }
    return result;
  }, [toast]);

  return {
    downloadedCodes,
    isDownloading,
    downloadItem,
    removeItem,
    isAvailableOffline,
    getOfflineItem,
    downloadedCount: downloadedCodes.size,
    syncProgress,
  };
}
