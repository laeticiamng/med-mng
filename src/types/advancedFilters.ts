/**
 * Types pour les filtres avancés de recherche EDN
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'all';
export type ProgressStatus = 'not-started' | 'in-progress' | 'completed' | 'all';
export type ReadingTimeRange = [number, number]; // [min, max] en minutes

export interface AdvancedFilters {
  // Catégories
  specialite?: string;
  domaineMedical?: string;
  
  // Difficulté
  difficulty: DifficultyLevel;
  
  // Temps de lecture (en minutes)
  readingTimeMin: number;
  readingTimeMax: number;
  
  // Statut de progression
  progressStatus: ProgressStatus;
  
  // Contenu disponible
  hasMusic: boolean;
  hasQuiz: boolean;
  hasBD: boolean;
  hasTableauA: boolean;
  hasTableauB: boolean;
  
  // Validation
  isValidated: boolean | null;
  
  // Score de complétude
  minCompletenessScore: number;
}

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  difficulty: 'all',
  readingTimeMin: 5,
  readingTimeMax: 60,
  progressStatus: 'all',
  hasMusic: false,
  hasQuiz: false,
  hasBD: false,
  hasTableauA: false,
  hasTableauB: false,
  isValidated: null,
  minCompletenessScore: 0,
};

export interface SavedFilter {
  id: string;
  name: string;
  filters: AdvancedFilters;
  createdAt: string;
  isFavorite: boolean;
}
