/**
 * Service pour la gestion des méthodes de révision
 * Implémente les 3 méthodes : J 2.0, Blocs Profonds, QCM First
 */

import { supabase } from '@/integrations/supabase/client'
import type {
  RevisionMethodType,
  RevisionSchedule,
  RevisionScheduleInsert,
  RevisionScheduleUpdate,
  RevisionMethodConfig,
  RevisionMethodConfigInsert,
  RevisionMethodConfigUpdate,
  RevisionSession,
  RevisionSessionInsert,
  MethodPerformanceMetrics,
  TodayRevisions,
  RevisionStats,
  ScheduleJMethodParams,
  MarkRevisionDoneParams,
  JMethodConfig,
  BlockMethodConfig,
  QCMFirstConfig
} from '@/types/revision-methods'

// ============================================================================
// USER REVISION METHOD
// ============================================================================

/**
 * Récupère la méthode de révision active de l'utilisateur
 */
export async function getUserRevisionMethod(userId: string): Promise<RevisionMethodType> {
  const { data, error } = await supabase.rpc('get_user_revision_method', {
    p_user_id: userId
  })

  if (error) {
    console.error('Error fetching user revision method:', error)
    return 'J_METHOD' // Default
  }

  return data as RevisionMethodType
}

/**
 * Met à jour la méthode de révision de l'utilisateur
 */
export async function updateUserRevisionMethod(
  userId: string,
  newMethod: RevisionMethodType
): Promise<void> {
  const { error } = await supabase.rpc('update_user_revision_method', {
    p_user_id: userId,
    p_new_method: newMethod
  })

  if (error) {
    console.error('Error updating user revision method:', error)
    throw error
  }
}

// ============================================================================
// REVISION SCHEDULE - CRUD
// ============================================================================

/**
 * Récupère les révisions du jour pour un utilisateur
 */
export async function getTodayRevisions(userId: string): Promise<TodayRevisions> {
  const { data, error } = await supabase.rpc('get_today_revisions', {
    p_user_id: userId
  })

  if (error) {
    console.error('Error fetching today revisions:', error)
    throw error
  }

  const revisions = (data as unknown as RevisionSchedule[]) || []

  return {
    pending: revisions.filter(r => r.status === 'PENDING'),
    missed: revisions.filter(r => r.status === 'MISSED'),
    done: revisions.filter(r => r.status === 'DONE'),
    total: revisions.length
  }
}

/**
 * Récupère les révisions en retard
 */
export async function getOverdueRevisions(userId: string): Promise<RevisionSchedule[]> {
  const { data, error } = await supabase.rpc('get_overdue_revisions', {
    p_user_id: userId
  })

  if (error) {
    console.error('Error fetching overdue revisions:', error)
    throw error
  }

  return (data as unknown as RevisionSchedule[]) || []
}

/**
 * Récupère toutes les révisions planifiées d'un utilisateur
 */
export async function getRevisionSchedule(
  userId: string,
  filters?: {
    method?: RevisionMethodType
    status?: string
    startDate?: string
    endDate?: string
  }
): Promise<RevisionSchedule[]> {
  let query = supabase
    .from('revision_schedule')
    .select('*')
    .eq('user_id', userId)

  if (filters?.method) {
    query = query.eq('revision_method', filters.method)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.startDate) {
    query = query.gte('scheduled_for', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('scheduled_for', filters.endDate)
  }

  const { data, error } = await query.order('scheduled_for', { ascending: true })

  if (error) {
    console.error('Error fetching revision schedule:', error)
    throw error
  }

  return data as RevisionSchedule[]
}

/**
 * Crée une nouvelle révision planifiée
 */
export async function createRevisionSchedule(
  revision: RevisionScheduleInsert
): Promise<RevisionSchedule> {
  const { data, error } = await supabase
    .from('revision_schedule')
    .insert(revision)
    .select()
    .single()

  if (error) {
    console.error('Error creating revision schedule:', error)
    throw error
  }

  return data as RevisionSchedule
}

/**
 * Met à jour une révision planifiée
 */
export async function updateRevisionSchedule(
  revisionId: string,
  updates: RevisionScheduleUpdate
): Promise<RevisionSchedule> {
  const { data, error } = await supabase
    .from('revision_schedule')
    .update(updates)
    .eq('id', revisionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating revision schedule:', error)
    throw error
  }

  return data as RevisionSchedule
}

/**
 * Supprime une révision planifiée
 */
export async function deleteRevisionSchedule(revisionId: string): Promise<void> {
  const { error } = await supabase
    .from('revision_schedule')
    .delete()
    .eq('id', revisionId)

  if (error) {
    console.error('Error deleting revision schedule:', error)
    throw error
  }
}

/**
 * Marque une révision comme terminée
 */
export async function markRevisionDone(params: MarkRevisionDoneParams): Promise<void> {
  const { error } = await supabase.rpc('mark_revision_done', {
    p_revision_id: params.revision_id,
    p_success: params.success ?? true,
    p_duration_minutes: params.duration_minutes ?? null,
    p_notes: params.notes ?? null
  })

  if (error) {
    console.error('Error marking revision as done:', error)
    throw error
  }
}

// ============================================================================
// MÉTHODE DES J 2.0
// ============================================================================

/**
 * Planifie les révisions selon la Méthode des J (J+2, J+7, J+14, J+30)
 */
export async function scheduleJMethodRevisions(params: ScheduleJMethodParams): Promise<void> {
  const { error } = await supabase.rpc('schedule_j_method_revisions', {
    p_user_id: params.user_id,
    p_item_type: params.item_type,
    p_item_id: params.item_id,
    p_item_title: params.item_title,
    p_item_data: params.item_data ?? null
  })

  if (error) {
    console.error('Error scheduling J method revisions:', error)
    throw error
  }
}

/**
 * Récupère la configuration de la Méthode des J pour un utilisateur
 */
export async function getJMethodConfig(userId: string): Promise<JMethodConfig> {
  const { data, error } = await supabase
    .from('revision_method_config')
    .select('*')
    .eq('user_id', userId)
    .eq('method_type', 'J_METHOD')
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching J method config:', error)
    throw error
  }

  // Default config
  const defaultConfig: JMethodConfig = {
    intervals: [2, 7, 14, 30],
    auto_schedule: true,
    notify_on_review_day: true
  }

  return data ? (data.config as JMethodConfig) : defaultConfig
}

/**
 * Met à jour la configuration de la Méthode des J
 */
export async function updateJMethodConfig(
  userId: string,
  config: Partial<JMethodConfig>
): Promise<void> {
  // Récupérer la config actuelle
  const currentConfig = await getJMethodConfig(userId)
  const newConfig = { ...currentConfig, ...config }

  const { error } = await supabase
    .from('revision_method_config')
    .upsert({
      user_id: userId,
      method_type: 'J_METHOD',
      config: newConfig,
      is_active: true
    })

  if (error) {
    console.error('Error updating J method config:', error)
    throw error
  }
}

// ============================================================================
// MÉTHODE BLOCS PROFONDS
// ============================================================================

/**
 * Génère un planning de révision pour la Méthode Blocs Profonds
 */
export async function generateBlockMethodSchedule(
  userId: string,
  itemIds: string[],
  config: BlockMethodConfig
): Promise<void> {
  const { items_per_day, target_date, deep_work_duration, include_weekends } = config

  // Calculer le nombre de jours disponibles
  const today = new Date()
  const targetDate = new Date(target_date)
  const totalDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Filtrer les weekends si nécessaire
  const availableDays: Date[] = []
  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay()

    if (include_weekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      availableDays.push(date)
    }
  }

  // Répartir les items sur les jours disponibles
  const schedulePromises: Promise<any>[] = []
  let dayIndex = 0

  for (let i = 0; i < itemIds.length; i++) {
    const itemId = itemIds[i]
    const blockPosition = (i % items_per_day) + 1
    const currentDate = availableDays[dayIndex]

    if (!currentDate) {
      console.warn('Not enough days to schedule all items')
      break
    }

    const revision: RevisionScheduleInsert = {
      user_id: userId,
      item_type: 'edn', // TODO: should be configurable
      item_id: itemId,
      item_title: `Item ${itemId}`,
      revision_method: 'BLOCK_METHOD',
      scheduled_for: currentDate.toISOString().split('T')[0],
      status: 'PENDING',
      method_metadata: {
        block_position: blockPosition,
        session_duration: deep_work_duration,
        total_items_in_block: Math.min(items_per_day, itemIds.length - i)
      }
    }

    schedulePromises.push(createRevisionSchedule(revision))

    // Passer au jour suivant si on a atteint le quota
    if ((i + 1) % items_per_day === 0) {
      dayIndex++
    }
  }

  await Promise.all(schedulePromises)
}

/**
 * Récupère la configuration de la Méthode Blocs Profonds
 */
export async function getBlockMethodConfig(userId: string): Promise<BlockMethodConfig> {
  const { data, error } = await supabase
    .from('revision_method_config')
    .select('*')
    .eq('user_id', userId)
    .eq('method_type', 'BLOCK_METHOD')
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching block method config:', error)
    throw error
  }

  // Default config
  const defaultConfig: BlockMethodConfig = {
    items_per_day: 5,
    target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days
    deep_work_duration: 60,
    include_weekends: false
  }

  return data ? (data.config as BlockMethodConfig) : defaultConfig
}

/**
 * Met à jour la configuration de la Méthode Blocs Profonds
 */
export async function updateBlockMethodConfig(
  userId: string,
  config: Partial<BlockMethodConfig>
): Promise<void> {
  const currentConfig = await getBlockMethodConfig(userId)
  const newConfig = { ...currentConfig, ...config }

  const { error } = await supabase
    .from('revision_method_config')
    .upsert({
      user_id: userId,
      method_type: 'BLOCK_METHOD',
      config: newConfig,
      is_active: true
    })

  if (error) {
    console.error('Error updating block method config:', error)
    throw error
  }
}

// ============================================================================
// MÉTHODE QCM FIRST
// ============================================================================

/**
 * Analyse les résultats d'un QCM et planifie les révisions de fiches
 */
export async function analyzeQCMAndScheduleReviews(
  userId: string,
  qcmResults: Array<{
    item_id: string
    item_type: string
    item_title: string
    correct: boolean
    difficulty: number
  }>,
  config: QCMFirstConfig
): Promise<void> {
  const { difficulty_threshold, auto_review } = config

  if (!auto_review) return

  // Filtrer les items avec difficulté ou erreur
  const itemsToReview = qcmResults.filter(
    result => !result.correct || result.difficulty >= difficulty_threshold
  )

  // Grouper par item_id pour compter les erreurs
  const errorCounts = new Map<string, number>()
  itemsToReview.forEach(item => {
    errorCounts.set(item.item_id, (errorCounts.get(item.item_id) || 0) + 1)
  })

  // Planifier les révisions (J+1 ou J+2 selon le nombre d'erreurs)
  const schedulePromises = Array.from(errorCounts.entries()).map(([itemId, errorCount]) => {
    const item = itemsToReview.find(r => r.item_id === itemId)!
    const daysUntilReview = errorCount > 2 ? 1 : 2

    const scheduledDate = new Date()
    scheduledDate.setDate(scheduledDate.getDate() + daysUntilReview)

    const revision: RevisionScheduleInsert = {
      user_id: userId,
      item_type: item.item_type,
      item_id: itemId,
      item_title: item.item_title,
      revision_method: 'QCM_FIRST',
      scheduled_for: scheduledDate.toISOString().split('T')[0],
      status: 'PENDING',
      method_metadata: {
        error_count: errorCount,
        last_score: qcmResults.filter(r => r.item_id === itemId && r.correct).length /
          qcmResults.filter(r => r.item_id === itemId).length,
        question_ids: qcmResults.filter(r => r.item_id === itemId).map(r => r.item_id)
      }
    }

    return createRevisionSchedule(revision)
  })

  await Promise.all(schedulePromises)
}

/**
 * Récupère la configuration de la Méthode QCM First
 */
export async function getQCMFirstConfig(userId: string): Promise<QCMFirstConfig> {
  const { data, error } = await supabase
    .from('revision_method_config')
    .select('*')
    .eq('user_id', userId)
    .eq('method_type', 'QCM_FIRST')
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching QCM first config:', error)
    throw error
  }

  // Default config
  const defaultConfig: QCMFirstConfig = {
    questions_per_session: 20,
    difficulty_threshold: 0.6,
    auto_review: true,
    min_score_to_pass: 70
  }

  return data ? (data.config as QCMFirstConfig) : defaultConfig
}

/**
 * Met à jour la configuration de la Méthode QCM First
 */
export async function updateQCMFirstConfig(
  userId: string,
  config: Partial<QCMFirstConfig>
): Promise<void> {
  const currentConfig = await getQCMFirstConfig(userId)
  const newConfig = { ...currentConfig, ...config }

  const { error } = await supabase
    .from('revision_method_config')
    .upsert({
      user_id: userId,
      method_type: 'QCM_FIRST',
      config: newConfig,
      is_active: true
    })

  if (error) {
    console.error('Error updating QCM first config:', error)
    throw error
  }
}

// ============================================================================
// REVISION SESSIONS
// ============================================================================

/**
 * Crée une nouvelle session de révision
 */
export async function createRevisionSession(
  session: RevisionSessionInsert
): Promise<RevisionSession> {
  const { data, error } = await supabase
    .from('revision_sessions')
    .insert(session)
    .select()
    .single()

  if (error) {
    console.error('Error creating revision session:', error)
    throw error
  }

  return data as RevisionSession
}

/**
 * Récupère l'historique des sessions de révision
 */
export async function getRevisionSessions(
  userId: string,
  limit = 10
): Promise<RevisionSession[]> {
  const { data, error } = await supabase
    .from('revision_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching revision sessions:', error)
    throw error
  }

  return data as RevisionSession[]
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Récupère les statistiques de révision pour une méthode
 */
export async function getRevisionStatsByMethod(
  userId: string,
  method: RevisionMethodType
): Promise<RevisionStats> {
  const { data, error } = await supabase.rpc('get_revision_stats_by_method', {
    p_user_id: userId,
    p_method: method
  })

  if (error) {
    console.error('Error fetching revision stats:', error)
    throw error
  }

  const stats = data?.[0] || {
    total_scheduled: 0,
    completed: 0,
    pending: 0,
    missed: 0,
    completion_rate: 0,
    average_success_rate: 0
  }

  return stats as RevisionStats
}

/**
 * Récupère les métriques de performance pour une méthode
 */
export async function getMethodPerformanceMetrics(
  userId: string,
  method: RevisionMethodType,
  periodStart?: string,
  periodEnd?: string
): Promise<MethodPerformanceMetrics | null> {
  let query = supabase
    .from('method_performance_metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('method_type', method)

  if (periodStart && periodEnd) {
    query = query
      .gte('period_start', periodStart)
      .lte('period_end', periodEnd)
  }

  const { data, error } = await query
    .order('period_start', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching performance metrics:', error)
    throw error
  }

  return data as MethodPerformanceMetrics | null
}
