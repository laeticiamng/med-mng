import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';
import {
  PlatformConnector,
  ConnectorConfig,
  SyncLog,
  ConnectorType,
  ConnectionStatus,
  SyncDirection,
  SyncFrequency,
  ConnectorApiRequest,
  ConnectorApiResponse,
  AVAILABLE_CONNECTORS,
  DEFAULT_DATA_MAPPINGS
} from '@/types/connectors';

/**
 * Hook pour gérer les connecteurs inter-plateformes
 * EmotionsCare, Growth-Copilot, System-Compass
 */
export function usePlatformConnectors() {
  const { user } = useAuth();
  const [connectors, setConnectors] = useState<PlatformConnector[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});

  const generateId = () => crypto.randomUUID();

  // Charger les connecteurs depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('med-mng-connectors');
    if (stored) {
      try {
        setConnectors(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load connectors:', e);
      }
    }

    const storedLogs = localStorage.getItem('med-mng-sync-logs');
    if (storedLogs) {
      try {
        setSyncLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error('Failed to load sync logs:', e);
      }
    }
  }, []);

  // Sauvegarder les données
  const saveConnectors = (data: PlatformConnector[]) => {
    localStorage.setItem('med-mng-connectors', JSON.stringify(data));
  };

  const saveSyncLogs = (data: SyncLog[]) => {
    localStorage.setItem('med-mng-sync-logs', JSON.stringify(data.slice(0, 500)));
  };

  // Configurer un nouveau connecteur
  const configureConnector = useCallback((
    type: ConnectorType,
    apiKey: string,
    additionalConfig?: Record<string, string>
  ): PlatformConnector | null => {
    const config = AVAILABLE_CONNECTORS.find(c => c.type === type);
    if (!config) {
      toast.error('Type de connecteur non supporté');
      return null;
    }

    // Vérifier les champs requis
    const missingFields = config.required_fields.filter(f => {
      if (f === 'api_key') return !apiKey;
      return !additionalConfig?.[f];
    });

    if (missingFields.length > 0) {
      toast.error(`Champs manquants: ${missingFields.join(', ')}`);
      return null;
    }

    // Store API key in sessionStorage (cleared on browser close, safer than localStorage)
    const apiKeyStorageKey = `med-mng-connector-key-${type}`;
    sessionStorage.setItem(apiKeyStorageKey, apiKey);
    if (additionalConfig) {
      Object.entries(additionalConfig).forEach(([key, value]) => {
        sessionStorage.setItem(`med-mng-connector-${type}-${key}`, value);
      });
    }

    const connector: PlatformConnector = {
      id: generateId(),
      type,
      name: config.name,
      description: config.description,
      icon: config.icon,
      status: 'pending',
      api_key_configured: true,
      sync_frequency: 'daily',
      sync_direction: 'bidirectional',
      enabled_features: config.features.map(f => f.id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedConnectors = [...connectors.filter(c => c.type !== type), connector];
    setConnectors(updatedConnectors);
    saveConnectors(updatedConnectors);

    toast.success(`${config.name} configuré avec succès`);
    return connector;
  }, [connectors]);

  // Tester la connexion
  const testConnection = useCallback(async (connectorId: string): Promise<boolean> => {
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector) return false;

    setIsSyncing(prev => ({ ...prev, [connectorId]: true }));

    try {
      // Simuler un test de connexion
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 80% de chance de succès pour la démo
      const success = Math.random() > 0.2;

      const updatedConnectors = connectors.map(c => {
        if (c.id === connectorId) {
          return {
            ...c,
            status: success ? 'connected' : 'error' as ConnectionStatus,
            error_message: success ? undefined : 'Impossible de se connecter à l\'API',
            updated_at: new Date().toISOString()
          };
        }
        return c;
      });

      setConnectors(updatedConnectors);
      saveConnectors(updatedConnectors);

      if (success) {
        toast.success('Connexion établie avec succès');
      } else {
        toast.error('Échec de la connexion');
      }

      return success;
    } catch (error) {
      toast.error('Erreur lors du test de connexion');
      return false;
    } finally {
      setIsSyncing(prev => ({ ...prev, [connectorId]: false }));
    }
  }, [connectors]);

  // Synchroniser les données
  const syncData = useCallback(async (
    connectorId: string,
    direction: 'import' | 'export'
  ): Promise<SyncLog | null> => {
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector || connector.status !== 'connected') {
      toast.error('Connecteur non disponible');
      return null;
    }

    setIsSyncing(prev => ({ ...prev, [connectorId]: true }));

    const syncLog: SyncLog = {
      id: generateId(),
      connector_id: connectorId,
      direction,
      status: 'success',
      records_processed: 0,
      records_failed: 0,
      started_at: new Date().toISOString()
    };

    try {
      // Simuler une synchronisation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Générer des résultats simulés
      const recordsProcessed = Math.floor(Math.random() * 100) + 10;
      const recordsFailed = Math.floor(Math.random() * 5);

      syncLog.records_processed = recordsProcessed;
      syncLog.records_failed = recordsFailed;
      syncLog.status = recordsFailed > recordsProcessed * 0.1 ? 'partial' : 'success';
      syncLog.completed_at = new Date().toISOString();

      if (recordsFailed > 0) {
        syncLog.error_details = [
          `${recordsFailed} enregistrements n'ont pas pu être synchronisés`,
          'Vérifiez les formats de données'
        ];
      }

      // Mettre à jour le connecteur
      const updatedConnectors = connectors.map(c => {
        if (c.id === connectorId) {
          return {
            ...c,
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        return c;
      });

      setConnectors(updatedConnectors);
      saveConnectors(updatedConnectors);

      const updatedLogs = [syncLog, ...syncLogs];
      setSyncLogs(updatedLogs);
      saveSyncLogs(updatedLogs);

      toast.success(`Synchronisation terminée: ${recordsProcessed} enregistrements traités`);
      return syncLog;
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.completed_at = new Date().toISOString();
      syncLog.error_details = [(error as Error).message];

      const updatedLogs = [syncLog, ...syncLogs];
      setSyncLogs(updatedLogs);
      saveSyncLogs(updatedLogs);

      toast.error('Erreur lors de la synchronisation');
      return syncLog;
    } finally {
      setIsSyncing(prev => ({ ...prev, [connectorId]: false }));
    }
  }, [connectors, syncLogs]);

  // Activer/désactiver une fonctionnalité
  const toggleFeature = useCallback((
    connectorId: string,
    featureId: string,
    enabled: boolean
  ) => {
    const updatedConnectors = connectors.map(c => {
      if (c.id === connectorId) {
        const features = enabled
          ? [...c.enabled_features, featureId]
          : c.enabled_features.filter(f => f !== featureId);
        return { ...c, enabled_features: features, updated_at: new Date().toISOString() };
      }
      return c;
    });

    setConnectors(updatedConnectors);
    saveConnectors(updatedConnectors);
  }, [connectors]);

  // Changer la fréquence de sync
  const setSyncFrequency = useCallback((
    connectorId: string,
    frequency: SyncFrequency
  ) => {
    const updatedConnectors = connectors.map(c => {
      if (c.id === connectorId) {
        return { ...c, sync_frequency: frequency, updated_at: new Date().toISOString() };
      }
      return c;
    });

    setConnectors(updatedConnectors);
    saveConnectors(updatedConnectors);
    toast.success('Fréquence de synchronisation mise à jour');
  }, [connectors]);

  // Déconnecter un connecteur
  const disconnectConnector = useCallback((connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector) return;

    // Supprimer les clés stockées
    sessionStorage.removeItem(`med-mng-connector-key-${connector.type}`);

    const updatedConnectors = connectors.map(c => {
      if (c.id === connectorId) {
        return {
          ...c,
          status: 'disconnected' as ConnectionStatus,
          api_key_configured: false,
          updated_at: new Date().toISOString()
        };
      }
      return c;
    });

    setConnectors(updatedConnectors);
    saveConnectors(updatedConnectors);
    toast.info('Connecteur déconnecté');
  }, [connectors]);

  // Obtenir les logs de sync pour un connecteur
  const getConnectorSyncLogs = useCallback((connectorId: string): SyncLog[] => {
    return syncLogs.filter(log => log.connector_id === connectorId);
  }, [syncLogs]);

  // Obtenir le statut global des connecteurs
  const getConnectorsStatus = useCallback(() => {
    const total = connectors.length;
    const connected = connectors.filter(c => c.status === 'connected').length;
    const errors = connectors.filter(c => c.status === 'error').length;

    return {
      total,
      connected,
      errors,
      pending: total - connected - errors,
      health: total === 0 ? 100 : Math.round((connected / total) * 100)
    };
  }, [connectors]);

  return {
    // State
    connectors,
    syncLogs,
    isLoading,
    isSyncing,
    availableConnectors: AVAILABLE_CONNECTORS,
    dataMappings: DEFAULT_DATA_MAPPINGS,

    // Actions
    configureConnector,
    testConnection,
    syncData,
    toggleFeature,
    setSyncFrequency,
    disconnectConnector,

    // Queries
    getConnectorSyncLogs,
    getConnectorsStatus
  };
}

export default usePlatformConnectors;
