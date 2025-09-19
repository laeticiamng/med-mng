import { supabase } from '@/integrations/supabase/client';

export type CanonicalAnalyticsEventType =
  | 'generate_start'
  | 'generate_success'
  | 'generate_fail'
  | 'lyrics_timecode_done'
  | 'play'
  | 'seek_segment'
  | 'qcm_start'
  | 'qcm_submit'
  | 'qcm_complete'
  | 'bd_generate_start'
  | 'bd_generate_success'
  | 'bd_generate_fail'
  | 'study_start'
  | 'study_end'
  | 'sync_success'
  | 'sync_fail';

export interface CanonicalAnalyticsEvent {
  type: CanonicalAnalyticsEventType;
  metadata?: Record<string, unknown>;
  contentId?: string | null;
  sessionId?: string | null;
}

interface AnalyticsContextState {
  userId?: string;
  enabled: boolean;
  sessionId?: string;
}

const SESSION_STORAGE_KEY = 'med-mng.analytics.session-id';
export const ANALYTICS_CONSENT_VERSION = '2025-09-20';

let context: AnalyticsContextState = {
  enabled: false,
  sessionId: undefined,
};

const generateId = () => {
  const cryptoObject = typeof globalThis !== 'undefined' ? (globalThis as unknown as { crypto?: Crypto }).crypto : undefined;
  if (cryptoObject && typeof cryptoObject.randomUUID === 'function') {
    return cryptoObject.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function ensureSessionId(): string {
  if (context.sessionId) {
    return context.sessionId;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        context.sessionId = stored;
        return stored;
      }
      const fresh = generateId();
      window.localStorage.setItem(SESSION_STORAGE_KEY, fresh);
      context.sessionId = fresh;
      return fresh;
    } catch (error) {
      console.warn('[analytics] unable to persist session id', error);
    }
  }

  const fallback = generateId();
  context.sessionId = fallback;
  return fallback;
}

export function setAnalyticsContext(userId: string | undefined, enabled: boolean) {
  context = {
    userId,
    enabled: Boolean(userId) && enabled,
    sessionId: context.sessionId ?? undefined,
  };

  if (context.enabled) {
    ensureSessionId();
  }
}

export function getAnalyticsContext(): AnalyticsContextState {
  return { ...context, sessionId: context.sessionId ?? ensureSessionId() };
}

export async function trackCanonicalEvent(
  event: CanonicalAnalyticsEvent,
): Promise<{ tracked: boolean; skipped: boolean }> {
  const state = getAnalyticsContext();

  if (!state.enabled || !state.userId) {
    return { tracked: false, skipped: true };
  }

  try {
    const { data, error } = await supabase.functions.invoke('analytics-tracker', {
      body: {
        eventType: event.type,
        metadata: event.metadata ?? {},
        userId: state.userId,
        sessionId: event.sessionId ?? state.sessionId ?? ensureSessionId(),
        contentRef: event.contentId ?? null,
      },
    });

    if (error) {
      console.warn('[analytics] tracking failed', error);
      return { tracked: false, skipped: false };
    }

    const tracked = Boolean((data as { tracked?: boolean })?.tracked ?? true);
    return { tracked, skipped: false };
  } catch (error) {
    console.warn('[analytics] unexpected tracking failure', error);
    return { tracked: false, skipped: false };
  }
}
