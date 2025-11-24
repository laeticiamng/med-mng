import logger from '@/lib/logger';
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

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [dataCompleteness, setDataCompleteness] = useState<DataCompleteness | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkSystemStatus = async () => {
    try {
      // Check system status and feature flags
      const { data: statusData, error: statusError } = await supabase.functions.invoke('med-mng-api', {
        body: { path: '/status' },
        method: 'GET'
      });

      if (statusError) throw statusError;
      
      setStatus(statusData);

      // Check data completeness
      const { data: completenessData, error: completenessError } = await supabase.functions.invoke('med-mng-api', {
        body: { path: '/status/data-completeness' },
        method: 'GET'
      });

      if (completenessError) throw completenessError;
      
      setDataCompleteness(completenessData);

      // Alert if frontend should upgrade
      if (statusData?.compatibility?.frontendShouldUpgrade) {
        toast({
          title: "⚠️ Mise à jour disponible",
          description: "Une nouvelle version est disponible pour une meilleure expérience.",
          variant: "destructive",
        });
      }

      // Alert if system is degraded
      if (statusData?.status === 'degraded') {
        toast({
          title: "⚠️ Service dégradé",
          description: "Certaines fonctionnalités peuvent être temporairement limitées.",
          variant: "destructive",
        });
      }

      // Alert if data completeness is low
      if (completenessData?.completeness_score < 80) {
        toast({
          title: "ℹ️ Données en migration",
          description: "Certains contenus sont en cours de finalisation.",
          variant: "default",
        });
      }

    } catch (error) {
      logger.error('System status check failed:', error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de vérifier l'état du système.",
        variant: "destructive",
      });
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
    isOperational: status?.status === 'operational',
    completenessScore: dataCompleteness?.completeness_score || 0
  };
}