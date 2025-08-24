/**
 * Adaptateur pour convertir les configurations de colonnes existantes 
 * vers le nouveau format ColumnConfig
 */

import { ColumnConfig } from '@/types/edn';

interface LegacyColumnConfig {
  nom: string;
  couleur?: string;
  couleurCellule?: string;
  couleurTexte?: string;
  icone?: string;
  obligatoire?: boolean;
}

export function adaptLegacyColumnConfig(legacyConfig: LegacyColumnConfig[]): ColumnConfig[] {
  return legacyConfig.map((config, index) => ({
    key: `col_${index}`,
    label: config.nom,
    width: '150px',
    obligatoire: config.obligatoire ?? true,
    description: `Colonne ${config.nom}`
  }));
}

export function createStandardColumnConfig(labels: string[]): ColumnConfig[] {
  return labels.map((label, index) => ({
    key: `col_${index}`,
    label: label,
    width: '150px',
    obligatoire: index < 2, // Les 2 premières colonnes sont toujours obligatoires
    description: `Colonne ${label}`
  }));
}

export const standardEdnColumns: ColumnConfig[] = [
  { key: 'concept', label: 'Concept', width: '200px', obligatoire: true, description: 'Concept principal' },
  { key: 'definition', label: 'Définition', width: '250px', obligatoire: true, description: 'Définition précise' },
  { key: 'exemple', label: 'Exemple', width: '200px', obligatoire: false, description: 'Exemple concret' },
  { key: 'piege', label: 'Piège', width: '180px', obligatoire: false, description: 'Piège à éviter' },
  { key: 'mnemo', label: 'Moyen mnémotechnique', width: '180px', obligatoire: false, description: 'Aide mémoire' },
  { key: 'subtilite', label: 'Subtilité', width: '180px', obligatoire: false, description: 'Point important' },
  { key: 'application', label: 'Application', width: '180px', obligatoire: false, description: 'Application pratique' },
  { key: 'vigilance', label: 'Vigilance', width: '180px', obligatoire: false, description: 'Point de vigilance' }
];