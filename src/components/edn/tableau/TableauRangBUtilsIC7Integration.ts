
// Utilitaires pour l'affichage du Tableau Rang B IC-7
export const processTableauRangBIC7 = (data: any) => {
  console.log('🔍 Traitement avancé IC-7 Rang B');
  
  // Extraire les données des concepts experts
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept expert', description: 'Expertise anti-discrimination' },
    { nom: 'Approche intersectionnelle', description: 'Analyse multifactorielle' },
    { nom: 'Cas complexe', description: 'Situation discriminatoire' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Méthode spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances importantes' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Leadership inclusif' }
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

  const theme = "IC-7 Rang B - Expertise lutte contre discriminations";

  console.log(`✅ IC-7 Rang B expert traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};
