import logger from '@/lib/logger';


// Utilitaires pour l'intégration des données IC-4 avec structure complexe
export const isIC4Item = (data: any): boolean => {
  return data?.item_code === 'IC-4' || 
         data?.title?.includes('Qualité et sécurité des soins') ||
         data?.slug === 'ic4-qualite-securite-soins';
};

export const processTableauRangAIC4 = (data: any) => {
  logger.debug('🔍 Traitement IC-4 Qualité et sécurité des soins');
  
  // Extraire les données des concepts depuis la nouvelle structure JSON
  const tableauData = data.tableau_rang_a || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Notion clé à maîtriser' },
    { nom: 'Définition', description: 'Définition précise et complète' },
    { nom: 'Exemple', description: 'Illustration pratique' },
    { nom: 'Piège', description: 'Erreur fréquente à éviter' },
    { nom: 'Mnémo', description: 'Aide-mémoire' },
    { nom: 'Application', description: 'Mise en pratique' },
    { nom: 'Vigilance', description: 'Point de vigilance' }
  ];

  const lignesEnrichies = concepts.map((concept: any) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "IC-4 Rang A - Qualité et sécurité des soins (13 concepts)";

  logger.debug(`✅ IC-4 traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const processTableauRangBIC4 = (data: any) => {
  logger.debug('🔍 Traitement IC-4 Rang B - Expertise qualité et sécurité');
  
  // Extraire les données des concepts experts depuis la nouvelle structure JSON
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Expertise avancée' },
    { nom: 'Analyse', description: 'Analyse approfondie' },
    { nom: 'Cas complexe', description: 'Situation concrète' },
    { nom: 'Écueil', description: 'Piège d\'expert' },
    { nom: 'Technique', description: 'Méthode spécialisée' },
    { nom: 'Maîtrise', description: 'Niveau de maîtrise requis' },
    { nom: 'Excellence', description: 'Niveau d\'excellence' }
  ];

  const lignesEnrichies = concepts.map((concept: any) => [
    concept.concept || '',
    concept.analyse || '',
    concept.cas || '',
    concept.ecueil || '',
    concept.technique || '',
    concept.maitrise || '',
    concept.excellence || ''
  ]);

  const theme = "IC-4 Rang B - Expertise qualité et sécurité (22 concepts)";

  logger.debug(`✅ IC-4 Rang B traité: ${lignesEnrichies.length} concepts experts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true
  };
};
