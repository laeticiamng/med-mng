import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  completeness_score?: number;
  competences_count_total?: number;
  paroles_musicales?: string[];
  created_at: string;
  updated_at: string;
}

interface UseOptimizedEdnItemsReturn {
  items: EdnItem[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (query: string) => void;
  searchQuery: string;
}

const ITEMS_PER_PAGE = 50;

export const useOptimizedEdnItems = (): UseOptimizedEdnItemsReturn => {
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [allLoaded, setAllLoaded] = useState(false);

  // Fonction optimisée de chargement
  const loadItems = useCallback(async (page: number = 0, reset: boolean = false, query: string = '') => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      }

      const startRange = page * ITEMS_PER_PAGE;
      const endRange = startRange + ITEMS_PER_PAGE - 1;

      let queryBuilder = supabase
        .from('edn_items_complete')
        .select('id, item_code, title, subtitle, completeness_score, competences_count_total, paroles_musicales, created_at, updated_at', { count: 'exact' })
        .eq('status', 'active')
        .order('item_code', { ascending: true })
        .range(startRange, endRange);

      // Recherche optimisée
      if (query.trim()) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,item_code.ilike.%${query}%`);
      }

      const { data, error: fetchError, count } = await queryBuilder;

      if (fetchError) {
        throw fetchError;
      }

      const newItems = data || [];
      
      if (reset || page === 0) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }

      setTotalCount(count || 0);
      setCurrentPage(page);
      setAllLoaded(newItems.length < ITEMS_PER_PAGE);

    } catch (err) {
      logger.dbError('loadItems', err, {
        component: 'useOptimizedEdnItems',
        metadata: { page, reset, query }
      });
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadItems(0, true, searchQuery);
  }, [loadItems, searchQuery]);

  // Fonctions publiques
  const loadMore = useCallback(async () => {
    if (!allLoaded && !loading) {
      await loadItems(currentPage + 1, false, searchQuery);
    }
  }, [allLoaded, loading, currentPage, searchQuery, loadItems]);

  const refresh = useCallback(async () => {
    await loadItems(0, true, searchQuery);
  }, [loadItems, searchQuery]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Valeurs calculées avec useMemo pour optimiser les re-renders
  const hasMore = useMemo(() => !allLoaded && items.length < totalCount, [allLoaded, items.length, totalCount]);

  return {
    items,
    loading,
    error,
    totalCount,
    hasMore,
    loadMore,
    refresh,
    search,
    searchQuery
  };
};