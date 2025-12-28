import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

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

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

// Cache global persistant
let globalCache: { items: EdnItem[]; stats: EdnItemsStats } | null = null;
let isFetching = false;

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

    // Éviter les fetch multiples
    if (isFetching) {
      const checkCache = setInterval(() => {
        if (globalCache && mountedRef.current) {
          setItems(globalCache.items);
          setStats(globalCache.stats);
          setLoading(false);
          clearInterval(checkCache);
        }
      }, 100);
      return () => clearInterval(checkCache);
    }

    isFetching = true;

    // Utiliser fetch directement sans AbortController
    const doFetch = async () => {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/edn_items_immersive?select=item_code,title,subtitle,paroles_musicales&order=item_code`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && Array.isArray(data)) {
          const mappedItems: EdnItem[] = data.map((d: any) => ({
            item_code: d.item_code,
            title: d.title,
            subtitle: d.subtitle || undefined,
            category: 'EDN',
            has_music: Boolean(d.paroles_musicales),
            has_lyrics: Boolean(d.paroles_musicales),
            competences_count: 0
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
        console.error('useAllEdnItems fetch error:', err);
        if (mountedRef.current) {
          setError('Erreur lors du chargement');
          setLoading(false);
        }
      } finally {
        isFetching = false;
      }
    };

    doFetch();

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
    isFetching = false;
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
