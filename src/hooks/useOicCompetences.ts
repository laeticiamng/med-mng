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

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Skip if no itemCode or invalid format
    if (!itemCode || (!itemCode.startsWith('IC-') && !itemCode.startsWith('OIC-'))) {
      setCompetences([]);
      setLoading(false);
      setError(null);
      return;
    }

    const cacheKey = `${itemCode}-${rang}`;
    
    // Check cache first - return immediately without touching loading state
    // Accept both populated and empty cached arrays to prevent re-fetching
    if (competencesCache.has(cacheKey)) {
      const cached = competencesCache.get(cacheKey)!;
      setCompetences(cached);
      setLoading(false);
      setError(null);
      return;
    }

    // Extract item number (IC-1 -> 001, IC-10 -> 010, OIC-XXX -> XXX)
    const itemNumber = itemCode.startsWith('OIC-') 
      ? itemCode.replace('OIC-', '').split('-')[0].padStart(3, '0')
      : itemCode.replace('IC-', '').padStart(3, '0');
    
    setLoading(true);
    setError(null);

    // Fetch with explicit promise handling and timeout
    const doFetch = async () => {
      console.log(`[useOicCompetences] Fetching ${itemCode} rang ${rang}, itemNumber: ${itemNumber}`);
      try {
        // Set a 10 second timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Timeout')), 10000);
        });

        const fetchPromise = supabase
          .from('backup_oic_competences')
          .select('objectif_id, intitule, description, rubrique, rang, item_parent')
          .eq('item_parent', itemNumber)
          .eq('rang', rang)
          .order('objectif_id');

        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (timeoutId) clearTimeout(timeoutId);
        if (cancelled) return;
        
        if (result.error) {
          console.warn(`[useOicCompetences] Error fetching ${itemCode} rang ${rang}:`, result.error.message);
          setError(result.error.message);
          setCompetences([]);
          setLoading(false);
          return;
        }

        const data = result.data || [];

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

        // Cache results (even empty arrays to prevent re-fetching)
        competencesCache.set(cacheKey, realCompetences);

        if (!cancelled) {
          setCompetences(realCompetences);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        if (cancelled) return;
        
        console.warn(`[useOicCompetences] Exception for ${itemCode} rang ${rang}:`, err);
        setError(String(err));
        setCompetences([]);
        setLoading(false);
      }
    };

    doFetch();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
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
