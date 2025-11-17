import { describe, it, expect } from 'vitest';
import { 
  getCompletionPercentage, 
  isItemComplete, 
  calculateItemsStats,
  getCompletionColor,
  getCompletionLabel 
} from '@/utils/completionScore';
import type { EdnItemUnified, EdnItem } from '@shared/types/edn';

describe('getCompletionPercentage', () => {
  describe('Avec score pré-calculé', () => {
    it('devrait retourner le score pré-calculé si disponible', () => {
      const item = { completeness_score: 85 } as EdnItemUnified;
      expect(getCompletionPercentage(item)).toBe(85);
    });

    it('devrait limiter le score à 100 maximum', () => {
      const item = { completeness_score: 150 } as EdnItemUnified;
      expect(getCompletionPercentage(item)).toBe(100);
    });

    it('devrait limiter le score à 0 minimum', () => {
      const item = { completeness_score: -20 } as EdnItemUnified;
      expect(getCompletionPercentage(item)).toBe(0);
    });

    it('devrait gérer un score de 0', () => {
      const item = { completeness_score: 0 } as EdnItemUnified;
      expect(getCompletionPercentage(item)).toBe(0);
    });
  });

  describe('Calcul fallback basé sur les rangs', () => {
    it('devrait calculer 40% pour rang A seul', () => {
      const item = { 
        competences_count_rang_a: 5, 
        competences_count_rang_b: 0 
      } as EdnItemUnified;
      expect(getCompletionPercentage(item)).toBe(40);
    });

    it('devrait calculer 40% pour rang B seul', () => {
      const item = { 
        competences_count_rang_a: 0, 
        competences_count_rang_b: 3 
      } as EdnItemUnified;
      expect(getCompletionPercentage(item)).toBe(40);
    });

    it('devrait calculer 80% pour les deux rangs', () => {
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

    it('devrait retourner 0 si tous les compteurs sont à 0', () => {
      const item = { 
        competences_count_rang_a: 0, 
        competences_count_rang_b: 0 
      } as EdnItemUnified;
      expect(getCompletionPercentage(item)).toBe(0);
    });
  });

  describe('Compatibilité EdnItem', () => {
    it('devrait fonctionner avec un EdnItem', () => {
      const item = { 
        completeness_score: 75,
        item_code: 'IC-001',
        title: 'Test'
      } as EdnItem;
      expect(getCompletionPercentage(item)).toBe(75);
    });
  });
});

describe('isItemComplete', () => {
  it('devrait retourner true pour un score de 100', () => {
    const item = { completeness_score: 100 } as EdnItemUnified;
    expect(isItemComplete(item)).toBe(true);
  });

  it('devrait retourner false pour un score < 100', () => {
    const item = { completeness_score: 99 } as EdnItemUnified;
    expect(isItemComplete(item)).toBe(false);
  });

  it('devrait retourner false pour un score de 0', () => {
    const item = { completeness_score: 0 } as EdnItemUnified;
    expect(isItemComplete(item)).toBe(false);
  });

  it('devrait retourner false pour un item sans score', () => {
    const item = { 
      competences_count_rang_a: 5, 
      competences_count_rang_b: 0 
    } as EdnItemUnified;
    expect(isItemComplete(item)).toBe(false);
  });
});

describe('getCompletionColor', () => {
  it('devrait retourner green pour 100%', () => {
    expect(getCompletionColor(100)).toBe('text-green-600');
  });

  it('devrait retourner blue pour >= 80%', () => {
    expect(getCompletionColor(80)).toBe('text-blue-600');
    expect(getCompletionColor(90)).toBe('text-blue-600');
  });

  it('devrait retourner yellow pour >= 60%', () => {
    expect(getCompletionColor(60)).toBe('text-yellow-600');
    expect(getCompletionColor(70)).toBe('text-yellow-600');
  });

  it('devrait retourner gray pour < 60%', () => {
    expect(getCompletionColor(50)).toBe('text-gray-600');
    expect(getCompletionColor(0)).toBe('text-gray-600');
  });
});

describe('getCompletionLabel', () => {
  it('devrait retourner "Complet" pour 100%', () => {
    expect(getCompletionLabel(100)).toBe('Complet');
  });

  it('devrait retourner "Avancé" pour >= 80%', () => {
    expect(getCompletionLabel(80)).toBe('Avancé');
    expect(getCompletionLabel(95)).toBe('Avancé');
  });

  it('devrait retourner "En cours" pour >= 60%', () => {
    expect(getCompletionLabel(60)).toBe('En cours');
    expect(getCompletionLabel(75)).toBe('En cours');
  });

  it('devrait retourner "À compléter" pour < 60%', () => {
    expect(getCompletionLabel(50)).toBe('À compléter');
    expect(getCompletionLabel(0)).toBe('À compléter');
  });
});

describe('calculateItemsStats', () => {
  describe('Cas normaux', () => {
    const items: EdnItemUnified[] = [
      { 
        completeness_score: 100, 
        competences_count_rang_a: 5, 
        competences_count_rang_b: 3, 
        is_validated: true, 
        has_paroles_musicales: true 
      } as EdnItemUnified,
      { 
        completeness_score: 50, 
        competences_count_rang_a: 0, 
        competences_count_rang_b: 0, 
        is_validated: false, 
        has_paroles_musicales: false 
      } as EdnItemUnified,
      { 
        completeness_score: 85, 
        competences_count_rang_a: 4, 
        competences_count_rang_b: 2, 
        is_validated: true, 
        has_paroles_rang_a: true 
      } as EdnItemUnified,
    ];

    it('devrait calculer le total correctement', () => {
      const stats = calculateItemsStats(items);
      expect(stats.total).toBe(3);
    });

    it('devrait compter les items complets', () => {
      const stats = calculateItemsStats(items);
      expect(stats.complete).toBe(2); // Items avec rangs A et B
    });

    it('devrait compter les items validés', () => {
      const stats = calculateItemsStats(items);
      expect(stats.validated).toBe(2);
    });

    it('devrait compter les items avec musique', () => {
      const stats = calculateItemsStats(items);
      expect(stats.withMusic).toBe(2); // Un avec paroles_musicales, un avec paroles_rang_a
    });

    it('devrait calculer la moyenne des scores', () => {
      const stats = calculateItemsStats(items);
      expect(stats.avgScore).toBe(78); // (100 + 50 + 85) / 3 = 78.33 arrondi
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer un tableau vide', () => {
      const stats = calculateItemsStats([]);
      
      expect(stats.total).toBe(0);
      expect(stats.complete).toBe(0);
      expect(stats.validated).toBe(0);
      expect(stats.withMusic).toBe(0);
      expect(stats.avgScore).toBe(0);
    });

    it('devrait gérer un seul item', () => {
      const items: EdnItemUnified[] = [
        { 
          completeness_score: 100, 
          competences_count_rang_a: 5, 
          competences_count_rang_b: 3, 
          is_validated: true 
        } as EdnItemUnified,
      ];
      
      const stats = calculateItemsStats(items);
      expect(stats.total).toBe(1);
      expect(stats.avgScore).toBe(100);
    });

    it('devrait gérer des items sans champs optionnels', () => {
      const items: EdnItemUnified[] = [
        { completeness_score: 0 } as EdnItemUnified,
        { completeness_score: 50 } as EdnItemUnified,
      ];
      
      const stats = calculateItemsStats(items);
      expect(stats.complete).toBe(0);
      expect(stats.validated).toBe(0);
      expect(stats.withMusic).toBe(0);
      expect(stats.avgScore).toBe(25);
    });

    it('devrait arrondir correctement la moyenne', () => {
      const items: EdnItemUnified[] = [
        { completeness_score: 33 } as EdnItemUnified,
        { completeness_score: 33 } as EdnItemUnified,
        { completeness_score: 33 } as EdnItemUnified,
      ];
      
      const stats = calculateItemsStats(items);
      expect(stats.avgScore).toBe(33);
    });
  });

  describe('Détection musique', () => {
    it('devrait compter has_paroles_musicales', () => {
      const items: EdnItemUnified[] = [
        { has_paroles_musicales: true } as EdnItemUnified,
      ];
      
      const stats = calculateItemsStats(items);
      expect(stats.withMusic).toBe(1);
    });

    it('devrait compter has_paroles_rang_a', () => {
      const items: EdnItemUnified[] = [
        { has_paroles_rang_a: true } as EdnItemUnified,
      ];
      
      const stats = calculateItemsStats(items);
      expect(stats.withMusic).toBe(1);
    });

    it('devrait compter has_paroles_rang_b', () => {
      const items: EdnItemUnified[] = [
        { has_paroles_rang_b: true } as EdnItemUnified,
      ];
      
      const stats = calculateItemsStats(items);
      expect(stats.withMusic).toBe(1);
    });

    it('ne devrait pas compter deux fois un item avec plusieurs types de musique', () => {
      const items: EdnItemUnified[] = [
        { 
          has_paroles_musicales: true, 
          has_paroles_rang_a: true,
          has_paroles_rang_b: true 
        } as EdnItemUnified,
      ];
      
      const stats = calculateItemsStats(items);
      expect(stats.withMusic).toBe(1);
    });
  });
});
