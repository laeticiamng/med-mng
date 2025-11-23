/**
 * 📊 Hook pour les métriques de génération musicale
 */

import logger from '@/lib/logger';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GlobalStats {
  total_generations: number;
  successful_generations: number;
  failed_generations: number;
  timeout_generations: number;
  avg_duration_seconds: number;
  avg_api_response_ms: number;
  avg_polling_attempts: number;
  success_rate_percent: number;
}

export interface ContentTypeStats {
  content_type: string;
  total: number;
  completed: number;
  failed: number;
  avg_duration: number;
  success_rate: number;
}

export interface StyleStats {
  style: string;
  total: number;
  completed: number;
  avg_duration: number;
}

export interface DailyStats {
  date: string;
  total: number;
  completed: number;
  failed: number;
  avg_duration: number;
}

export function useMusicMetrics() {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [contentTypeStats, setContentTypeStats] = useState<ContentTypeStats[]>([]);
  const [styleStats, setStyleStats] = useState<StyleStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async (type: string) => {
    const { data, error } = await supabase.functions.invoke('music-metrics', {
      body: { type }
    });

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'Erreur de chargement');
    
    return data.data;
  };

  const loadAllStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all metrics in parallel
      const [global, contentType, style, daily] = await Promise.all([
        fetchMetrics('global'),
        fetchMetrics('content-type'),
        fetchMetrics('style'),
        fetchMetrics('daily')
      ]);

      setGlobalStats(global);
      setContentTypeStats(contentType || []);
      setStyleStats(style || []);
      setDailyStats(daily || []);

    } catch (err) {
      logger.error('Error loading stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadAllStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    globalStats,
    contentTypeStats,
    styleStats,
    dailyStats,
    loading,
    error,
    refresh: loadAllStats
  };
}
