import { conceptsRangAIC4, conceptsRangBIC4, colonnesConfigIC4 } from './TableauRangADataIC4';

interface IC4TableauData {
  item_code?: string;
  title?: string;
  theme?: string;
  rang?: 'A' | 'B';
}

interface ColonneConfig {
  nom: string;
  couleur: string;
  couleurCellule: string;
  couleurTexte: string;
}

export const generateLignesRangAIntelligentIC4 = (_data: IC4TableauData | null | undefined): string[][] => {
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

export const generateLignesRangBIntelligentIC4 = (_data: IC4TableauData | null | undefined): string[][] => {
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

export const determinerColonnesUtilesIC4 = (_lignes: string[][]): ColonneConfig[] => {
  return colonnesConfigIC4;
};
