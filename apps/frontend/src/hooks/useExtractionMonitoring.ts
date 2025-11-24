import logger from '@/lib/logger';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ExtractionLog {
  id: string;
  batch_id: string;
  batch_type: string;
  status: string;
  progress_percentage: number;
  total_items: number;
  processed_items: number;
  failed_items: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface ExtractionStats {
  total_extractions: number;
  recent_extractions_7d: number;
  running_extractions: number;
  success_rate_7d: number;
  failed_extractions_7d: number;
}

export function useExtractionMonitoring() {
  const [stats, setStats] = useState<ExtractionStats | null>(null);
  const [recentExtractions, setRecentExtractions] = useState<ExtractionLog[]>([]);
  const [runningExtractions, setRunningExtractions] = useState<ExtractionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('extraction-monitoring', {
        body: { action: 'get_stats' }
      });

      if (error) throw error;
      if (data?.success) setStats(data.data);
    } catch (error) {
      logger.error('Error fetching extraction stats:', error);
    }
  };

  const fetchRecentExtractions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('extraction-monitoring', {
        body: { action: 'get_recent' }
      });

      if (error) throw error;
      if (data?.success) setRecentExtractions(data.data);
    } catch (error) {
      logger.error('Error fetching recent extractions:', error);
    }
  };

  const fetchRunningExtractions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('extraction-monitoring', {
        body: { action: 'get_running' }
      });

      if (error) throw error;
      if (data?.success) setRunningExtractions(data.data);
    } catch (error) {
      logger.error('Error fetching running extractions:', error);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchRecentExtractions(),
      fetchRunningExtractions()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    stats,
    recentExtractions,
    runningExtractions,
    loading,
    refresh: fetchAll
  };
}