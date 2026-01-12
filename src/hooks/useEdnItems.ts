import { useState, useEffect, useRef } from 'react';
import { appendEdnCacheParams, getEdnCacheBuster, pickCacheDiagnostics, subscribeEdnCacheBuster } from '@/utils/ednCache';

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
const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

export const useEdnItems = () => {
  const [items, setItems] = useState<EdnItemBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [cacheBuster, setCacheBuster] = useState(getEdnCacheBuster);
  
  // Ref pour éviter les appels multiples en parallèle
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastSignatureRef = useRef<string | null>(null);

  const fetchPage = async (
    pageNum: number,
    append: boolean = false,
    forceRefresh: boolean = false
  ) => {
    // Éviter les appels multiples
    if (fetchingRef.current) {
      console.log('⏳ useEdnItems - Fetch already in progress, skipping');
      return;
    }
    
    fetchingRef.current = true;
    const start = pageNum * ITEMS_PER_PAGE;
    
    console.log('🔄 useEdnItems - Fetching page:', pageNum, 'range:', start, '-', start + ITEMS_PER_PAGE - 1);
    
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      }
      
      // Utiliser fetch directement au lieu du SDK Supabase
      const baseUrl = `${SUPABASE_URL}/rest/v1/edn_items_immersive?select=id,item_code,title,subtitle,slug,updated_at,paroles_musicales,competences_count_rang_a,competences_count_rang_b&order=item_code&offset=${start}&limit=${ITEMS_PER_PAGE}`;
      const url = appendEdnCacheParams(baseUrl, cacheBuster, forceRefresh);
      
      console.log('📤 useEdnItems - Sending fetch request');
      
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact',
          ...(forceRefresh ? { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } : {})
        },
        cache: forceRefresh ? 'no-store' : 'default'
      });
      
      console.log('📥 useEdnItems - Response status:', response.status);
      
      if (!mountedRef.current) {
        console.log('⚠️ useEdnItems - Component unmounted');
        fetchingRef.current = false;
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const contentRange = response.headers.get('content-range');
      const total = contentRange ? parseInt(contentRange.split('/')[1]) : data.length;

      console.log('✅ useEdnItems - Received:', data.length, 'items, total:', total);
      console.log('🧾 useEdnItems - Cache headers:', pickCacheDiagnostics(response.headers));
      
      const fetchedItems = data || [];
      
      if (append) {
        setItems(prev => [...prev, ...fetchedItems]);
      } else {
        setItems(fetchedItems);
      }

      const latestUpdatedAt = fetchedItems.reduce<string>(
        (latest, item) => (item.updated_at && item.updated_at > latest ? item.updated_at : latest),
        ''
      );
      const signature = `${fetchedItems.length}-${latestUpdatedAt}-${total}`;
      if (lastSignatureRef.current && lastSignatureRef.current !== signature) {
        console.log('🔁 useEdnItems - Response diff detected', {
          previous: lastSignatureRef.current,
          current: signature
        });
      }
      lastSignatureRef.current = signature;
      
      setTotalCount(total);
      setHasMore(fetchedItems.length === ITEMS_PER_PAGE && total > start + fetchedItems.length);
      setPage(pageNum);
      setLoading(false);
      fetchingRef.current = false;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      console.error('❌ useEdnItems - Error:', err);
      fetchingRef.current = false;
      if (!mountedRef.current) return;
      setError(errorMessage);
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading && !fetchingRef.current) {
      fetchPage(page + 1, true);
    }
  };

  const refresh = () => {
    fetchingRef.current = false;
    setPage(0);
    fetchPage(0, false, true);
  };

  // Initial fetch
  useEffect(() => {
    console.log('🚀 useEdnItems - Initial mount');
    mountedRef.current = true;
    const unsubscribe = subscribeEdnCacheBuster((value) => {
      setCacheBuster(value);
    });
    fetchPage(0, false);
    
    return () => {
      console.log('🔚 useEdnItems - Unmounting');
      mountedRef.current = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cacheBuster !== '0') {
      fetchPage(0, false, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheBuster]);

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
