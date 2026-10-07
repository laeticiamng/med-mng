/**
 * Valeurs autorisées par la base pour `user_progress` (vérifiées en production
 * le 07.10.2026, pg_constraint) :
 *  - user_progress_content_type_check  : content_type ∈ {edn, ecos, quiz}
 *  - user_progress_mastery_level_check : mastery_level ∈ {beginner, intermediate,
 *    advanced, expert} (NULL accepté)
 *
 * Le code écrivait content_type = 'item' et mastery_level = 'revised' /
 * 'in_progress' / 'not_started' : chaque écriture était rejetée (23514) et la
 * lecture filtrait sur 'item', donc rien ne s'affichait jamais (MM-A03).
 * Toute lecture ou écriture de user_progress passe par ce module.
 */
import type { ItemStatus } from '@/types/medMngItems';

/** content_type des items EDN dans user_progress. */
export const TYPE_CONTENU_ITEM = 'edn' as const;
/** content_type des situations ECOS dans user_progress. */
export const TYPE_CONTENU_ECOS = 'ecos' as const;

export type NiveauMaitrise = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Statut d'item affiché → niveau stocké. « Non commencé » n'a pas de niveau. */
export function maitriseDepuisStatut(statut: ItemStatus): NiveauMaitrise | null {
  if (statut === 'revised') return 'advanced';
  if (statut === 'in_progress') return 'intermediate';
  return null;
}

/** Niveau stocké → statut affiché (anciennes valeurs textuelles tolérées en lecture). */
export function statutDepuisMaitrise(niveau: string | null | undefined): ItemStatus {
  switch (niveau) {
    case 'advanced':
    case 'expert':
    case 'revised':
    case 'done':
      return 'revised';
    case 'beginner':
    case 'intermediate':
    case 'in_progress':
      return 'in_progress';
    default:
      return 'not_started';
  }
}

/**
 * Niveau d'une tentative ECOS d'après son score : ≥ 60 % « advanced » (même
 * seuil que l'ancien « revised »), > 0 « intermediate », 0 « beginner »
 * (la situation a été tentée).
 */
export function maitriseDepuisScoreEcos(pourcentage: number): NiveauMaitrise {
  if (pourcentage >= 60) return 'advanced';
  if (pourcentage > 0) return 'intermediate';
  return 'beginner';
}
