import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ rpc: vi.fn(), donneesChargees: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: m.rpc } }));
vi.mock('@/data/quizMemorisation', async () => {
  m.donneesChargees();
  return await vi.importActual<typeof import('@/data/quizMemorisation')>('@/data/quizMemorisation');
});

import { chargerQuestionsAffichables } from '../quizMemorisationChargement';
import { chargerQuestionsServeur, lireQuestionServeur, lireReponseServeur } from '../quizMemorisationServeur';

const qcm = (surcharge: Record<string, unknown> = {}) => ({
  id: 'M247-A1', rang: 'A', type: 'qcm', question: 'Seuil ?', options: ['a', 'b', 'c', 'd'], index_correct: 2,
  reponse: null, explication: 'Explication', objectif_id: 'OIC-247-03-A', statut: 'valide_expert', ...surcharge,
});
const rappel = (surcharge: Record<string, unknown> = {}) => ({
  id: 'M247-A3', rang: 'A', type: 'rappel', question: 'Seuil HGPO ?', options: null, index_correct: null,
  reponse: '≥ 2 g/L', explication: 'Explication', objectif_id: 'OIC-247-03-A', statut: 'verifie_source_externe', ...surcharge,
});

afterEach(() => {
  vi.unstubAllEnvs();
  m.rpc.mockReset();
  m.donneesChargees.mockClear();
});

describe('lecture défensive de la réponse serveur', () => {
  it('convertit un QCM et un rappel valides, sans aucune donnée de traçabilité', () => {
    const q = lireQuestionServeur(qcm());
    expect(q).toMatchObject({ id: 'M247-A1', type: 'qcm', indexCorrect: 2, options: ['a', 'b', 'c', 'd'] });
    expect(q).not.toHaveProperty('verification');
    expect(lireQuestionServeur(rappel())).toMatchObject({ type: 'rappel', reponse: '≥ 2 g/L' });
  });

  it.each([
    ['identifiant invalide', qcm({ id: 'x' })],
    ['rang inconnu', qcm({ rang: 'C' })],
    ['type inconnu', qcm({ type: 'vf' })],
    ['trois options', qcm({ options: ['a', 'b', 'c'] })],
    ['option vide', qcm({ options: ['a', '', 'c', 'd'] })],
    ['index hors bornes', qcm({ index_correct: 4 })],
    ['index non entier', qcm({ index_correct: 1.5 })],
    ['rappel sans réponse', rappel({ reponse: ' ' })],
    ['question vide', qcm({ question: '' })],
    ['statut bloqué servi par erreur', qcm({ statut: 'bloque' })],
    ['statut brouillon servi par erreur', qcm({ statut: 'brouillon' })],
    ['statut absent', qcm({ statut: undefined })],
    ['null', null],
    ['tableau', []],
  ])('écarte une ligne inexploitable : %s', (_nom, ligne) => {
    expect(lireQuestionServeur(ligne)).toBeNull();
  });

  it('un item verrouillé ne donne ni question ni réponse', () => {
    expect(lireReponseServeur({ item_code: 'IC-217', verrouille: true, questions: [qcm()] })).toEqual({
      questions: [], pilote: false, verrouille: true,
    });
  });

  it('garde les lignes valides et ignore les autres', () => {
    const r = lireReponseServeur({ verrouille: false, pilote: true, questions: [qcm(), { n: 1 }, rappel()] });
    expect(r.questions.map((q) => q.id)).toEqual(['M247-A1', 'M247-A3']);
    expect(r.pilote).toBe(true);
    expect(lireReponseServeur('n’importe quoi').questions).toEqual([]);
    expect(lireReponseServeur({ verrouille: false }).questions).toEqual([]);
  });
});

describe('chargerQuestionsServeur — appel RPC et droits', () => {
  it('sans drapeau : aucun appel réseau', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_SERVEUR', 'false');
    expect(await chargerQuestionsServeur('IC-247')).toMatchObject({ questions: [], verrouille: false });
    expect(m.rpc).not.toHaveBeenCalled();
  });

  it('avec drapeau : appelle la RPC avec le code normalisé et rend les questions', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_SERVEUR', 'true');
    m.rpc.mockResolvedValue({ data: { item_code: 'IC-247', verrouille: false, pilote: false, questions: [qcm()] }, error: null });
    const r = await chargerQuestionsServeur('ic-0247');
    expect(m.rpc).toHaveBeenCalledWith('mm_quiz_memorisation_item', { p_item_code: 'IC-247' });
    expect(r.questions).toHaveLength(1);
    expect(r.pilote).toBe(false);
  });

  it('item Premium pour un compte non autorisé : verrouillé, aucune question', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_SERVEUR', 'true');
    m.rpc.mockResolvedValue({ data: { item_code: 'IC-217', verrouille: true }, error: null });
    expect(await chargerQuestionsServeur('IC-217')).toEqual({ questions: [], pilote: false, verrouille: true });
  });

  it('erreur serveur, RPC absente (migration non appliquée) ou exception : quiz existant seul, sans plantage', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_SERVEUR', 'true');
    m.rpc.mockResolvedValueOnce({ data: null, error: { message: 'function does not exist' } });
    expect((await chargerQuestionsServeur('IC-247')).questions).toEqual([]);
    m.rpc.mockRejectedValueOnce(new Error('réseau'));
    expect((await chargerQuestionsServeur('IC-247')).questions).toEqual([]);
  });
});

describe('source des questions : le serveur prime, le JavaScript ne contient rien', () => {
  it('drapeau serveur : le module de données du pilote n’est JAMAIS chargé', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_SERVEUR', 'true');
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'true');
    m.rpc.mockResolvedValue({ data: { verrouille: false, pilote: false, questions: [qcm()] }, error: null });
    const r = await chargerQuestionsAffichables('IC-247');
    expect(r.questions.map((q) => q.id)).toEqual(['M247-A1']);
    expect(m.donneesChargees).not.toHaveBeenCalled();
  });

  it('aucun drapeau : rien, aucun appel, aucune donnée', async () => {
    expect(await chargerQuestionsAffichables('IC-247')).toEqual({ questions: [], pilote: false });
    expect(m.rpc).not.toHaveBeenCalled();
    expect(m.donneesChargees).not.toHaveBeenCalled();
  });

  it('drapeau pilote seul : source statique, signalée comme pilote, sans appel RPC', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'true');
    const r = await chargerQuestionsAffichables('IC-160');
    expect(r.pilote).toBe(true);
    expect(r.questions.length).toBeGreaterThan(0);
    expect(m.rpc).not.toHaveBeenCalled();
  });
});

describe('sécurité du code source', () => {
  const dossier = join(__dirname, '../..');
  const fichiers = (d: string): string[] =>
    readdirSync(d).flatMap((n) => {
      const c = join(d, n);
      if (statSync(c).isDirectory()) return n === '__tests__' ? [] : fichiers(c);
      return /\.(ts|tsx)$/.test(n) && !/\.test\./.test(n) ? [c] : [];
    });

  it('le front ne lit jamais directement les tables de questions ni de validations', () => {
    for (const f of fichiers(dossier)) {
      if (f.includes('/integrations/supabase/types.ts')) continue;
      const texte = readFileSync(f, 'utf8');
      expect(texte, f).not.toMatch(/\.from\(\s*['"]mm_quiz_memorisation_(questions|validations|config)['"]/);
    }
  });

  it('aucune fonction d’enregistrement de validation n’est appelée depuis le front', () => {
    for (const f of fichiers(dossier)) {
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/mm_quiz_memorisation_enregistrer_validation/);
    }
  });
});
