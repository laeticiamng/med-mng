/**
 * Unified TableauRangA utilities - replaces multiple IC-specific files
 * Centralized processing for all IC items with optimized performance
 */

import { ColumnConfig, TableauData, TableauGenerationResult } from '@/types/edn';
import { adaptLegacyColumnConfig } from '@/utils/tableauConfigAdapter';

// Standard tableau processing for all IC items
export const processTableauData = (data: TableauData, itemCode: string): TableauGenerationResult => {
  const theme = data.theme || '';
  const isRangB = theme.toLowerCase().includes('rang b') || theme.toLowerCase().includes('expert');
  
  // Enhanced data processing with specific IC logic
  const enrichedData = enhanceTableauData(data, itemCode);
  const lignes = generateOptimizedRows(enrichedData, isRangB);
  const colonnes = determineOptimalColumns(lignes);
  
  const actualCount = lignes.length;
  const expectedCount = getExpectedCountForItem(itemCode, isRangB);
  
  return {
    lignes,
    colonnes,
    metadata: {
      totalConcepts: actualCount,
      rangACount: isRangB ? 0 : actualCount,
      rangBCount: isRangB ? actualCount : 0,
      theme: `${itemCode} - ${isRangB ? 'Expert' : 'Foundational'} Knowledge`,
      objectifs: generateObjectives(itemCode, isRangB),
      competences: generateCompetencies(itemCode, isRangB),
      completeness: Math.min(100, (actualCount / expectedCount) * 100)
    }
  };
};

const enhanceTableauData = (data: TableauData, itemCode: string): TableauData => {
  // Unified enhancement logic for all IC items
  return {
    ...data,
    sections: data.sections || [],
    competences: data.competences || [],
    items: data.items || []
  };
};

const generateOptimizedRows = (data: TableauData, isRangB: boolean): string[][] => {
  const rows: string[][] = [];
  
  if (data.sections && data.sections.length > 0) {
    data.sections.forEach((section: any) => {
      if (section && typeof section === 'object') {
        const row = [
          section.concept || section.title || '',
          section.definition || section.description || '',
          section.exemple || section.example || '',
          section.piege || section.pitfall || '',
          section.mnemo || section.mnemonic || '',
          section.subtilite || section.subtlety || '',
          section.application || '',
          section.vigilance || section.warning || ''
        ];
        rows.push(row);
      }
    });
  }
  
  return rows;
};

const determineOptimalColumns = (lignes: string[][]): ColumnConfig[] => {
  // Standard column configuration for all tableau items
  return [
    { key: 'concept', label: 'Concept clé', width: '20%' },
    { key: 'definition', label: 'Définition', width: '15%' },
    { key: 'exemple', label: 'Exemple clinique', width: '15%' },
    { key: 'piege', label: 'Piège à éviter', width: '12%' },
    { key: 'mnemo', label: 'Moyen mnémotechnique', width: '12%' },
    { key: 'subtilite', label: 'Subtilité importante', width: '13%' },
    { key: 'application', label: 'Application pratique', width: '8%' },
    { key: 'vigilance', label: 'Point de vigilance', width: '5%' }
  ];
};

const getExpectedCountForItem = (itemCode: string, isRangB: boolean): number => {
  // Define expected counts for different IC items
  const itemCounts: Record<string, { rangA: number; rangB: number }> = {
    'IC-2': { rangA: 7, rangB: 2 },
    'IC-4': { rangA: 13, rangB: 22 },
    'IC-5': { rangA: 4, rangB: 4 },
    'IC-6': { rangA: 8, rangB: 12 },
    'IC-7': { rangA: 6, rangB: 8 },
    'IC-8': { rangA: 5, rangB: 7 },
    'IC-9': { rangA: 5, rangB: 7 },
    'IC-10': { rangA: 10, rangB: 15 }
  };
  
  const counts = itemCounts[itemCode] || { rangA: 5, rangB: 8 };
  return isRangB ? counts.rangB : counts.rangA;
};

const generateObjectives = (itemCode: string, isRangB: boolean): string[] => {
  const baseObjectives = [
    `Maîtriser les connaissances ${isRangB ? 'expertes' : 'fondamentales'} de ${itemCode}`,
    `Appliquer les concepts clés dans la pratique clinique`,
    `Identifier les pièges et points de vigilance importants`
  ];
  
  return baseObjectives;
};

const generateCompetencies = (itemCode: string, isRangB: boolean): string[] => {
  const baseCompetencies = [
    `Définir précisément les concepts de ${itemCode}`,
    `Reconnaître les applications cliniques pertinentes`,
    `Éviter les erreurs courantes et pièges diagnostiques`
  ];
  
  return baseCompetencies;
};

// Backward compatibility exports
export const processIC2Data = (data: TableauData) => processTableauData(data, 'IC-2');
export const processIC4Data = (data: TableauData) => processTableauData(data, 'IC-4');
export const processIC5Data = (data: TableauData) => processTableauData(data, 'IC-5');
export const processIC6Data = (data: TableauData) => processTableauData(data, 'IC-6');
export const processIC7Data = (data: TableauData) => processTableauData(data, 'IC-7');
export const processIC8Data = (data: TableauData) => processTableauData(data, 'IC-8');
export const processIC9Data = (data: TableauData) => processTableauData(data, 'IC-9');
export const processIC10Data = (data: TableauData) => processTableauData(data, 'IC-10');