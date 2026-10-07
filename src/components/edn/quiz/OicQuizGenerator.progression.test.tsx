import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OicCompetence } from '@/hooks/useOicCompetences';

/**
 * MM-A03 (audit du 07.10.2026) : la fin du quiz d'item n'écrivait que
 * `quiz_results`, alors que /edn-complete (useProgressionEdn) lit
 * `revision_history` et `user_item_progress`. « Items travaillés »,
 * « À revoir aujourd'hui » et « maîtrisés » restaient donc à zéro.
 */

const competence = (n: number): OicCompetence => ({
  objectif_id: `OIC-007-0${n}-A`,
  intitule: `Connaître la notion numéro ${n}`,
  description: `Description officielle distincte et suffisamment longue de la notion numéro ${n} pour servir d'option.`,
  rubrique: 'Définition',
  rang: 'A',
  item_parent: 'IC-7',
});
const COMPETENCES = [1, 2, 3, 4, 5].map(competence);

vi.mock('@/hooks/useOicCompetences', () => ({
  useOicCompetences: (itemCode: string, rang: 'A' | 'B') => ({
    competences: itemCode === 'IC-007' && rang === 'A' ? COMPETENCES : [],
    loading: false,
  }),
}));
vi.mock('@/hooks/useGamification', () => ({ useGamification: () => ({ addPoints: vi.fn(), unlockBadge: vi.fn() }) }));
vi.mock('@/hooks/useActivityTracking', () => ({ useActivityTracking: () => ({ logActivity: vi.fn() }) }));

type Appel = { table: string; op: string; payload?: unknown };
const appels: Appel[] = [];

const constructeur = (table: string) => {
  const b: Record<string, unknown> = {};
  const fin = { data: null, error: null };
  b.select = () => b;
  b.eq = () => b;
  b.maybeSingle = () => Promise.resolve(fin);
  b.insert = (payload: unknown) => {
    appels.push({ table, op: 'insert', payload });
    return Promise.resolve(fin);
  };
  b.upsert = (payload: unknown) => {
    appels.push({ table, op: 'upsert', payload });
    return Promise.resolve(fin);
  };
  return b;
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getSession: () => Promise.resolve({ data: { session: { user: { id: 'u-1' } } } }) },
    from: (table: string) => constructeur(table),
  },
}));

import { OicQuizGenerator } from './OicQuizGenerator';

const terminerLeQuiz = () => {
  render(<OicQuizGenerator itemCode="IC-007" itemTitle="Item de test" />);
  fireEvent.click(screen.getAllByRole('button').find((b) => /Rang A/.test(b.textContent ?? ''))!);
  for (;;) {
    fireEvent.click(screen.getAllByRole('radio')[0]);
    const suivant = screen.queryByRole('button', { name: /Suivant/ });
    if (!suivant) break;
    fireEvent.click(suivant);
  }
  fireEvent.click(screen.getByRole('button', { name: 'Terminer' }));
};

describe('OicQuizGenerator — enregistrement de la progression', () => {
  beforeEach(() => {
    appels.length = 0;
  });

  it('écrit revision_history et user_item_progress (code d’item normalisé) en plus de quiz_results', async () => {
    terminerLeQuiz();

    await waitFor(() => {
      expect(appels.find((a) => a.table === 'user_item_progress' && a.op === 'upsert')).toBeTruthy();
    });

    expect(appels.find((a) => a.table === 'quiz_results')).toBeTruthy();

    const historique = appels.find((a) => a.table === 'revision_history' && a.op === 'insert');
    expect(historique?.payload).toMatchObject({ user_id: 'u-1', item_code: 'IC-7' });

    const carte = appels.find((a) => a.table === 'user_item_progress')!.payload as Record<string, unknown>;
    expect(carte).toMatchObject({ user_id: 'u-1', item_code: 'IC-7' });
    expect(typeof carte.next_review_date).toBe('string');
  });
});
