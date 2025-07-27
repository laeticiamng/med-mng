import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  userActivity: {
    totalSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    newUsers: number;
    returningUsers: number;
  };
  contentMetrics: {
    totalGenerations: number;
    successfulGenerations: number;
    popularStyles: string[];
    averageRating: number;
  };
  performanceMetrics: {
    averageLoadTime: number;
    errorRate: number;
    apiResponseTime: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    activeSubscriptions: number;
    churnRate: number;
    conversionRate: number;
  };
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackEvent = useCallback(async (
    eventName: string,
    properties: Record<string, any> = {},
    userId?: string
  ) => {
    try {
      await supabase.functions.invoke('analytics-tracker', {
        body: {
          event: eventName,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            url: window.location.pathname,
            userAgent: navigator.userAgent
          },
          userId: userId || (await supabase.auth.getUser()).data.user?.id
        }
      });
    } catch (error) {
      console.error('Erreur tracking événement:', error);
    }
  }, []);

  const trackPageView = useCallback(async (page: string) => {
    await trackEvent('page_view', { page });
  }, [trackEvent]);

  const trackMusicGeneration = useCallback(async (style: string, duration: number, success: boolean) => {
    await trackEvent('music_generation', {
      style,
      duration,
      success,
      category: 'content_creation'
    });
  }, [trackEvent]);

  const trackUserAction = useCallback(async (action: string, context?: string) => {
    await trackEvent('user_action', {
      action,
      context,
      category: 'user_interaction'
    });
  }, [trackEvent]);

  const trackError = useCallback(async (error: Error, context?: string) => {
    await trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      category: 'error'
    });
  }, [trackEvent]);

  const trackPerformance = useCallback(async (metric: string, value: number, context?: string) => {
    await trackEvent('performance', {
      metric,
      value,
      context,
      category: 'performance'
    });
  }, [trackEvent]);

  const fetchAnalytics = useCallback(async (
    startDate?: Date,
    endDate?: Date,
    filters?: Record<string, any>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data: analyticsData, error } = await supabase.functions.invoke('analytics-aggregator', {
        body: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          filters
        }
      });

      if (error) throw error;

      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur récupération analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (
    format: 'csv' | 'json' | 'xlsx',
    startDate?: Date,
    endDate?: Date
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('analytics-export', {
        body: {
          format,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        }
      });

      if (error) throw error;

      // Créer et télécharger le fichier
      const blob = new Blob([data], { type: getContentType(format) });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export analytics:', error);
    }
  }, []);

  const getContentType = (format: string) => {
    switch (format) {
      case 'csv': return 'text/csv';
      case 'json': return 'application/json';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default: return 'text/plain';
    }
  };

  useEffect(() => {
    // Tracking automatique de la page courante
    trackPageView(window.location.pathname);

    // Tracking des erreurs globales
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), event.filename);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [trackPageView, trackError]);

  return {
    data,
    loading,
    error,
    trackEvent,
    trackPageView,
    trackMusicGeneration,
    trackUserAction,
    trackError,
    trackPerformance,
    fetchAnalytics,
    exportData
  };
}