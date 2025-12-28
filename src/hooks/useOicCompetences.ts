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

    // Use .then() directly on the query builder
    const query = supabase
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description, rubrique, rang, item_parent')
      .eq('item_parent', itemNumber)
      .eq('rang', rang)
      .order('objectif_id');
    
    console.log(`⏳ OIC Query created, executing...`);
    
    query.then((result) => {
      console.log(`🔄 OIC Query completed`, result);
      
      const { data, error: queryError } = result;
      
      if (queryError) {
        console.error('❌ OIC Error:', queryError);
        setError(queryError.message);
        setCompetences([]);
        setLoading(false);
        return;
      }

      console.log(`📊 OIC Result: ${data?.length || 0} compétences for ${itemCode} rang ${rang}`);

      const realCompetences = (data || [])
        .filter((comp): comp is typeof comp & { objectif_id: string; intitule: string } => 
          Boolean(comp.objectif_id && comp.intitule)
        )
        .map(comp => ({
          ...comp,
          description: comp.description || comp.intitule
        })) as OicCompetence[];

      // Cache results
      if (realCompetences.length > 0) {
        competencesCache.set(cacheKey, realCompetences);
        console.log(`💾 OIC Cached: ${cacheKey} = ${realCompetences.length} compétences`);
      }

      setCompetences(realCompetences);
      setError(null);
      setLoading(false);
    });
  }, [itemCode, rang]);

  // Manual refetch function
  const refetch = useCallback(() => {
    if (itemCode && itemCode.startsWith('IC-')) {
      invalidateOicCache(itemCode, rang);
      // Force re-render by updating a dependency - easiest is to just re-run the effect
      setLoading(true);
      const itemNumber = itemCode.replace('IC-', '').padStart(3, '0');
      
      supabase
        .from('backup_oic_competences')
        .select('objectif_id, intitule, description, rubrique, rang, item_parent')
        .eq('item_parent', itemNumber)
        .eq('rang', rang)
        .order('objectif_id')
        .then(({ data, error: queryError }) => {
          if (queryError) {
            setError(queryError.message);
            setCompetences([]);
          } else {
            const realCompetences = (data || [])
              .filter((comp): comp is typeof comp & { objectif_id: string; intitule: string } => 
                Boolean(comp.objectif_id && comp.intitule)
              )
              .map(comp => ({
                ...comp,
                description: comp.description || comp.intitule
              })) as OicCompetence[];
            
            if (realCompetences.length > 0) {
              competencesCache.set(`${itemCode}-${rang}`, realCompetences);
            }
            setCompetences(realCompetences);
            setError(null);
          }
          setLoading(false);
        });
    }
  }, [itemCode, rang]);

  return { competences, loading, error, refetch };
}
