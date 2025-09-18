import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { describeRateLimitError } from '@/utils/errors/rateLimit';

export const DASHBOARD_TIMEFRAMES = ['24h', '7d', '30d', '90d'] as const;
export type DashboardTimeframe = typeof DASHBOARD_TIMEFRAMES[number];

export interface EventBreakdownEntry {
  event_type: string;
  count: number;
}

export interface FrictionEntry {
  event_type: string;
  count: number;
  last_occurrence: string | null;
  sample_metadata: Record<string, unknown> | null;
}

export interface ContentEntry {
  content_ref: string | null;
  event_type: string;
  count: number;
}

export interface TimeseriesEntry {
  bucket: string;
  event_type: string;
  count: number;
}

export interface AnalyticsDashboardPayload {
  generated_at: string;
  timeframe: string;
  event_breakdown: EventBreakdownEntry[];
  top_frictions: FrictionEntry[];
  top_contents: ContentEntry[];
  timeseries: TimeseriesEntry[];
}

interface AnalyticsDashboardState {
  data: AnalyticsDashboardPayload | null;
  loading: boolean;
  error: string | null;
  timeframe: DashboardTimeframe;
  generatedAt: string | null;
  refresh: () => Promise<void>;
  setTimeframe: (next: DashboardTimeframe) => void;
}

interface UseAnalyticsDashboardOptions {
  initialTimeframe?: DashboardTimeframe;
  autoLoad?: boolean;
}

const DEFAULT_TIMEFRAME: DashboardTimeframe = '7d';

function normaliseTimeframe(value: string | null | undefined): DashboardTimeframe {
  if (!value) {
    return DEFAULT_TIMEFRAME;
  }
  return (DASHBOARD_TIMEFRAMES.find((entry) => entry === value) ?? DEFAULT_TIMEFRAME);
}

export function useAnalyticsDashboard(options: UseAnalyticsDashboardOptions = {}): AnalyticsDashboardState {
  const { initialTimeframe = DEFAULT_TIMEFRAME, autoLoad = true } = options;
  const [timeframe, setTimeframeState] = useState<DashboardTimeframe>(initialTimeframe);
  const [data, setData] = useState<AnalyticsDashboardPayload | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (target: DashboardTimeframe) => {
    setLoading(true);
    setError(null);

    try {
      const { data: response, error: fetchError } = await supabase.functions.invoke('analytics-engine', {
        body: { timeframe: target },
      });

      if (fetchError) {
        const rateLimit = describeRateLimitError(fetchError, 'Tableau de bord analytics temporairement indisponible.');
        if (rateLimit.isRateLimited) {
          setError(rateLimit.message);
          return;
        }
        throw fetchError;
      }

      const resolvedTimeframe = normaliseTimeframe((response?.timeframe as string | undefined) ?? target);
      if (resolvedTimeframe !== timeframe) {
        setTimeframeState(resolvedTimeframe);
      }

      const payload = (response?.metrics ?? null) as AnalyticsDashboardPayload | null;
      setData(payload);
      setGeneratedAt((response?.generated_at as string | undefined) ?? new Date().toISOString());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue lors du chargement des analytics.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }
    void fetchAnalytics(timeframe);
  }, [autoLoad, fetchAnalytics, timeframe]);

  const refresh = useCallback(async () => {
    await fetchAnalytics(timeframe);
  }, [fetchAnalytics, timeframe]);

  const setTimeframe = useCallback((next: DashboardTimeframe) => {
    setTimeframeState(next);
  }, []);

  const state = useMemo<AnalyticsDashboardState>(() => ({
    data,
    loading,
    error,
    timeframe,
    generatedAt,
    refresh,
    setTimeframe,
  }), [data, loading, error, timeframe, generatedAt, refresh, setTimeframe]);

  return state;
}
