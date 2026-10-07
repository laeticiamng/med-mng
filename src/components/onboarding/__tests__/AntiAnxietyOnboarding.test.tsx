import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * MM-A06 (audit du 07.10.2026) : l'onboarding finissait sur /generator
 * (Premium) pour un compte gratuit, et envoyait revision_type / music_style
 * vers des colonnes absentes de user_onboarding (choix jamais utilisés).
 */
const naviguer = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useNavigate: () => naviguer,
}));
vi.mock('@/hooks/useActivityTracking', () => ({ useActivityTracking: () => ({ logActivity: vi.fn() }) }));
const ecritures: Array<{ table: string; valeurs: unknown }> = [];
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: () => Promise.resolve({ data: { user: { id: 'u' } } }) },
    from: (table: string) => ({
      upsert: (valeurs: unknown) => {
        ecritures.push({ table, valeurs });
        return Promise.resolve({ error: null });
      },
    }),
  },
}));

import { AntiAnxietyOnboarding } from '../AntiAnxietyOnboarding';

describe('AntiAnxietyOnboarding', () => {
  beforeEach(() => {
    naviguer.mockReset();
    ecritures.length = 0;
  });

  it('mène au premier item d’essai gratuit, sans étapes ni champs morts', async () => {
    const onComplete = vi.fn();
    render(<AntiAnxietyOnboarding isOpen onClose={vi.fn()} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: /C'est parti/ }));
    expect(screen.queryByText(/Que révisez-vous/)).toBeNull();
    expect(screen.queryByText(/Quel style préférez-vous/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /premier item d.essai/i }));
    await Promise.resolve();

    expect(onComplete).toHaveBeenCalled();
    expect(naviguer).toHaveBeenCalledWith('/edn-complete/ic-1/apercu');
    expect(naviguer).not.toHaveBeenCalledWith('/generator');
    for (const e of ecritures) {
      expect(e.valeurs).not.toHaveProperty('revision_type');
      expect(e.valeurs).not.toHaveProperty('music_style');
    }
  });
});
