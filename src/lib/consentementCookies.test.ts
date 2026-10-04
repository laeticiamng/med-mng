import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import {
  CLE_CONSENTEMENT,
  CLE_PREFERENCES,
  effacerChoixCookies,
  enregistrerPreferencesCookies,
  lirePreferencesCookies,
  mesureAudienceAcceptee,
} from './consentementCookies';
import { trackConversionEvent } from './conversionTracking';

/**
 * Vague 3 (04.10.2026, vérifié en production) : la visite de la page Tarifs d'un visiteur non
 * connecté était enregistrée dans analytics_events quel que soit le choix du bandeau cookies, qui
 * annonçait par ailleurs « Plausible Analytics » (jamais chargé). Désormais : seulement avec l'accord
 * donné sur le texte actuel du bandeau (version 2).
 */
const stockage = new Map<string, string>();

beforeEach(() => {
  stockage.clear();
  sessionStorage.clear();
  vi.mocked(window.localStorage.getItem).mockImplementation((cle: string) => stockage.get(cle) ?? null);
  vi.mocked(window.localStorage.setItem).mockImplementation((cle: string, valeur: string) => {
    stockage.set(cle, valeur);
  });
  vi.mocked(window.localStorage.removeItem).mockImplementation((cle: string) => {
    stockage.delete(cle);
  });
  vi.mocked(supabase.from).mockClear();
  vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: null } as never);
});

describe('consentement du bandeau cookies', () => {
  it('sans choix : bandeau à afficher, pas de mesure', () => {
    expect(lirePreferencesCookies()).toBeNull();
    expect(mesureAudienceAcceptee()).toBe(false);
  });

  it('un choix fait sur l’ancien texte (« Plausible », sans version) ne vaut pas accord', () => {
    stockage.set(CLE_CONSENTEMENT, 'true');
    stockage.set(CLE_PREFERENCES, JSON.stringify({ essential: true, functional: true, analytics: true }));
    expect(lirePreferencesCookies()).toBeNull();
    expect(mesureAudienceAcceptee()).toBe(false);
  });

  it('accord puis retrait', () => {
    enregistrerPreferencesCookies(true);
    expect(mesureAudienceAcceptee()).toBe(true);
    enregistrerPreferencesCookies(false);
    expect(lirePreferencesCookies()).toEqual({ essential: true, analytics: false, version: 2 });
    expect(mesureAudienceAcceptee()).toBe(false);
    effacerChoixCookies();
    expect(lirePreferencesCookies()).toBeNull();
  });
});

describe('mesure du parcours d’abonnement (trackConversionEvent)', () => {
  it('visiteur sans accord : rien n’est enregistré ni stocké', async () => {
    await trackConversionEvent('page_view', { page: 'pricing' });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('conversion_session')).toBeNull();
  });

  it('visiteur qui a refusé la mesure : rien n’est enregistré', async () => {
    enregistrerPreferencesCookies(false);
    await trackConversionEvent('page_view', { page: 'pricing' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('visiteur qui a accepté la mesure : visite enregistrée sous un identifiant aléatoire', async () => {
    enregistrerPreferencesCookies(true);
    await trackConversionEvent('page_view', { page: 'pricing' });
    expect(supabase.from).toHaveBeenCalledWith('analytics_events');
    expect(sessionStorage.getItem('conversion_session')).toBeTruthy();
  });

  it('refus ou retrait de l’accord : l’identifiant de visite créé pendant l’accord est oublié', async () => {
    enregistrerPreferencesCookies(true);
    await trackConversionEvent('page_view', { page: 'pricing' });
    expect(sessionStorage.getItem('conversion_session')).toBeTruthy();
    enregistrerPreferencesCookies(false);
    expect(sessionStorage.getItem('conversion_session')).toBeNull();

    enregistrerPreferencesCookies(true);
    await trackConversionEvent('page_view', { page: 'pricing' });
    expect(sessionStorage.getItem('conversion_session')).toBeTruthy();
    effacerChoixCookies();
    expect(sessionStorage.getItem('conversion_session')).toBeNull();
  });

  it('compte connecté : enregistré avec le compte (exécution du service)', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null } as never);
    await trackConversionEvent('checkout_start', { plan: 'annuel' });
    expect(supabase.from).toHaveBeenCalledWith('analytics_events');
  });
});
