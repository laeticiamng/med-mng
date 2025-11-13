import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QualityAlert {
  id: string;
  project_name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  metric_type: string;
  metric_value: string | null;
  threshold_value: string | null;
  is_read: boolean;
  created_at: string;
}

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<QualityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadAlerts();
    subscribeToAlerts();
  }, []);

  useEffect(() => {
    const count = alerts.filter(a => !a.is_read).length;
    setUnreadCount(count);
  }, [alerts]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quality_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAlerts = () => {
    const channel = supabase
      .channel('quality_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quality_alerts'
        },
        (payload) => {
          const newAlert = payload.new as QualityAlert;
          console.log('New alert received:', newAlert);
          
          setAlerts(prev => [newAlert, ...prev]);
          
          // Show toast notification
          const severityColors = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢'
          };
          
          toast.error(`${severityColors[newAlert.severity]} ${newAlert.title}`, {
            description: newAlert.message,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('quality_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('quality_alerts')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setAlerts(prev =>
        prev.map(alert => ({ ...alert, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
    }
  }, [alerts]);

  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('quality_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success('Alert deleted');
    } catch (err) {
      console.error('Error deleting alert:', err);
      toast.error('Failed to delete alert');
    }
  }, []);

  return {
    alerts,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    refresh: loadAlerts,
  };
}
