
// Utilitaires pour l'affichage du Tableau Rang B IC-6
export const processTableauRangBIC6 = (data: any) => {
  console.log('🔍 Traitement avancé IC-6 Rang B');
  
  // Extraire les données des concepts experts
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept expert', description: 'Organisation avancée' },
    { nom: 'Analyse systémique', description: 'Vision globale' },
    { nom: 'Cas complexe', description: 'Situation experte' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Méthode spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances organisationnelles' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Coordination optimale' }
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

  const theme = "IC-6 Rang B - Expertise organisation et coordination";

  console.log(`✅ IC-6 Rang B expert traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};
