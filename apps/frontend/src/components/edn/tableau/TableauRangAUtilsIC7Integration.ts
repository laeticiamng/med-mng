
// Utilitaires pour l'intégration des données IC-7
export const processTableauRangAIC7 = (data: any) => {
  console.log('🔍 Traitement IC-7 - Les discriminations');
  
  // Extraire les données du tableau
  const tableauData = data.tableau_rang_a || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Type de discrimination' },
    { nom: 'Définition', description: 'Caractérisation précise' },
    { nom: 'Exemple', description: 'Situation concrète' },
    { nom: 'Piège', description: 'Erreur à éviter' },
    { nom: 'Mnémotechnique', description: 'Aide-mémoire' },
    { nom: 'Subtilité', description: 'Nuance critique' },
    { nom: 'Application', description: 'Prévention pratique' },
    { nom: 'Vigilance', description: 'Point d\'attention' }
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

  const theme = "IC-7 - Les discriminations";

  console.log(`✅ IC-7 traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const isIC7Item = (data: any): boolean => {
  return data?.item_code === 'IC-7' || 
         data?.title?.includes('discriminations') ||
         data?.theme?.includes('IC-7');
};
