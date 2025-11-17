/**
 * ECOS Service
 * Manages ECOS scenarios and evaluation sessions
 */

import { supabase } from '@/integrations/supabase/client';

export interface EcosSituation {
  id: string;
  sd_id: number;
  intitule_sd: string;
  contenu_complet_html?: string;
  competences_associees?: string[];
  url_source?: string;
  date_import: string;
  created_at: string;
  updated_at: string;
}

export interface EcosEvaluationCriterion {
  id: string;
  situation_id: string;
  criterion_name: string;
  criterion_description?: string;
  max_points: number;
  category: 'communication' | 'examination' | 'diagnosis' | 'management' | 'professionalism';
  order_index: number;
  is_mandatory: boolean;
  hints?: string;
}

export interface EcosUserSession {
  id: string;
  user_id: string;
  situation_id: string;
  started_at: string;
  completed_at?: string;
  total_score: number;
  max_possible_score: number;
  percentage_score?: number;
  time_spent_seconds?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  evaluator_notes?: string;
  self_reflection?: string;
}

export interface EcosSessionScore {
  id: string;
  session_id: string;
  criterion_id: string;
  points_earned: number;
  evaluator_notes?: string;
  feedback?: string;
  timestamp: string;
}

/**
 * Get all ECOS situations
 */
export async function getEcosSituations(limit = 50, offset = 0): Promise<EcosSituation[]> {
  try {
    const { data, error } = await supabase
      .from('ecos_situations_uness')
      .select('*')
      .order('sd_id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data || []) as EcosSituation[];
  } catch (err) {
    console.error('Error fetching ECOS situations:', err);
    return [];
  }
}

/**
 * Get a specific ECOS situation by ID
 */
export async function getEcosSituation(situationId: string): Promise<EcosSituation | null> {
  try {
    const { data, error } = await supabase
      .from('ecos_situations_uness')
      .select('*')
      .eq('id', situationId)
      .single();

    if (error) throw error;
    return data as EcosSituation;
  } catch (err) {
    console.error('Error fetching ECOS situation:', err);
    return null;
  }
}

/**
 * Get ECOS situation by SD ID
 */
export async function getEcosSituationBySdId(sdId: number): Promise<EcosSituation | null> {
  try {
    const { data, error } = await supabase
      .from('ecos_situations_uness')
      .select('*')
      .eq('sd_id', sdId)
      .single();

    if (error) throw error;
    return data as EcosSituation;
  } catch (err) {
    console.error('Error fetching ECOS situation by SD ID:', err);
    return null;
  }
}

/**
 * Get evaluation criteria for a situation
 */
export async function getEvaluationCriteria(situationId: string): Promise<EcosEvaluationCriterion[]> {
  try {
    const { data, error } = await supabase
      .from('ecos_evaluation_criteria')
      .select('*')
      .eq('situation_id', situationId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []) as EcosEvaluationCriterion[];
  } catch (err) {
    console.error('Error fetching evaluation criteria:', err);
    return [];
  }
}

/**
 * Create a new user session
 */
export async function createUserSession(
  userId: string,
  situationId: string,
  maxPossibleScore: number
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('ecos_user_sessions')
      .insert({
        user_id: userId,
        situation_id: situationId,
        max_possible_score: maxPossibleScore,
        status: 'in_progress',
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    console.error('Error creating user session:', err);
    return null;
  }
}

/**
 * Get user's sessions for a situation
 */
export async function getUserSessions(
  userId: string,
  situationId?: string
): Promise<EcosUserSession[]> {
  try {
    let query = supabase
      .from('ecos_user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (situationId) {
      query = query.eq('situation_id', situationId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as EcosUserSession[];
  } catch (err) {
    console.error('Error fetching user sessions:', err);
    return [];
  }
}

/**
 * Update session status and scores
 */
export async function updateSession(
  sessionId: string,
  updates: {
    completed_at?: string;
    total_score?: number;
    time_spent_seconds?: number;
    status?: 'in_progress' | 'completed' | 'abandoned';
    evaluator_notes?: string;
    self_reflection?: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ecos_user_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error updating session:', err);
    return false;
  }
}

/**
 * Save criterion score
 */
export async function saveCriterionScore(
  sessionId: string,
  criterionId: string,
  pointsEarned: number,
  feedback?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ecos_session_scores')
      .upsert({
        session_id: sessionId,
        criterion_id: criterionId,
        points_earned: pointsEarned,
        feedback,
      });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error saving criterion score:', err);
    return false;
  }
}

/**
 * Get session scores
 */
export async function getSessionScores(sessionId: string): Promise<EcosSessionScore[]> {
  try {
    const { data, error } = await supabase
      .from('ecos_session_scores')
      .select('*')
      .eq('session_id', sessionId);

    if (error) throw error;
    return (data || []) as EcosSessionScore[];
  } catch (err) {
    console.error('Error fetching session scores:', err);
    return [];
  }
}

/**
 * Get user statistics
 */
export async function getUserEcosStats(userId: string): Promise<{
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalTimeSpent: number;
}> {
  try {
    const sessions = await getUserSessions(userId);
    const completedSessions = sessions.filter(s => s.status === 'completed');

    const totalTimeSpent = completedSessions.reduce(
      (sum, s) => sum + (s.time_spent_seconds || 0),
      0
    );

    const averageScore = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.percentage_score || 0), 0) / completedSessions.length
      : 0;

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      averageScore: Math.round(averageScore * 100) / 100,
      totalTimeSpent,
    };
  } catch (err) {
    console.error('Error fetching user stats:', err);
    return {
      totalSessions: 0,
      completedSessions: 0,
      averageScore: 0,
      totalTimeSpent: 0,
    };
  }
}
