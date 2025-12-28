import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

// Cache global persistant
let globalCache: { items: EdnItem[]; stats: EdnItemsStats } | null = null;
let fetchPromise: Promise<void> | null = null;

export const useAllEdnItems = () => {
  const [items, setItems] = useState<EdnItem[]>(globalCache?.items || []);
  const [loading, setLoading] = useState(!globalCache);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EdnItemsFilters>({});
  const [stats, setStats] = useState<EdnItemsStats | null>(globalCache?.stats || null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Si cache disponible, utiliser immédiatement
    if (globalCache) {
      setItems(globalCache.items);
      setStats(globalCache.stats);
      setLoading(false);
      return;
    }

    // Si un fetch est déjà en cours, attendre
    if (fetchPromise) {
      fetchPromise.then(() => {
        if (mountedRef.current && globalCache) {
          setItems(globalCache.items);
          setStats(globalCache.stats);
          setLoading(false);
        }
      });
      return;
    }

    // Lancer le fetch
    const doFetch = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('edn_items_immersive')
          .select('item_code, title, subtitle, paroles_musicales, competences_count_total')
          .order('item_code');

        if (supabaseError) {
          if (mountedRef.current) {
            setError('Erreur lors du chargement des items');
            setLoading(false);
          }
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

          const statsData: EdnItemsStats = {
            total: mappedItems.length,
            withMusic: mappedItems.filter(i => i.has_music).length,
            withLyrics: mappedItems.filter(i => i.has_lyrics).length,
            byCategory: { 'EDN': mappedItems.length }
          };

          // Stocker dans le cache global
          globalCache = { items: mappedItems, stats: statsData };

          if (mountedRef.current) {
            setItems(mappedItems);
            setStats(statsData);
            setLoading(false);
          }
        }
      } catch (err) {
        if (mountedRef.current) {
          setError('Erreur lors du chargement');
          setLoading(false);
        }
      }
    };

    fetchPromise = doFetch().finally(() => {
      fetchPromise = null;
    });

    return () => {
      mountedRef.current = false;
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
    // Invalider le cache global et recharger
    globalCache = null;
    fetchPromise = null;
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
