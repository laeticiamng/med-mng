import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PanicState {
  visible: boolean;
  severity: 'critical' | 'recovering';
  message: string;
  details?: string;
  overlayActive: boolean;
  retrySeconds?: number;
  nextRetryAt: number | null;
  lastCheckAt: string | null;
  lastTriggeredAt?: string | null;
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

interface HealthSnapshot {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  summary?: PanicState['summary'];
  overlay?: {
    active: boolean;
    severity: PanicState['severity'];
    message?: string | null;
    details?: string | null;
    retrySeconds?: number;
    lastTriggeredAt?: string | null;
  };
  checks?: Array<{ service?: string; status?: string; error?: string; details?: unknown }>;
}

async function fetchHealthSnapshot(): Promise<HealthSnapshot> {
  try {
    const { data, error } = await supabase.functions.invoke('system-health', {
      body: { action: 'check_health' },
    });

    if (error) {
      throw error;
    }

    const overlay = data?.overlay
      ? {
          active: Boolean(data.overlay.active),
          severity: data.overlay.severity === 'recovering' ? ('recovering' as const) : ('critical' as const),
          message: data.overlay.message ?? null,
          details: data.overlay.details ?? null,
          retrySeconds:
            typeof data.overlay.retry_seconds === 'number'
              ? Math.max(5, Math.floor(data.overlay.retry_seconds))
              : undefined,
          lastTriggeredAt: data.overlay.last_triggered_at ?? null,
        }
      : undefined;

    const status: HealthSnapshot['status'] =
      data?.status === 'healthy' || data?.status === 'warning'
        ? data.status
        : 'error';

    let message = 'Incident détecté par le monitoring système.';
    if (overlay?.active && overlay.message) {
      message = overlay.message;
    } else if (status === 'healthy') {
      message = 'Système opérationnel';
    } else if (status === 'warning') {
      message = 'Récupération en cours après incident.';
    }

    return {
      status,
      message,
      summary: data?.summary,
      overlay,
      checks: data?.checks ?? [],
    };
  } catch (error: any) {
    // Silently handle Supabase connection errors to avoid spam
    if (error?.message?.includes('Failed to fetch') || error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      console.debug('Panic monitor: Supabase not accessible, using fallback health check');
    } else {
      console.warn('Panic monitor: Health check via system-health failed', error);
    }

    try {
      const response = await fetch('/health', { cache: 'no-store' });
      if (!response.ok) {
        return {
          status: 'error',
          message: 'Le service de santé interne signale une indisponibilité.',
          overlay: { active: true, severity: 'critical', message: 'Le service de santé interne signale une indisponibilité.' },
        };
      }

      return {
        status: 'warning',
        message: 'Récupération en cours après incident.',
        overlay: { active: false, severity: 'recovering' },
      };
    } catch (networkError) {
      // Silently handle network errors - don't show panic overlay for network issues
      console.debug('Panic monitor: Network not accessible, assuming healthy state');
      return {
        status: 'healthy',
        message: 'Mode hors ligne - Fonctionnalités locales disponibles',
        overlay: { active: false, severity: 'recovering' },
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
    overlayActive: false,
    nextRetryAt: null,
    lastCheckAt: null,
    lastTriggeredAt: null,
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

    const overlayActive = Boolean(snapshot.overlay?.active);
    const hasCriticalCheck = (snapshot.checks || []).some(check => check?.status === 'error');
    const shouldDisplayOverlay = overlayActive || snapshot.status === 'error';

    const severity: PanicState['severity'] = overlayActive
      ? snapshot.overlay?.severity ?? 'critical'
      : snapshot.status === 'error'
        ? 'critical'
        : hasCriticalCheck
          ? 'critical'
          : 'recovering';

    const detailMessages: string[] = [];

    if (overlayActive && snapshot.overlay?.details) {
      detailMessages.push(snapshot.overlay.details);
    } else if (!overlayActive && Array.isArray(snapshot.checks)) {
      snapshot.checks
        .filter(check => check?.status === 'error')
        .forEach((check) => {
          const serviceName = check?.service
            ? `${check.service.charAt(0).toUpperCase()}${check.service.slice(1)}`
            : 'Service';
          const message = check?.error || 'Incident détecté';
          detailMessages.push(`${serviceName}: ${message}`);
        });
    }

    if (!detailMessages.length && snapshot.summary) {
      detailMessages.push(
        `Services dégradés: ${snapshot.summary.errors}/${snapshot.summary.total_services}`
      );
    }

    const combinedDetails = detailMessages.length > 0
      ? detailMessages.join('\n')
      : snapshot.message;

    const retrySeconds = overlayActive ? snapshot.overlay?.retrySeconds : undefined;
    const delayMs = overlayActive
      ? (retrySeconds ?? Math.ceil(cooldownMs / 1000)) * 1000
      : snapshot.status === 'error'
        ? cooldownMs
        : pollIntervalMs;

    scheduleNextRetry(delayMs);

    setState((prev) => ({
      ...prev,
      visible: shouldDisplayOverlay,
      overlayActive,
      severity,
      message: overlayActive && snapshot.overlay?.message
        ? snapshot.overlay.message
        : snapshot.message,
      details: combinedDetails,
      summary: snapshot.summary,
      lastCheckAt: new Date().toISOString(),
      lastTriggeredAt: snapshot.overlay?.lastTriggeredAt ?? prev.lastTriggeredAt ?? null,
      retrySeconds,
    }));
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
