// Utilitaires pour l'affichage du Tableau Rang B OIC-010-03-B

interface OIC010ConceptB {
  concept?: string;
  definition?: string;
  exemple?: string;
  piege?: string;
  mnemo?: string;
  subtilite?: string;
  application?: string;
  vigilance?: string;
}

interface OIC010TableauDataB {
  tableau_rang_b?: {
    sections?: Array<{ concepts?: OIC010ConceptB[] }>;
  };
  sections?: Array<{ concepts?: OIC010ConceptB[] }>;
}

interface ColonneUtileB {
  nom: string;
  description: string;
}

export const processTableauRangBOIC010 = (data: OIC010TableauDataB) => {
  // Extraire les données des concepts experts
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneUtileB[] = [
    { nom: 'Concept expert', description: 'Évaluation psychocorporelle' },
    { nom: 'Analyse approfondie', description: 'Impact multidimensionnel' },
    { nom: 'Cas complexe', description: 'Situation experte' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Protocole spécialisé' },
    { nom: 'Distinction fine', description: 'Nuances cliniques' },
    { nom: 'Maîtrise', description: 'Expertise psychosomatique' },
    { nom: 'Excellence', description: 'Accompagnement holistique' }
  ];

  const lignesEnrichies = concepts.map((concept: OIC010ConceptB) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.subtilite || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "OIC-010-03-B Rang B - Expertise impact psychocorporel";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced' as const
  };
};
