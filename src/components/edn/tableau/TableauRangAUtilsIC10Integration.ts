
// Utilitaires pour l'intégration des données IC-10
export const processTableauRangAIC10 = (data: any) => {
  console.log('🔍 Traitement IC-10 - Approches transversales du corps');
  
  // Extraire les données du tableau
  const tableauData = data.tableau_rang_a || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Dimension corporelle' },
    { nom: 'Définition', description: 'Approche théorique' },
    { nom: 'Exemple', description: 'Cas pratique concret' },
    { nom: 'Piège', description: 'Erreur à éviter' },
    { nom: 'Mnémotechnique', description: 'Aide-mémoire' },
    { nom: 'Subtilité', description: 'Nuance importante' },
    { nom: 'Application', description: 'Mise en pratique' },
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

  const theme = "IC-10 - Approches transversales du corps";

  console.log(`✅ IC-10 traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const isIC10Item = (data: any): boolean => {
  return data?.item_code === 'IC-10' || 
         data?.title?.includes('Approches transversales') ||
         data?.title?.includes('corps') ||
         data?.theme?.includes('IC-10');
};
