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

// Cache global
let cachedItems: EdnItemOptimized[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useEdnItemsOptimized = () => {
  const [items, setItems] = useState<EdnItemOptimized[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      // Vérifier le cache d'abord
      const now = Date.now();
      if (cachedItems && (now - cacheTimestamp) < CACHE_TTL) {
        console.log('[EDN] Utilisation du cache');
        setItems(cachedItems);
        setLoading(false);
        return;
      }

      console.log('[EDN] Début chargement...');
      setLoading(true);
      setError(null);

      try {
        // Requête simple - juste les items EDN
        const { data, error: fetchError } = await supabase
          .from('edn_items_immersive')
          .select('id,item_code,title,subtitle,slug,updated_at,paroles_musicales')
          .order('item_code');

        if (fetchError) {
          console.error('[EDN] Erreur Supabase:', fetchError);
          throw fetchError;
        }
        
        if (cancelled) return;

        console.log('[EDN] Données reçues:', data?.length || 0, 'items');

        if (!data || data.length === 0) {
          throw new Error('Aucun item EDN trouvé');
        }

        const enrichedItems: EdnItemOptimized[] = data.map((item: any) => ({
          ...item,
          competences_count_rang_a: 0,
          competences_count_rang_b: 0,
        }));

        // Mettre en cache
        cachedItems = enrichedItems;
        cacheTimestamp = Date.now();
        
        setItems(enrichedItems);
        setLoading(false);

        // Enrichir avec OIC en arrière-plan (non bloquant)
        fetchOicCounts(enrichedItems, cancelled);

      } catch (err: any) {
        if (cancelled) return;
        console.error('[EDN] Erreur:', err);
        setError(err.message || 'Erreur de chargement');
        setLoading(false);
      }
    };

    const fetchOicCounts = async (baseItems: EdnItemOptimized[], isCancelled: boolean) => {
      try {
        const { data: oicData } = await supabase
          .from('backup_oic_competences')
          .select('item_parent,rang')
          .not('objectif_id', 'is', null);

        if (isCancelled || !oicData) return;

        const countsMap = new Map<string, { rangA: number; rangB: number }>();
        oicData.forEach((row: { item_parent: string; rang: string }) => {
          const itemNum = row.item_parent;
          const existing = countsMap.get(itemNum) || { rangA: 0, rangB: 0 };
          if (row.rang === 'A') existing.rangA++;
          else if (row.rang === 'B') existing.rangB++;
          countsMap.set(itemNum, existing);
        });

        const enriched = baseItems.map((item) => {
          const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
          const counts = countsMap.get(itemNumber) || { rangA: 0, rangB: 0 };
          return {
            ...item,
            competences_count_rang_a: counts.rangA,
            competences_count_rang_b: counts.rangB,
          };
        });

        cachedItems = enriched;
        setItems(enriched);
        console.log('[EDN] OIC enrichi');
      } catch (err) {
        console.warn('[EDN] OIC enrichment failed:', err);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Statistiques calculées
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

  const refresh = () => {
    cachedItems = null;
    cacheTimestamp = 0;
    window.location.reload();
  };

  return { items, stats, loading, error, refresh };
};

// Invalider le cache
export const invalidateEdnCache = () => {
  cachedItems = null;
  cacheTimestamp = 0;
};
