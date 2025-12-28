// Utilitaires pour l'intégration des données IC-6
export const processTableauRangAIC6 = (data: any) => {
  const tableauData = data.tableau_rang_a || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Notion clé organisation' },
    { nom: 'Définition', description: 'Explication précise' },
    { nom: 'Exemple', description: 'Cas concret pratique' },
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

  const theme = "IC-6 - Organisation de l'exercice clinique et sécurisation du parcours patient";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const isIC6Item = (data: any): boolean => {
  return data?.item_code === 'IC-6' || 
         data?.title?.includes('Organisation de l\'exercice clinique') ||
         data?.theme?.includes('IC-6');
};
