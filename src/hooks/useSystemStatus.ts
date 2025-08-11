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
      const FN_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/med-mng-api';
      const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token ?? ANON;
      const headers = {
        'Content-Type': 'application/json',
        'apikey': ANON,
        'Authorization': `Bearer ${token}`,
      } as const;

      const resStatus = await fetch(`${FN_URL}/status`, {
        method: 'GET',
        headers,
      });
      if (!resStatus.ok) throw new Error(`Status HTTP ${resStatus.status}`);
      const statusData = await resStatus.json();
      setStatus(statusData);

      const resComplete = await fetch(`${FN_URL}/status/data-completeness`, {
        method: 'GET',
        headers,
      });
      if (!resComplete.ok) throw new Error(`Completeness HTTP ${resComplete.status}`);
      const completenessData = await resComplete.json();
      setDataCompleteness(completenessData);


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
      if (!silent && completenessData?.completeness_score < 80) {
        toast({
          title: "ℹ️ Données en migration",
          description: "Certains contenus sont en cours de finalisation.",
          variant: "default",
        });
      }

    } catch (error) {
      console.error('System status check failed:', error);
      if (!silent) {
        toast({
          title: "Erreur de connexion",
          description: "Impossible de vérifier l'état du système.",
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