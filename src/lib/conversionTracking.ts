/**
 * Parcours d'abonnement - événements enregistrés dans analytics_events :
 * page_view (page Tarifs), signup, checkout_start, checkout_complete.
 * Visiteur non connecté : seulement avec l'accord du bandeau cookies (mesure d'audience).
 */
import { supabase } from '@/integrations/supabase/client';
import { CLE_IDENTIFIANT_VISITE, mesureAudienceAcceptee } from '@/lib/consentementCookies';

type ConversionEvent = 'page_view' | 'signup' | 'checkout_start' | 'checkout_complete';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let sid = sessionStorage.getItem(CLE_IDENTIFIANT_VISITE);
  if (!sid) {
    sid = crypto.randomUUID?.() ?? `s_${Date.now()}`;
    sessionStorage.setItem(CLE_IDENTIFIANT_VISITE, sid);
  }
  return sid;
}

export async function trackConversionEvent(
  eventType: ConversionEvent,
  metadata?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    // Avant connexion : mesure d'audience Med MNG uniquement avec l'accord donné dans le
    // bandeau cookies (vague 3) ; sans accord, rien n'est enregistré ni stocké (pas d'identifiant).
    if (!user && !mesureAudienceAcceptee()) return;

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
