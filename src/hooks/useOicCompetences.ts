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

export const useOicCompetences = (itemCode: string, rang: 'A' | 'B') => {
  const [competences, setCompetences] = useState<OicCompetence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchOicCompetences = useCallback(async () => {
    if (!itemCode) {
      setLoading(false);
      return;
    }

    const cacheKey = `${itemCode}-${rang}`;
    
    // Vérifier le cache d'abord
    const cached = competencesCache.get(cacheKey);
    if (cached && cached.length > 0) {
      console.log(`✅ OIC Cache hit: ${cacheKey} = ${cached.length} compétences`);
      setCompetences(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Extraire le numéro d'item (IC-1 -> 001, IC-10 -> 010)
      const itemNumber = itemCode.replace('IC-', '').padStart(3, '0');
      console.log(`🔍 OIC Query: item_parent=${itemNumber}, rang=${rang}`);
      
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

      if (queryError) {
        console.error('❌ Erreur récupération OIC:', queryError);
        setError(queryError.message);
        setLoading(false);
        return;
      }

      console.log(`📊 OIC Results: ${data?.length || 0} compétences pour ${itemCode} rang ${rang}`);

      // Garder toutes les compétences avec objectif_id et intitule
      const realCompetences = (data || [])
        .filter(comp => comp.objectif_id && comp.intitule)
        .map(comp => ({
          ...comp,
          description: comp.description || comp.intitule
        })) as OicCompetence[];

      // Mettre en cache seulement si on a des résultats
      if (realCompetences.length > 0) {
        competencesCache.set(cacheKey, realCompetences);
      }
      
      setCompetences(realCompetences);
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setLoading(false);
    }
  }, [itemCode, rang]);

  useEffect(() => {
    fetchOicCompetences();
  }, [fetchOicCompetences]);

  return { competences, loading, error };
};
