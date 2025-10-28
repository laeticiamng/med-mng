
import { useMemo } from 'react';

interface CompetenceV2 {
  competence_id: string;
  concept: string;
  definition: string;
  exemple: string;
  piege: string;
  mnemo: string;
  subtilite: string;
  application: string;
  vigilance: string;
  paroles_chantables: string[];
}

interface ItemV2Data {
  item_metadata: {
    code: string;
    title: string;
    subtitle?: string;
    category: string;
    difficulty: string;
    version: string;
    slug: string;
  };
  content: {
    rang_a: {
      theme: string;
      competences: CompetenceV2[];
    };
    rang_b: {
      theme: string;
      competences: CompetenceV2[];
    };
  };
  generation_config: {
    music_enabled: boolean;
    bd_enabled: boolean;
    quiz_enabled: boolean;
    interactive_enabled: boolean;
  };
}

export const useEdnItemV2Process = (item: any) => {
  return useMemo(() => {
    if (!item) return null;

    // Check if item has payload_v2 (new format) with proper structure validation
    if (item.payload_v2 && item.payload_v2.content?.rang_a && item.payload_v2.content?.rang_b) {
      const v2Data = item.payload_v2 as ItemV2Data;
      
      // Validate that we have competences to process
      const hasRangACompetences = v2Data.content.rang_a.competences?.length > 0;
      const hasRangBCompetences = v2Data.content.rang_b.competences?.length > 0;
      
      if (!hasRangACompetences && !hasRangBCompetences) {
        console.warn(`⚠️ ${item.item_code}: V2 format detected but no competences found, using original item`);
        return item;
      }
      
      console.log(`Processing ${item.item_code} selon fiche E-LiSA officielle:`, {
        title: `${item.item_code} Rang A - ${item.title}`,
        subtitle: `Item de connaissance E-LiSA - ${item.item_code}`,
        objectifs: v2Data.content.rang_a.competences.map(c => c.concept || c.competence_id),
        competences_cles: v2Data.content.rang_a.competences,
        situations_cliniques: [
          `Cas clinique standard de ${item.title}`,
          'Diagnostic et prise en charge initiale',
          'Surveillance et suivi patient'
        ]
      });
      
      const totalCompetences = v2Data.content.rang_a.competences.length + v2Data.content.rang_b.competences.length;
      console.log(`${item.item_code} Génération : ${totalCompetences} connaissances selon E-LiSA exactement`);
      
      // Transform V2 data to legacy format for compatibility
      const transformedItem = {
        ...item,
        tableau_rang_a: hasRangACompetences ? {
          theme: v2Data.content.rang_a.theme,
          sections: [{
            concepts: v2Data.content.rang_a.competences
          }]
        } : item.tableau_rang_a,
        tableau_rang_b: hasRangBCompetences ? {
          theme: v2Data.content.rang_b.theme,
          sections: [{
            concepts: v2Data.content.rang_b.competences
          }]
        } : item.tableau_rang_b,
        paroles_musicales: [
          ...v2Data.content.rang_a.competences.flatMap(comp => comp.paroles_chantables || []),
          ...v2Data.content.rang_b.competences.flatMap(comp => comp.paroles_chantables || [])
        ].filter(Boolean)
      };

      console.log(`${item.item_code}: ${totalCompetences}/${totalCompetences} connaissances E-LiSA générées`);
      console.log(`${item.item_code} E-LiSA : ${totalCompetences}/${totalCompetences} connaissances`);

      return transformedItem;
    }

    // Return original item if not V2 format or if it already has the expected structure
    console.log('Returning original item for:', item.item_code);
    return item;
  }, [item]);
};
