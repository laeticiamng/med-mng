import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { QUESTIONS_MEMORISATION_PAR_ITEM } from '../index';
import { genererSqlVerificationExtraits, statutAffichable } from '../verification';
import type { QuestionMemo } from '../types';

const toutes: QuestionMemo[] = Object.values(QUESTIONS_MEMORISATION_PAR_ITEM).flat();
const qcm = toutes.filter((q): q is Extract<QuestionMemo, { type: 'qcm' }> => q.type === 'qcm');

describe('données du pilote de mémorisation — structure et traçabilité', () => {
  it('couvre les trois items du pilote, avec les deux rangs', () => {
    expect(Object.keys(QUESTIONS_MEMORISATION_PAR_ITEM).sort()).toEqual(['IC-160', 'IC-217', 'IC-247']);
    for (const [code, qs] of Object.entries(QUESTIONS_MEMORISATION_PAR_ITEM)) {
      expect(qs.some((q) => q.rang === 'A'), `${code} sans rang A`).toBe(true);
      expect(qs.some((q) => q.rang === 'B'), `${code} sans rang B`).toBe(true);
      expect(qs.length, `${code} : pilote limité`).toBeLessThanOrEqual(12);
    }
  });

  it('a des identifiants uniques, cohérents avec l’item, le rang et la compétence', () => {
    const ids = toutes.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [code, qs] of Object.entries(QUESTIONS_MEMORISATION_PAR_ITEM)) {
      const numero = code.replace('IC-', '');
      for (const q of qs) {
        expect(q.itemCode).toBe(code);
        expect(q.id).toMatch(new RegExp(`^M${numero}-${q.rang}\\d+$`));
        expect(q.objectifId).toMatch(new RegExp(`^OIC-${numero.padStart(3, '0')}-\\d{2}-${q.rang}$`));
      }
    }
  });

  it('garde les QCM sans ambiguïté : 4 options distinctes, une seule bonne réponse', () => {
    for (const q of qcm) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.trim().toLowerCase())).size, q.id).toBe(4);
      expect(q.options.every((o) => o.trim().length > 0), q.id).toBe(true);
      expect(q.options[q.indexCorrect], q.id).toBe(q.verification.reponseCorrecte);
    }
  });

  it('ne laisse pas deviner la réponse : positions variées, bonne réponse rarement la plus longue', () => {
    const positions = new Set(qcm.map((q) => q.indexCorrect));
    expect(positions.size).toBe(4);
    for (const [code, qs] of Object.entries(QUESTIONS_MEMORISATION_PAR_ITEM)) {
      const qcmItem = qs.filter((q) => q.type === 'qcm');
      const pos = new Set(qcmItem.map((q) => (q as (typeof qcm)[number]).indexCorrect));
      expect(pos.size, `${code} : positions de la bonne réponse`).toBeGreaterThanOrEqual(3);
    }
    const plusLongue = qcm.filter((q) => {
      // Strictement la plus longue : à égalité (options chiffrées), aucun indice.
      const autres = q.options.filter((_, i) => i !== q.indexCorrect).map((o) => o.length);
      return q.options[q.indexCorrect].length > Math.max(...autres);
    });
    expect(plusLongue.length / qcm.length).toBeLessThanOrEqual(0.34);
  });

  it('reste court et lisible sur mobile', () => {
    for (const q of toutes) {
      expect(q.question.length, `${q.id} question`).toBeLessThanOrEqual(130);
      expect(q.explication.length, `${q.id} explication`).toBeLessThanOrEqual(300);
      if (q.type === 'qcm') q.options.forEach((o) => expect(o.length, `${q.id} option`).toBeLessThanOrEqual(100));
      else expect(q.reponse.length, `${q.id} réponse`).toBeLessThanOrEqual(180);
    }
  });

  it('porte une traçabilité complète et ne prétend à aucune validation médicale', () => {
    for (const q of toutes) {
      const v = q.verification;
      expect(v.extraitReferentiel.trim().length, `${q.id} extrait`).toBeGreaterThan(10);
      expect(v.justification.trim().length, `${q.id} justification`).toBeGreaterThan(20);
      expect(v.reponseCorrecte.trim().length, q.id).toBeGreaterThan(0);
      expect(v.verifiePar).toBeTruthy();
      expect(v.dateVerification).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (v.statut === 'verifie_source_externe') {
        expect(v.sourcesExternes.length, `${q.id} sans source externe`).toBeGreaterThan(0);
        v.sourcesExternes.forEach((s) => expect(s.lien, q.id).toMatch(/^https:\/\//));
      }
      // Invariant du pilote : aucune relecture médicale humaine n'a eu lieu.
      expect(v.statut, q.id).not.toBe('valide_expert');
      expect(v.statut, q.id).not.toBe('brouillon');
    }
  });

  it('n’affiche rien en production tant qu’aucune question n’est validée par un expert', () => {
    expect(toutes.some((q) => statutAffichable(q.verification.statut, false))).toBe(false);
    expect(toutes.every((q) => statutAffichable(q.verification.statut, true))).toBe(true);
    expect(statutAffichable('brouillon', true)).toBe(false);
  });

  it('génère la requête de contrôle des extraits (voir docs/quiz-memorisation)', () => {
    const sql = genererSqlVerificationExtraits(toutes);
    expect(sql).toContain('oic_competences');
    expect(sql.match(/\('M\d+-[AB]\d+'/g)!.length).toBeGreaterThanOrEqual(toutes.length);
    if (process.env.QMEMO_SQL_OUT) writeFileSync(process.env.QMEMO_SQL_OUT, sql);
  });
});
