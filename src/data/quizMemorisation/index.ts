import { QUESTIONS_IC_160 } from './ic-160';
import { QUESTIONS_IC_217 } from './ic-217';
import { QUESTIONS_IC_247 } from './ic-247';
import type { QuestionMemo } from './types';

export * from './types';

/**
 * Questions de mémorisation du PILOTE, par code d’item (IC-<n>).
 *
 * Ce module n’est chargé (import dynamique) que si le drapeau du pilote est
 * actif : voir src/lib/quizMemorisationChargement.ts. Il n’est donc pas dans le
 * bundle de production tant que VITE_QUIZ_MEMORISATION_PILOTE n’est pas « true ».
 */
export const QUESTIONS_MEMORISATION_PAR_ITEM: Readonly<Record<string, readonly QuestionMemo[]>> = {
  'IC-160': QUESTIONS_IC_160,
  'IC-217': QUESTIONS_IC_217,
  'IC-247': QUESTIONS_IC_247,
};
