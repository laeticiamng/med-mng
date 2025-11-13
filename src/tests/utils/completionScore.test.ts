import { describe, it, expect } from 'vitest';
import { getCompletionPercentage, isItemComplete, calculateItemsStats } from '@/utils/completionScore';
import type { EdnItemUnified } from '@/types/edn';

describe('getCompletionPercentage', () => {
  it('devrait retourner le score pré-calculé si disponible', () => {
    const item = { completeness_score: 85 } as EdnItemUnified;
    expect(getCompletionPercentage(item)).toBe(85);
  });

  it('devrait calculer le score basé sur les rangs', () => {
    const item = { 
      competences_count_rang_a: 5, 
      competences_count_rang_b: 3 
    } as EdnItemUnified;
    expect(getCompletionPercentage(item)).toBe(80);
  });

  it('devrait retourner 0 pour un item vide', () => {
    const item = {} as EdnItemUnified;
    expect(getCompletionPercentage(item)).toBe(0);
  });
});

describe('calculateItemsStats', () => {
  const items: EdnItemUnified[] = [
    { completeness_score: 100, competences_count_rang_a: 5, competences_count_rang_b: 3, is_validated: true, has_paroles_musicales: true } as EdnItemUnified,
    { completeness_score: 50, competences_count_rang_a: 0, competences_count_rang_b: 0, is_validated: false, has_paroles_musicales: false } as EdnItemUnified,
  ];

  it('devrait calculer les statistiques correctement', () => {
    const stats = calculateItemsStats(items);
    
    expect(stats.total).toBe(2);
    expect(stats.complete).toBe(1);
    expect(stats.validated).toBe(1);
    expect(stats.withMusic).toBe(1);
    expect(stats.avgScore).toBe(75);
  });
});
