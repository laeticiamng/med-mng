/**
 * Conversion funnel tracking - records events to analytics_events table
 * Events: page_view, signup, checkout_start, checkout_complete
 */
import { supabase } from '@/integrations/supabase/client';

type ConversionEvent = 'page_view' | 'signup' | 'checkout_start' | 'checkout_complete';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let sid = sessionStorage.getItem('conversion_session');
  if (!sid) {
    sid = crypto.randomUUID?.() ?? `s_${Date.now()}`;
    sessionStorage.setItem('conversion_session', sid);
  }
  return sid;
}

export async function trackConversionEvent(
  eventType: ConversionEvent,
  metadata?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await (supabase as any).from('analytics_events').insert({
      event_type: eventType,
      user_id: user?.id ?? null,
      session_id: getSessionId(),
      page_url: typeof window !== 'undefined' ? window.location.pathname : null,
      metadata: metadata ?? {},
    });
  } catch (err) {
    // Non-blocking — don't break the user flow
    console.debug('[analytics] tracking error:', err);
  }
}
