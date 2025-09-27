
import { logger } from '@/lib/logger';
import { conceptsRangAIC4, conceptsRangBIC4, colonnesConfigIC4 } from './TableauRangADataIC4';
import { TableauData, ColumnConfig } from '@/types/edn';
import { adaptLegacyColumnConfig } from '@/utils/tableauConfigAdapter';

export const generateLignesRangAIntelligentIC4 = (data: TableauData): string[][] => {
  logger.debug('IC-4 Génération Rang A : 13 connaissances selon LiSA exactement', {
    component: 'TableauRangAUtilsIC4'
  });
  
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

  logger.debug(`IC-4 Rang A: ${lignes.length}/13 connaissances LiSA générées`, {
    component: 'TableauRangAUtilsIC4'
  });
  return lignes;
};

export const generateLignesRangBIntelligentIC4 = (data: TableauData): string[][] => {
  logger.debug('IC-4 Génération Rang B : 22 connaissances selon LiSA exactement', {
    component: 'TableauRangAUtilsIC4'
  });
  
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

  logger.debug(`IC-4 Rang B: ${lignes.length}/22 connaissances LiSA générées (structure initiale)`, {
    component: 'TableauRangAUtilsIC4'
  });
  return lignes;
};

export const determinerColonnesUtilesIC4 = (lignes: string[][]): ColumnConfig[] => {
  logger.debug('IC-4: Configuration colonnes optimisée pour structure LiSA officielle', {
    component: 'TableauRangAUtilsIC4'
  });
  
  // Toutes les colonnes sont pertinentes selon le format LiSA
  return adaptLegacyColumnConfig(colonnesConfigIC4);
};
