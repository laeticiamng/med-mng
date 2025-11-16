// ============================================================================
// Types for Revision Methods System
// ============================================================================

export type RevisionMethodType = 'J_METHOD' | 'BLOCK_METHOD' | 'QCM_FIRST';

export type RevisionItemType = 'fiche' | 'sd' | 'edn_item' | 'qcm' | 'cas_clinique';

export type RevisionStatus = 'PENDING' | 'DONE' | 'MISSED' | 'SKIPPED';

// ============================================================================
// User Profile with Revision Method
// ============================================================================

export interface UserProfileWithRevisionMethod {
  id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  revision_method: RevisionMethodType;
  revision_method_config: RevisionMethodConfig;
  revision_method_changed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Revision Method Configurations
// ============================================================================

export interface JMethodConfig {
  intervals: number[]; // Ex: [2, 7, 14, 30]
  auto_schedule: boolean;
}

export interface BlockMethodConfig {
  items_per_day: number;
  target_date: string; // ISO date
  selected_items: string[]; // UUIDs
}

export interface QCMFirstConfig {
  questions_per_session: number;
  min_error_threshold: number; // Threshold pour suggérer une fiche (ex: 50%)
  auto_suggest_fiches: boolean;
}

export type RevisionMethodConfig =
  | { method: 'J_METHOD'; config: JMethodConfig }
  | { method: 'BLOCK_METHOD'; config: BlockMethodConfig }
  | { method: 'QCM_FIRST'; config: QCMFirstConfig };

// ============================================================================
// Revision Schedule
// ============================================================================

export interface RevisionScheduleItem {
  id: string;
  user_id: string;
  item_id: string;
  item_type: RevisionItemType;
  item_code: string;
  scheduled_for: Date;
  revision_method: RevisionMethodType;
  status: RevisionStatus;
  completed_at?: Date;
  revision_number?: number;
  interval_days?: number;
  priority_score?: number;
  success_rate?: number;
  time_spent_minutes?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RevisionScheduleInsert {
  user_id: string;
  item_id: string;
  item_type: RevisionItemType;
  item_code: string;
  scheduled_for: Date;
  revision_method: RevisionMethodType;
  status?: RevisionStatus;
  revision_number?: number;
  interval_days?: number;
  priority_score?: number;
}

// ============================================================================
// Method Effectiveness Tracking
// ============================================================================

export interface RevisionMethodEffectiveness {
  id: string;
  user_id: string;
  revision_method: RevisionMethodType;
  total_sessions: number;
  completed_sessions: number;
  average_success_rate: number;
  average_time_per_session: number; // minutes
  streak_days: number;
  longest_streak: number;
  total_items_reviewed: number;
  mastery_improvement_rate: number;
  period_start: Date;
  period_end?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Block Method Specific
// ============================================================================

export interface BlockMethodConfigDB {
  id: string;
  user_id: string;
  items_per_day: number;
  target_date: Date;
  selected_items: string[]; // UUIDs
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// QCM First Specific
// ============================================================================

export interface QCMFirstSession {
  id: string;
  user_id: string;
  session_date: Date;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  success_rate?: number;
  suggested_fiches: string[]; // UUIDs
  fiches_reviewed: string[]; // UUIDs
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Statistics and Analytics
// ============================================================================

export interface RevisionMethodStats {
  current_method: RevisionMethodType;
  total_scheduled: number;
  completed_today: number;
  pending_today: number;
  overdue_count: number;
  completion_rate: number;
  average_success_rate?: number;
}

export interface TodayRevisionItem {
  id: string;
  item_id: string;
  item_type: RevisionItemType;
  item_code: string;
  scheduled_for: Date;
  revision_method: RevisionMethodType;
  status: RevisionStatus;
  revision_number?: number;
  priority_score?: number;
}

export interface OverdueRevisionItem {
  id: string;
  item_id: string;
  item_code: string;
  scheduled_for: Date;
  days_overdue: number;
}

// ============================================================================
// Method Descriptions (for UI)
// ============================================================================

export interface RevisionMethodDescription {
  id: RevisionMethodType;
  name: string;
  shortDescription: string;
  fullDescription: string;
  emoji: string;
  benefits: string[];
  bestFor: string[];
  example: string;
}

export const REVISION_METHODS: Record<RevisionMethodType, RevisionMethodDescription> = {
  J_METHOD: {
    id: 'J_METHOD',
    name: 'Méthode des J 2.0',
    shortDescription: 'Répétition espacée optimisée',
    fullDescription: 'Tu revois chaque notion plusieurs fois après l\'avoir apprise : J0, J+2, J+7, J+14, J+30. Objectif : consolider ta mémoire sans t\'épuiser.',
    emoji: '📅',
    benefits: [
      'Mémorisation à long terme optimale',
      'Révisions automatiquement planifiées',
      'Consolidation progressive des connaissances'
    ],
    bestFor: [
      'Préparation sur plusieurs semaines/mois',
      'Consolidation durable des connaissances',
      'Étudiants disciplinés et réguliers'
    ],
    example: 'Tu découvres la fiche "Diabète de type 2" aujourd\'hui → révisions automatiques prévues à J+2, J+7, J+14, J+30'
  },
  BLOCK_METHOD: {
    id: 'BLOCK_METHOD',
    name: 'Méthode Blocs Profonds',
    shortDescription: 'Deep focus sur peu d\'items',
    fullDescription: 'Chaque jour, tu travailles un petit nombre d\'items à fond (fiche + QCM). Idéal si tu préfères te poser longtemps sur un sujet plutôt que de saupoudrer.',
    emoji: '🎯',
    benefits: [
      'Concentration maximale sur chaque sujet',
      'Compréhension approfondie',
      'Moins de stress mental (focus limité)'
    ],
    bestFor: [
      'Sujets complexes nécessitant du temps',
      'Étudiants préférant le deep work',
      'Préparation intensive courte durée'
    ],
    example: 'Objectif : 5 items/jour pendant 30 jours → chaque jour : lecture active + QCM + synthèse sur ces 5 items uniquement'
  },
  QCM_FIRST: {
    id: 'QCM_FIRST',
    name: 'Méthode QCM First',
    shortDescription: 'Questions → Fiche ciblée',
    fullDescription: 'Tu commences par les QCM et les cas, puis tu revois uniquement les fiches où tu as le plus de mal. Idéal si tu apprends mieux en te testant d\'abord.',
    emoji: '❓',
    benefits: [
      'Apprentissage actif immédiat',
      'Identification rapide des lacunes',
      'Révisions ciblées sur les faiblesses'
    ],
    bestFor: [
      'Étudiants qui apprennent en se testant',
      'Révisions de dernière minute efficaces',
      'Identification rapide des points faibles'
    ],
    example: 'Session : 20 QCM variés → score <60% sur "Insuffisance cardiaque" → fiche suggérée automatiquement'
  }
};

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ChangeRevisionMethodRequest {
  new_method: RevisionMethodType;
  config?: Partial<JMethodConfig | BlockMethodConfig | QCMFirstConfig>;
}

export interface CreateJMethodRevisionsRequest {
  item_id: string;
  item_type: RevisionItemType;
  item_code: string;
  base_date?: Date;
}

export interface CompleteRevisionRequest {
  revision_id: string;
  success_rate?: number;
  time_spent_minutes?: number;
  notes?: string;
}

export interface CreateBlockConfigRequest {
  items_per_day: number;
  target_date: string; // ISO date
  selected_items: string[]; // UUIDs
}

export interface CreateQCMSessionRequest {
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  suggested_fiches: string[];
}
