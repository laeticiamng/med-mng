
import { determinerColonnesUtilesIC1, generateLignesRangAIC1 } from './TableauRangAUtilsIC1';
import { logger } from '@/lib/logger';
import type { EdnItem, ProcessingData, TableauResult } from '@/types';

// Fonction principale pour traiter les données IC-1 selon E-LiSA officielle
export function processTableauRangAIC1(data: ProcessingData | EdnItem): TableauResult {
  logger.info('ui', 'Processing IC-1 selon fiche E-LiSA officielle', { 
    component: 'TableauRangAUtilsIC1Integration',
    itemCode: data.item_code || 'unknown'
  });
  
  // Générer les lignes enrichies spécifiquement pour IC-1 (15 connaissances)
  const lignesEnrichies = generateLignesRangAIC1(data);
  
  // Déterminer les colonnes utiles
  const colonnesUtiles = determinerColonnesUtilesIC1(lignesEnrichies);
  
  const expectedCount = 15;
  const actualCount = lignesEnrichies.length;
  
  logger.info('ui', `IC-1 E-LiSA : ${actualCount}/${expectedCount} connaissances`, {
    component: 'TableauRangAUtilsIC1Integration',
    expectedCount,
    actualCount
  });
  
  return {
    lignesEnrichies,
    colonnesUtiles,
    theme: "IC-1 : La relation médecin-malade - 15 connaissances E-LiSA",
    isComplete: actualCount === expectedCount
  };
}

// Fonction pour vérifier si c'est l'item IC-1
export function isIC1Item(data: ProcessingData | EdnItem): boolean {
  if (!data) return false;
  
  const theme = data.theme?.toLowerCase() || '';
  const title = data.title?.toLowerCase() || '';
  
  return theme.includes('relation médecin-malade') || 
         theme.includes('relation medecin-malade') ||
         title.includes('relation médecin-malade') ||
         title.includes('relation medecin-malade') ||
         theme.includes('ic-1') || theme.includes('ic1');
}
