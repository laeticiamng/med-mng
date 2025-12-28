
import { conceptsRangAIC3, conceptsRangBIC3 } from './TableauRangADataIC3Concepts';
import { colonnesConfigIC3 } from './TableauRangADataIC3Config';

interface IC3TableauData {
  item_code?: string;
  title?: string;
  theme?: string;
  rang?: 'A' | 'B';
}

// Fonction pour détecter si c'est l'item IC-3 (vérification exacte)
export const isIC3Item = (data: IC3TableauData | null | undefined): boolean => {
  if (!data) return false;
  
  // Vérification exacte du code
  if (data.item_code === 'IC-3') return true;
  
  // Vérifier le titre spécifique à IC-3
  const title = data.title?.toLowerCase() || '';
  if (title.includes('raisonnement médical') || title.includes('raisonnement et décision')) return true;
  
  // Vérifier avec regex pour éviter les faux positifs
  const theme = data.theme || '';
  return /\bIC-3\b/i.test(theme);
};

export const processTableauRangAIC3 = (data: IC3TableauData | null | undefined) => {
  const isRangB = data?.rang === 'B' || data?.theme?.includes('Rang B');
  const concepts = isRangB ? conceptsRangBIC3 : conceptsRangAIC3;
  
  const lignesEnrichies = concepts.map(concept => [
    concept.concept,
    concept.definition,
    concept.exemple,
    concept.piege,
    concept.mnemo,
    concept.subtilite,
    concept.application,
    concept.vigilance
  ]);

  return {
    lignesEnrichies,
    colonnesUtiles: colonnesConfigIC3,
    theme: isRangB ? 'IC-3 Rang B - Expertise en raisonnement médical (8 concepts)' : 'IC-3 Rang A - Fondamentaux du raisonnement médical (15 concepts)',
    isRangB,
    isComplete: lignesEnrichies.length > 0
  };
};
