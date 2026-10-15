import { describe, expect, it } from 'vitest';
import type { QuestionMemo } from '@/data/quizMemorisation/types';
import {
  cleStockageNotions,
  compterParRang,
  construireSerie,
  ecrireNotions,
  incrementerNombreSeries,
  lireNombreSeries,
  lireNotions,
  mettreAJourNotions,
  notionsConcernees,
  questionsAffichables,
  scoreSerie,
  type StockageSimple,
} from '../quizMemorisation';

const verif = (statut: QuestionMemo['verification']['statut']) => ({
  statut,
  extraitReferentiel: 'extrait de test',
  sourcesExternes: [],
  reponseCorrecte: 'x',
  justification: 'justification de test',
  verifiePar: 'test',
  dateVerification: '2026-10-15',
});
const q = (id: string, rang: 'A' | 'B', statut: QuestionMemo['verification']['statut'] = 'conforme_referentiel'): QuestionMemo => ({
  id, itemCode: 'IC-999', rang, objectifId: 'OIC-999-01-A', type: 'rappel', question: id, reponse: 'x', explication: 'e',
  verification: verif(statut),
});

const A = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'].map((id) => q(`M999-${id}`, 'A'));
const B = [q('M999-B1', 'B'), q('M999-B2', 'B')];

const stockageMemoire = (): StockageSimple & { donnees: Map<string, string> } => {
  const donnees = new Map<string, string>();
  return { donnees, getItem: (c) => donnees.get(c) ?? null, setItem: (c, v) => void donnees.set(c, v) };
};

describe('questionsAffichables', () => {
  const mix = [q('a', 'A', 'brouillon'), q('b', 'A', 'conforme_referentiel'), q('c', 'A', 'verifie_source_externe'), q('d', 'A', 'valide_expert')];
  it('en production : seules les questions validées par un expert', () => {
    expect(questionsAffichables(mix, false).map((x) => x.id)).toEqual(['d']);
  });
  it('en pilote : tout sauf les brouillons', () => {
    expect(questionsAffichables(mix, true).map((x) => x.id)).toEqual(['b', 'c', 'd']);
  });
  it('compte les questions par rang', () => {
    expect(compterParRang([...A, ...B])).toEqual({ A: 7, B: 2 });
    expect(compterParRang([])).toEqual({ A: 0, B: 0 });
  });
});

describe('construireSerie', () => {
  it('limite à 5 questions du rang demandé, dans un ordre déterministe', () => {
    const s1 = construireSerie({ questions: [...A, ...B], rang: 'A' });
    expect(s1.map((x) => x.id)).toEqual(['M999-A1', 'M999-A2', 'M999-A3', 'M999-A4', 'M999-A5']);
    expect(construireSerie({ questions: [...A, ...B], rang: 'A' })).toEqual(s1);
  });
  it('tourne d’un cran à chaque série pour ne pas reposer toujours les mêmes', () => {
    const s = construireSerie({ questions: A, rang: 'A', decalage: 5 });
    expect(s.map((x) => x.id)).toEqual(['M999-A6', 'M999-A7', 'M999-A1', 'M999-A2', 'M999-A3']);
    expect(construireSerie({ questions: A, rang: 'A', decalage: 7 }).map((x) => x.id)).toEqual(A.slice(0, 5).map((x) => x.id));
    expect(construireSerie({ questions: A, rang: 'A', decalage: -1 })).toHaveLength(5);
  });
  it('met les notions à revoir en premier, les plus ratées d’abord', () => {
    const aRevoir = { 'M999-A6': { erreurs: 1, dernier: '' }, 'M999-A4': { erreurs: 3, dernier: '' } };
    const ids = construireSerie({ questions: A, rang: 'A', aRevoir }).map((x) => x.id);
    expect(ids.slice(0, 2)).toEqual(['M999-A4', 'M999-A6']);
    expect(new Set(ids).size).toBe(5);
  });
  it('ne pose que ce qui existe : rang B court, rang vide', () => {
    expect(construireSerie({ questions: [...A, ...B], rang: 'B' })).toHaveLength(2);
    expect(construireSerie({ questions: A, rang: 'B' })).toEqual([]);
  });
  it('ignore une notion à revoir qui n’appartient pas au rang', () => {
    const ids = construireSerie({ questions: [...A, ...B], rang: 'B', aRevoir: { 'M999-A1': { erreurs: 2, dernier: '' } } }).map((x) => x.id);
    expect(ids).toEqual(['M999-B1', 'M999-B2']);
  });
});

describe('scoreSerie et notions à revoir', () => {
  it('calcule le score, y compris série vide', () => {
    expect(scoreSerie([{ id: 'a', ok: true }, { id: 'b', ok: false }, { id: 'c', ok: true }, { id: 'd', ok: true }])).toEqual({ retenues: 3, total: 4, pourcentage: 75 });
    expect(scoreSerie([])).toEqual({ retenues: 0, total: 0, pourcentage: 0 });
  });
  it('un échec ajoute la notion, une réussite la retire, sans modifier l’original', () => {
    const avant = { x: { erreurs: 1, dernier: 'hier' } };
    const apres = mettreAJourNotions(avant, [{ id: 'x', ok: false }, { id: 'y', ok: false }, { id: 'z', ok: true }], new Date('2026-10-15T10:00:00Z'));
    expect(apres.x.erreurs).toBe(2);
    expect(apres.y).toEqual({ erreurs: 1, dernier: '2026-10-15T10:00:00.000Z' });
    expect(avant).toEqual({ x: { erreurs: 1, dernier: 'hier' } });
    expect(mettreAJourNotions(apres, [{ id: 'x', ok: true }])).not.toHaveProperty('x');
  });
  it('ne compte que les notions de l’item courant', () => {
    expect(notionsConcernees({ 'M999-A1': { erreurs: 1, dernier: '' }, 'M160-A1': { erreurs: 2, dernier: '' } }, A)).toEqual(['M999-A1']);
  });
});

describe('stockage local', () => {
  it('relit ce qui a été écrit, par compte', () => {
    const s = stockageMemoire();
    ecrireNotions(s, 'u1', { a: { erreurs: 2, dernier: 'd' } });
    expect(lireNotions(s, 'u1')).toEqual({ a: { erreurs: 2, dernier: 'd' } });
    expect(lireNotions(s, 'u2')).toEqual({});
    expect(lireNotions(s, null)).toEqual({});
  });
  it('résiste à un contenu corrompu, à un stockage absent ou qui lève', () => {
    const s = stockageMemoire();
    s.setItem(cleStockageNotions('u1'), '{pas du json');
    expect(lireNotions(s, 'u1')).toEqual({});
    s.setItem(cleStockageNotions('u1'), JSON.stringify([1, 2]));
    expect(lireNotions(s, 'u1')).toEqual({});
    s.setItem(cleStockageNotions('u1'), JSON.stringify({ a: 'oops' }));
    expect(lireNotions(s, 'u1')).toEqual({});
    expect(lireNotions(null, 'u1')).toEqual({});
    const casse: StockageSimple = { getItem: () => { throw new Error('bloqué'); }, setItem: () => { throw new Error('plein'); } };
    expect(lireNotions(casse, 'u1')).toEqual({});
    expect(() => ecrireNotions(casse, 'u1', {})).not.toThrow();
    expect(() => incrementerNombreSeries(casse, 'u1', 'IC-1', 'A')).not.toThrow();
    expect(lireNombreSeries(casse, 'u1', 'IC-1', 'A')).toBe(0);
  });
  it('compte les séries par item et par rang', () => {
    const s = stockageMemoire();
    incrementerNombreSeries(s, 'u1', 'IC-160', 'A');
    incrementerNombreSeries(s, 'u1', 'IC-160', 'A');
    incrementerNombreSeries(s, 'u1', 'IC-160', 'B');
    expect(lireNombreSeries(s, 'u1', 'IC-160', 'A')).toBe(2);
    expect(lireNombreSeries(s, 'u1', 'IC-160', 'B')).toBe(1);
    expect(lireNombreSeries(s, 'u1', 'IC-217', 'A')).toBe(0);
  });
});
