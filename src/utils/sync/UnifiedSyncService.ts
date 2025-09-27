import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface SyncResult {
  success: boolean;
  statistics: {
    items_processed: number;
    items_completed: number;
    items_with_errors: number;
    completion_rate: string;
  };
  details?: Array<{
    item_code: string;
    rang_a_before: number;
    rang_a_after: number;
    rang_b_before: number;
    rang_b_after: number;
    total_before: number;
    total_after: number;
  }>;
  function_saved?: boolean;
  error?: string;
  message?: string;
}

export class UnifiedSyncService {
  /**
   * Lance la synchronisation complète EDN-OIC
   */
  static async executeCompletion(): Promise<SyncResult> {
    logger.info('Démarrage completion EDN avec compétences OIC', {
      component: 'UnifiedSyncService',
      action: 'executeCompletion'
    });

    try {
      const { data, error } = await supabase.functions.invoke('complete-edn-with-oic', {
        body: { 
          action: 'complete',
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        logger.error('Erreur lors de l\'invocation', {
          component: 'UnifiedSyncService'
        });
        throw error;
      }

      logger.info('Réponse reçue', {
        component: 'UnifiedSyncService'
      });

      if (data?.success) {
        const stats = data.statistics;
        logger.info('Completion réussie', {
          component: 'UnifiedSyncService'
        });

        if (data.details && data.details.length > 0) {
          logger.debug('Détails des enrichissements disponibles', {
            component: 'UnifiedSyncService'
          });
        }
      } else {
        logger.error('Échec de la completion', {
          component: 'UnifiedSyncService'
        });
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      logger.error('Erreur critique', {
        component: 'UnifiedSyncService'
      });
      
      throw error;
    }
  }

  /**
   * Synchronise tous les items EDN
   */
  static async syncAllItems(): Promise<any> {
    logger.info('Démarrage synchronisation globale EDN', {
      component: 'UnifiedSyncService'
    });
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-edn-content', {
        body: { syncAll: true }
      });

      if (error) {
        logger.error('Erreur fonction sync', {
          component: 'UnifiedSyncService'
        });
        throw error;
      }

      logger.info('Synchronisation terminée', {
        component: 'UnifiedSyncService'
      });
      
      return data;
    } catch (error) {
      logger.error('Erreur synchronisation globale', {
        component: 'UnifiedSyncService'
      });
      throw error;
    }
  }

  /**
   * Déclenche la completion avec gestion simplifiée
   */
  static async triggerCompletion(): Promise<any> {
    logger.info('Lancement completion EDN-OIC', {
      component: 'UnifiedSyncService'
    });

    try {
      const { data, error } = await supabase.functions.invoke('complete-edn-with-oic', {
        body: { action: 'complete' }
      });

      if (error) {
        logger.error('Erreur fonction', {
          component: 'UnifiedSyncService'
        });
        throw error;
      }

      logger.info('Completion terminée', {
        component: 'UnifiedSyncService'
      });

      if (data?.success) {
        const stats = data.statistics;
        logger.info('Statistiques completion disponibles', {
          component: 'UnifiedSyncService'
        });

        if (data.details?.length > 0) {
          logger.debug('Exemples enrichis disponibles', {
            component: 'UnifiedSyncService'
          });
        }
      } else {
        logger.error('Échec completion', {
          component: 'UnifiedSyncService'
        });
      }

      return data;
    } catch (error) {
      logger.error('Erreur critique', {
        component: 'UnifiedSyncService'
      });
      throw error;
    }
  }
}