import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEdnFilters } from '@/hooks/useEdnFilters';
import type { EdnItemUnified } from '@shared/types/edn';

const mockItems: EdnItemUnified[] = [
  { 
    id: '1', 
    item_code: 'IC-001', 
    title: 'Cardiologie', 
    competences_count_rang_a: 5, 
    competences_count_rang_b: 3, 
    is_validated: true,
    completeness_score: 85 
  } as EdnItemUnified,
  { 
    id: '2', 
    item_code: 'IC-002', 
    title: 'Pneumologie', 
    competences_count_rang_a: 0, 
    competences_count_rang_b: 0, 
    is_validated: false,
    completeness_score: 20 
  } as EdnItemUnified,
  { 
    id: '3', 
    item_code: 'IC-003', 
    title: 'Neurologie', 
    competences_count_rang_a: 5, 
    competences_count_rang_b: 5, 
    is_validated: true,
    completeness_score: 100 
  } as EdnItemUnified,
];

describe('useEdnFilters', () => {
  describe('Recherche textuelle', () => {
    it('devrait filtrer par titre', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setSearchTerm('cardio');
      });
      
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].item_code).toBe('IC-001');
    });

    it('devrait filtrer par item_code', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setSearchTerm('IC-002');
      });
      
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].title).toBe('Pneumologie');
    });

    it('devrait être insensible à la casse', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setSearchTerm('NEURO');
      });
      
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].title).toBe('Neurologie');
    });

    it('devrait retourner tous les items avec une recherche vide', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setSearchTerm('');
      });
      
      expect(result.current.filteredItems).toHaveLength(3);
    });
  });

  describe('Filtres rapides', () => {
    it('devrait filtrer les items complets', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setQuickFilter('complete');
      });
      
      expect(result.current.filteredItems).toHaveLength(2);
      expect(result.current.filteredItems.every(i => 
        (i.competences_count_rang_a || 0) > 0 && (i.competences_count_rang_b || 0) > 0
      )).toBe(true);
    });

    it('devrait filtrer les items incomplets', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setQuickFilter('incomplete');
      });
      
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].item_code).toBe('IC-002');
    });

    it('devrait filtrer les items validés', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setQuickFilter('validated');
      });
      
      expect(result.current.filteredItems).toHaveLength(2);
      expect(result.current.filteredItems.every(i => i.is_validated)).toBe(true);
    });

    it('devrait retourner tous les items avec le filtre "all"', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setQuickFilter('all');
      });
      
      expect(result.current.filteredItems).toHaveLength(3);
    });
  });

  describe('Catégories', () => {
    it('devrait filtrer par catégorie "complete"', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setSelectedCategory('complete');
      });
      
      expect(result.current.filteredItems).toHaveLength(2);
    });

    it('devrait filtrer par catégorie "withMusic"', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setSelectedCategory('withMusic');
      });
      
      expect(result.current.filteredItems.length).toBeGreaterThan(0);
      expect(result.current.filteredItems.every(i => (i.completeness_score || 0) > 60)).toBe(true);
    });
  });

  describe('Combinaison de filtres', () => {
    it('devrait combiner recherche et filtre rapide', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setSearchTerm('Cardio');
        result.current.setQuickFilter('complete');
      });
      
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].item_code).toBe('IC-001');
    });

    it('devrait combiner plusieurs filtres', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setQuickFilter('validated');
        result.current.setSelectedCategory('complete');
      });
      
      expect(result.current.filteredItems).toHaveLength(2);
    });

    it('devrait retourner zéro résultat si aucun match', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setSearchTerm('NonExistant');
      });
      
      expect(result.current.filteredItems).toHaveLength(0);
    });
  });

  describe('Réinitialisation', () => {
    it('devrait réinitialiser tous les filtres', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setSearchTerm('test');
        result.current.setQuickFilter('complete');
        result.current.setSelectedCategory('complete');
        result.current.setSortBy('completeness_score');
        result.current.resetAllFilters();
      });
      
      expect(result.current.searchTerm).toBe('');
      expect(result.current.quickFilter).toBe('all');
      expect(result.current.selectedCategory).toBe('all');
      expect(result.current.sortBy).toBe('item_code');
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('hasActiveFilters', () => {
    it('devrait être false par défaut', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('devrait être true si un terme de recherche est actif', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setSearchTerm('test');
      });
      
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('devrait être true si un filtre rapide est actif', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setQuickFilter('complete');
      });
      
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('devrait être true si le tri est modifié', () => {
      const { result } = renderHook(() => useEdnFilters(mockItems));
      
      act(() => {
        result.current.setSortBy('completeness_score');
      });
      
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });
});
