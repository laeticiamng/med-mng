import logger from '@/lib/logger';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TagData } from '@/components/sitemap/TagManager';
import { useToast } from '@/hooks/use-toast';

interface SyncData {
  favorites: Set<string>;
  tags: TagData[];
  visitStats: Record<string, { count: number; timestamps: number[]; sessions: any[] }>;
  navigationPaths: { from: string; to: string; count: number }[];
  alertThresholds: { bounceRate: number; avgTimeSeconds: number };
}

export function useCloudSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const { toast } = useToast();

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Charger les préférences d'auto-sync
  useEffect(() => {
    const saved = localStorage.getItem('sitemap-auto-sync');
    if (saved !== null) {
      setAutoSyncEnabled(saved === 'true');
    }
  }, []);

  // Sauvegarder dans le cloud
  const syncToCloud = useCallback(async (data: SyncData) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentification requise',
        description: 'Connectez-vous pour synchroniser vos données dans le cloud',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsSyncing(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Vérifier si l'utilisateur a déjà des données
      const { data: existing } = await supabase
        .from('user_sitemap_data')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const syncData = {
        user_id: user.id,
        favorites: Array.from(data.favorites),
        tags: JSON.parse(JSON.stringify(data.tags)),
        visit_stats: JSON.parse(JSON.stringify(data.visitStats)),
        navigation_paths: JSON.parse(JSON.stringify(data.navigationPaths)),
        alert_thresholds: JSON.parse(JSON.stringify(data.alertThresholds)),
        last_synced_at: new Date().toISOString(),
      };

      if (existing) {
        // Mise à jour
        const { error } = await supabase
          .from('user_sitemap_data')
          .update(syncData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('user_sitemap_data')
          .insert(syncData);

        if (error) throw error;
      }

      setLastSyncedAt(new Date());
      toast({
        title: '✓ Synchronisation réussie',
        description: 'Vos données ont été sauvegardées dans le cloud',
      });

      return true;
    } catch (error) {
      logger.error('Sync error:', error);
      toast({
        title: 'Erreur de synchronisation',
        description: error instanceof Error ? error.message : 'Échec de la synchronisation',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, toast]);

  // Charger depuis le cloud
  const syncFromCloud = useCallback(async (): Promise<SyncData | null> => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentification requise',
        description: 'Connectez-vous pour récupérer vos données du cloud',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setIsSyncing(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('user_sitemap_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucune donnée trouvée
          return null;
        }
        throw error;
      }

      if (data) {
        setLastSyncedAt(new Date(data.last_synced_at));
        
        toast({
          title: '✓ Données récupérées',
          description: 'Vos données cloud ont été chargées avec succès',
        });

        return {
          favorites: new Set(data.favorites || []),
          tags: (data.tags as any) || [],
          visitStats: (data.visit_stats as any) || {},
          navigationPaths: (data.navigation_paths as any) || [],
          alertThresholds: (data.alert_thresholds as any) || { bounceRate: 70, avgTimeSeconds: 300 },
        };
      }

      return null;
    } catch (error) {
      logger.error('Sync from cloud error:', error);
      toast({
        title: 'Erreur de récupération',
        description: error instanceof Error ? error.message : 'Échec de la récupération',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, toast]);

  // Toggle auto-sync
  const toggleAutoSync = useCallback(() => {
    const newValue = !autoSyncEnabled;
    setAutoSyncEnabled(newValue);
    localStorage.setItem('sitemap-auto-sync', newValue.toString());
    
    toast({
      title: newValue ? '✓ Auto-sync activé' : 'Auto-sync désactivé',
      description: newValue 
        ? 'Vos données seront automatiquement sauvegardées' 
        : 'Synchronisation manuelle uniquement',
    });
  }, [autoSyncEnabled, toast]);

  return {
    isSyncing,
    lastSyncedAt,
    isAuthenticated,
    autoSyncEnabled,
    syncToCloud,
    syncFromCloud,
    toggleAutoSync,
  };
}
