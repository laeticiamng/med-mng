import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlatformStats {
  users: {
    total: number;
    active_last_7_days: number;
    growth_rate: number;
  };
  activity: {
    total_events: number;
    events_last_24h: number;
    avg_events_per_user: number;
  };
  notifications: {
    unread_total: number;
  };
  system: {
    uptime: number;
    version: string;
    last_update: string;
  };
}

export const usePlatformFeatures = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getPlatformStats = useCallback(async (): Promise<PlatformStats | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('platform-features', {
        body: { action: 'get_platform_stats' }
      });

      if (error) throw error;

      return data as PlatformStats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get platform stats';
      setError(errorMessage);
      console.error('Get platform stats error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (exportType: 'user_data' | 'analytics_summary', format: 'json' | 'csv' = 'json') => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('platform-features', {
        body: {
          action: 'export_data',
          export_type: exportType,
          format
        }
      });

      if (error) throw error;

      // Create download
      const blob = new Blob([format === 'csv' ? data : JSON.stringify(data, null, 2)], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `platform_export_${exportType}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: `Vos données ont été exportées au format ${format.toUpperCase()}.`,
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      toast({
        title: "Erreur d'export",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const optimizePerformance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('platform-features', {
        body: { action: 'optimize_performance' }
      });

      if (error) throw error;

      toast({
        title: "Optimisation terminée",
        description: `${data.optimizations_applied.length} optimisations appliquées.`,
      });

      return { success: true, optimizations: data.optimizations_applied };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize performance';
      setError(errorMessage);
      toast({
        title: "Erreur d'optimisation",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const sendNotification = useCallback(async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', actionUrl?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('platform-features', {
        body: {
          action: 'send_notification',
          user_id: userId,
          title,
          message,
          type,
          action_url: actionUrl
        }
      });

      if (error) throw error;

      toast({
        title: "Notification envoyée",
        description: "La notification a été envoyée avec succès.",
      });

      return { success: true, notification: data.notification };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      setError(errorMessage);
      toast({
        title: "Erreur d'envoi",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    getPlatformStats,
    exportData,
    optimizePerformance,
    sendNotification
  };
};