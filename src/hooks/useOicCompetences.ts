
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
        
        console.log(`🔍 Récupération compétences OIC depuis BACKUP pour item ${itemNumber} rang ${rang}`);
        
        const { data, error } = await supabase
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

        if (error) {
          console.error('❌ Erreur récupération OIC:', error);
          setError(error.message);
          return;
        }

        console.log(`✅ ${data?.length || 0} compétences OIC BACKUP récupérées pour ${itemCode} rang ${rang}`);
        
        // Toutes les compétences de backup_oic_competences sont authentiques
        const realCompetences = data?.filter(comp => {
          // Garder toutes les compétences qui ont un contenu valide
          return comp.objectif_id && 
                 comp.intitule && 
                 comp.description && 
                 comp.description.trim().length > 5;
        }) || [];

        console.log(`🎯 ${realCompetences.length} compétences VALIDES après filtrage`);
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
