import type { EdnItemUnified, EdnItem } from '@shared/types/edn';

/**
 * Calculate the completion percentage for an EDN item
 * Uses pre-calculated score if available, otherwise falls back to rank-based calculation
 */
export function getCompletionPercentage(item: EdnItemUnified | EdnItem): number {
  // Use pre-calculated score if available
  if (item.completeness_score !== undefined && item.completeness_score !== null) {
    return Math.max(0, Math.min(100, item.completeness_score));
  }

  // Fallback: Calculate based on competency ranks
  const itemUnified = item as EdnItemUnified;
  const hasRangA = (itemUnified.competences_count_rang_a ?? 0) > 0;
  const hasRangB = (itemUnified.competences_count_rang_b ?? 0) > 0;

  if (hasRangA && hasRangB) {
    return 80; // Both ranks present
  } else if (hasRangA || hasRangB) {
    return 40; // One rank present
  }

  return 0; // No ranks
}

/**
 * Check if an item is complete (100% completion)
 */
export function isItemComplete(item: EdnItemUnified): boolean {
  return getCompletionPercentage(item) === 100;
}

/**
 * Get the color class for a completion percentage
 */
export function getCompletionColor(percentage: number): string {
  if (percentage === 100) {
    return 'text-green-600';
  } else if (percentage >= 80) {
    return 'text-blue-600';
  } else if (percentage >= 60) {
    return 'text-yellow-600';
  }
  return 'text-gray-600';
}

/**
 * Get the label for a completion percentage
 */
export function getCompletionLabel(percentage: number): string {
  if (percentage === 100) {
    return 'Complet';
  } else if (percentage >= 80) {
    return 'Avancé';
  } else if (percentage >= 60) {
    return 'En cours';
  }
  return 'À compléter';
}

/**
 * Statistics for a collection of items
 */
export interface ItemsStats {
  total: number;
  complete: number;
  validated: number;
  withMusic: number;
  avgScore: number;
}

/**
 * Calculate statistics for a collection of EDN items
 */
export function calculateItemsStats(items: EdnItemUnified[]): ItemsStats {
  if (items.length === 0) {
    return {
      total: 0,
      complete: 0,
      validated: 0,
      withMusic: 0,
      avgScore: 0,
    };
  }

  let complete = 0;
  let validated = 0;
  let withMusic = 0;
  let totalScore = 0;

  for (const item of items) {
    // Count complete items (items with both rang A and B)
    const hasRangA = (item.competences_count_rang_a ?? 0) > 0;
    const hasRangB = (item.competences_count_rang_b ?? 0) > 0;
    if (hasRangA && hasRangB) {
      complete++;
    }

    // Count validated items
    if (item.is_validated) {
      validated++;
    }

    // Count items with music (any of the music flags)
    if (
      item.has_paroles_musicales ||
      item.has_paroles_rang_a ||
      item.has_paroles_rang_b
    ) {
      withMusic++;
    }

    // Sum scores
    totalScore += getCompletionPercentage(item);
  }

  return {
    total: items.length,
    complete,
    validated,
    withMusic,
    avgScore: Math.round(totalScore / items.length),
  };
}
