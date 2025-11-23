// ============================================================================
// Revision Methods Service
// ============================================================================

import { supabase } from '../lib/supabase';
import {
  RevisionMethodType,
  RevisionScheduleItem,
  RevisionScheduleInsert,
  RevisionMethodStats,
  TodayRevisionItem,
  OverdueRevisionItem,
  RevisionMethodEffectiveness,
  BlockMethodConfigDB,
  QCMFirstSession,
  CreateBlockConfigRequest,
  CreateQCMSessionRequest,
  CompleteRevisionRequest,
  CreateJMethodRevisionsRequest,
  ChangeRevisionMethodRequest,
  RevisionItemType,
  JMethodConfig,
  BlockMethodConfig,
  QCMFirstConfig
} from '../types/revision-methods';

// ============================================================================
// User Revision Method Management
// ============================================================================

/**
 * Get user's current revision method
 */
export async function getUserRevisionMethod(userId: string): Promise<RevisionMethodType | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('revision_method')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching revision method:', error);
    return null;
  }

  return data?.revision_method as RevisionMethodType || 'J_METHOD';
}

/**
 * Change user's revision method
 */
export async function changeRevisionMethod(
  userId: string,
  request: ChangeRevisionMethodRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update user profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        revision_method: request.new_method,
        revision_method_config: request.config || {},
        revision_method_changed_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating revision method:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error changing revision method:', error);
    return { success: false, error: 'Unknown error' };
  }
}

/**
 * Get user's revision method configuration
 */
export async function getRevisionMethodConfig(
  userId: string
): Promise<JMethodConfig | BlockMethodConfig | QCMFirstConfig | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('revision_method_config')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching revision config:', error);
    return null;
  }

  return data?.revision_method_config || null;
}

// ============================================================================
// Revision Schedule Management
// ============================================================================

/**
 * Get today's revision items for a user
 */
export async function getTodayRevisionItems(userId: string): Promise<TodayRevisionItem[]> {
  const { data, error } = await supabase.rpc('get_today_revision_items', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error fetching today revision items:', error);
    return [];
  }

  return data || [];
}

/**
 * Get overdue revision items
 */
export async function getOverdueRevisionItems(userId: string): Promise<OverdueRevisionItem[]> {
  const { data, error } = await supabase.rpc('get_overdue_revision_items', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error fetching overdue items:', error);
    return [];
  }

  return data || [];
}

/**
 * Get revision method statistics
 */
export async function getRevisionMethodStats(userId: string): Promise<RevisionMethodStats | null> {
  const { data, error } = await supabase.rpc('get_revision_method_stats', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error fetching revision stats:', error);
    return null;
  }

  return data?.[0] || null;
}

/**
 * Create a single revision schedule item
 */
export async function createRevisionScheduleItem(
  item: RevisionScheduleInsert
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('revision_schedule')
    .insert(item);

  if (error) {
    console.error('Error creating revision schedule item:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Complete a revision
 */
export async function completeRevision(
  request: CompleteRevisionRequest
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.rpc('complete_revision', {
    p_revision_id: request.revision_id,
    p_success_rate: request.success_rate,
    p_time_spent_minutes: request.time_spent_minutes,
    p_notes: request.notes
  });

  if (error) {
    console.error('Error completing revision:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Mark revision as skipped
 */
export async function skipRevision(revisionId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('revision_schedule')
    .update({ status: 'SKIPPED' })
    .eq('id', revisionId);

  if (error) {
    console.error('Error skipping revision:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Reschedule a revision to a new date
 */
export async function rescheduleRevision(
  revisionId: string,
  newDate: Date
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('revision_schedule')
    .update({ scheduled_for: newDate.toISOString().split('T')[0] })
    .eq('id', revisionId);

  if (error) {
    console.error('Error rescheduling revision:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================================
// J Method (Méthode des J 2.0)
// ============================================================================

/**
 * Create J Method revisions (J+2, J+7, J+14, J+30)
 */
export async function createJMethodRevisions(
  userId: string,
  request: CreateJMethodRevisionsRequest
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.rpc('create_j_method_revisions', {
    p_user_id: userId,
    p_item_id: request.item_id,
    p_item_type: request.item_type,
    p_item_code: request.item_code,
    p_base_date: request.base_date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  });

  if (error) {
    console.error('Error creating J method revisions:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Mark an item as seen and auto-create J Method revisions
 */
export async function markItemSeenAndSchedule(
  userId: string,
  itemId: string,
  itemType: RevisionItemType,
  itemCode: string
): Promise<{ success: boolean; error?: string }> {
  // Check if revisions already exist for this item
  const { data: existing } = await supabase
    .from('revision_schedule')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('revision_method', 'J_METHOD')
    .limit(1);

  if (existing && existing.length > 0) {
    // Already scheduled, no need to create again
    return { success: true };
  }

  // Create J Method revisions
  return await createJMethodRevisions(userId, {
    item_id: itemId,
    item_type: itemType,
    item_code: itemCode
  });
}

// ============================================================================
// Block Method (Méthode Blocs Profonds)
// ============================================================================

/**
 * Create or update Block Method configuration
 */
export async function createBlockMethodConfig(
  userId: string,
  request: CreateBlockConfigRequest
): Promise<{ success: boolean; error?: string; configId?: string }> {
  try {
    // First, deactivate any existing active config
    await supabase
      .from('block_method_config')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Create new config
    const { data, error } = await supabase
      .from('block_method_config')
      .insert({
        user_id: userId,
        items_per_day: request.items_per_day,
        target_date: request.target_date,
        selected_items: request.selected_items,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating block config:', error);
      return { success: false, error: error.message };
    }

    // Generate daily schedule
    await generateBlockMethodSchedule(userId, data.id);

    return { success: true, configId: data.id };
  } catch (error) {
    console.error('Error in createBlockMethodConfig:', error);
    return { success: false, error: 'Unknown error' };
  }
}

/**
 * Generate daily schedule for Block Method
 */
async function generateBlockMethodSchedule(userId: string, configId: string): Promise<void> {
  // Get config
  const { data: config, error: configError } = await supabase
    .from('block_method_config')
    .select('*')
    .eq('id', configId)
    .single();

  if (configError || !config) {
    console.error('Error fetching block config:', configError);
    return;
  }

  const startDate = new Date();
  const targetDate = new Date(config.target_date);
  const totalDays = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const itemsPerDay = config.items_per_day;
  const totalItems = config.selected_items.length;

  // Calculate how many times we need to cycle through items
  const totalSlotsNeeded = totalDays * itemsPerDay;
  const cycles = Math.ceil(totalSlotsNeeded / totalItems);

  // Create schedule entries
  const scheduleItems: RevisionScheduleInsert[] = [];
  let currentDate = new Date(startDate);
  let itemIndex = 0;

  for (let day = 0; day < totalDays; day++) {
    for (let slot = 0; slot < itemsPerDay; slot++) {
      const itemId = config.selected_items[itemIndex % totalItems];

      scheduleItems.push({
        user_id: userId,
        item_id: itemId,
        item_type: 'edn_item', // Default, could be configurable
        item_code: `BLOCK-${itemId.substring(0, 8)}`,
        scheduled_for: new Date(currentDate),
        revision_method: 'BLOCK_METHOD',
        status: 'PENDING',
        priority_score: 100 - day // Earlier days have higher priority
      });

      itemIndex++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Insert all schedule items
  const { error } = await supabase
    .from('revision_schedule')
    .insert(scheduleItems);

  if (error) {
    console.error('Error generating block schedule:', error);
  }
}

/**
 * Get active Block Method configuration
 */
export async function getActiveBlockMethodConfig(userId: string): Promise<BlockMethodConfigDB | null> {
  const { data, error } = await supabase
    .from('block_method_config')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching block config:', error);
    return null;
  }

  return data;
}

// ============================================================================
// QCM First Method
// ============================================================================

/**
 * Create a QCM First session
 */
export async function createQCMFirstSession(
  userId: string,
  request: CreateQCMSessionRequest
): Promise<{ success: boolean; error?: string; sessionId?: string }> {
  const { data, error } = await supabase
    .from('qcm_first_sessions')
    .insert({
      user_id: userId,
      session_date: new Date().toISOString().split('T')[0],
      total_questions: request.total_questions,
      correct_answers: request.correct_answers,
      incorrect_answers: request.incorrect_answers,
      suggested_fiches: request.suggested_fiches,
      fiches_reviewed: [],
      completed: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating QCM session:', error);
    return { success: false, error: error.message };
  }

  // Create revision schedule items for suggested fiches
  const scheduleItems: RevisionScheduleInsert[] = request.suggested_fiches.map(ficheId => ({
    user_id: userId,
    item_id: ficheId,
    item_type: 'fiche' as RevisionItemType,
    item_code: `FICHE-${ficheId.substring(0, 8)}`,
    scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    revision_method: 'QCM_FIRST',
    status: 'PENDING',
    priority_score: 100 // High priority for error-based fiches
  }));

  if (scheduleItems.length > 0) {
    await supabase.from('revision_schedule').insert(scheduleItems);
  }

  return { success: true, sessionId: data.id };
}

/**
 * Mark a fiche as reviewed in QCM First session
 */
export async function markFicheReviewedInQCMSession(
  sessionId: string,
  ficheId: string
): Promise<{ success: boolean; error?: string }> {
  // Get current session
  const { data: session, error: fetchError } = await supabase
    .from('qcm_first_sessions')
    .select('fiches_reviewed')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    console.error('Error fetching QCM session:', fetchError);
    return { success: false, error: fetchError.message };
  }

  // Add fiche to reviewed list
  const updatedReviewed = [...(session.fiches_reviewed || []), ficheId];

  const { error: updateError } = await supabase
    .from('qcm_first_sessions')
    .update({ fiches_reviewed: updatedReviewed })
    .eq('id', sessionId);

  if (updateError) {
    console.error('Error updating QCM session:', updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

/**
 * Complete QCM First session
 */
export async function completeQCMFirstSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('qcm_first_sessions')
    .update({ completed: true })
    .eq('id', sessionId);

  if (error) {
    console.error('Error completing QCM session:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get today's QCM First session
 */
export async function getTodayQCMFirstSession(userId: string): Promise<QCMFirstSession | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('qcm_first_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('session_date', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching today QCM session:', error);
    return null;
  }

  return data;
}

// ============================================================================
// Method Effectiveness Tracking
// ============================================================================

/**
 * Get method effectiveness data for a user
 */
export async function getMethodEffectiveness(
  userId: string,
  method?: RevisionMethodType
): Promise<RevisionMethodEffectiveness[]> {
  let query = supabase
    .from('revision_method_effectiveness')
    .select('*')
    .eq('user_id', userId)
    .order('period_start', { ascending: false });

  if (method) {
    query = query.eq('revision_method', method);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching method effectiveness:', error);
    return [];
  }

  return data || [];
}

/**
 * Update method effectiveness metrics (should be called periodically)
 */
export async function updateMethodEffectiveness(
  userId: string,
  method: RevisionMethodType
): Promise<void> {
  // This would typically be called by a cron job or background task
  // For now, it's a placeholder for future implementation
  console.log(`Updating effectiveness for user ${userId}, method ${method}`);
}
