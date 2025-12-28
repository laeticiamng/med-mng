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

  useEffect(() => {
    let cancelled = false;

    // Skip if no itemCode or invalid format
    if (!itemCode || !itemCode.startsWith('IC-')) {
      setCompetences([]);
      setLoading(false);
      setError(null);
      return;
    }

    const cacheKey = `${itemCode}-${rang}`;
    
    // Check cache first
    const cached = competencesCache.get(cacheKey);
    if (cached && cached.length > 0) {
      console.log(`✅ OIC Cache hit: ${cacheKey} = ${cached.length} compétences`);
      setCompetences(cached);
      setLoading(false);
      setError(null);
      return;
    }

    // Extract item number (IC-1 -> 001, IC-10 -> 010)
    const itemNumber = itemCode.replace('IC-', '').padStart(3, '0');
    
    setLoading(true);
    setError(null);

    // Fetch with explicit promise handling
    const doFetch = async () => {
      console.log(`🔍 OIC Fetching: item_parent=${itemNumber}, rang=${rang}`);
      
      try {
        const result = await supabase
          .from('backup_oic_competences')
          .select('objectif_id, intitule, description, rubrique, rang, item_parent')
          .eq('item_parent', itemNumber)
          .eq('rang', rang)
          .order('objectif_id');
        
        if (cancelled) return;
        
        console.log(`🔄 OIC Query result:`, { 
          hasError: !!result.error, 
          dataLength: result.data?.length,
          error: result.error
        });
        
        if (result.error) {
          setError(result.error.message);
          setCompetences([]);
          setLoading(false);
          return;
        }

        const data = result.data || [];
        console.log(`📊 OIC Result: ${data.length} compétences for ${itemCode} rang ${rang}`);

        const realCompetences = data
          .filter((comp): comp is typeof comp & { objectif_id: string; intitule: string } => 
            Boolean(comp.objectif_id && comp.intitule)
          )
          .map(comp => ({
            objectif_id: comp.objectif_id,
            intitule: comp.intitule,
            description: comp.description || comp.intitule,
            rubrique: comp.rubrique || '',
            rang: comp.rang || rang,
            item_parent: comp.item_parent || itemNumber
          })) as OicCompetence[];

        // Cache results
        if (realCompetences.length > 0) {
          competencesCache.set(cacheKey, realCompetences);
          console.log(`💾 OIC Cached: ${cacheKey} = ${realCompetences.length} compétences`);
        }

        setCompetences(realCompetences);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('❌ OIC Fetch exception:', err);
        setError(String(err));
        setCompetences([]);
        setLoading(false);
      }
    };

    doFetch();

    return () => {
      cancelled = true;
    };
  }, [itemCode, rang]);

  // Manual refetch function
  const refetch = useCallback(() => {
    invalidateOicCache(itemCode, rang);
    // Trigger re-render by changing loading state
    setLoading(true);
    setError(null);
    setCompetences([]);
  }, [itemCode, rang]);

  return { competences, loading, error, refetch };
}
