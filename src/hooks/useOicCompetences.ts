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
  const [state, setState] = useState<{
    competences: OicCompetence[];
    loading: boolean;
    error: string | null;
  }>({
    competences: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchCompetences() {
      if (!itemCode) {
        setState({ competences: [], loading: false, error: null });
        return;
      }

      const cacheKey = `${itemCode}-${rang}`;
      
      // Check cache first
      const cached = competencesCache.get(cacheKey);
      if (cached && cached.length > 0) {
        console.log(`✅ OIC Cache hit: ${cacheKey} = ${cached.length} compétences`);
        if (!cancelled) {
          setState({ competences: cached, loading: false, error: null });
        }
        return;
      }

      // Extract item number (IC-1 -> 001, IC-10 -> 010)
      const itemNumber = itemCode.replace('IC-', '').padStart(3, '0');
      console.log(`🔍 OIC Query: item_parent=${itemNumber}, rang=${rang}`);

      try {
        const { data, error: queryError } = await supabase
          .from('backup_oic_competences')
          .select('objectif_id, intitule, description, rubrique, rang, item_parent')
          .eq('item_parent', itemNumber)
          .eq('rang', rang)
          .order('objectif_id');

        if (cancelled) return;

        if (queryError) {
          console.error('❌ Erreur récupération OIC:', queryError);
          setState({ competences: [], loading: false, error: queryError.message });
          return;
        }

        console.log(`📊 OIC Results: ${data?.length || 0} compétences pour ${itemCode} rang ${rang}`);

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

        setState({ competences: realCompetences, loading: false, error: null });
      } catch (err) {
        console.error('❌ Erreur:', err);
        if (!cancelled) {
          setState({ 
            competences: [], 
            loading: false, 
            error: err instanceof Error ? err.message : 'Erreur inconnue' 
          });
        }
      }
    }

    fetchCompetences();

    return () => {
      cancelled = true;
    };
  }, [itemCode, rang]);

  return state;
}
