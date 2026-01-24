import { useState, useEffect, useCallback } from 'react';

interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string;
}

interface FilterState {
  search: string;
  style: string;
  rang: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'date' | 'title' | 'style';
  sortOrder: 'asc' | 'desc';
  favorites: boolean;
}

const STORAGE_KEY = 'med-mng-saved-filters';
const LAST_FILTER_KEY = 'med-mng-last-filter';
const MAX_SAVED_FILTERS = 10;

const defaultFilters: FilterState = {
  search: '',
  style: '',
  rang: '',
  dateRange: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
  favorites: false
};

export const useSavedFilters = () => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterState>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved filters from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedFilters(parsed);
        }
      }

      // Load last used filter
      const lastFilter = localStorage.getItem(LAST_FILTER_KEY);
      if (lastFilter) {
        const parsed = JSON.parse(lastFilter);
        setCurrentFilters({ ...defaultFilters, ...parsed });
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist saved filters
  const persistFilters = useCallback((filters: SavedFilter[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }, []);

  // Persist current filter state
  const persistCurrentFilter = useCallback((filters: FilterState) => {
    try {
      localStorage.setItem(LAST_FILTER_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving current filter:', error);
    }
  }, []);

  // Update current filters
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setCurrentFilters(prev => {
      const newFilters = { ...prev, ...updates };
      persistCurrentFilter(newFilters);
      return newFilters;
    });
  }, [persistCurrentFilter]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setCurrentFilters(defaultFilters);
    persistCurrentFilter(defaultFilters);
  }, [persistCurrentFilter]);

  // Save current filter as preset
  const saveCurrentFilter = useCallback((name: string) => {
    const newFilter: SavedFilter = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
        ? `filter_${crypto.randomUUID().slice(0, 8)}` 
        : `filter_${Date.now()}`,
      name: name.trim() || `Filtre ${savedFilters.length + 1}`,
      filters: { ...currentFilters },
      createdAt: new Date().toISOString()
    };

    const updated = [newFilter, ...savedFilters].slice(0, MAX_SAVED_FILTERS);
    setSavedFilters(updated);
    persistFilters(updated);

    return newFilter;
  }, [currentFilters, savedFilters, persistFilters]);

  // Load a saved filter
  const loadFilter = useCallback((filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter) {
      setCurrentFilters(filter.filters);
      persistCurrentFilter(filter.filters);
      return true;
    }
    return false;
  }, [savedFilters, persistCurrentFilter]);

  // Delete a saved filter
  const deleteFilter = useCallback((filterId: string) => {
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    persistFilters(updated);
  }, [savedFilters, persistFilters]);

  // Rename a saved filter
  const renameFilter = useCallback((filterId: string, newName: string) => {
    const updated = savedFilters.map(f => 
      f.id === filterId ? { ...f, name: newName.trim() } : f
    );
    setSavedFilters(updated);
    persistFilters(updated);
  }, [savedFilters, persistFilters]);

  // Check if current filters match a saved filter
  const getMatchingSavedFilter = useCallback(() => {
    return savedFilters.find(saved => 
      JSON.stringify(saved.filters) === JSON.stringify(currentFilters)
    );
  }, [savedFilters, currentFilters]);

  // Check if filters have been modified from defaults
  const hasActiveFilters = useCallback(() => {
    return JSON.stringify(currentFilters) !== JSON.stringify(defaultFilters);
  }, [currentFilters]);

  // Get active filter count
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (currentFilters.search) count++;
    if (currentFilters.style) count++;
    if (currentFilters.rang) count++;
    if (currentFilters.dateRange !== 'all') count++;
    if (currentFilters.favorites) count++;
    return count;
  }, [currentFilters]);

  return {
    // State
    savedFilters,
    currentFilters,
    isLoading,
    
    // Actions
    updateFilters,
    resetFilters,
    saveCurrentFilter,
    loadFilter,
    deleteFilter,
    renameFilter,
    
    // Helpers
    getMatchingSavedFilter,
    hasActiveFilters,
    getActiveFilterCount,
    defaultFilters
  };
};
