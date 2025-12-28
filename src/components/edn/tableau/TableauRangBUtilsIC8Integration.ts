interface IC8ConceptB {
  concept?: string;
  definition?: string;
  exemple?: string;
  piege?: string;
  mnemo?: string;
  subtilite?: string;
  application?: string;
  vigilance?: string;
}

interface IC8SectionB {
  concepts?: IC8ConceptB[];
}

interface IC8TableauDataB {
  tableau_rang_b?: {
    sections?: IC8SectionB[];
  };
  sections?: IC8SectionB[];
}

interface ColonneUtile {
  nom: string;
  description: string;
}

// Utilitaires pour l'affichage du Tableau Rang B IC-8
export const processTableauRangBIC8 = (data: IC8TableauDataB) => {
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneUtile[] = [
    { nom: 'Concept expert', description: 'Lutte anti-discrimination' },
    { nom: 'Analyse systémique', description: 'Approche structurelle' },
    { nom: 'Cas complexe', description: 'Situation experte' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Intervention spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances sociales' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Équité parfaite' }
  ];

  const lignesEnrichies = concepts.map((concept: IC8ConceptB) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.subtilite || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "IC-8 Rang B - Expertise lutte contre les discriminations";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};
