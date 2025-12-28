import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EdnItem {
  item_code: string;
  title: string;
  subtitle?: string;
  category?: string;
  has_music?: boolean;
  has_lyrics?: boolean;
  competences_count?: number;
}

interface EdnItemsFilters {
  category?: string;
  hasMusic?: boolean;
  hasLyrics?: boolean;
  search?: string;
}

interface EdnItemsStats {
  total: number;
  withMusic: number;
  withLyrics: number;
  byCategory: Record<string, number>;
}

// Cache global pour éviter les re-fetch en StrictMode
let cachedItems: EdnItem[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAllEdnItems = () => {
  const [items, setItems] = useState<EdnItem[]>(cachedItems || []);
  const [loading, setLoading] = useState(!cachedItems);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EdnItemsFilters>({});
  const [stats, setStats] = useState<EdnItemsStats | null>(null);

  useEffect(() => {
    // Utiliser le cache si disponible et récent
    if (cachedItems && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setItems(cachedItems);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from('edn_items_immersive')
          .select('item_code, title, subtitle, paroles_musicales, competences_count_total')
          .order('item_code')
          .abortSignal(controller.signal);

        if (controller.signal.aborted) return;

        if (supabaseError) {
          setError('Erreur lors du chargement des items');
          setLoading(false);
          return;
        }

        if (data) {
          const mappedItems: EdnItem[] = data.map(d => ({
            item_code: d.item_code,
            title: d.title,
            subtitle: d.subtitle || undefined,
            category: 'EDN',
            has_music: Boolean(d.paroles_musicales),
            has_lyrics: Boolean(d.paroles_musicales),
            competences_count: d.competences_count_total || 0
          }));

          // Mettre en cache
          cachedItems = mappedItems;
          cacheTimestamp = Date.now();

          setItems(mappedItems);

          const statsData: EdnItemsStats = {
            total: mappedItems.length,
            withMusic: mappedItems.filter(i => i.has_music).length,
            withLyrics: mappedItems.filter(i => i.has_lyrics).length,
            byCategory: {}
          };

          mappedItems.forEach(item => {
            const cat = item.category || 'Non catégorisé';
            statsData.byCategory[cat] = (statsData.byCategory[cat] || 0) + 1;
          });

          setStats(statsData);
        }

        setLoading(false);
      } catch (err: any) {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        setError('Erreur lors du chargement');
        setLoading(false);
      }
    };

    fetchItems();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filters.category) {
      result = result.filter(i => i.category === filters.category);
    }

    if (filters.hasMusic !== undefined) {
      result = result.filter(i => i.has_music === filters.hasMusic);
    }

    if (filters.hasLyrics !== undefined) {
      result = result.filter(i => i.has_lyrics === filters.hasLyrics);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(i =>
        i.item_code.toLowerCase().includes(searchLower) ||
        i.title.toLowerCase().includes(searchLower) ||
        (i.subtitle?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    return result;
  }, [items, filters]);

  const getItemByCode = useCallback((code: string): EdnItem | undefined => {
    return items.find(i => i.item_code === code);
  }, [items]);

  const searchItems = useCallback((query: string): EdnItem[] => {
    const queryLower = query.toLowerCase();
    return items.filter(i =>
      i.item_code.toLowerCase().includes(queryLower) ||
      i.title.toLowerCase().includes(queryLower)
    ).slice(0, 20);
  }, [items]);

  const getCategories = useCallback((): string[] => {
    const categories = new Set(items.map(i => i.category || 'Non catégorisé'));
    return Array.from(categories).sort();
  }, [items]);

  const getRandomItems = useCallback((count: number = 5): EdnItem[] => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [items]);

  const refreshItems = useCallback(() => {
    // Invalider le cache et recharger
    cachedItems = null;
    cacheTimestamp = 0;
    window.location.reload();
  }, []);

  return {
    items,
    filteredItems,
    loading,
    error,
    filters,
    setFilters,
    stats,
    getItemByCode,
    searchItems,
    getCategories,
    getRandomItems,
    refreshItems
  };
};
