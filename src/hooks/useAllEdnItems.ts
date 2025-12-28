import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

// Cache global simple
let cachedData: { items: EdnItem[]; stats: EdnItemsStats } | null = null;

export const useAllEdnItems = () => {
  const [items, setItems] = useState<EdnItem[]>(cachedData?.items || []);
  const [stats, setStats] = useState<EdnItemsStats>(cachedData?.stats || { total: 0, withMusic: 0, withLyrics: 0, byCategory: {} });
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si on a déjà des données en cache, ne pas refetch
    if (cachedData) {
      setItems(cachedData.items);
      setStats(cachedData.stats);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchItems = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('edn_items_immersive')
          .select('item_code, title, subtitle, paroles_musicales')
          .order('item_code');

        if (cancelled) return;

        if (fetchError) {
          console.error('Supabase error:', fetchError);
          setError('Erreur lors du chargement');
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
            competences_count: 0
          }));

          const statsData: EdnItemsStats = {
            total: mappedItems.length,
            withMusic: mappedItems.filter(i => i.has_music).length,
            withLyrics: mappedItems.filter(i => i.has_lyrics).length,
            byCategory: { EDN: mappedItems.length }
          };

          // Mettre en cache
          cachedData = { items: mappedItems, stats: statsData };
          
          if (!cancelled) {
            setItems(mappedItems);
            setStats(statsData);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (!cancelled) {
          setError('Erreur lors du chargement');
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, []);

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
    cachedData = null;
    window.location.reload();
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
