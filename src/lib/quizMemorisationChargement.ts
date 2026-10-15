import type { QuestionMemo } from '@/data/quizMemorisation/types';
import { normaliserCodeItem } from '@/config/offre';
import { questionsAffichables } from '@/utils/quizMemorisation';

/**
 * Chargement des questions de mémorisation d’un item — PILOTE.
 *
 * Tout est derrière `VITE_QUIZ_MEMORISATION_PILOTE=true` (build de préproduction
 * uniquement). Sans ce drapeau :
 *  - rien n’est affiché : le quiz de l’item reste celui d’aujourd’hui ;
 *  - le module de données n’est pas importé, et comme la condition est
 *    remplacée par une constante au build, il n’est pas non plus embarqué dans
 *    le bundle (contrôlé : voir docs/quiz-memorisation/RAPPORT-PILOTE.md).
 *
 * Même avec le drapeau, seules les questions de statut suffisant sont
 * rendues (`conforme_referentiel` et plus en pilote ; `valide_expert` hors
 * pilote — il n’y en a aucune).
 *
 * LIMITE À LEVER AVANT GÉNÉRALISATION : les questions des items Premium
 * voyagent dans le JavaScript du pilote, donc lisibles par quiconque a accès au
 * build de préproduction. En production, elles devront être servies par une RPC
 * serveur soumise à la même règle que `mm_contenu_immersif_item`.
 */
export const pilote = (): boolean => import.meta.env.VITE_QUIZ_MEMORISATION_PILOTE === 'true';

export async function chargerQuestionsMemorisation(itemCode: string): Promise<QuestionMemo[]> {
  if (import.meta.env.VITE_QUIZ_MEMORISATION_PILOTE !== 'true') return [];
  const { QUESTIONS_MEMORISATION_PAR_ITEM } = await import('@/data/quizMemorisation');
  const brutes = QUESTIONS_MEMORISATION_PAR_ITEM[normaliserCodeItem(itemCode)] ?? [];
  return questionsAffichables(brutes, true);
}
