import { useState, useMemo, useCallback } from 'react';

interface EdnItemBase {
  id: string;
  item_code: string;
  title: string;
  competences_count_rang_a?: number;
  competences_count_rang_b?: number;
  completeness_score?: number;
  is_validated?: boolean;
}

export const useEdnFilters = <T extends EdnItemBase>(allItems: T[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'complete' | 'incomplete' | 'validated'>('all');
  const [sortBy, setSortBy] = useState<'item_code' | 'completeness_score' | 'updated_at'>('item_code');
  
  const resetAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setQuickFilter('all');
    setSortBy('item_code');
  }, []);
  
  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || 
           selectedCategory !== 'all' || 
           quickFilter !== 'all' || 
           sortBy !== 'item_code';
  }, [searchTerm, selectedCategory, quickFilter, sortBy]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesQuickFilter = (() => {
        switch (quickFilter) {
          case 'complete':
            return (item.competences_count_rang_a || 0) > 0 && (item.competences_count_rang_b || 0) > 0;
          case 'incomplete':
            return !((item.competences_count_rang_a || 0) > 0 && (item.competences_count_rang_b || 0) > 0);
          case 'validated':
            return item.is_validated === true;
          default:
            return true;
        }
      })();
      
      if (selectedCategory === 'all') return matchesSearch && matchesQuickFilter;
      
      const matchesCategory = (() => {
        switch (selectedCategory) {
          case 'complete':
            return (item.competences_count_rang_a || 0) > 0 && (item.competences_count_rang_b || 0) > 0;
          case 'withMusic':
            return item.completeness_score ? item.completeness_score > 60 : false;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesCategory && matchesQuickFilter;
    });
  }, [allItems, searchTerm, selectedCategory, quickFilter]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    quickFilter,
    setQuickFilter,
    sortBy,
    setSortBy,
    resetAllFilters,
    hasActiveFilters,
    filteredItems
  };
};
