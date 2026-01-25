import { SUPABASE_URL, getSupabaseHeaders } from '@/lib/supabaseConstants';
import { appendEdnCacheParams, bumpEdnCacheBuster, getEdnCacheBuster, subscribeEdnCacheBuster } from '@/utils/ednCache';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface EdnItem {
  item_code: string;
  title: string;
  subtitle?: string;
  category: string;
  has_music: boolean;
  has_lyrics: boolean;
  competences_count: number;
}

interface EdnItemsStats {
  total: number;
  withMusic: number;
  withLyrics: number;
  byCategory: Record<string, number>;
}

// Cache simple en mémoire
let cachedItems: EdnItem[] | null = null;
let cachedStats: EdnItemsStats | null = null;

export const useAllEdnItems = () => {
  const [items, setItems] = useState<EdnItem[]>(cachedItems || []);
  const [stats, setStats] = useState<EdnItemsStats>(cachedStats || { total: 0, withMusic: 0, withLyrics: 0, byCategory: {} });
  const [loading, setLoading] = useState(!cachedItems);
  const [error, setError] = useState<string | null>(null);
  const [cacheBuster, setCacheBuster] = useState(getEdnCacheBuster);
  const lastCacheBusterRef = useRef(cacheBuster);

  useEffect(() => {
    if (cacheBuster !== lastCacheBusterRef.current) {
      cachedItems = null;
      cachedStats = null;
      lastCacheBusterRef.current = cacheBuster;
    }

    // Si on a des données en cache, ne pas refetch
    if (cachedItems && cachedItems.length > 0) {
      setItems(cachedItems);
      setStats(cachedStats!);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const unsubscribe = subscribeEdnCacheBuster((value) => {
      setCacheBuster(value);
    });

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // Utiliser fetch direct pour éviter les conflits avec d'autres hooks Supabase
        const baseUrl = `${SUPABASE_URL}/rest/v1/edn_items_immersive?select=item_code,title,subtitle,paroles_musicales&order=item_code`;
        const url = appendEdnCacheParams(baseUrl, cacheBuster, true);
        const response = await fetch(url, {
          headers: getSupabaseHeaders(true),
          cache: 'no-store'
        });

        if (!isMounted) return;

        if (!response.ok) {
          console.error('HTTP error:', response.status);
          setError('Erreur lors du chargement');
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (!isMounted) return;

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
            byCategory: { EDN: mappedItems.length }
          };

          // Mettre en cache
          cachedItems = mappedItems;
          cachedStats = statsData;

          setItems(mappedItems);
          setStats(statsData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        if (isMounted) {
          setError('Erreur lors du chargement');
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [cacheBuster]);

  const getItemByCode = useCallback((code: string) => {
    return items.find(item => item.item_code === code);
  }, [items]);

  const searchItems = useCallback((query: string) => {
    if (!query.trim()) return items;
    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
      item.item_code.toLowerCase().includes(lowerQuery) ||
      item.title.toLowerCase().includes(lowerQuery) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(lowerQuery))
    );
  }, [items]);

  const getItemsByCategory = useCallback((category: string) => {
    return items.filter(item => item.category === category);
  }, [items]);

  const itemsWithLyrics = useMemo(() => items.filter(i => i.has_lyrics), [items]);

  const refreshItems = useCallback(() => {
    cachedItems = null;
    cachedStats = null;
    bumpEdnCacheBuster('manual-refresh');
  }, []);

  return {
    items,
    stats,
    loading,
    error,
    getItemByCode,
    searchItems,
    getItemsByCategory,
    itemsWithLyrics,
    refreshItems
  };
};
