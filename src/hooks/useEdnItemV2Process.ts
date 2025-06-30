
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

    // Check if item has payload_v2 (new format)
    if (item.payload_v2) {
      const v2Data = item.payload_v2 as ItemV2Data;
      
      // Transform V2 data to legacy format for compatibility
      const transformedItem = {
        ...item,
        tableau_rang_a: {
          theme: v2Data.content.rang_a.theme,
          sections: [{
            concepts: v2Data.content.rang_a.competences
          }]
        },
        tableau_rang_b: {
          theme: v2Data.content.rang_b.theme,
          sections: [{
            concepts: v2Data.content.rang_b.competences
          }]
        },
        paroles_musicales: v2Data.content.rang_a.competences.flatMap(c => c.paroles_chantables)
          .concat(v2Data.content.rang_b.competences.flatMap(c => c.paroles_chantables))
      };

      return transformedItem;
    }

    // Return original item if not V2 format
    return item;
  }, [item]);
};
