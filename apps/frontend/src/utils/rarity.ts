/**
 * Utilities pour la gestion des raretés (badges, auras, items)
 */

export type RarityLevel = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Retourne les classes CSS de couleur de gradient pour un niveau de rareté
 */
export function getRarityColor(rarity: string): string {
  const rarityColors: Record<string, string> = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600',
  };

  return rarityColors[rarity.toLowerCase()] || rarityColors.common;
}

/**
 * Retourne la couleur de texte pour un niveau de rareté
 */
export function getRarityTextColor(rarity: string): string {
  const textColors: Record<string, string> = {
    common: 'text-gray-600',
    uncommon: 'text-green-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600',
  };

  return textColors[rarity.toLowerCase()] || textColors.common;
}

/**
 * Retourne la couleur de fond pour un niveau de rareté
 */
export function getRarityBgColor(rarity: string): string {
  const bgColors: Record<string, string> = {
    common: 'bg-gray-100',
    uncommon: 'bg-green-100',
    rare: 'bg-blue-100',
    epic: 'bg-purple-100',
    legendary: 'bg-yellow-100',
  };

  return bgColors[rarity.toLowerCase()] || bgColors.common;
}

/**
 * Retourne la couleur de bordure pour un niveau de rareté
 */
export function getRarityBorderColor(rarity: string): string {
  const borderColors: Record<string, string> = {
    common: 'border-gray-200',
    uncommon: 'border-green-200',
    rare: 'border-blue-200',
    epic: 'border-purple-200',
    legendary: 'border-yellow-200',
  };

  return borderColors[rarity.toLowerCase()] || borderColors.common;
}

/**
 * Retourne le label traduit pour un niveau de rareté
 */
export function getRarityLabel(rarity: string): string {
  const labels: Record<string, string> = {
    common: 'Commun',
    uncommon: 'Peu commun',
    rare: 'Rare',
    epic: 'Épique',
    legendary: 'Légendaire',
  };

  return labels[rarity.toLowerCase()] || 'Commun';
}

/**
 * Retourne l'ordre de tri pour les raretés (pour trier par rareté)
 */
export function getRaritySortOrder(rarity: string): number {
  const order: Record<string, number> = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
  };

  return order[rarity.toLowerCase()] || 0;
}
