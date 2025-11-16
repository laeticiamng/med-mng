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

// ============================================
// Types pour l'enrichissement et l'analyse
// ============================================

export type ItemStatus = 'active' | 'draft' | 'archived' | 'restored_from_backup' | 'deprecated';
export type NiveauComplexite = 'debutant' | 'intermediaire' | 'avance' | 'expert';
export type QualityGrade = 'Excellent' | 'Très bon' | 'Bon' | 'Satisfaisant' | 'Moyen' | 'Insuffisant';

export interface QualityDetail {
  component: string;
  score: number;
  status: 'present' | 'missing' | 'partial';
  count?: number;
}

export interface EdnQualityReport {
  item_code: string;
  title: string;
  quality_score: number;
  quality_grade: QualityGrade;
  completeness_percentage: number;
  quality_details: QualityDetail[];
  missing_elements: string[];
  suggestions: string[];
  competences_count: {
    rang_a: number;
    rang_b: number;
    total: number;
  };
  is_validated: boolean;
  analyzed_at: string;
}

export interface EdnEnrichmentResult {
  item_code: string;
  enriched: boolean;
  extracted_keywords_count: number;
  inferred_complexity: NiveauComplexite;
  medical_tags_count: number;
  timestamp: string;
}

export interface EdnGlobalStats {
  total_items: number;
  complete_items: number;
  incomplete_items: number;
  validated_items: number;
  avg_completeness: number;
  avg_competences_per_item: number;
  total_competences_rang_a: number;
  total_competences_rang_b: number;
  items_with_tableau_a: number;
  items_with_tableau_b: number;
  items_with_music: number;
  items_with_immersive: number;
  items_with_quiz: number;
  last_update: string;
}

export interface EdnStatsBySpecialite {
  specialite: string;
  domaine_medical: string;
  item_count: number;
  avg_completeness: number;
  avg_competences: number;
  validated_count: number;
  item_codes: string[];
}

export interface EdnQualityGlobalReport {
  total_items: number;
  average_quality_score: number;
  quality_distribution: {
    excellent: number;
    tres_bon: number;
    bon: number;
    satisfaisant: number;
    moyen: number;
    insuffisant: number;
  };
  items_with_all_components: number;
  items_validated: number;
  last_refresh: string;
}

export interface EdnSearchResult {
  item_code: string;
  title: string;
  subtitle?: string;
  specialite?: string;
  completeness_score: number;
  rank: number;
}

export interface EdnSimilarItem {
  item_code: string;
  title: string;
  similarity_score: number;
  shared_tags: number;
}

// ============================================
// Types pour les analytics avancées
// ============================================

export type SessionType = 'study' | 'quiz' | 'music' | 'immersive';
export type RecommendationType = 'next_study' | 'review' | 'difficulty_match' | 'interest_based';

export interface EdnAnalytics {
  id: string;
  item_code: string;
  user_id: string;
  session_type: SessionType;
  engagement_score: number;
  completion_rate: number;
  time_spent_minutes: number;
  learning_progress: Record<string, unknown>;
  user_feedback: Record<string, unknown>;
  performance_metrics: Record<string, unknown>;
  created_at: string;
  session_metadata: Record<string, unknown>;
}

export interface EdnRecommendation {
  id: string;
  user_id: string;
  recommended_item_code: string;
  recommendation_type: RecommendationType;
  confidence_score: number;
  reasoning: string;
  metadata: Record<string, unknown>;
  is_active: boolean;
  expires_at: string;
  created_at: string;
}

export interface EdnLearningPath {
  user_level: {
    overall_progress: number;
    strong_areas: string[];
    improvement_areas: string[];
    avg_engagement: number;
  };
  recommended_items: Array<{
    item_code: string;
    title: string;
    difficulty_match: number;
    interest_prediction: number;
  }>;
  generated_at: string;
  expires_at: string;
}

// ============================================
// Types pour l'audit
// ============================================

export type AuditStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

export interface EdnAuditRecord {
  id: string;
  item_code: string;
  audit_date: string;
  completeness_score?: number;
  rang_a_complete?: boolean;
  rang_b_complete?: boolean;
  missing_rang_a?: string[];
  missing_rang_b?: string[];
  ai_analysis?: Record<string, unknown>;
  suggestions?: string;
  status: AuditStatus;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Types pour le progrès utilisateur
// ============================================

export type UserProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered';

export interface UserEdnProgress {
  id: string;
  user_id: string;
  item_number: string;
  status: UserProgressStatus;
  score: number;
  time_spent_minutes: number;
  last_reviewed_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgressSummary {
  total_items: number;
  completed_items: number;
  in_progress_items: number;
  mastered_items: number;
  not_started_items: number;
  total_time_spent: number;
  average_score: number;
}
