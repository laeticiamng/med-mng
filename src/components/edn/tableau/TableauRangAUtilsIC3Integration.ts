
import { conceptsRangAIC3, conceptsRangBIC3 } from './TableauRangADataIC3Concepts';
import { colonnesConfigIC3 } from './TableauRangADataIC3Config';
import type { ProcessingData, EDNItem } from '@/types';

export const isIC3Item = (data: ProcessingData | EDNItem): boolean => {
  return data?.item_code === 'IC-3' ||
         data?.theme?.toLowerCase().includes('raisonnement') ||
         data?.theme?.toLowerCase().includes('décision') ||
         data?.theme?.toLowerCase().includes('scientifique') ||
         data?.title?.toLowerCase().includes('ic-3') ||
         data?.title?.toLowerCase().includes('démarche scientifique');
};

// Utilitaires pour l'intégration des données IC-3
export const processTableauRangAIC3 = (data: ProcessingData | EDNItem) => {
  const isRangB = (data as ProcessingData).rang === 'B' || data?.theme?.includes('Rang B');
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
