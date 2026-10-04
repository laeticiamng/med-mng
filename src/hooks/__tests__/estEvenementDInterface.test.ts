import { describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { getUser: vi.fn() }, from: vi.fn() } }));

import { estEvenementDInterface } from '@/hooks/useActivityTracking';

// Revue critique 04.10.2026 : la navigation et la lecture des pages légales
// étaient enregistrées comme de l'« étude » (« Étude 96 », « 106/50 objectif
// hebdo » pour un compte qui n'avait rien révisé).
describe('estEvenementDInterface', () => {
  it('écarte la navigation, l’ouverture de l’espace et les pages légales', () => {
    expect(estEvenementDInterface({ activity_type: 'study', metadata: { component: 'navigation', action: 'click', destination: 'Favoris' } })).toBe(true);
    expect(estEvenementDInterface({ activity_type: 'study', metadata: { type: 'app_session_start' } })).toBe(true);
    expect(estEvenementDInterface({ activity_type: 'study', metadata: { action: 'view_cgv' } })).toBe(true);
    expect(estEvenementDInterface({ activity_type: 'study', metadata: { action: 'login_success', method: 'email' } })).toBe(true);
    expect(estEvenementDInterface({ activity_type: 'study', metadata: { type: 'streak_display_view' } })).toBe(true);
  });

  it('garde la révision réelle et les autres types d’activité', () => {
    expect(estEvenementDInterface({ activity_type: 'study', metadata: { action: 'view_tableau', rang: 'A' } })).toBe(false);
    expect(estEvenementDInterface({ activity_type: 'study', metadata: { action: 'play_music', songId: 's1' } })).toBe(false);
    expect(estEvenementDInterface({ activity_type: 'study' })).toBe(false);
    expect(estEvenementDInterface({ activity_type: 'exam', metadata: { action: 'view_cgv' } })).toBe(false);
    expect(estEvenementDInterface({ activity_type: 'ecos', metadata: { component: 'navigation' } })).toBe(false);
  });
});
