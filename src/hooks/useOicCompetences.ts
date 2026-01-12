import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOicItemParentCandidates } from '@/utils/oicItemParent';

export interface OicCompetence {
  objectif_id: string;
  intitule: string;
  description: string;
  rubrique: string;
  rang: string;
  item_parent: string;
  titre_complet?: string;
  sommaire?: string;
  mecanismes?: string;
  indications?: string;
  effets_indesirables?: string;
  interactions?: string;
  modalites_surveillance?: string;
  causes_echec?: string;
  contributeurs?: string;
  ordre_affichage?: number;
}

// Cache global pour éviter les re-fetches
const competencesCache = new Map<string, OicCompetence[]>();

// Function to invalidate cache
export function invalidateOicCache(itemCode?: string, rang?: 'A' | 'B') {
  if (itemCode && rang) {
    const cacheKey = `${itemCode}-${rang}`;
    competencesCache.delete(cacheKey);
  } else if (itemCode) {
    competencesCache.delete(`${itemCode}-A`);
    competencesCache.delete(`${itemCode}-B`);
  } else {
    competencesCache.clear();
  }
}

export function useOicCompetences(itemCode: string, rang: 'A' | 'B') {
  const [competences, setCompetences] = useState<OicCompetence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCountRef = useRef(0);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Skip if no itemCode or invalid format
    if (!itemCode || (!itemCode.startsWith('IC-') && !itemCode.startsWith('OIC-'))) {
      setCompetences([]);
      setLoading(false);
      setError(null);
      return;
    }

    const cacheKey = `${itemCode}-${rang}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && competencesCache.has(cacheKey)) {
      const cached = competencesCache.get(cacheKey)!;
      setCompetences(cached);
      setLoading(false);
      setError(null);
      return;
    }

    const itemParentCandidates = getOicItemParentCandidates(itemCode);
    if (itemParentCandidates.length === 0) {
      setCompetences([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const currentFetch = ++fetchCountRef.current;

    try {
      const { data, error: fetchError } = await supabase
        .from('oic_competences')
        .select('objectif_id, intitule, description, rang, item_parent')
        .in('item_parent', itemParentCandidates)
        .eq('rang', rang)
        .order('objectif_id');
      
      // Ignore if a newer fetch was triggered
      if (currentFetch !== fetchCountRef.current) return;
      
      if (fetchError) {
        console.warn(`[useOicCompetences] Error: ${fetchError.message}`);
        setError(fetchError.message);
        setCompetences([]);
        setLoading(false);
        return;
      }

      const realCompetences = (data || [])
        .filter((comp): comp is typeof comp & { objectif_id: string; intitule: string } => 
          Boolean(comp.objectif_id && comp.intitule)
        )
        .map(comp => ({
          objectif_id: comp.objectif_id,
          intitule: comp.intitule,
          description: comp.description || comp.intitule,
          rubrique: '',
          rang: comp.rang || rang,
          item_parent: comp.item_parent || itemParentCandidates[0]
        })) as OicCompetence[];

      // Cache results
      competencesCache.set(cacheKey, realCompetences);
      setCompetences(realCompetences);
      setError(null);
      setLoading(false);
    } catch (err) {
      if (currentFetch !== fetchCountRef.current) return;
      console.warn(`[useOicCompetences] Exception:`, err);
      setError(String(err));
      setCompetences([]);
      setLoading(false);
    }
  }, [itemCode, rang]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Manual refetch function
  const refetch = useCallback(() => {
    invalidateOicCache(itemCode, rang);
    fetchData(true);
  }, [itemCode, rang, fetchData]);

  return { competences, loading, error, refetch };
}
