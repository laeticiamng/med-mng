import logger from '@/lib/logger';


// Utilitaires pour l'affichage du Tableau Rang B IC-4
export const processTableauRangBIC4Advanced = (data: any) => {
  logger.debug('🔍 Traitement avancé IC-4 Rang B');
  
  // Extraire les données des concepts experts
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept expert', description: 'Expertise de haut niveau' },
    { nom: 'Analyse approfondie', description: 'Compréhension systémique' },
    { nom: 'Cas complexe', description: 'Situation réelle experte' },
    { nom: 'Écueil d\'expert', description: 'Piège de niveau avancé' },
    { nom: 'Technique avancée', description: 'Méthode spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances importantes' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Leadership et innovation' }
  ];

  const lignesEnrichies = concepts.map((concept: any) => [
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

  logger.debug(`✅ IC-4 Rang B expert traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};

export const processTableauRangBIC4 = processTableauRangBIC4Advanced;

export const isIC4RangBItem = (data: any): boolean => {
  return data?.item_code === 'IC-4' || 
         data?.title?.includes('Qualité et sécurité des soins') ||
         data?.slug === 'ic4-qualite-securite-soins';
};
