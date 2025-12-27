import { useState, useEffect, useRef } from 'react';
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

export const useOicCompetences = (itemCode: string, rang: 'A' | 'B') => {
  const [competences, setCompetences] = useState<OicCompetence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  
  useEffect(() => {
    mountedRef.current = true;
    
    const fetchOicCompetences = async () => {
      const cacheKey = `${itemCode}-${rang}`;
      
      // Vérifier le cache d'abord
      const cached = competencesCache.get(cacheKey);
      if (cached) {
        setCompetences(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Extraire le numéro d'item (IC-1 -> 001, IC-10 -> 010)
        const itemNumber = itemCode.replace('IC-', '').padStart(3, '0');
        
        const { data, error: queryError } = await supabase
          .from('backup_oic_competences')
          .select(`
            objectif_id,
            intitule,
            description,
            rubrique,
            rang,
            item_parent
          `)
          .eq('item_parent', itemNumber)
          .eq('rang', rang)
          .order('objectif_id');

        if (!mountedRef.current) return;

        if (queryError) {
          console.error('❌ Erreur récupération OIC:', queryError);
          setError(queryError.message);
          setLoading(false);
          return;
        }

        // Garder toutes les compétences avec objectif_id et intitule
        const realCompetences = (data || [])
          .filter(comp => comp.objectif_id && comp.intitule)
          .map(comp => ({
            ...comp,
            description: comp.description || comp.intitule
          })) as OicCompetence[];

        // Mettre en cache
        competencesCache.set(cacheKey, realCompetences);
        
        if (mountedRef.current) {
          setCompetences(realCompetences);
          setLoading(false);
        }
        
      } catch (err) {
        console.error('❌ Erreur:', err);
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue');
          setLoading(false);
        }
      }
    };

    if (itemCode) {
      fetchOicCompetences();
    } else {
      setLoading(false);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [itemCode, rang]);

  return { competences, loading, error };
};
