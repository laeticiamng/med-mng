interface IC8Concept {
  concept?: string;
  definition?: string;
  exemple?: string;
  piege?: string;
  mnemo?: string;
  subtilite?: string;
  application?: string;
  vigilance?: string;
}

interface IC8Section {
  concepts?: IC8Concept[];
}

interface IC8TableauData {
  tableau_rang_a?: {
    sections?: IC8Section[];
  };
  sections?: IC8Section[];
  item_code?: string;
  title?: string;
  theme?: string;
}

interface ColonneUtile {
  nom: string;
  description: string;
}

// Utilitaires pour l'intégration des données IC-8
export const processTableauRangAIC8 = (data: IC8TableauData) => {
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

  const lignesEnrichies = concepts.map((concept: IC8Concept) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.subtilite || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "IC-8 - Certificats médicaux dans le cadre des violences";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const isIC8Item = (data: IC8TableauData | null | undefined): boolean => {
  return data?.item_code === 'IC-8' || 
         data?.title?.includes('Certificats médicaux') ||
         data?.title?.includes('violences') ||
         data?.theme?.includes('IC-8') || false;
};
