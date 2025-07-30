
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OicCompetence {
  objectif_id: string;
  intitule: string;
  description: string;
  rubrique: string;
  rang: string;
  item_parent: string;
  ordre?: number;
  url_source?: string;
}

export const useOicCompetences = (itemCode: string, rang: 'A' | 'B') => {
  const [competences, setCompetences] = useState<OicCompetence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOicCompetences = async () => {
      try {
        setLoading(true);
        
        // Extraire le numéro d'item (IC-1 -> 001, IC-10 -> 010)
        const itemNumber = itemCode.replace('IC-', '').padStart(3, '0');
        
        console.log(`🔍 Récupération compétences OIC RÉELLES pour item ${itemNumber} rang ${rang}`);
        
        const { data, error } = await supabase
          .from('backup_oic_competences')
          .select(`
            objectif_id,
            intitule,
            description,
            rubrique,
            rang,
            item_parent,
            ordre,
            url_source
          `)
          .eq('item_parent', itemNumber)
          .eq('rang', rang)
          .order('ordre');

        if (error) {
          console.error('❌ Erreur récupération OIC:', error);
          setError(error.message);
          return;
        }

        console.log(`✅ ${data?.length || 0} compétences OIC RÉELLES récupérées pour ${itemCode} rang ${rang}`);
        
        // Simplement vérifier que les compétences ont le contenu nécessaire
        const realCompetences = data?.filter(comp => {
          return comp.objectif_id && comp.intitule && comp.description;
        }) || [];

        console.log(`🎯 ${realCompetences.length} compétences AUTHENTIQUES récupérées`);
        setCompetences(realCompetences);
        
      } catch (err) {
        console.error('❌ Erreur:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    if (itemCode) {
      fetchOicCompetences();
    }
  }, [itemCode, rang]);

  return { competences, loading, error };
};
