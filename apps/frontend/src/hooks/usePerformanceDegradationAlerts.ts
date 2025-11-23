import logger from '@/lib/logger';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PerformanceDegradationAlert {
  id: string;
  user_id: string;
  category: string;
  previous_period_start: string;
  previous_period_end: string;
  current_period_start: string;
  current_period_end: string;
  previous_score: number;
  current_score: number;
  degradation_percentage: number;
  severity: 'warning' | 'critical';
  acknowledged: boolean;
  acknowledged_at: string | null;
  dismissed: boolean;
  dismissed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function usePerformanceDegradationAlerts() {
  const [alerts, setAlerts] = useState<PerformanceDegradationAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();

    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel('performance_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'performance_degradation_alerts',
        },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAlerts([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('performance_degradation_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('dismissed', false)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAlerts((data || []) as PerformanceDegradationAlert[]);
    } catch (err: any) {
      logger.error('Error loading performance alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('performance_degradation_alerts')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (updateError) throw updateError;

      toast.success('Alerte marquée comme lue');
      await loadAlerts();
    } catch (err: any) {
      logger.error('Error acknowledging alert:', err);
      toast.error('Erreur lors de la mise à jour de l\'alerte');
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('performance_degradation_alerts')
        .update({
          dismissed: true,
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (updateError) throw updateError;

      toast.success('Alerte ignorée');
      await loadAlerts();
    } catch (err: any) {
      logger.error('Error dismissing alert:', err);
      toast.error('Erreur lors de l\'ignorage de l\'alerte');
    }
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');

  return {
    alerts,
    unacknowledgedAlerts,
    criticalAlerts,
    loading,
    error,
    acknowledgeAlert,
    dismissAlert,
    refresh: loadAlerts,
  };
}
