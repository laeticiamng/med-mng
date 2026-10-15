import { describe, expect, it } from 'vitest';
import { estQuestionQuizGenerique } from '../tableauTransformations';

describe('estQuestionQuizGenerique', () => {
  it.each([
    // edn_items_complete.quiz_questions (3 × 367 = 1101)
    "Quelle est la compétence principale de rang A pour l'item 99 ?",
    "Dans le contexte de l'item 12, quelle approche thérapeutique est privilégiée ?",
    "Quel est l'objectif principal de rang B pour l'item 367 ?",
    // edn_items_immersive.quiz_questions (2 × 367 = 734)
    "Quelle est la compétence fondamentale principale de l'item 1 ?",
    "En niveau avancé (Rang B), que devez-vous maîtriser pour l'item 247 ?",
    '',
    null,
  ])('reconnaît le gabarit « %s »', (question) => {
    expect(estQuestionQuizGenerique(question)).toBe(true);
  });

  it.each([
    'Quel signe doit faire évoquer un tétanos, même si aucune plaie n’est retrouvée ?',
    'À partir de quelle glycémie veineuse à jeun, retrouvée à deux reprises, parle-t-on de diabète ?',
  ])('conserve une vraie question « %s »', (question) => {
    expect(estQuestionQuizGenerique(question)).toBe(false);
  });
});
