import logger from '@/lib/logger';


// Utilitaires pour l'affichage du Tableau Rang B IC-9
export const processTableauRangBIC9 = (data: any) => {
  logger.debug('🔍 Traitement avancé IC-9 Rang B');
  
  // Extraire les données des concepts experts
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept expert', description: 'Expertise médico-légale' },
    { nom: 'Analyse légale', description: 'Approche judiciaire' },
    { nom: 'Cas complexe', description: 'Situation experte' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Méthode spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances légales' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Expertise reconnue' }
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

  const theme = "IC-9 Rang B - Expertise médico-légale avancée";

  logger.debug(`✅ IC-9 Rang B expert traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};
