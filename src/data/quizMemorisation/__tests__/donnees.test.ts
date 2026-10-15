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
      // Invariant du pilote : aucune relecture médicale humaine n'a eu lieu. Une revue IA,
      // même indépendante, ne donne jamais ce statut.
      expect(v.statut, q.id).not.toBe('valide_expert');
      expect(v.verifiePar, q.id).not.toMatch(/médecin|Dr /i);
      expect(v.statut, q.id).not.toBe('brouillon');
    }
  });

  it('n’affiche rien en production tant qu’aucune question n’est validée par un expert', () => {
    expect(toutes.some((q) => statutAffichable(q.verification.statut, false))).toBe(false);
    const nonBloquees = toutes.filter((q) => q.verification.statut !== 'bloque');
    expect(nonBloquees.every((q) => statutAffichable(q.verification.statut, true))).toBe(true);
    expect(statutAffichable('brouillon', true)).toBe(false);
    expect(statutAffichable('bloque', true)).toBe(false);
    expect(statutAffichable('bloque', false)).toBe(false);
  });

  it('bloque toute question dont le texte affiché dépasse le référentiel sans source externe lue', () => {
    const idsBloques = toutes.filter((q) => q.verification.statut === 'bloque').map((q) => q.id).sort();
    expect(idsBloques).toEqual(['M160-A2', 'M217-A4', 'M247-A2', 'M247-A7', 'M247-B3']);
    // Aucune question « conforme_referentiel » ne peut citer une correction externe dans ses notes.
    for (const q of toutes.filter((x) => x.verification.statut === 'conforme_referentiel')) {
      expect(q.verification.notes ?? '', q.id).not.toMatch(/Revue Codex/);
    }
  });

  it('documente la raison de chaque blocage', () => {
    for (const q of toutes) {
      if (q.verification.statut === 'bloque') expect(q.verification.motifBlocage?.length, q.id).toBeGreaterThan(40);
      else expect(q.verification.motifBlocage, q.id).toBeUndefined();
    }
  });
});

/** Non-régression de la revue scientifique du 15.10.2026. */
describe('revue scientifique — corrections à ne pas perdre', () => {
  const parId = (id: string) => toutes.find((q) => q.id === id)!;
  const texteAffiche = (q: QuestionMemo) =>
    [q.question, q.explication, q.type === 'qcm' ? q.options.join(' ') : q.reponse].join(' ');

  it('M217-A5 : le MNI test n’est jamais présenté comme confirmatoire', () => {
    const q = parId('M217-A5');
    expect(texteAffiche(q)).not.toMatch(/certitude/i);
    expect(q.verification.reponseCorrecte).toBe('Une sérologie EBV');
    expect(q.question).toMatch(/hétérophile/);
    expect(q.explication).toMatch(/non spécifiques de l’EBV/);
    expect(q.explication).toMatch(/IgM anti-VCA positives et des anti-EBNA négatifs/);
    expect(q.explication).toMatch(/IgG anti-VCA persistent/);
    expect(q.verification.reponseCorrecte).not.toMatch(/MNI/);
    expect(q.explication).toMatch(/ne confirme pas/);
    expect(q.explication).toMatch(/faux négatifs/);
    for (const autre of toutes) expect(texteAffiche(autre), autre.id).not.toMatch(/diagnostic de certitude/i);
  });

  it('M247-A2 (indication de l’HGPO) reste bloquée tant que le conflit référentiel / HAS n’est pas tranché', () => {
    expect(parId('M247-A2').verification.statut).toBe('bloque');
    expect(parId('M247-A2').verification.motifBlocage).toMatch(/HAS/);
  });

  it('M247-A7 : chaque alternative du resucrage est quantifiée et non allégée', () => {
    const q = parId('M247-A7');
    const reponse = q.type === 'rappel' ? q.reponse : '';
    expect(reponse).toMatch(/15 g/);
    expect(reponse).toMatch(/demi-verre/);
    expect(reponse).toMatch(/non allégé/);
    expect(reponse).not.toMatch(/bonbons/);
    expect(q.explication).toMatch(/light/);
  });

  it('M217-B3 : le DRESS n’est pas décrit « sans cholestase »', () => {
    const q = parId('M217-B3');
    expect(q.explication).not.toMatch(/sans cholestase/);
    expect(q.explication).toMatch(/cholestatique/);
  });

  it('M217-A4 : l’absence de cholestase dans l’EBV est qualifiée, pas absolue', () => {
    const q = parId('M217-A4');
    expect(q.type === 'rappel' && q.reponse).toMatch(/habituellement/);
    expect(q.explication).toMatch(/cholestase reste possible/);
  });

  it('M247-A3 : le seuil est donné en g/L et en mmol/L exacts (11,1)', () => {
    const q = parId('M247-A3');
    expect(q.type === 'rappel' && q.reponse).toMatch(/11,1 mmol\/L/);
  });

  it('M247-B3 : NaCl 0,9 % et cristalloïdes équilibrés reconnus, mais question bloquée tant que le consensus n’est pas lu', () => {
    const q = parId('M247-B3');
    expect(q.verification.statut).toBe('bloque');
    expect(q.type === 'qcm' && q.options[q.indexCorrect]).toMatch(/NaCl 0,9 %.*cristalloïde équilibré.*contexte/);
    expect(q.explication).toMatch(/cristalloïde équilibré/);
  });

  it('M160-B2 : le trajet neurotoxique reste inchangé (retour rétrograde par les motoneurones)', () => {
    const q = parId('M160-B2');
    expect(q.type === 'rappel' && q.reponse).toMatch(/transport rétrograde.*motoneurones.*interneurones inhibiteurs/);
  });

  it('M160-A2 : l’apyrexie n’est affirmée que pour le début', () => {
    const q = parId('M160-A2');
    expect(q.type === 'rappel' && q.reponse).not.toMatch(/fièvre/);
    expect(q.explication).not.toMatch(/sans fièvre/);
    expect(q.explication).toMatch(/Pas de fièvre au début/);
  });

  it('IC-160 : immunoglobulines réservées à la plaie majeure non à jour, dose de 250 UI', () => {
    const a3 = parId('M160-A3');
    const a4 = parId('M160-A4');
    expect(a3.verification.reponseCorrecte).toMatch(/250 UI/);
    expect(a4.verification.reponseCorrecte).not.toMatch(/immunoglobuline/i);
  });

  it('génère la requête de contrôle des extraits (voir docs/quiz-memorisation)', () => {
    const sql = genererSqlVerificationExtraits(toutes);
    expect(sql).toContain('oic_competences');
    expect(sql.match(/\('M\d+-[AB]\d+'/g)!.length).toBeGreaterThanOrEqual(toutes.length);
    if (process.env.QMEMO_SQL_OUT) writeFileSync(process.env.QMEMO_SQL_OUT, sql);
  });
});
