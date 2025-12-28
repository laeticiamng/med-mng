
import { conceptsRangAIC5, conceptsRangBIC5, colonnesConfigIC5 } from './TableauRangADataIC5';

// Fonction pour détecter si c'est l'item IC-5 (vérification exacte)
export const isIC5Item = (data: any): boolean => {
  if (!data) return false;
  
  // Vérification exacte du code
  if (data.item_code === 'IC-5') return true;
  
  // Vérifier le titre spécifique à IC-5
  const title = data.title?.toLowerCase() || '';
  if (title.includes('gestion des erreurs et des plaintes') || title.includes('aléa thérapeutique')) return true;
  
  // Vérifier avec regex pour éviter les faux positifs
  const theme = data.theme || '';
  return /\bIC-5\b/i.test(theme);
};

// Fonction pour détecter si c'est le rang B selon les données
export const isRangBIC5 = (data: any): boolean => {
  if (!data) return false;
  
  // Forcer le rang B pour IC-5 quand le thème contient "Rang B"
  const theme = (data.theme || '').toLowerCase();
  const isExplicitRangB = theme.includes('rang b') || theme.includes('expertise');
  
  return isExplicitRangB;
};

export const generateLignesRangAIntelligentIC5 = (data: any): string[][] => {
  const lignes: string[][] = [];
  
  // Utiliser les 4 premiers concepts Rang A définis
  conceptsRangAIC5.forEach((concept) => {
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

export const generateLignesRangBIntelligentIC5 = (data: any): string[][] => {
  const lignes: string[][] = [];
  
  // Utiliser les 4 concepts Rang B définis
  conceptsRangBIC5.forEach((concept) => {
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

export const determinerColonnesUtilesIC5 = (lignes: string[][]): any[] => {
  // Toutes les colonnes sont pertinentes
  return colonnesConfigIC5;
};

// Fonction principale pour traiter les données IC-5
export function processTableauRangAIC5(data: any) {
  const isRangB = isRangBIC5(data);
  
  // Générer les lignes selon le rang
  const lignesEnrichies = isRangB 
    ? generateLignesRangBIntelligentIC5(data)
    : generateLignesRangAIntelligentIC5(data);
  
  // Déterminer les colonnes
  const colonnesUtiles = determinerColonnesUtilesIC5(lignesEnrichies);
  
  const expectedCount = isRangB ? 4 : 4; // IC-5 a 4 compétences A et 4 B
  const actualCount = lignesEnrichies.length;
  
  return {
    lignesEnrichies,
    colonnesUtiles,
    theme: `IC-5 Organisation système de santé - ${isRangB ? 'Rang B (4 connaissances expertes)' : 'Rang A (4 connaissances fondamentales)'}`,
    isRangB,
    isComplete: actualCount === expectedCount
  };
}
