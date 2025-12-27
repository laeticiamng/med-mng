import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EdnItemBasic {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  updated_at: string;
  paroles_musicales?: string[];
  competences_count_rang_a?: number;
  competences_count_rang_b?: number;
}

const ITEMS_PER_PAGE = 50;

export const useEdnItems = () => {
  const [items, setItems] = useState<EdnItemBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPage = async (pageNum: number, append: boolean = false) => {
    const start = pageNum * ITEMS_PER_PAGE;
    
    console.log('🔄 useEdnItems - Fetching page:', pageNum, 'range:', start, '-', start + ITEMS_PER_PAGE - 1);
    
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      }
      
      const { data, error: fetchError, count } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, subtitle, slug, updated_at, paroles_musicales, competences_count_rang_a, competences_count_rang_b', { count: 'exact' })
        .range(start, start + ITEMS_PER_PAGE - 1)
        .order('item_code');
      
      console.log('📦 useEdnItems - Response:', { count: data?.length, error: fetchError?.message, total: count });
      
      if (fetchError) {
        throw fetchError;
      }
      
      const fetchedItems = data || [];
      
      if (append) {
        setItems(prev => [...prev, ...fetchedItems]);
      } else {
        setItems(fetchedItems);
      }
      
      setTotalCount(count || 0);
      setHasMore(fetchedItems.length === ITEMS_PER_PAGE && (count || 0) > start + fetchedItems.length);
      setPage(pageNum);
      setLoading(false);
      
    } catch (err: any) {
      console.error('❌ useEdnItems - Error:', err);
      setError(err.message || 'Erreur lors du chargement');
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPage(page + 1, true);
    }
  };

  const refresh = () => {
    setPage(0);
    fetchPage(0, false);
  };

  // Initial fetch
  useEffect(() => {
    console.log('🚀 useEdnItems - Initial mount');
    fetchPage(0, false);
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh
  };
};
