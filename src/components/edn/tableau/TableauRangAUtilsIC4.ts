
import { conceptsRangAIC4, conceptsRangBIC4, colonnesConfigIC4 } from './TableauRangADataIC4';

export const generateLignesRangAIntelligentIC4 = (data: any): string[][] => {
  console.log('IC-4 Génération Rang A : 13 connaissances selon LiSA exactement');
  
  const lignes: string[][] = [];
  
  // Utiliser uniquement les 13 concepts Rang A définis selon LiSA
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

  console.log(`IC-4 Rang A: ${lignes.length}/13 connaissances LiSA générées`);
  return lignes;
};

export const generateLignesRangBIntelligentIC4 = (data: any): string[][] => {
  console.log('IC-4 Génération Rang B : 22 connaissances selon LiSA exactement');
  
  const lignes: string[][] = [];
  
  // Utiliser uniquement les 22 concepts Rang B définis selon LiSA (commencer avec les 4 premiers)
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

  console.log(`IC-4 Rang B: ${lignes.length}/22 connaissances LiSA générées (structure initiale)`);
  return lignes;
};

export const determinerColonnesUtilesIC4 = (lignes: string[][]): any[] => {
  console.log('IC-4: Configuration colonnes optimisée pour structure LiSA officielle');
  
  // Toutes les colonnes sont pertinentes selon le format LiSA
  return colonnesConfigIC4;
};
