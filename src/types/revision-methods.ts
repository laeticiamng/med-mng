/**
 * Types pour le système de méthodes de révision
 * Correspond aux tables créées dans la migration 20251116000000_add_revision_methods.sql
 */

// ============================================================================
// ENUMS
// ============================================================================

export type RevisionMethodType = 'J_METHOD' | 'BLOCK_METHOD' | 'QCM_FIRST'

export type RevisionStatus = 'PENDING' | 'DONE' | 'MISSED' | 'SKIPPED'

export type SessionType = 'daily' | 'review' | 'catch_up'

// ============================================================================
// REVISION METHODS - METADATA
// ============================================================================

export interface RevisionMethodInfo {
  type: RevisionMethodType
  name: string
  shortName: string
  description: string
  detailedDescription: string
  icon: string
  color: string
  bestFor: string[]
  pros: string[]
  cons: string[]
}

export const REVISION_METHODS: Record<RevisionMethodType, RevisionMethodInfo> = {
  J_METHOD: {
    type: 'J_METHOD',
    name: 'Méthode des J 2.0',
    shortName: 'Méthode des J',
    description: 'Tu revois chaque notion plusieurs fois après l\'avoir apprise : J0, J+2, J+7, J+14, J+30.',
    detailedDescription: 'La répétition espacée scientifiquement prouvée. Chaque item est automatiquement planifié pour révision à intervalles croissants (2, 7, 14 et 30 jours après la première étude).',
    icon: 'Calendar',
    color: 'blue',
    bestFor: [
      'Mémoire à long terme',
      'Préparation EDN/ECOS sur plusieurs mois',
      'Consolidation progressive'
    ],
    pros: [
      'Scientifiquement prouvée',
      'Automatique et guidée',
      'Optimale pour la rétention',
      'Planning clair'
    ],
    cons: [
      'Demande de la régularité',
      'Moins flexible',
      'Prend du temps'
    ]
  },
  BLOCK_METHOD: {
    type: 'BLOCK_METHOD',
    name: 'Méthode Blocs Profonds',
    shortName: 'Blocs Profonds',
    description: 'Chaque jour, tu travailles un petit nombre d\'items à fond (fiche + QCM).',
    detailedDescription: 'Concentration intense sur peu d\'items par jour. Tu choisis le nombre d\'items quotidiens et la date cible, puis l\'algorithme répartit le travail en mode "deep focus".',
    icon: 'Target',
    color: 'purple',
    bestFor: [
      'Deep work / concentration',
      'Compréhension approfondie',
      'Items complexes',
      'Apprentissage actif'
    ],
    pros: [
      'Compréhension en profondeur',
      'Moins de fatigue mentale',
      'Flexibilité du rythme',
      'Satisfaisant (progression visible)'
    ],
    cons: [
      'Couverture plus lente',
      'Risque de surcharge si mal dosé',
      'Moins de rappels'
    ]
  },
  QCM_FIRST: {
    type: 'QCM_FIRST',
    name: 'Méthode QCM First',
    shortName: 'QCM First',
    description: 'Tu commences par les QCM et les cas, puis tu revois uniquement les fiches où tu as le plus de mal.',
    detailedDescription: 'Approche "test-first" : commence par t\'entraîner sur des questions, puis cible tes révisions sur les fiches où tu fais des erreurs. Idéal pour apprendre en se testant.',
    icon: 'FileQuestion',
    color: 'green',
    bestFor: [
      'Apprentissage par testing',
      'Identification rapide des faiblesses',
      'Préparation intensive',
      'Révisions ciblées'
    ],
    pros: [
      'Feedback immédiat',
      'Ciblage des faiblesses',
      'Motivant (gamification)',
      'Gain de temps'
    ],
    cons: [
      'Nécessite beaucoup de QCM',
      'Peut négliger la théorie',
      'Risque d\'apprendre "par cœur"'
    ]
  }
}

// ============================================================================
// REVISION SCHEDULE
// ============================================================================

export interface RevisionSchedule {
  id: string
  user_id: string
  item_type: string
  item_id: string
  item_title: string | null
  item_data: Record<string, any> | null
  revision_method: RevisionMethodType
  scheduled_for: string // Date ISO string
  status: RevisionStatus
  completed_at: string | null
  method_metadata: Record<string, any>
  success: boolean | null
  duration_minutes: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface RevisionScheduleInsert {
  user_id: string
  item_type: string
  item_id: string
  item_title?: string
  item_data?: Record<string, any>
  revision_method: RevisionMethodType
  scheduled_for: string
  status?: RevisionStatus
  method_metadata?: Record<string, any>
}

export interface RevisionScheduleUpdate {
  status?: RevisionStatus
  completed_at?: string
  success?: boolean
  duration_minutes?: number
  notes?: string
}

// J Method specific metadata
export interface JMethodMetadata {
  repetition_number: 1 | 2 | 3 | 4
  interval_days: 2 | 7 | 14 | 30
  initial_date: string
}

// Block Method specific metadata
export interface BlockMethodMetadata {
  block_position: number
  session_duration: number
  total_items_in_block: number
}

// QCM First specific metadata
export interface QCMFirstMetadata {
  question_ids: string[]
  error_count: number
  last_score: number
}

// ============================================================================
// REVISION METHOD CONFIG
// ============================================================================

export interface RevisionMethodConfig {
  id: string
  user_id: string
  method_type: RevisionMethodType
  config: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RevisionMethodConfigInsert {
  user_id: string
  method_type: RevisionMethodType
  config: Record<string, any>
  is_active?: boolean
}

export interface RevisionMethodConfigUpdate {
  config?: Record<string, any>
  is_active?: boolean
}

// Specific config types for each method
export interface JMethodConfig {
  intervals: number[] // Default: [2, 7, 14, 30]
  auto_schedule: boolean
  notify_on_review_day: boolean
}

export interface BlockMethodConfig {
  items_per_day: number
  target_date: string
  deep_work_duration: number // minutes
  include_weekends: boolean
  preferred_time?: 'morning' | 'afternoon' | 'evening'
}

export interface QCMFirstConfig {
  questions_per_session: number
  difficulty_threshold: number // 0-1, below this triggers fiche review
  auto_review: boolean
  min_score_to_pass: number // 0-100
}

// ============================================================================
// REVISION SESSIONS
// ============================================================================

export interface RevisionSession {
  id: string
  user_id: string
  revision_method: RevisionMethodType
  items_reviewed: ItemReviewedInSession[]
  items_count: number
  success_rate: number | null
  total_duration_minutes: number
  session_type: SessionType | null
  notes: string | null
  started_at: string
  completed_at: string
  created_at: string
}

export interface ItemReviewedInSession {
  item_id: string
  item_type: string
  success: boolean
  duration_seconds: number
}

export interface RevisionSessionInsert {
  user_id: string
  revision_method: RevisionMethodType
  items_reviewed: ItemReviewedInSession[]
  items_count: number
  success_rate?: number
  total_duration_minutes: number
  session_type?: SessionType
  notes?: string
  started_at: string
  completed_at: string
}

// ============================================================================
// METHOD PERFORMANCE METRICS
// ============================================================================

export interface MethodPerformanceMetrics {
  id: string
  user_id: string
  method_type: RevisionMethodType
  period_start: string
  period_end: string
  sessions_count: number
  total_items_reviewed: number
  average_success_rate: number | null
  total_time_minutes: number
  completion_rate: number | null
  current_streak_days: number
  longest_streak_days: number
  created_at: string
  updated_at: string
}

export interface MethodPerformanceMetricsInsert {
  user_id: string
  method_type: RevisionMethodType
  period_start: string
  period_end: string
  sessions_count?: number
  total_items_reviewed?: number
  average_success_rate?: number
  total_time_minutes?: number
  completion_rate?: number
  current_streak_days?: number
  longest_streak_days?: number
}

// ============================================================================
// USER PROFILE EXTENSION
// ============================================================================

export interface UserProfileWithMethod {
  revision_method: RevisionMethodType
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface TodayRevisions {
  pending: RevisionSchedule[]
  missed: RevisionSchedule[]
  done: RevisionSchedule[]
  total: number
}

export interface RevisionStats {
  total_scheduled: number
  completed: number
  pending: number
  missed: number
  completion_rate: number
  average_success_rate: number
}

export interface MethodComparison {
  method: RevisionMethodType
  stats: RevisionStats
  performance: MethodPerformanceMetrics | null
}

// ============================================================================
// FUNCTION PARAMETERS
// ============================================================================

export interface ScheduleJMethodParams {
  user_id: string
  item_type: string
  item_id: string
  item_title: string
  item_data?: Record<string, any>
}

export interface MarkRevisionDoneParams {
  revision_id: string
  success?: boolean
  duration_minutes?: number
  notes?: string
}

export interface GetRevisionStatsParams {
  user_id: string
  method: RevisionMethodType
}
