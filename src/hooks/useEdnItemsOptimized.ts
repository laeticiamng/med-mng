// @refresh reset
import { useState, useEffect, useMemo, useCallback } from 'react';
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

  const fetchItems = useCallback(async () => {
    console.log('[EDN] Starting fetch...');
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('edn_items_immersive')
        .select('id,item_code,title,subtitle,slug,updated_at,paroles_musicales')
        .order('item_code');

      console.log('[EDN] Fetch result:', { count: data?.length, error: fetchError });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        throw new Error('Aucun item EDN trouvé');
      }

      const enrichedItems: EdnItemOptimized[] = data.map((item: any) => ({
        ...item,
        competences_count_rang_a: 0,
        competences_count_rang_b: 0,
      }));

      setItems(enrichedItems);
      setLoading(false);

      // Background enrichment with OIC
      try {
        const { data: oicData } = await supabase
          .from('backup_oic_competences')
          .select('item_parent,rang')
          .not('objectif_id', 'is', null);

        if (oicData) {
          const countsMap = new Map<string, { rangA: number; rangB: number }>();
          oicData.forEach((row: { item_parent: string; rang: string }) => {
            const existing = countsMap.get(row.item_parent) || { rangA: 0, rangB: 0 };
            if (row.rang === 'A') existing.rangA++;
            else if (row.rang === 'B') existing.rangB++;
            countsMap.set(row.item_parent, existing);
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
        }
      } catch (oicErr) {
        console.warn('[EDN] OIC enrichment failed:', oicErr);
      }

    } catch (err: any) {
      console.error('[EDN] Error:', err);
      setError(err.message || 'Erreur de chargement');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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

  return { items, stats, loading, error, refresh: fetchItems };
};

export const invalidateEdnCache = () => {
  // No-op, cache removed for simplicity
};
