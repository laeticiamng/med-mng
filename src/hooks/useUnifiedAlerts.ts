import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface UnifiedAlert {
  id: string;
  source: 'pagerduty' | 'nvd';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  created_at: string;
  url?: string;
  cvss_score?: number;
  status?: string;
}

export interface UnifiedAlertsResponse {
  success: boolean;
  timestamp: string;
  mode: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  alerts: UnifiedAlert[];
}

export const useUnifiedAlerts = (mode: 'combined' | 'pagerduty' | 'nvd' = 'combined') => {
  const queryClient = useQueryClient();
  const [realtimeAlerts, setRealtimeAlerts] = useState<UnifiedAlert[]>([]);

  // Fetch alerts from edge function
  const { data, isLoading, error, refetch } = useQuery<UnifiedAlertsResponse>({
    queryKey: ['unified-alerts', mode],
    queryFn: async () => {
      console.log(`[useUnifiedAlerts] Fetching alerts with mode: ${mode}`);
      
      const { data, error } = await supabase.functions.invoke('unified-alerts', {
        body: { mode },
      });

      if (error) {
        console.error('[useUnifiedAlerts] Error:', error);
        throw error;
      }

      console.log('[useUnifiedAlerts] Response:', data);
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Subscribe to realtime updates
  useEffect(() => {
    console.log('[useUnifiedAlerts] Setting up realtime subscription');
    
    const channel = supabase
      .channel('unified-alerts-broadcast')
      .on('broadcast', { event: 'alerts-updated' }, (payload) => {
        console.log('[useUnifiedAlerts] Realtime update received:', payload);
        
        if (payload.payload?.alerts) {
          setRealtimeAlerts(payload.payload.alerts);
          
          // Show toast for critical alerts
          const criticalCount = payload.payload.critical_count || 0;
          if (criticalCount > 0) {
            toast.error(`${criticalCount} alerte(s) critique(s) détectée(s)`, {
              description: 'Consultez le dashboard pour plus de détails',
            });
          }
          
          // Invalidate query to refetch
          queryClient.invalidateQueries({ queryKey: ['unified-alerts'] });
        }
      })
      .subscribe();

    return () => {
      console.log('[useUnifiedAlerts] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Manual refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('unified-alerts', {
        body: { mode },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-alerts'] });
      toast.success('Alertes actualisées');
    },
    onError: (error) => {
      console.error('[useUnifiedAlerts] Refresh error:', error);
      toast.error('Erreur lors de l\'actualisation des alertes');
    },
  });

  return {
    data,
    alerts: data?.alerts || [],
    realtimeAlerts,
    isLoading,
    error,
    refetch,
    refresh: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
    stats: {
      total: data?.total || 0,
      critical: data?.critical || 0,
      high: data?.high || 0,
      medium: data?.medium || 0,
      low: data?.low || 0,
    },
  };
};
