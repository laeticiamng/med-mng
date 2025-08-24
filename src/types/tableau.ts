/**
 * Types spécialisés pour les tableaux EDN
 */

import { EdnItemData, ColumnConfig } from './edn';

export interface ConceptTableau {
  concept: string;
  definition: string;
  exemple: string;
  piege?: string;
  mnemo?: string;
  subtilite?: string;
  application?: string;
  vigilance?: string;
  analyse?: string;
  cas?: string;
  ecueil?: string;
  technique?: string;
  maitrise?: string;
  excellence?: string;
}

export interface TableauProcessingData extends Omit<EdnItemData, 'sections'> {
  sections?: Array<{
    title: string;
    concepts: ConceptTableau[];
    columns?: string[];
  }>;
}

export interface TableauResult {
  lignesEnrichies: string[][];
  colonnesUtiles: ColumnConfig[];
  theme?: string;
  isComplete?: boolean;
  isRangB?: boolean;
  expectedCount?: number;
  actualCount?: number;
}

export interface ProcessingFunction {
  (data: TableauProcessingData): TableauResult;
}

export interface ConceptMappingFunction {
  (concept: ConceptTableau): string[];
}

export interface LegacyColumnData {
  nom?: string;
  icone?: string;
  couleur?: string;
  couleurCellule?: string;
  couleurTexte?: string;
  obligatoire?: boolean;
}

export type TableauDataProcessor = (data: TableauProcessingData) => string[][];
export type ColumnDeterminer = (lignes: string[][]) => ColumnConfig[];
export type ItemDetector = (data: TableauProcessingData) => boolean;