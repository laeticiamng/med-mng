import { afterEach, describe, expect, it, vi } from 'vitest';

const donnees = vi.hoisted(() => ({ charge: vi.fn() }));
vi.mock('@/data/quizMemorisation', async () => {
  donnees.charge();
  return await vi.importActual<typeof import('@/data/quizMemorisation')>('@/data/quizMemorisation');
});

import { chargerQuestionsMemorisation, pilote } from '../quizMemorisationChargement';

afterEach(() => {
  vi.unstubAllEnvs();
  donnees.charge.mockClear();
});

describe('chargerQuestionsMemorisation — drapeau du pilote', () => {
  it.each(['', 'false', 'FALSE', '1', 'oui'])('drapeau « %s » : aucune question et module de données jamais chargé', async (valeur) => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', valeur);
    expect(pilote()).toBe(false);
    expect(await chargerQuestionsMemorisation('IC-160')).toEqual([]);
    expect(donnees.charge).not.toHaveBeenCalled();
  });

  it('par défaut (variable absente), rien n’est actif', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', undefined as unknown as string);
    expect(pilote()).toBe(false);
    expect(await chargerQuestionsMemorisation('IC-217')).toEqual([]);
    expect(donnees.charge).not.toHaveBeenCalled();
  });

  it('drapeau « true » : charge les questions des items pilotes, quel que soit le format du code', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'true');
    expect(pilote()).toBe(true);
    expect((await chargerQuestionsMemorisation('IC-160')).length).toBe(8);
    expect((await chargerQuestionsMemorisation('ic-217')).length).toBe(9);
    // IC-247 : 11 questions dont 2 bloquées (M247-A2, M247-B3), jamais servies.
    const ic247 = await chargerQuestionsMemorisation('IC-0247');
    expect(ic247.length).toBe(9);
    expect(ic247.map((q) => q.id)).not.toContain('M247-A2');
    expect(ic247.map((q) => q.id)).not.toContain('M247-B3');
    expect(donnees.charge).toHaveBeenCalled();
  });

  it('drapeau « true » mais item hors pilote : aucune question (le quiz existant reste seul)', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'true');
    expect(await chargerQuestionsMemorisation('IC-1')).toEqual([]);
    expect(await chargerQuestionsMemorisation('')).toEqual([]);
  });
});
