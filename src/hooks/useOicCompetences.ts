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

async function fetchOicData(itemNumber: string, rang: string): Promise<OicCompetence[]> {
  console.log(`⏳ OIC Query starting: item_parent=${itemNumber}, rang=${rang}`);
  
  const response = await supabase
    .from('backup_oic_competences')
    .select('objectif_id, intitule, description, rubrique, rang, item_parent')
    .eq('item_parent', itemNumber)
    .eq('rang', rang)
    .order('objectif_id');
  
  console.log(`🔄 OIC Response:`, response);
  
  if (response.error) {
    console.error('❌ OIC Error:', response.error);
    throw new Error(response.error.message);
  }
  
  const data = response.data || [];
  console.log(`📊 OIC Result: ${data.length} compétences`);
  
  return data
    .filter((comp): comp is typeof comp & { objectif_id: string; intitule: string } => 
      Boolean(comp.objectif_id && comp.intitule)
    )
    .map(comp => ({
      ...comp,
      description: comp.description || comp.intitule
    })) as OicCompetence[];
}

export function useOicCompetences(itemCode: string, rang: 'A' | 'B') {
  const [competences, setCompetences] = useState<OicCompetence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    console.log(`🔍 OIC Fetching: item_parent=${itemNumber}, rang=${rang}`);

    setLoading(true);
    setError(null);

    fetchOicData(itemNumber, rang)
      .then(data => {
        if (data.length > 0) {
          competencesCache.set(cacheKey, data);
          console.log(`💾 OIC Cached: ${cacheKey} = ${data.length} compétences`);
        }
        setCompetences(data);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ OIC Fetch failed:', err);
        setError(err.message || String(err));
        setCompetences([]);
        setLoading(false);
      });
  }, [itemCode, rang]);

  // Manual refetch function
  const refetch = useCallback(() => {
    if (itemCode && itemCode.startsWith('IC-')) {
      invalidateOicCache(itemCode, rang);
      setLoading(true);
      const itemNumber = itemCode.replace('IC-', '').padStart(3, '0');
      
      fetchOicData(itemNumber, rang)
        .then(data => {
          if (data.length > 0) {
            competencesCache.set(`${itemCode}-${rang}`, data);
          }
          setCompetences(data);
          setError(null);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || String(err));
          setCompetences([]);
          setLoading(false);
        });
    }
  }, [itemCode, rang]);

  return { competences, loading, error, refetch };
}
