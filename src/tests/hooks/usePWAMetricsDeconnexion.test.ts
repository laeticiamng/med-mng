import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * QA du 14.10.2026 : après une déconnexion, une métrique PWA déjà en attente de getUser() partait avec
 * la clé publique (anon) et recevait un 401 (RLS). La session locale est relue juste avant l'envoi.
 */
const etat = vi.hoisted(() => ({
  getUser: vi.fn(),
  getSession: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: etat.getUser, getSession: etat.getSession },
    from: () => ({ upsert: etat.upsert }),
  },
}));
vi.mock('web-vitals', () => ({ onCLS: vi.fn(), onFCP: vi.fn(), onLCP: vi.fn(), onTTFB: vi.fn(), onINP: vi.fn() }));

import { usePWAMetrics } from '@/hooks/usePWAMetrics';

describe('usePWAMetrics : envoi après déconnexion', () => {
  beforeEach(() => {
    etat.getUser.mockReset().mockResolvedValue({ data: { user: { id: 'u1' } } });
    etat.getSession.mockReset();
    etat.upsert.mockReset().mockResolvedValue({ error: null });
  });

  it('session locale disparue entre getUser() et l’envoi : aucune requête (pas de 401 anonyme)', async () => {
    etat.getSession.mockResolvedValue({ data: { session: null } });
    const { result } = renderHook(() => usePWAMetrics());
    await act(async () => {});
    await act(async () => {
      await result.current.sendMetricUpdate({ fcp: 1000 });
    });
    expect(etat.upsert).not.toHaveBeenCalled();
  });

  it('session présente : la métrique est envoyée', async () => {
    etat.getSession.mockResolvedValue({ data: { session: { access_token: 't' } } });
    const { result } = renderHook(() => usePWAMetrics());
    await act(async () => {});
    await act(async () => {
      await result.current.sendMetricUpdate({ fcp: 1000 });
    });
    expect(etat.upsert).toHaveBeenCalled();
  });
});
