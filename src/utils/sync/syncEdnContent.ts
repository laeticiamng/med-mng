import { supabase } from '@/integrations/supabase/client';
import { describeRateLimitError } from '@/utils/errors/rateLimit';
import { trackCanonicalEvent } from '@/services/CanonicalAnalyticsTracker';

export interface SyncResult {
  success: boolean;
  statistics: {
    items_processed: number;
    items_updated: number;
    items_unchanged: number;
    errors: number;
  };
  update_report: Array<{
    item_code: string;
    rang_a_before?: number;
    rang_a_after?: number;
    rang_b_before?: number;
    rang_b_after?: number;
    rang_a?: number;
    rang_b?: number;
    updated: boolean;
  }>;
  timestamp: string;
  error?: string;
}

export async function syncAllEdnContent(): Promise<SyncResult> {
  try {
    console.log('🚀 Démarrage synchronisation EDN...');
    
    const { data, error } = await supabase.functions.invoke('sync-edn-content', {
      body: {}
    });

    if (error) {
      console.error('❌ Erreur fonction sync:', error);
      const rateLimit = describeRateLimitError(error, "Impossible de lancer la synchronisation EDN pour le moment.");
      if (rateLimit.isRateLimited) {
        throw new Error(rateLimit.message);
      }
      throw error;
    }

    console.log('✅ Synchronisation terminée:', data);
    void trackCanonicalEvent({
      type: 'sync_success',
      metadata: {
        itemsProcessed: data?.statistics?.items_processed ?? null,
        itemsUpdated: data?.statistics?.items_updated ?? null,
        errors: data?.statistics?.errors ?? null,
        timestamp: data?.timestamp ?? null,
      },
    });
    return data;

  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
    void trackCanonicalEvent({
      type: 'sync_fail',
      metadata: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack ?? null : null,
        details: error instanceof Error ? undefined : error,
      },
    });
    throw error;
  }
}

export async function getLastSyncStatus(): Promise<{
  lastSync?: string;
  itemsCount: number;
  completedOicCount: number;
}> {
  try {
    // Récupérer le nombre total d'items EDN
    const { count: itemsCount } = await supabase
      .from('edn_items_complete')
      .select('*', { count: 'exact', head: true });

    // Récupérer le nombre de compétences OIC complétées
    const { count: completedOicCount } = await supabase
      .from('backup_oic_competences')
      .select('*', { count: 'exact', head: true })
      .in('completion_status', ['completed', 'updated', 'verified_unchanged']);

    // Récupérer la dernière mise à jour
    const { data: lastUpdate } = await supabase
      .from('edn_items_complete')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return {
      lastSync: lastUpdate?.updated_at,
      itemsCount: itemsCount || 0,
      completedOicCount: completedOicCount || 0
    };
    
  } catch (error) {
    console.error('❌ Erreur status sync:', error);
    return {
      itemsCount: 0,
      completedOicCount: 0
    };
  }
}