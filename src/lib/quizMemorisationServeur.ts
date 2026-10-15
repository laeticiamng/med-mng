import { supabase } from '@/integrations/supabase/client';
import { normaliserCodeItem } from '@/config/offre';
import type { QuestionAffichee, StatutVerification } from '@/data/quizMemorisation/types';

/**
 * Distribution des questions de mémorisation par le SERVEUR (RPC `mm_quiz_memorisation_item`,
 * supabase/migrations/20261015120000_mm_quiz_memorisation_serveur.sql).
 *
 * Le serveur applique la règle Gratuit/Premium d'après le JWT et ne sert que les statuts
 * autorisés (par défaut : `valide_expert`). Aucune question ne se trouve dans le JavaScript :
 * un item verrouillé ne renvoie ni question ni réponse.
 *
 * Activé par VITE_QUIZ_MEMORISATION_SERVEUR=true. Sans ce drapeau, aucun appel n'est émis.
 * Tant que la migration n'est pas appliquée, la RPC n'existe pas : l'erreur est absorbée
 * (aucune question, quiz existant seul).
 */
export const serveurActif = (): boolean => import.meta.env.VITE_QUIZ_MEMORISATION_SERVEUR === 'true';

export interface QuestionsServeur {
  questions: QuestionAffichee[];
  /** Le serveur sert aussi des questions non encore validées par un expert (mode pilote). */
  pilote: boolean;
  verrouille: boolean;
}

const VIDE: QuestionsServeur = { questions: [], pilote: false, verrouille: false };
const STATUTS_SERVIS: readonly StatutVerification[] = ['conforme_referentiel', 'verifie_source_externe', 'valide_expert'];

const estTexte = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const estObjet = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Valide la forme d'une ligne reçue ; renvoie `null` si elle est inexploitable (jamais d'exception). */
export function lireQuestionServeur(brute: unknown): QuestionAffichee | null {
  if (!estObjet(brute)) return null;
  const { id, rang, type, question, explication, statut } = brute;
  if (!estTexte(id) || !/^M\d+-[AB]\d+$/.test(id)) return null;
  if (rang !== 'A' && rang !== 'B') return null;
  if (!estTexte(question) || !estTexte(explication)) return null;
  if (!STATUTS_SERVIS.includes(statut as StatutVerification)) return null;
  const base = { id, rang, question, explication, statut: statut as StatutVerification } as const;

  if (type === 'qcm') {
    const { options, index_correct: indexCorrect } = brute;
    if (!Array.isArray(options) || options.length !== 4 || !options.every(estTexte)) return null;
    if (!Number.isInteger(indexCorrect) || (indexCorrect as number) < 0 || (indexCorrect as number) > 3) return null;
    return {
      ...base,
      type: 'qcm',
      options: options as unknown as [string, string, string, string],
      indexCorrect: indexCorrect as 0 | 1 | 2 | 3,
    };
  }
  if (type === 'rappel') {
    if (!estTexte(brute.reponse)) return null;
    return { ...base, type: 'rappel', reponse: brute.reponse };
  }
  return null;
}

export function lireReponseServeur(donnees: unknown): QuestionsServeur {
  if (!estObjet(donnees)) return VIDE;
  if (donnees.verrouille === true) return { questions: [], pilote: false, verrouille: true };
  if (!Array.isArray(donnees.questions)) return VIDE;
  const questions = donnees.questions
    .map(lireQuestionServeur)
    .filter((q): q is QuestionAffichee => q !== null);
  return { questions, pilote: donnees.pilote === true, verrouille: false };
}

export async function chargerQuestionsServeur(itemCode: string): Promise<QuestionsServeur> {
  if (!serveurActif()) return VIDE;
  try {
    const { data, error } = await supabase.rpc('mm_quiz_memorisation_item' as never, {
      p_item_code: normaliserCodeItem(itemCode),
    } as never);
    if (error) return VIDE;
    return lireReponseServeur(data);
  } catch {
    return VIDE;
  }
}
