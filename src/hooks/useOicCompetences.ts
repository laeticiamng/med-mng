
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
        
        // Extraire le numéro d'item et gérer les différents formats
        let itemNumber: string;
        if (itemCode.startsWith('IC-')) {
          itemNumber = itemCode.replace('IC-', '').padStart(3, '0');
        } else {
          // Si c'est déjà au format numérique, on le garde tel quel
          itemNumber = itemCode.padStart(3, '0');
        }
        
        console.log(`🔍 [useOicCompetences] Récupération pour itemCode='${itemCode}' -> itemNumber='${itemNumber}' rang='${rang}'`);
        
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
            url_source,
            completion_status
          `)
          .eq('item_parent', itemNumber)
          .eq('rang', rang)
          .in('completion_status', ['completed', 'updated', 'verified_unchanged', 'skipped_error'])
          .not('description', 'is', null)
          .order('ordre', { ascending: true, nullsFirst: false });

        console.log(`🔧 [useOicCompetences] Requête SQL: item_parent='${itemNumber}' AND rang='${rang}'`);
        console.log(`📊 [useOicCompetences] Données brutes récupérées pour ${itemCode}:`, data?.length, 'éléments');
        console.log(`📊 [useOicCompetences] Échantillon données:`, data?.slice(0, 2));

        if (error) {
          console.error('❌ Erreur récupération OIC:', error);
          setError(error.message);
          return;
        }

        console.log(`✅ ${data?.length || 0} compétences OIC RÉELLES récupérées pour ${itemCode} rang ${rang}`);
        
        // Filtrer les compétences avec descriptions complètes et à jour
        const realCompetences = data?.filter(comp => {
          const hasRequiredFields = comp.objectif_id && comp.intitule && comp.description;
          const hasValidDescription = comp.description && comp.description.length > 20;
          const hasValidStatus = ['completed', 'updated', 'verified_unchanged', 'skipped_error'].includes(comp.completion_status);
          
          return hasRequiredFields && hasValidDescription && hasValidStatus;
        }) || [];

        // Tri supplémentaire pour s'assurer de l'ordre croissant
        const sortedCompetences = realCompetences.sort((a, b) => {
          // Priorité 1: tri par ordre si disponible
          if (a.ordre !== null && b.ordre !== null && a.ordre !== undefined && b.ordre !== undefined) {
            return a.ordre - b.ordre;
          }
          
          // Priorité 2: extraire le numéro de séquence de l'objectif_id
          const extractSequenceNumber = (objectifId: string) => {
            // Pattern: OIC-XXX-YY-[A|B] où YY est le numéro de séquence
            const match = objectifId.match(/OIC-\d+-(\d+)-[AB]/);
            return match ? parseInt(match[1], 10) : 999999; // valeur élevée si pas de match
          };
          
          const seqA = extractSequenceNumber(a.objectif_id || '');
          const seqB = extractSequenceNumber(b.objectif_id || '');
          
          return seqA - seqB;
        });

        console.log(`🎯 ${sortedCompetences.length} compétences AUTHENTIQUES récupérées avec descriptions complètes et triées par ordre`);
        setCompetences(sortedCompetences);
        
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
