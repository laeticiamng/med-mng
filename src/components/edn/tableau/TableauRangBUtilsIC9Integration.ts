interface IC9ConceptB {
  concept?: string;
  definition?: string;
  exemple?: string;
  piege?: string;
  mnemo?: string;
  subtilite?: string;
  application?: string;
  vigilance?: string;
}

interface IC9SectionB {
  concepts?: IC9ConceptB[];
}

interface IC9TableauDataB {
  tableau_rang_b?: {
    sections?: IC9SectionB[];
  };
  sections?: IC9SectionB[];
}

interface ColonneUtile {
  nom: string;
  description: string;
}

// Utilitaires pour l'affichage du Tableau Rang B IC-9
export const processTableauRangBIC9 = (data: IC9TableauDataB) => {
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneUtile[] = [
    { nom: 'Concept expert', description: 'Expertise médico-légale' },
    { nom: 'Analyse légale', description: 'Approche judiciaire' },
    { nom: 'Cas complexe', description: 'Situation experte' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Méthode spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances légales' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Expertise reconnue' }
  ];

  const lignesEnrichies = concepts.map((concept: IC9ConceptB) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.subtilite || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "IC-9 Rang B - Expertise médico-légale avancée";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};
