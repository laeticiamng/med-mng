import { useState, useEffect } from 'react';
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

export function useOicCompetences(itemCode: string, rang: 'A' | 'B') {
  const [competences, setCompetences] = useState<OicCompetence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if no itemCode
    if (!itemCode) {
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
    console.log(`🔍 OIC Query START: item_parent=${itemNumber}, rang=${rang}`);

    setLoading(true);
    setError(null);

    // Direct fetch without async wrapper
    supabase
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description, rubrique, rang, item_parent')
      .eq('item_parent', itemNumber)
      .eq('rang', rang)
      .order('objectif_id')
      .then((result) => {
        const { data, error: queryError } = result;
        
        console.log(`📊 OIC Query DONE: ${data?.length || 0} results, error=${queryError?.message || 'none'}`);

        if (queryError) {
          console.error('❌ Erreur récupération OIC:', queryError);
          setError(queryError.message);
          setCompetences([]);
          setLoading(false);
          return;
        }

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
        }

        setCompetences(realCompetences);
        setLoading(false);
        setError(null);
      });

    // No cleanup needed - state updates after unmount are harmless in React 18+
  }, [itemCode, rang]);

  return { competences, loading, error };
}
