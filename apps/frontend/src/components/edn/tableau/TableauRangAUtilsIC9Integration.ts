import logger from '@/lib/logger';


// Utilitaires pour l'intégration des données IC-9
export const processTableauRangAIC9 = (data: any) => {
  logger.debug('🔍 Traitement IC-9 - Certificats médicaux violences');
  
  // Extraire les données du tableau
  const tableauData = data.tableau_rang_a || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Élément médico-légal' },
    { nom: 'Définition', description: 'Cadre juridique précis' },
    { nom: 'Exemple', description: 'Cas pratique type' },
    { nom: 'Piège', description: 'Erreur à éviter' },
    { nom: 'Mnémotechnique', description: 'Aide-mémoire' },
    { nom: 'Subtilité', description: 'Nuance légale' },
    { nom: 'Application', description: 'Pratique concrète' },
    { nom: 'Vigilance', description: 'Point déontologique' }
  ];

  const lignesEnrichies = concepts.map((concept: any) => [
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

  logger.debug(`✅ IC-9 traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const isIC9Item = (data: any): boolean => {
  return data?.item_code === 'IC-9' || 
         data?.title?.includes('Certificats médicaux') ||
         data?.title?.includes('violences') ||
         data?.theme?.includes('IC-9');
};
