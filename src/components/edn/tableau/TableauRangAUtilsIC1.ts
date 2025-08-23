
import { conceptsRangAIC1, colonnesConfigIC1 } from './TableauRangADataIC1';
import { logger } from '@/lib/logger';
import type { ColonneConfig, EDNItem } from '@/types';

// Fonction pour déterminer les colonnes utiles selon le contenu IC-1
export function determinerColonnesUtilesIC1(lignes: string[][]): ColonneConfig[] {
  return colonnesConfigIC1;
}

// Fonction pour générer les lignes enrichies spécifiquement pour IC-1
export function generateLignesRangAIC1(data: EDNItem): string[][] {
  logger.info('IC-1 Génération : 15 connaissances selon E-LiSA', { 
    component: 'TableauRangAUtilsIC1',
    action: 'generateLignesRangAIC1' 
  });
  
  const lignes: string[][] = [];
  
  // Utiliser uniquement les 15 concepts Rang A définis selon E-LiSA
  conceptsRangAIC1.forEach(concept => {
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

  logger.info(`IC-1: ${lignes.length}/15 connaissances E-LiSA générées`, {
    component: 'TableauRangAUtilsIC1',
    count: lignes.length
  });
  return lignes;
}
