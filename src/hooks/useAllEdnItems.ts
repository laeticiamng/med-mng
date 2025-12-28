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

export const useAllEdnItems = () => {
  const [items, setItems] = useState<EdnItem[]>([]);
  const [stats, setStats] = useState<EdnItemsStats>({ total: 0, withMusic: 0, withLyrics: 0, byCategory: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('edn_items_immersive')
          .select('item_code, title, subtitle, paroles_musicales')
          .order('item_code');

        if (!isMounted) return;

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
