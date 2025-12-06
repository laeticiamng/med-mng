
export interface IC1CompletenessReport {
  isCompliant: boolean;
  missingElements: string[];
  contentAnalysis: {
    rangA: {
      hasContent: boolean;
      competencesCount: number;
      missingCompetences: string[];
    };
    rangB: {
      hasContent: boolean;
      competencesCount: number;
      missingCompetences: string[];
    };
  };
  medicalContentCheck: {
    hasRelationMedecinMalade: boolean;
    hasCorpsHumainDimensions: boolean;
    hasMaladiesImpact: boolean;
    hasPratiquesCliniques: boolean;
  };
  recommendations: string[];
}
