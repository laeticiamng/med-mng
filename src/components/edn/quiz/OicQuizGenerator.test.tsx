import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { OicCompetence } from '@/hooks/useOicCompetences';

/**
 * Non-régression (E2E de production du 04.10.2026) : sur la dernière question,
 * « Terminer » était actif sans réponse ; la question restait sans réponse et
 * comptait comme fausse. Il doit se comporter comme « Suivant ».
 */

const competence = (n: number): OicCompetence => ({
  objectif_id: `OIC-999-0${n}-A`,
  intitule: `Connaître la notion numéro ${n}`,
  description: `Description officielle distincte et suffisamment longue de la notion numéro ${n} pour servir d'option.`,
  rubrique: 'Définition',
  rang: 'A',
  item_parent: 'IC-999',
});
const COMPETENCES = [1, 2, 3, 4, 5].map(competence);

vi.mock('@/hooks/useOicCompetences', () => ({
  useOicCompetences: (itemCode: string, rang: 'A' | 'B') => ({
    competences: itemCode === 'IC-999' && rang === 'A' ? COMPETENCES : [],
    loading: false,
  }),
}));
vi.mock('@/hooks/useGamification', () => ({ useGamification: () => ({ addPoints: vi.fn(), unlockBadge: vi.fn() }) }));
vi.mock('@/hooks/useActivityTracking', () => ({ useActivityTracking: () => ({ logActivity: vi.fn() }) }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) }, from: vi.fn() },
}));

import { OicQuizGenerator } from './OicQuizGenerator';

describe('OicQuizGenerator — fin du quiz', () => {
  it('« Terminer » reste désactivé tant que la dernière question est sans réponse', () => {
    render(<OicQuizGenerator itemCode="IC-999" itemTitle="Item de test" />);
    fireEvent.click(screen.getAllByRole('button').find((b) => /Rang A/.test(b.textContent ?? ''))!);

    // Questions 1 à n-1 : répondre puis « Suivant ».
    for (;;) {
      const suivant = screen.queryByRole('button', { name: /Suivant/ });
      if (!suivant) break;
      expect(suivant).toBeDisabled();
      fireEvent.click(screen.getAllByRole('radio')[0]);
      expect(suivant).toBeEnabled();
      fireEvent.click(suivant);
    }

    const terminer = screen.getByRole('button', { name: 'Terminer' });
    expect(terminer).toBeDisabled();
    fireEvent.click(screen.getAllByRole('radio')[1]);
    expect(terminer).toBeEnabled();
  });
});
