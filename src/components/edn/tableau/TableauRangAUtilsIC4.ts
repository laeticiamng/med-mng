import { conceptsRangAIC4, conceptsRangBIC4, colonnesConfigIC4 } from './TableauRangADataIC4';

export const generateLignesRangAIntelligentIC4 = (data: any): string[][] => {
  const lignes: string[][] = [];
  
  conceptsRangAIC4.forEach(concept => {
    const ligne = [
      concept.concept,
      concept.definition,
      concept.exemple,
      concept.piege,
      concept.mnemo,
      concept.subtilite,
      concept.application,
      concept.vigilance
    ];
    lignes.push(ligne);
  });

  return lignes;
};

export const generateLignesRangBIntelligentIC4 = (data: any): string[][] => {
  const lignes: string[][] = [];
  
  conceptsRangBIC4.forEach(concept => {
    const ligne = [
      concept.concept,
      concept.definition,
      concept.exemple,
      concept.piege,
      concept.mnemo,
      concept.subtilite,
      concept.application,
      concept.vigilance
    ];
    lignes.push(ligne);
  });

  return lignes;
};

export const determinerColonnesUtilesIC4 = (lignes: string[][]): any[] => {
  return colonnesConfigIC4;
};
