import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * MM-A14 (audit du 07.10.2026) : l'export RGPD lisait med_mng_subscriptions
 * (l'abonnement réel est dans user_subscriptions) et oubliait des tables
 * personnelles écrites par le site (notes d'item, favoris, points, journal
 * d'activité, générations audio…). Noms vérifiés en production
 * (information_schema, colonne user_id).
 */
const lues: string[] = [];

vi.mock('@/components/layout/PremiumPageLayout', () => ({
  PremiumPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/hooks/useSubscription', () => ({ useSubscription: () => ({ isSubscriptionActive: () => false }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: () => Promise.resolve({ data: { user: { id: 'u-1', email: 'e@x.fr', created_at: '2026-01-01' } } }) },
    from: (table: string) => {
      lues.push(table);
      const b: Record<string, unknown> = {};
      b.select = () => b;
      b.in = () => Promise.resolve({ data: [], error: null });
      b.eq = () => Promise.resolve({ data: [], error: null });
      return b;
    },
  },
}));

import MesDonneesRGPD from '../MesDonneesRGPD';

describe('Mes données RGPD — export', () => {
  beforeAll(() => {
    // jsdom ne fournit pas createObjectURL.
    Object.assign(window.URL, { createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn() });
  });

  it('exporte l’abonnement réel et toutes les tables personnelles écrites par le site', async () => {
    render(
      <MemoryRouter>
        <MesDonneesRGPD />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Télécharger mes données/ }));
    await waitFor(() => expect(lues).toContain('user_subscriptions'));

    expect(lues).not.toContain('med_mng_subscriptions');
    for (const table of [
      'profiles',
      'user_item_progress',
      'revision_history',
      'item_reviews',
      'quiz_results',
      'user_progress',
      'user_edn_notes',
      'user_edn_favorites',
      'med_mng_user_favorites',
      'gamification_activities',
      'user_activity_log',
      'user_badges',
      'mm_generations_audio',
      'mm_signalements_contenu',
      'user_onboarding',
    ]) {
      expect(lues).toContain(table);
    }
  });
});
