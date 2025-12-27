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

interface OicCount {
  item_parent: string;
  rang: string;
  count: number;
}

// Cache global pour éviter les re-fetches
let cachedItems: EdnItemOptimized[] | null = null;
let cachedOicCounts: Map<string, { rangA: number; rangB: number }> | null = null;

export const useEdnItemsOptimized = () => {
  const [items, setItems] = useState<EdnItemOptimized[]>(cachedItems || []);
  const [oicCounts, setOicCounts] = useState<Map<string, { rangA: number; rangB: number }>>(
    cachedOicCounts || new Map()
  );
  const [loading, setLoading] = useState(!cachedItems);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si déjà en cache, pas besoin de refetch
    if (cachedItems && cachedOicCounts) {
      setItems(cachedItems);
      setOicCounts(cachedOicCounts);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch items et comptages OIC en parallèle
        const [itemsResponse, oicResponse] = await Promise.all([
          supabase
            .from('edn_items_immersive')
            .select('id,item_code,title,subtitle,slug,updated_at,paroles_musicales')
            .order('item_code'),
          supabase
            .from('backup_oic_competences')
            .select('item_parent,rang')
            .not('objectif_id', 'is', null)
        ]);

        if (itemsResponse.error) throw itemsResponse.error;
        if (oicResponse.error) throw oicResponse.error;

        // Calculer les comptages OIC
        const countsMap = new Map<string, { rangA: number; rangB: number }>();
        (oicResponse.data || []).forEach((row: { item_parent: string; rang: string }) => {
          const itemNum = row.item_parent;
          const existing = countsMap.get(itemNum) || { rangA: 0, rangB: 0 };
          if (row.rang === 'A') existing.rangA++;
          else if (row.rang === 'B') existing.rangB++;
          countsMap.set(itemNum, existing);
        });

        // Enrichir les items avec les comptages réels
        const enrichedItems = (itemsResponse.data || []).map((item: any) => {
          const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
          const counts = countsMap.get(itemNumber) || { rangA: 0, rangB: 0 };
          return {
            ...item,
            competences_count_rang_a: counts.rangA,
            competences_count_rang_b: counts.rangB,
          };
        });

        // Mettre en cache
        cachedItems = enrichedItems;
        cachedOicCounts = countsMap;

        setItems(enrichedItems);
        setOicCounts(countsMap);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur chargement EDN optimisé:', err);
        setError(err.message || 'Erreur de chargement');
        setLoading(false);
      }
    };

    fetchData();
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
    
    // Score moyen basé sur les données réelles
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
    cachedOicCounts = null;
    setLoading(true);
    setError(null);
    // Re-trigger useEffect
    window.location.reload();
  };

  return { items, oicCounts, stats, loading, error, refresh };
};

// Fonction pour invalider le cache (utile après génération de contenu)
export const invalidateEdnCache = () => {
  cachedItems = null;
  cachedOicCounts = null;
};
