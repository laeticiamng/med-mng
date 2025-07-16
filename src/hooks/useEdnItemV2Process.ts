
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

    // Debug: Log item data to verify content
    console.log('useEdnItemV2Process - Processing item:', item.item_code, {
      hasPayloadV2: !!item.payload_v2,
      hasTableauRangA: !!item.tableau_rang_a,
      hasTableauRangB: !!item.tableau_rang_b,
      rangAStructure: item.tableau_rang_a?.sections?.[0]?.concepts?.length || 0,
      rangBStructure: item.tableau_rang_b?.sections?.[0]?.concepts?.length || 0
    });

    // Check if item has payload_v2 (new format) with proper structure validation
    if (item.payload_v2 && item.payload_v2.content?.rang_a && item.payload_v2.content?.rang_b) {
      const v2Data = item.payload_v2 as ItemV2Data;
      
      console.log('Processing V2 format for:', item.item_code);
      
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
        paroles_musicales: [
          ...v2Data.content.rang_a.competences.flatMap(comp => comp.paroles_chantables || []),
          ...v2Data.content.rang_b.competences.flatMap(comp => comp.paroles_chantables || [])
        ]
      };

      return transformedItem;
    }

    // Return original item if not V2 format or if it already has the expected structure
    console.log('Returning original item for:', item.item_code);
    return item;
  }, [item]);
};
