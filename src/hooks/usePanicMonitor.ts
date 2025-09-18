import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PanicState {
  visible: boolean;
  severity: 'critical' | 'recovering';
  message: string;
  details?: string;
  nextRetryAt: number | null;
  lastCheckAt: string | null;
  summary?: {
    total_services: number;
    healthy: number;
    warnings: number;
    errors: number;
  };
}

interface UsePanicMonitorOptions {
  pollIntervalMs?: number;
  cooldownMs?: number;
}

const DEFAULT_OPTIONS: Required<UsePanicMonitorOptions> = {
  pollIntervalMs: 60_000,
  cooldownMs: 30_000,
};

async function fetchHealthSnapshot(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  message: string;
  summary?: PanicState['summary'];
}> {
  try {
    const { data, error } = await supabase.functions.invoke('system-health', {
      body: { action: 'check_health' },
    });

    if (error) {
      throw error;
    }

    if (data?.status === 'healthy' || data?.status === 'warning') {
      return {
        status: data.status,
        message: 'Système opérationnel',
        summary: data.summary,
      };
    }

    return {
      status: 'error',
      message: 'Incident détecté par le monitoring système.',
      summary: data?.summary,
    };
  } catch (error) {
    console.error('Health check via system-health failed', error);

    try {
      const response = await fetch('/health', { cache: 'no-store' });
      if (!response.ok) {
        return {
          status: 'error',
          message: 'Le service de santé interne signale une indisponibilité.',
        };
      }

      return {
        status: 'warning',
        message: 'Récupération en cours après incident.',
      };
    } catch (networkError) {
      console.error('Fallback /health check failed', networkError);
      return {
        status: 'error',
        message: 'Impossible de contacter les services. Vérifiez la connexion réseau.',
      };
    }
  }
}

export function usePanicMonitor(options: UsePanicMonitorOptions = {}) {
  const { pollIntervalMs, cooldownMs } = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<PanicState>({
    visible: false,
    severity: 'recovering',
    message: '',
    nextRetryAt: null,
    lastCheckAt: null,
  });
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scheduleNextRetry = useCallback(
    (delayMs: number) => {
      const deadline = Date.now() + delayMs;
      setState((prev) => ({
        ...prev,
        nextRetryAt: deadline,
      }));

      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }

      cooldownRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          nextRetryAt: null,
        }));
      }, delayMs);
    },
    []
  );

  const evaluateHealth = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const snapshot = await fetchHealthSnapshot();

    setState((prev) => ({
      ...prev,
      visible: snapshot.status === 'error',
      severity: snapshot.status === 'error' ? 'critical' : 'recovering',
      message: snapshot.message,
      summary: snapshot.summary,
      lastCheckAt: new Date().toISOString(),
      details: snapshot.summary
        ? `Services dégradés: ${snapshot.summary.errors}/${snapshot.summary.total_services}`
        : prev.details,
    }));

    if (snapshot.status === 'error') {
      scheduleNextRetry(cooldownMs);
    } else {
      scheduleNextRetry(pollIntervalMs);
    }
  }, [cooldownMs, pollIntervalMs, scheduleNextRetry]);

  const manualRetry = useCallback(async () => {
    await evaluateHealth();
  }, [evaluateHealth]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    evaluateHealth();

    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    pollTimerRef.current = setInterval(() => {
      evaluateHealth();
    }, pollIntervalMs);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
    };
  }, [evaluateHealth, pollIntervalMs]);

  const retryCountdown = useMemo(() => {
    if (!state.nextRetryAt) {
      return 0;
    }
    return Math.max(0, Math.ceil((state.nextRetryAt - Date.now()) / 1000));
  }, [state.nextRetryAt]);

  return {
    state,
    retryCountdown,
    retry: manualRetry,
  };
}
