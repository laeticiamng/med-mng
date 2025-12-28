// Utilitaires pour l'affichage du Tableau Rang B IC-4

interface IC4ConceptB {
  concept?: string;
  analyse?: string;
  cas?: string;
  ecueil?: string;
  technique?: string;
  distinction?: string;
  maitrise?: string;
  excellence?: string;
}

interface IC4TableauDataB {
  tableau_rang_b?: {
    sections?: Array<{ concepts?: IC4ConceptB[] }>;
  };
  sections?: Array<{ concepts?: IC4ConceptB[] }>;
  item_code?: string;
  title?: string;
  slug?: string;
}

interface ColonneUtileB {
  nom: string;
  description: string;
}

export const processTableauRangBIC4Advanced = (data: IC4TableauDataB) => {
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneUtileB[] = [
    { nom: 'Concept expert', description: 'Expertise de haut niveau' },
    { nom: 'Analyse approfondie', description: 'Compréhension systémique' },
    { nom: 'Cas complexe', description: 'Situation réelle experte' },
    { nom: 'Écueil d\'expert', description: 'Piège de niveau avancé' },
    { nom: 'Technique avancée', description: 'Méthode spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances importantes' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Leadership et innovation' }
  ];

  const lignesEnrichies = concepts.map((concept: IC4ConceptB) => [
    concept.concept || '',
    concept.analyse || '',
    concept.cas || '',
    concept.ecueil || '',
    concept.technique || '',
    concept.distinction || '',
    concept.maitrise || '',
    concept.excellence || ''
  ]);

  const theme = "IC-4 Rang B - Expertise qualité et sécurité des soins";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced' as const
  };
};

export const processTableauRangBIC4 = processTableauRangBIC4Advanced;

export const isIC4RangBItem = (data: IC4TableauDataB): boolean => {
  return data?.item_code === 'IC-4' || 
         data?.title?.includes('Qualité et sécurité des soins') ||
         data?.slug === 'ic4-qualite-securite-soins' || false;
};
