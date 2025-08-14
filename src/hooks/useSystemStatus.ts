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
      // Utiliser directement le client Supabase au lieu d'appels HTTP manuels
      const { data: statusData, error: statusError } = await supabase.functions.invoke('med-mng-api', {
        body: { path: '/status' }
      });

      if (statusError) {
        console.error('Status check error:', statusError);
        // Fallback vers des données par défaut si l'API échoue
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
      } else {
        setStatus(statusData);
      }

      const { data: completenessData, error: completenessError } = await supabase.functions.invoke('med-mng-api', {
        body: { path: '/status/data-completeness' }
      });

      if (completenessError) {
        console.error('Completeness check error:', completenessError);
        // Fallback vers des données par défaut
        setDataCompleteness({
          completeness_score: 75,
          gaps: []
        });
      } else {
        setDataCompleteness(completenessData);
      }

      // Alert if frontend should upgrade
      if (!silent && statusData?.compatibility?.frontendShouldUpgrade) {
        toast({
          title: "⚠️ Mise à jour disponible",
          description: "Une nouvelle version est disponible pour une meilleure expérience.",
          variant: "destructive",
        });
      }

      // Alert if system is degraded
      if (!silent && statusData?.status === 'degraded') {
        toast({
          title: "⚠️ Service dégradé",
          description: "Certaines fonctionnalités peuvent être temporairement limitées.",
          variant: "destructive",
        });
      }

      // Alert if data completeness is low
      if (!silent && (completenessData?.completeness_score || 75) < 80) {
        toast({
          title: "ℹ️ Données en migration",
          description: "Certains contenus sont en cours de finalisation.",
          variant: "default",
        });
      }

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