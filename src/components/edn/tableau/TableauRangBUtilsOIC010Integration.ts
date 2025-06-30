
// Utilitaires pour l'affichage du Tableau Rang B OIC-010-03-B
export const processTableauRangBOIC010 = (data: any) => {
  console.log('🔍 Traitement avancé OIC-010-03-B Rang B');
  
  // Extraire les données des concepts experts
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept expert', description: 'Évaluation psychocorporelle' },
    { nom: 'Analyse approfondie', description: 'Impact multidimensionnel' },
    { nom: 'Cas complexe', description: 'Situation experte' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Protocole spécialisé' },
    { nom: 'Distinction fine', description: 'Nuances cliniques' },
    { nom: 'Maîtrise', description: 'Expertise psychosomatique' },
    { nom: 'Excellence', description: 'Accompagnement holistique' }
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

  const theme = "OIC-010-03-B Rang B - Expertise impact psychocorporel";

  console.log(`✅ OIC-010-03-B Rang B expert traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};
