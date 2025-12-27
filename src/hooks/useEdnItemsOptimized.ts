// @refresh reset
import { useState, useEffect, useMemo } from 'react';
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

// Module-level cache to prevent refetching
let cachedItems: EdnItemOptimized[] | null = null;
let fetchPromise: Promise<EdnItemOptimized[]> | null = null;

async function fetchEdnItems(): Promise<EdnItemOptimized[]> {
  // Return cached items if available
  if (cachedItems) {
    return cachedItems;
  }
  
  // Return existing promise if fetch is in progress
  if (fetchPromise) {
    return fetchPromise;
  }
  
  console.log('[EDN] Fetching items from Supabase...');
  
  fetchPromise = (async () => {
    const { data, error } = await supabase
      .from('edn_items_immersive')
      .select('id,item_code,title,subtitle,slug,updated_at,paroles_musicales')
      .order('item_code');
    
    console.log('[EDN] Fetch complete:', { count: data?.length, error: error?.message });
    
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('Aucun item EDN trouvé');
    
    const items: EdnItemOptimized[] = data.map((item) => ({
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
    
    cachedItems = items;
    fetchPromise = null;
    
    // Background OIC enrichment
    enrichWithOic();
    
    return items;
  })();
  
  return fetchPromise;
}

async function enrichWithOic() {
  if (!cachedItems) return;
  
  try {
    const { data: oicData } = await supabase
      .from('backup_oic_competences')
      .select('item_parent,rang')
      .not('objectif_id', 'is', null);

    if (!oicData || !cachedItems) return;

    const countsMap = new Map<string, { rangA: number; rangB: number }>();
    oicData.forEach((row) => {
      const key = row.item_parent || '';
      const existing = countsMap.get(key) || { rangA: 0, rangB: 0 };
      if (row.rang === 'A') existing.rangA++;
      else if (row.rang === 'B') existing.rangB++;
      countsMap.set(key, existing);
    });

    cachedItems = cachedItems.map((item) => {
      const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
      const counts = countsMap.get(itemNumber) || { rangA: 0, rangB: 0 };
      return {
        ...item,
        competences_count_rang_a: counts.rangA,
        competences_count_rang_b: counts.rangB,
      };
    });
  } catch (err) {
    console.warn('[EDN] OIC enrichment failed:', err);
  }
}

export const useEdnItemsOptimized = () => {
  const [items, setItems] = useState<EdnItemOptimized[]>(cachedItems || []);
  const [loading, setLoading] = useState(!cachedItems);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    if (cachedItems) {
      setItems(cachedItems);
      setLoading(false);
      return;
    }
    
    fetchEdnItems()
      .then((data) => {
        if (mounted) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Re-sync with cache periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (cachedItems && cachedItems !== items) {
        setItems(cachedItems);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [items]);

  const refresh = () => {
    cachedItems = null;
    fetchPromise = null;
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

export const invalidateEdnCache = () => {
  cachedItems = null;
  fetchPromise = null;
};
