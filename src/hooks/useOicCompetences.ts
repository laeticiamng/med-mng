import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    console.log(`🗑️ OIC Cache invalidated: ${cacheKey}`);
  } else if (itemCode) {
    competencesCache.delete(`${itemCode}-A`);
    competencesCache.delete(`${itemCode}-B`);
    console.log(`🗑️ OIC Cache invalidated: ${itemCode} (both rangs)`);
  } else {
    competencesCache.clear();
    console.log(`🗑️ OIC Cache fully cleared`);
  }
}

export function useOicCompetences(itemCode: string, rang: 'A' | 'B') {
  const [competences, setCompetences] = useState<OicCompetence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetences = useCallback(async (code: string, r: 'A' | 'B'): Promise<{ data: OicCompetence[] | null; error: string | null }> => {
    const cacheKey = `${code}-${r}`;
    
    // Check cache first
    const cached = competencesCache.get(cacheKey);
    if (cached && cached.length > 0) {
      console.log(`✅ OIC Cache hit: ${cacheKey} = ${cached.length} compétences`);
      return { data: cached, error: null };
    }

    // Extract item number (IC-1 -> 001, IC-10 -> 010)
    const itemNumber = code.replace('IC-', '').padStart(3, '0');
    console.log(`🔍 OIC Fetching: item_parent=${itemNumber}, rang=${r}`);

    try {
      const { data, error: queryError } = await supabase
        .from('backup_oic_competences')
        .select('objectif_id, intitule, description, rubrique, rang, item_parent')
        .eq('item_parent', itemNumber)
        .eq('rang', r)
        .order('objectif_id');

      if (queryError) {
        console.error('❌ OIC Error:', queryError);
        return { data: null, error: queryError.message };
      }

      console.log(`📊 OIC Result: ${data?.length || 0} compétences for ${code} rang ${r}`, data?.slice(0, 2));

      const realCompetences = (data || [])
        .filter((comp): comp is typeof comp & { objectif_id: string; intitule: string } => 
          Boolean(comp.objectif_id && comp.intitule)
        )
        .map(comp => ({
          ...comp,
          description: comp.description || comp.intitule
        })) as OicCompetence[];

      // Cache only if we have results
      if (realCompetences.length > 0) {
        competencesCache.set(cacheKey, realCompetences);
        console.log(`💾 OIC Cached: ${cacheKey} = ${realCompetences.length} compétences`);
      }

      return { data: realCompetences, error: null };
    } catch (err) {
      console.error('❌ OIC Fetch exception:', err);
      return { data: null, error: String(err) };
    }
  }, []);

  useEffect(() => {
    // Skip if no itemCode or invalid format
    if (!itemCode || !itemCode.startsWith('IC-')) {
      setCompetences([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    
    setLoading(true);
    setError(null);

    fetchCompetences(itemCode, rang).then(result => {
      if (cancelled) return;
      
      if (result.error) {
        setError(result.error);
        setCompetences([]);
      } else {
        setCompetences(result.data || []);
        setError(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [itemCode, rang, fetchCompetences]);

  // Manual refetch function
  const refetch = useCallback(() => {
    if (itemCode && itemCode.startsWith('IC-')) {
      invalidateOicCache(itemCode, rang);
      setLoading(true);
      fetchCompetences(itemCode, rang).then(result => {
        if (result.error) {
          setError(result.error);
          setCompetences([]);
        } else {
          setCompetences(result.data || []);
          setError(null);
        }
        setLoading(false);
      });
    }
  }, [itemCode, rang, fetchCompetences]);

  return { competences, loading, error, refetch };
}
