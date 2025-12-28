
interface IC7Concept {
  concept?: string;
  definition?: string;
  exemple?: string;
  piege?: string;
  mnemo?: string;
  subtilite?: string;
  application?: string;
  vigilance?: string;
}

interface IC7Section {
  concepts?: IC7Concept[];
}

interface IC7TableauData {
  tableau_rang_a?: {
    sections?: IC7Section[];
  };
  sections?: IC7Section[];
  item_code?: string;
  title?: string;
  theme?: string;
}

interface ColonneUtile {
  nom: string;
  description: string;
}

// Utilitaires pour l'intégration des données IC-7
export const processTableauRangAIC7 = (data: IC7TableauData) => {
  // Extraire les données du tableau
  const tableauData = data.tableau_rang_a || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneUtile[] = [
    { nom: 'Concept', description: 'Type de discrimination' },
    { nom: 'Définition', description: 'Caractérisation précise' },
    { nom: 'Exemple', description: 'Situation concrète' },
    { nom: 'Piège', description: 'Erreur à éviter' },
    { nom: 'Mnémotechnique', description: 'Aide-mémoire' },
    { nom: 'Subtilité', description: 'Nuance critique' },
    { nom: 'Application', description: 'Prévention pratique' },
    { nom: 'Vigilance', description: 'Point d\'attention' }
  ];

  const lignesEnrichies = concepts.map((concept: IC7Concept) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.subtilite || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "IC-7 - Les discriminations";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const isIC7Item = (data: IC7TableauData | null | undefined): boolean => {
  return data?.item_code === 'IC-7' || 
         data?.title?.includes('discriminations') ||
         data?.theme?.includes('IC-7') || false;
};
