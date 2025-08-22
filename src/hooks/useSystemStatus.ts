import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemStatus {
  status: 'operational' | 'degraded' | 'maintenance';
  version: string;
  features: Record<string, boolean>;
  compatibility: {
    frontendMinVersion: string;
    frontendShouldUpgrade: boolean;
    breaking_changes: string[];
  };
}

interface DataCompleteness {
  completeness_score: number;
  gaps: string[];
}

export function useSystemStatus(options?: { silent?: boolean }) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [dataCompleteness, setDataCompleteness] = useState<DataCompleteness | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const silent = options?.silent ?? false;

  const checkSystemStatus = async () => {
    try {
      // Appel API réel pour le statut système
      const { data: statusData, error: statusError } = await supabase.functions.invoke('med-mng-api', {
        body: { 
          path: '/status',
          method: 'GET'
        }
      });

      if (statusError) throw statusError;

      setStatus({
        status: statusData.status || 'operational',
        version: statusData.version || '1.0.0',
        features: statusData.features || {},
        compatibility: statusData.compatibility || {
          frontendMinVersion: '1.0.0',
          frontendShouldUpgrade: false,
          breaking_changes: []
        }
      });

      // Appel API réel pour la complétude des données
      const { data: completenessData, error: completenessError } = await supabase.functions.invoke('med-mng-api', {
        body: { 
          path: '/status/data-completeness',
          method: 'GET'
        }
      });

      if (completenessError) throw completenessError;

      setDataCompleteness({
        completeness_score: completenessData.completeness_score || 0,
        gaps: completenessData.gaps || []
      });

    } catch (error) {
      console.error('System status check failed:', error);
      
      // Définir des valeurs de fallback pour éviter les erreurs
      setStatus({
        status: 'degraded',
        version: '1.0.0',
        features: {},
        compatibility: {
          frontendMinVersion: '1.0.0',
          frontendShouldUpgrade: false,
          breaking_changes: []
        }
      });
      
      setDataCompleteness({
        completeness_score: 0,
        gaps: ['API non disponible']
      });

      if (!silent) {
        toast({
          title: "Statut système",
          description: "Impossible de récupérer le statut en temps réel. Fonctionnement en mode dégradé.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
    
    // Check status every 5 minutes
    const interval = setInterval(checkSystemStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    status,
    dataCompleteness,
    isLoading,
    refresh: checkSystemStatus,
    needsUpgrade: status?.compatibility?.frontendShouldUpgrade || false,
    isOperational: status?.status === 'operational' || (status as any)?.status === 'healthy',
    completenessScore: dataCompleteness?.completeness_score || 0
  };
}