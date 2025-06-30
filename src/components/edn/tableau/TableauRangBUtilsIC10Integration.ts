
// Utilitaires pour l'affichage du Tableau Rang B IC-10
export const processTableauRangBIC10 = (data: any) => {
  console.log('🔍 Traitement avancé IC-10 Rang B');
  
  // Extraire les données des concepts experts
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept expert', description: 'Approche multidimensionnelle' },
    { nom: 'Analyse intégrative', description: 'Vision holistique' },
    { nom: 'Cas complexe', description: 'Situation experte' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Méthode spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances importantes' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Approche transversale' }
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

  const theme = "IC-10 Rang B - Expertise approches transversales";

  console.log(`✅ IC-10 Rang B expert traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};
