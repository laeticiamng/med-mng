// @refresh reset
import { useState, useEffect, useMemo, useRef } from 'react';
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
  const fetchedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Already fetched - don't fetch again
    if (fetchedRef.current) {
      return;
    }
    
    fetchedRef.current = true;
    
    console.log('[EDN] Starting fetch...');
    
    supabase
      .from('edn_items_immersive')
      .select('id,item_code,title,subtitle,slug,updated_at,paroles_musicales')
      .order('item_code')
      .then(({ data, error: fetchError }) => {
        if (!isMountedRef.current) return;
        
        console.log('[EDN] Got response:', { count: data?.length, error: fetchError?.message });

        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setError('Aucun item EDN trouvé');
          setLoading(false);
          return;
        }

        const enrichedItems: EdnItemOptimized[] = data.map((item) => ({
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

        setItems(enrichedItems);
        setLoading(false);

        // Background OIC enrichment
        supabase
          .from('backup_oic_competences')
          .select('item_parent,rang')
          .not('objectif_id', 'is', null)
          .then(({ data: oicData }) => {
            if (!isMountedRef.current || !oicData) return;

            const countsMap = new Map<string, { rangA: number; rangB: number }>();
            oicData.forEach((row) => {
              const key = row.item_parent || '';
              const existing = countsMap.get(key) || { rangA: 0, rangB: 0 };
              if (row.rang === 'A') existing.rangA++;
              else if (row.rang === 'B') existing.rangB++;
              countsMap.set(key, existing);
            });

            setItems(prev => prev.map((item) => {
              const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
              const counts = countsMap.get(itemNumber) || { rangA: 0, rangB: 0 };
              return {
                ...item,
                competences_count_rang_a: counts.rangA,
                competences_count_rang_b: counts.rangB,
              };
            }));
          });
      });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = () => {
    fetchedRef.current = false;
    setLoading(true);
    setError(null);
    setItems([]);
    // Re-run by forcing component remount
    window.location.reload();
  };

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

export const invalidateEdnCache = () => {};
