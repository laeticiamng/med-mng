/**
 * Utilitaires pour le calcul du score de complétion des items EDN
 * Extrait de la logique métier pour faciliter les tests
 */

import { EdnItem, EdnItemUnified } from '@/types/edn';

/**
 * Calcule le pourcentage de complétion d'un item
 * Utilise le score pré-calculé en DB si disponible, sinon estime
 */
export function getCompletionPercentage(item: EdnItem | EdnItemUnified): number {
  // Utiliser le score pré-calculé si disponible
  if (item.completeness_score != null) {
    return Math.min(100, Math.max(0, item.completeness_score));
  }
  
  // Fallback: estimation basée sur les compteurs
  const hasRangA = (item.competences_count_rang_a || 0) > 0;
  const hasRangB = (item.competences_count_rang_b || 0) > 0;
  
  let score = 0;
  if (hasRangA) score += 40; // Rang A = 40%
  if (hasRangB) score += 40; // Rang B = 40%
  // Les 20% restants (musique, scène, quiz) ne sont pas comptés ici
  
  return score;
}

/**
 * Vérifie si un item est considéré comme complet
 */
export function isItemComplete(item: EdnItem | EdnItemUnified): boolean {
  return getCompletionPercentage(item) === 100;
}

/**
 * Retourne la couleur associée au score de complétion
 */
export function getCompletionColor(percentage: number): string {
  if (percentage === 100) return 'text-green-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-gray-600';
}

/**
 * Retourne le label de badge pour le score
 */
export function getCompletionLabel(percentage: number): string {
  if (percentage === 100) return 'Complet';
  if (percentage >= 80) return 'Avancé';
  if (percentage >= 60) return 'En cours';
  return 'À compléter';
}

/**
 * Calcule les statistiques globales pour un ensemble d'items
 */
export function calculateItemsStats(items: EdnItemUnified[]) {
  const total = items.length;
  
  if (total === 0) {
    return {
      total: 0,
      complete: 0,
      validated: 0,
      withMusic: 0,
      avgScore: 0,
    };
  }
  
  const complete = items.filter(item => 
    (item.competences_count_rang_a || 0) > 0 && (item.competences_count_rang_b || 0) > 0
  ).length;
  
  const validated = items.filter(item => item.is_validated).length;
  
  const withMusic = items.filter(item => 
    item.has_paroles_musicales || item.has_paroles_rang_a || item.has_paroles_rang_b
  ).length;
  
  const avgScore = Math.round(
    items.reduce((sum, item) => sum + getCompletionPercentage(item), 0) / total
  );
  
  return { total, complete, validated, withMusic, avgScore };
}
