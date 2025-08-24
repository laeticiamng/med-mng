
import { EdnItemData } from '@/types/edn';
import { conceptsRangAIC5, conceptsRangBIC5, colonnesConfigIC5 } from './TableauRangADataIC5';
import { adaptLegacyColumnConfig } from '@/utils/tableauConfigAdapter';

export const isIC5Item = (data: EdnItemData): boolean => {
  if (!data) return false;
  
  // Vérifier le code d'item directement
  if (data.item_code === 'IC-5') return true;
  
  // Vérifier le titre
  if (data.title && data.title.toLowerCase().includes('organisation du système')) return true;
  
  // Vérifier le thème
  if (data.theme) {
    const theme = data.theme.toLowerCase();
    return theme.includes('organisation') || 
           theme.includes('système') || 
           (theme.includes('ic-5') || theme.includes('ic5'));
  }
  
  return false;
};

// Fonction pour détecter si c'est le rang B selon les données
export const isRangBIC5 = (data: EdnItemData): boolean => {
  if (!data) return false;
  
  // Forcer le rang B pour IC-5 quand le thème contient "Rang B"
  const theme = (data.theme || '').toLowerCase();
  const isExplicitRangB = theme.includes('rang b') || theme.includes('expertise');
  
  console.log('🔍 isRangBIC5 - Theme:', theme);
  console.log('📊 isRangBIC5 - Explicit Rang B:', isExplicitRangB);
  
  return isExplicitRangB;
};

export const generateLignesRangAIntelligentIC5 = (data: EdnItemData): string[][] => {
  console.log('🎯 IC-5 Génération Rang A : 4 connaissances selon données');
  
  const lignes: string[][] = [];
  
  // Utiliser les 4 premiers concepts Rang A définis
  conceptsRangAIC5.forEach((concept, index) => {
    console.log(`📝 Ajout concept IC-5 Rang A ${index + 1}/4: ${concept.concept.substring(0, 50)}...`);
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

  console.log(`✅ IC-5 Rang A: ${lignes.length}/4 connaissances générées`);
  return lignes;
};

export const generateLignesRangBIntelligentIC5 = (data: EdnItemData): string[][] => {
  console.log('🎯 IC-5 Génération Rang B : 4 connaissances selon données');
  
  const lignes: string[][] = [];
  
  // Utiliser les 4 concepts Rang B définis
  conceptsRangBIC5.forEach((concept, index) => {
    console.log(`📝 Ajout concept IC-5 Rang B ${index + 1}/4: ${concept.concept.substring(0, 50)}...`);
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

  console.log(`✅ IC-5 Rang B: ${lignes.length}/4 connaissances générées`);
  return lignes;
};

export const determinerColonnesUtilesIC5 = (lignes: string[][]): import('@/types/edn').ColumnConfig[] => {
  console.log('🏗️ IC-5: Configuration colonnes optimisée');
  
  // Toutes les colonnes sont pertinentes
  return adaptLegacyColumnConfig(colonnesConfigIC5);
};

// Fonction principale pour traiter les données IC-5
export function processTableauRangAIC5(data: EdnItemData) {
  console.log('🔍 Processing IC-5 Organisation système de santé:', data);
  
  const isRangB = isRangBIC5(data);
  console.log('📊 IC-5 - Est-ce Rang B ?', isRangB);
  
  // Générer les lignes selon le rang
  const lignesEnrichies = isRangB 
    ? generateLignesRangBIntelligentIC5(data)
    : generateLignesRangAIntelligentIC5(data);
  
  console.log('📋 IC-5 - Lignes générées:', lignesEnrichies.length);
  console.log('📋 IC-5 - Contenu lignes:', lignesEnrichies);
  
  // Déterminer les colonnes
  const colonnesUtiles = determinerColonnesUtilesIC5(lignesEnrichies);
  
  const expectedCount = isRangB ? 4 : 4; // IC-5 a 4 compétences A et 4 B
  const actualCount = lignesEnrichies.length;
  
  console.log(`✅ IC-5 ${isRangB ? 'Rang B' : 'Rang A'}: ${actualCount}/${expectedCount} connaissances`);
  
  return {
    lignesEnrichies,
    colonnesUtiles,
    theme: `IC-5 Organisation système de santé - ${isRangB ? 'Rang B (4 connaissances expertes)' : 'Rang A (4 connaissances fondamentales)'}`,
    isRangB,
    isComplete: actualCount === expectedCount
  };
}
