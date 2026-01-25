import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type RangType = 'A' | 'B';

export interface TableauItem {
  id: string;
  itemCode: string;
  title: string;
  rang: RangType;
  numero?: number;
  category?: string;
}

export interface TableauFilter {
  search?: string;
  category?: string;
  completed?: boolean;
  favorite?: boolean;
  hasMusic?: boolean;
}

export interface TableauSortOption {
  field: 'numero' | 'title' | 'category' | 'progress';
  direction: 'asc' | 'desc';
}

export interface UseTableauNavigationProps {
  initialRang?: RangType;
  items?: TableauItem[];
  persistToUrl?: boolean;
  onRangChange?: (rang: RangType) => void;
  onItemSelect?: (item: TableauItem) => void;
  onFilterChange?: (filter: TableauFilter) => void;
}

export interface UseTableauNavigationReturn {
  // État du rang
  activeRang: RangType;
  switchToRang: (rang: RangType) => void;
  toggleRang: () => void;
  isRangA: boolean;
  isRangB: boolean;

  // Navigation entre items
  currentIndex: number;
  currentItem: TableauItem | null;
  goToItem: (index: number) => void;
  goToItemByCode: (itemCode: string) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToFirst: () => void;
  goToLast: () => void;
  hasNext: boolean;
  hasPrevious: boolean;

  // Filtrage
  filter: TableauFilter;
  setFilter: (filter: TableauFilter) => void;
  updateFilter: (partial: Partial<TableauFilter>) => void;
  clearFilter: () => void;
  filteredItems: TableauItem[];

  // Tri
  sort: TableauSortOption;
  setSort: (sort: TableauSortOption) => void;
  toggleSortDirection: () => void;
  sortedItems: TableauItem[];

  // Items par rang
  itemsRangA: TableauItem[];
  itemsRangB: TableauItem[];
  currentRangItems: TableauItem[];

  // Stats
  totalItems: number;
  itemsCountRangA: number;
  itemsCountRangB: number;
  filteredCount: number;

  // Navigation clavier
  handleKeyNavigation: (event: React.KeyboardEvent) => void;

  // URL state
  getShareableUrl: () => string;
  loadFromUrl: () => void;
}

export const useTableauNavigation = ({
  initialRang = 'A',
  items = [],
  persistToUrl = false,
  onRangChange,
  onItemSelect,
  onFilterChange
}: UseTableauNavigationProps = {}): UseTableauNavigationReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  // État du rang
  const [activeRang, setActiveRang] = useState<RangType>(() => {
    if (persistToUrl) {
      const urlRang = searchParams.get('rang') as RangType;
      if (urlRang === 'A' || urlRang === 'B') return urlRang;
    }
    return initialRang;
  });

  // Index courant
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (persistToUrl) {
      const urlIndex = searchParams.get('index');
      if (urlIndex) return parseInt(urlIndex, 10);
    }
    return 0;
  });

  // Filtre
  const [filter, setFilterState] = useState<TableauFilter>(() => {
    if (persistToUrl) {
      return {
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        completed: searchParams.get('completed') === 'true' ? true : undefined,
        favorite: searchParams.get('favorite') === 'true' ? true : undefined,
        hasMusic: searchParams.get('hasMusic') === 'true' ? true : undefined
      };
    }
    return {};
  });

  // Tri
  const [sort, setSort] = useState<TableauSortOption>({
    field: 'numero',
    direction: 'asc'
  });

  // Items par rang
  const itemsRangA = useMemo(() => items.filter(item => item.rang === 'A'), [items]);
  const itemsRangB = useMemo(() => items.filter(item => item.rang === 'B'), [items]);
  const currentRangItems = useMemo(
    () => activeRang === 'A' ? itemsRangA : itemsRangB,
    [activeRang, itemsRangA, itemsRangB]
  );

  // Filtrage
  const filteredItems = useMemo(() => {
    let result = [...currentRangItems];

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.itemCode.toLowerCase().includes(searchLower)
      );
    }

    if (filter.category) {
      result = result.filter(item => item.category === filter.category);
    }

    return result;
  }, [currentRangItems, filter]);

  // Tri
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'numero':
          comparison = (a.numero || 0) - (b.numero || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        default:
          comparison = 0;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredItems, sort]);

  // Item courant
  const currentItem = useMemo(
    () => sortedItems[currentIndex] || null,
    [sortedItems, currentIndex]
  );

  // Navigation states
  const hasNext = currentIndex < sortedItems.length - 1;
  const hasPrevious = currentIndex > 0;

  // Synchroniser avec URL
  useEffect(() => {
    if (!persistToUrl) return;

    const params = new URLSearchParams();
    params.set('rang', activeRang);
    if (currentIndex > 0) params.set('index', currentIndex.toString());
    if (filter.search) params.set('search', filter.search);
    if (filter.category) params.set('category', filter.category);

    setSearchParams(params, { replace: true });
  }, [persistToUrl, activeRang, currentIndex, filter, setSearchParams]);

  // Actions
  const switchToRang = useCallback((rang: RangType) => {
    setActiveRang(rang);
    setCurrentIndex(0);
    onRangChange?.(rang);
  }, [onRangChange]);

  const toggleRang = useCallback(() => {
    const newRang = activeRang === 'A' ? 'B' : 'A';
    switchToRang(newRang);
  }, [activeRang, switchToRang]);

  const goToItem = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, sortedItems.length - 1));
    setCurrentIndex(clampedIndex);
    const item = sortedItems[clampedIndex];
    if (item) onItemSelect?.(item);
  }, [sortedItems, onItemSelect]);

  const goToItemByCode = useCallback((itemCode: string) => {
    const index = sortedItems.findIndex(item => item.itemCode === itemCode);
    if (index !== -1) {
      goToItem(index);
    }
  }, [sortedItems, goToItem]);

  const goToNext = useCallback(() => {
    if (hasNext) goToItem(currentIndex + 1);
  }, [hasNext, currentIndex, goToItem]);

  const goToPrevious = useCallback(() => {
    if (hasPrevious) goToItem(currentIndex - 1);
  }, [hasPrevious, currentIndex, goToItem]);

  const goToFirst = useCallback(() => {
    goToItem(0);
  }, [goToItem]);

  const goToLast = useCallback(() => {
    goToItem(sortedItems.length - 1);
  }, [sortedItems.length, goToItem]);

  // Gestion des filtres
  const setFilter = useCallback((newFilter: TableauFilter) => {
    setFilterState(newFilter);
    setCurrentIndex(0);
    onFilterChange?.(newFilter);
  }, [onFilterChange]);

  const updateFilter = useCallback((partial: Partial<TableauFilter>) => {
    setFilterState(prev => {
      const updated = { ...prev, ...partial };
      onFilterChange?.(updated);
      return updated;
    });
    setCurrentIndex(0);
  }, [onFilterChange]);

  const clearFilter = useCallback(() => {
    setFilter({});
  }, [setFilter]);

  // Gestion du tri
  const toggleSortDirection = useCallback(() => {
    setSort(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Navigation clavier
  const handleKeyNavigation = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        goToNext();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        goToPrevious();
        break;
      case 'Home':
        event.preventDefault();
        goToFirst();
        break;
      case 'End':
        event.preventDefault();
        goToLast();
        break;
      case 'Tab':
        if (event.shiftKey) {
          // Shift+Tab pour changer de rang
          event.preventDefault();
          toggleRang();
        }
        break;
    }
  }, [goToNext, goToPrevious, goToFirst, goToLast, toggleRang]);

  // URL partageable
  const getShareableUrl = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('rang', activeRang);
    if (currentItem) {
      url.searchParams.set('item', currentItem.itemCode);
    }
    return url.toString();
  }, [activeRang, currentItem]);

  const loadFromUrl = useCallback(() => {
    const urlRang = searchParams.get('rang') as RangType;
    const urlItem = searchParams.get('item');

    if (urlRang === 'A' || urlRang === 'B') {
      setActiveRang(urlRang);
    }

    if (urlItem) {
      setTimeout(() => goToItemByCode(urlItem), 0);
    }
  }, [searchParams, goToItemByCode]);

  return {
    // État du rang
    activeRang,
    switchToRang,
    toggleRang,
    isRangA: activeRang === 'A',
    isRangB: activeRang === 'B',

    // Navigation
    currentIndex,
    currentItem,
    goToItem,
    goToItemByCode,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    hasNext,
    hasPrevious,

    // Filtrage
    filter,
    setFilter,
    updateFilter,
    clearFilter,
    filteredItems,

    // Tri
    sort,
    setSort,
    toggleSortDirection,
    sortedItems,

    // Items par rang
    itemsRangA,
    itemsRangB,
    currentRangItems,

    // Stats
    totalItems: items.length,
    itemsCountRangA: itemsRangA.length,
    itemsCountRangB: itemsRangB.length,
    filteredCount: filteredItems.length,

    // Navigation clavier
    handleKeyNavigation,

    // URL state
    getShareableUrl,
    loadFromUrl
  };
};

export default useTableauNavigation;
