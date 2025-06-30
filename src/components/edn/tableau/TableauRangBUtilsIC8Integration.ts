
// Utilitaires pour l'affichage du Tableau Rang B IC-8
export const processTableauRangBIC8 = (data: any) => {
  console.log('🔍 Traitement avancé IC-8 Rang B');
  
  // Extraire les données des concepts experts
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept expert', description: 'Expertise médico-légale' },
    { nom: 'Analyse judiciaire', description: 'Approche expertale' },
    { nom: 'Cas complexe', description: 'Situation experte' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Méthode spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances importantes' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Expertise judiciaire' }
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

  const theme = "IC-8 Rang B - Expertise certificats et violences";

  console.log(`✅ IC-8 Rang B expert traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};
