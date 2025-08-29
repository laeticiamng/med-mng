import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  response_time_ms: number;
  details?: any;
  error?: string;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  timestamp: string;
  checks: HealthCheck[];
  summary: {
    total_services: number;
    healthy: number;
    warnings: number;
    errors: number;
  };
}

interface HealthHistory {
  uptime_percentage: number;
  total_checks: number;
  last_24h_checks: number;
  recent_logs: any[];
  service_stats: Record<string, { healthy: number; warning: number; error: number; total: number }>;
}

export const useSystemHealth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async (): Promise<SystemHealth | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('system-health', {
        body: { action: 'check_health' }
      });

      if (error) throw error;

      return data as SystemHealth;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check system health';
      setError(errorMessage);
      console.error('System health check error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHealthHistory = useCallback(async (): Promise<HealthHistory | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('system-health', {
        body: { action: 'get_health_history' }
      });

      if (error) throw error;

      return data as HealthHistory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get health history';
      setError(errorMessage);
      console.error('Get health history error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPerformanceMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('system-health', {
        body: { action: 'get_performance_metrics' }
      });

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get performance metrics';
      setError(errorMessage);
      console.error('Get performance metrics error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    checkHealth,
    getHealthHistory,
    getPerformanceMetrics
  };
};