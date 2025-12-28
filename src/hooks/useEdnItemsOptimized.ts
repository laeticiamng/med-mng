// @refresh reset
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EdnItemOptimized {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  updated_at: string;
  paroles_musicales?: string[];
  competences_count_rang_a?: number;
  competences_count_rang_b?: number;
  specialite?: string;
  mots_cles?: string[];
}

export const useEdnItemsOptimized = () => {
  const [items, setItems] = useState<EdnItemOptimized[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const hasFetchedRef = useRef(false);

  const fetchItems = useCallback(async () => {
    // Prevent double fetch in StrictMode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('[EDN] Fetching items...');
      
      const { data, error: fetchError } = await supabase
        .from('edn_items_immersive')
        .select('id,item_code,title,subtitle,slug,updated_at,paroles_musicales')
        .order('item_code');
      
      if (!mountedRef.current) return;
      
      if (fetchError) {
        console.error('[EDN] Fetch error:', fetchError);
        throw new Error(fetchError.message);
      }
      
      if (!data || data.length === 0) {
        console.warn('[EDN] No data returned');
        throw new Error('Aucun item EDN trouvé');
      }
      
      console.log('[EDN] Fetched', data.length, 'items');
      
      const mappedItems: EdnItemOptimized[] = data.map((item) => ({
        id: item.id,
        item_code: item.item_code,
        title: item.title,
        subtitle: item.subtitle || undefined,
        slug: item.slug,
        updated_at: item.updated_at,
        paroles_musicales: item.paroles_musicales || undefined,
        competences_count_rang_a: 0,
        competences_count_rang_b: 0,
      }));
      
      setItems(mappedItems);
      setLoading(false);
      
      // Async OIC enrichment (background, non-blocking)
      enrichWithOic(mappedItems);
      
    } catch (err) {
      console.error('[EDN] Error:', err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setLoading(false);
      }
    }
  }, []);

  const enrichWithOic = async (currentItems: EdnItemOptimized[]) => {
    try {
      const { data: oicData } = await supabase
        .from('backup_oic_competences')
        .select('item_parent,rang')
        .not('objectif_id', 'is', null);

      if (!oicData || !mountedRef.current) return;

      const countsMap = new Map<string, { rangA: number; rangB: number }>();
      oicData.forEach((row) => {
        const key = row.item_parent || '';
        const existing = countsMap.get(key) || { rangA: 0, rangB: 0 };
        if (row.rang === 'A') existing.rangA++;
        else if (row.rang === 'B') existing.rangB++;
        countsMap.set(key, existing);
      });

      const enrichedItems = currentItems.map((item) => {
        const itemNumber = item.item_code.replace('IC-', '');
        const paddedNumber = itemNumber.padStart(3, '0');
        
        const counts = countsMap.get(paddedNumber) 
          || countsMap.get(itemNumber) 
          || countsMap.get(item.item_code)
          || { rangA: 0, rangB: 0 };
        
        return {
          ...item,
          competences_count_rang_a: counts.rangA,
          competences_count_rang_b: counts.rangB,
        };
      });

      if (mountedRef.current) {
        setItems(enrichedItems);
      }
    } catch (err) {
      console.warn('[EDN] OIC enrichment failed:', err);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    hasFetchedRef.current = false;
    
    fetchItems();
    
    return () => { 
      mountedRef.current = false;
    };
  }, [fetchItems]);

  const refresh = useCallback(() => {
    hasFetchedRef.current = false;
    fetchItems();
  }, [fetchItems]);

  const stats = useMemo(() => {
    const total = items.length;
    const withRangA = items.filter(i => (i.competences_count_rang_a || 0) > 0).length;
    const withRangB = items.filter(i => (i.competences_count_rang_b || 0) > 0).length;
    const complete = items.filter(i => 
      (i.competences_count_rang_a || 0) > 0 && (i.competences_count_rang_b || 0) > 0
    ).length;
    const withMusic = items.filter(i => 
      i.paroles_musicales && i.paroles_musicales.length > 0
    ).length;
    
    const avgScore = total > 0 ? Math.round(
      items.reduce((sum, item) => {
        let score = 0;
        if ((item.competences_count_rang_a || 0) > 0) score += 35;
        if ((item.competences_count_rang_b || 0) > 0) score += 35;
        if (item.paroles_musicales && item.paroles_musicales.length > 0) score += 30;
        return sum + score;
      }, 0) / total
    ) : 0;

    return { total, withRangA, withRangB, complete, withMusic, avgScore };
  }, [items]);

  return { items, stats, loading, error, refresh };
};

export const invalidateEdnCache = () => {
  // No-op for compatibility - cache removed for reliability
};
