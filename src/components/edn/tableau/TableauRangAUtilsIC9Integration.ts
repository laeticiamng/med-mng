interface IC9Concept {
  concept?: string;
  definition?: string;
  exemple?: string;
  piege?: string;
  mnemo?: string;
  subtilite?: string;
  application?: string;
  vigilance?: string;
}

interface IC9Section {
  concepts?: IC9Concept[];
}

interface IC9TableauData {
  item_code?: string;
  title?: string;
  theme?: string;
  tableau_rang_a?: {
    sections?: IC9Section[];
  };
  sections?: IC9Section[];
}

interface ColonneUtile {
  nom: string;
  description: string;
}

// Utilitaires pour l'intégration des données IC-9
export const processTableauRangAIC9 = (data: IC9TableauData) => {
  // Extraire les données du tableau
  const tableauData = data.tableau_rang_a || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneUtile[] = [
    { nom: 'Concept', description: 'Élément médico-légal' },
    { nom: 'Définition', description: 'Cadre juridique précis' },
    { nom: 'Exemple', description: 'Cas pratique type' },
    { nom: 'Piège', description: 'Erreur à éviter' },
    { nom: 'Mnémotechnique', description: 'Aide-mémoire' },
    { nom: 'Subtilité', description: 'Nuance légale' },
    { nom: 'Application', description: 'Pratique concrète' },
    { nom: 'Vigilance', description: 'Point déontologique' }
  ];

  const lignesEnrichies = concepts.map((concept: IC9Concept) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.subtilite || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "IC-9 - Certificats médicaux dans le cadre des violences";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const isIC9Item = (data: IC9TableauData): boolean => {
  return data?.item_code === 'IC-9' || 
         data?.title?.includes('Certificats médicaux') ||
         data?.title?.includes('violences') ||
         data?.theme?.includes('IC-9') || false;
};
