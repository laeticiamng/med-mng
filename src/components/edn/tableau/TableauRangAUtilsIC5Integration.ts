
import { conceptsRangAIC5, conceptsRangBIC5, colonnesConfigIC5 } from './TableauRangADataIC5';

export const isIC5Item = (data: any): boolean => {
  return data?.theme?.toLowerCase().includes('organisation') ||
         data?.theme?.toLowerCase().includes('système') ||
         data?.theme?.toLowerCase().includes('santé') ||
         data?.title?.toLowerCase().includes('ic-5') ||
         data?.title?.toLowerCase().includes('organisation du système');
};

export const processTableauRangAIC5 = (data: any) => {
  const concepts = data?.rang === 'B' ? conceptsRangBIC5 : conceptsRangAIC5;
  
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
    colonnesUtiles: colonnesConfigIC5,
    theme: data?.rang === 'B' ? 'IC-5 Rang B - Expertise en organisation du système de santé' : 'IC-5 Rang A - Fondamentaux de l\'organisation du système de santé',
    isRangB: data?.rang === 'B'
  };
};
