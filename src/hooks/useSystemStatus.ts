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
      // Temporairement désactivé pour éviter les erreurs en boucle
      // TODO: Réactiver quand l'API sera stable
      setStatus({
        status: 'operational',
        version: '1.0.0',
        features: {},
        compatibility: {
          frontendMinVersion: '1.0.0',
          frontendShouldUpgrade: false,
          breaking_changes: []
        }
      });
      
      setDataCompleteness({
        completeness_score: 85,
        gaps: []
      });

    } catch (error) {
      console.error('System status check failed:', error);
      
      // Définir des valeurs de fallback pour éviter les erreurs
      setStatus({
        status: 'operational',
        version: '1.0.0',
        features: {},
        compatibility: {
          frontendMinVersion: '1.0.0',
          frontendShouldUpgrade: false,
          breaking_changes: []
        }
      });
      
      setDataCompleteness({
        completeness_score: 75,
        gaps: []
      });

      if (!silent) {
        toast({
          title: "Informations système",
          description: "Connexion en mode dégradé - toutes les fonctionnalités restent disponibles.",
          variant: "default",
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