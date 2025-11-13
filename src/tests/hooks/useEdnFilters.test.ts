import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEdnFilters } from '@/hooks/useEdnFilters';
import type { EdnItemUnified } from '@/types/edn';

const mockItems: EdnItemUnified[] = [
  { id: '1', item_code: 'IC-001', title: 'Cardiologie', competences_count_rang_a: 5, competences_count_rang_b: 3, is_validated: true } as EdnItemUnified,
  { id: '2', item_code: 'IC-002', title: 'Pneumologie', competences_count_rang_a: 0, competences_count_rang_b: 0, is_validated: false } as EdnItemUnified,
];

describe('useEdnFilters', () => {
  it('devrait filtrer par recherche textuelle', () => {
    const { result } = renderHook(() => useEdnFilters(mockItems));
    
    act(() => {
      result.current.setSearchTerm('cardio');
    });
    
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].item_code).toBe('IC-001');
  });

  it('devrait filtrer les items complets', () => {
    const { result } = renderHook(() => useEdnFilters(mockItems));
    
    act(() => {
      result.current.setQuickFilter('complete');
    });
    
    expect(result.current.filteredItems).toHaveLength(1);
  });

  it('devrait réinitialiser tous les filtres', () => {
    const { result } = renderHook(() => useEdnFilters(mockItems));
    
    act(() => {
      result.current.setSearchTerm('test');
      result.current.setQuickFilter('complete');
      result.current.resetAllFilters();
    });
    
    expect(result.current.searchTerm).toBe('');
    expect(result.current.quickFilter).toBe('all');
    expect(result.current.hasActiveFilters).toBe(false);
  });
});
