/**
 * Types stricts pour les items EDN
 * Remplace tous les types 'any' par des interfaces TypeScript strictes
 */

// ============================================
// Types de base pour les contenus pédagogiques
// ============================================

export interface TableauSection {
  title?: string;
  content?: string;
  keywords?: string[];
}

export interface TableauRang {
  title?: string;
  sections?: TableauSection[];
  objectifs?: string[];
  competences_cles?: string[];
  situations_cliniques?: string[];
  cas_complexes?: string[]; // Rang B uniquement
  competences_expertes?: string[]; // Rang B uniquement
}

export interface SceneImmersive {
  title?: string;
  description?: string;
  context?: string;
  participants?: Array<{
    name: string;
    role: string;
  }>;
  dialogue?: Array<{
    speaker: string;
    text: string;
    timestamp?: number;
  }>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

export interface QuizQuestions {
  title?: string;
  description?: string;
  questions: QuizQuestion[];
}

export interface AudioAmbiance {
  url?: string;
  title?: string;
  duration?: number;
  volume?: number;
}

export interface VisualAmbiance {
  url?: string;
  type?: 'image' | 'video';
  alt?: string;
  caption?: string;
}

export interface CompetenceOIC {
  id: string;
  rang: 'A' | 'B';
  rubrique?: string;
  intitule?: string;
  texte: string;
  niveau?: string;
}

// ============================================
// Item EDN complet (toutes les données)
// ============================================

export interface EdnItem {
  // Identifiants
  id: string;
  item_code: string;
  slug: string;
  
  // Métadonnées de base
  title: string;
  subtitle?: string;
  created_at: string;
  updated_at: string;
  
  // Métadonnées enrichies
  specialite?: string;
  domaine_medical?: string;
  niveau_complexite?: string;
  mots_cles?: string[];
  tags_medicaux?: string[];
  status?: string;
  
  // Contenus pédagogiques structurés
  tableau_rang_a?: TableauRang;
  tableau_rang_b?: TableauRang;
  paroles_musicales?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  scene_immersive?: SceneImmersive;
  quiz_questions?: QuizQuestions;
  audio_ambiance?: AudioAmbiance;
  visual_ambiance?: VisualAmbiance;
  
  // Payload V2 (format flexible pour évolutions futures)
  payload_v2?: Record<string, unknown>;
  
  // Compteurs et scores
  competences_count_rang_a?: number;
  competences_count_rang_b?: number;
  competences_count_total?: number;
  completeness_score?: number;
  
  // Validation
  is_validated?: boolean;
  validation_date?: string;
  
  // Compétences OIC détaillées
  competences_oic_rang_a?: CompetenceOIC[];
  competences_oic_rang_b?: CompetenceOIC[];
}

// ============================================
// Item EDN léger (vue unifiée pour la liste)
// ============================================

export interface EdnItemUnified {
  // Identifiants
  id: string;
  item_code: string;
  slug: string;
  
  // Métadonnées de base
  title: string;
  subtitle?: string;
  created_at: string;
  updated_at: string;
  
  // Métadonnées enrichies
  specialite?: string;
  domaine_medical?: string;
  niveau_complexite?: string;
  mots_cles?: string[];
  tags_medicaux?: string[];
  status?: string;
  
  // Scores et validation
  completeness_score?: number;
  is_validated?: boolean;
  validation_date?: string;
  
  // Compteurs de compétences
  competences_count_rang_a: number;
  competences_count_rang_b: number;
  competences_count_total: number;
  
  // Flags de disponibilité des contenus (boolean au lieu de charger les gros JSON)
  has_tableau_rang_a: boolean;
  has_tableau_rang_b: boolean;
  has_paroles_musicales: boolean;
  has_paroles_rang_a: boolean;
  has_paroles_rang_b: boolean;
  has_paroles_rang_ab: boolean;
  has_scene_immersive: boolean;
  has_quiz_questions: boolean;
  has_audio_ambiance: boolean;
  has_visual_ambiance: boolean;
  
  // Compétences OIC (pour affichage rapide)
  competences_oic_rang_a?: CompetenceOIC[];
  competences_oic_rang_b?: CompetenceOIC[];
}

// ============================================
// État modal refactorisé
// ============================================

export interface EdnModalState {
  isOpen: boolean;
  item: EdnItem | null;
  activeTab: string;
}

export const INITIAL_MODAL_STATE: EdnModalState = {
  isOpen: false,
  item: null,
  activeTab: 'overview',
};

// ============================================
// Types pour les filtres
// ============================================

export type QuickFilterType = 'all' | 'complete' | 'incomplete' | 'validated';
export type SortByType = 'item_code' | 'completeness_score' | 'updated_at';
export type CategoryType = 'all' | 'complete' | 'withMusic';
