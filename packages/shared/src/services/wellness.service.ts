/**
 * Wellness & Rituals Service
 * Manages wellness activities, rituals, streaks, and goals
 */

import { supabase } from '@/integrations/supabase/client'

export type ActivityType = 'meditation' | 'exercise' | 'journaling' | 'stretching' | 'breathing' | 'yoga' | 'walking' | 'other'
export type IntensityLevel = 'low' | 'medium' | 'high'
export type MoodLevel = 'terrible' | 'bad' | 'neutral' | 'good' | 'excellent'
export type RitualCategory = 'morning' | 'evening' | 'exercise' | 'meditation' | 'other'
export type GoalType = 'meditation' | 'exercise' | 'journaling' | 'water' | 'sleep' | 'other'
export type GoalFrequency = 'daily' | 'weekly' | 'monthly'
export type GoalStatus = 'active' | 'completed' | 'abandoned'

export interface WellnessActivity {
  id: string
  user_id: string
  activity_type: ActivityType
  name: string
  description?: string
  duration_minutes?: number
  intensity_level?: IntensityLevel
  mood_before?: MoodLevel
  mood_after?: MoodLevel
  location?: string
  notes?: string
  tags: string[]
  heart_rate?: number
  calories_burned?: number
  is_shared: boolean
  activity_date: string
  activity_time?: string
  created_at: string
  updated_at: string
}

export interface Ritual {
  id: string
  user_id: string
  name: string
  description?: string
  category: RitualCategory
  frequency: 'daily' | 'weekly' | 'custom'
  duration_minutes?: number
  is_active: boolean
  reminder_enabled: boolean
  reminder_time?: string
  color?: string
  icon?: string
  created_at: string
  updated_at: string
}

export interface RitualCompletion {
  id: string
  ritual_id: string
  user_id: string
  completed_at: string
  duration_minutes?: number
  notes?: string
  mood_before?: MoodLevel
  mood_after?: MoodLevel
  is_late: boolean
}

export interface WellnessStreak {
  id: string
  user_id: string
  activity_type: string
  current_streak: number
  best_streak: number
  days_completed: number
  last_completed_date?: string
  created_at: string
  updated_at: string
}

export interface WellnessGoal {
  id: string
  user_id: string
  goal_type: GoalType
  title: string
  description?: string
  target_value?: number
  target_unit?: string
  frequency: GoalFrequency
  current_progress: number
  status: GoalStatus
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface WellnessStats {
  id: string
  user_id: string
  meditation_minutes_total: number
  exercise_minutes_total: number
  journaling_minutes_total: number
  activities_completed_total: number
  rituals_completed_total: number
  wellness_score: number
  last_activity_date?: string
  created_at: string
  updated_at: string
}

export const wellnessService = {
  /**
   * Log a wellness activity
   */
  async logActivity(
    activityType: ActivityType,
    name: string,
    options?: {
      duration_minutes?: number
      intensity_level?: IntensityLevel
      mood_before?: MoodLevel
      mood_after?: MoodLevel
      location?: string
      notes?: string
      tags?: string[]
      heart_rate?: number
      calories_burned?: number
      activity_date?: string
      activity_time?: string
    }
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('log_wellness_activity', {
        activity_type_param: activityType,
        name_param: name,
        duration_param: options?.duration_minutes,
        activity_date_param: options?.activity_date || new Date().toISOString().split('T')[0],
      })

      if (error) throw error
      return data as string
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to log activity')
    }
  },

  /**
   * Get user's wellness activities
   */
  async getUserActivities(
    limit = 20,
    offset = 0,
    activityType?: ActivityType,
    startDate?: string,
    endDate?: string
  ): Promise<WellnessActivity[]> {
    try {
      let query = supabase.from('wellness_activities').select('*')

      if (activityType) {
        query = query.eq('activity_type', activityType)
      }

      if (startDate) {
        query = query.gte('activity_date', startDate)
      }

      if (endDate) {
        query = query.lte('activity_date', endDate)
      }

      const { data, error } = await query
        .order('activity_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return (data || []) as WellnessActivity[]
    } catch (err) {
      console.error('Error fetching activities:', err)
      return []
    }
  },

  /**
   * Get activity summary for date range
   */
  async getActivitySummary(startDate: string, endDate: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('wellness_activities')
        .select('activity_type, duration_minutes')
        .gte('activity_date', startDate)
        .lte('activity_date', endDate)

      if (error) throw error

      const summary: Record<string, number> = {}
      data?.forEach((activity: any) => {
        const type = activity.activity_type
        summary[type] = (summary[type] || 0) + (activity.duration_minutes || 1)
      })

      return summary
    } catch (err) {
      console.error('Error getting activity summary:', err)
      return {}
    }
  },

  /**
   * Create a ritual
   */
  async createRitual(
    name: string,
    category: RitualCategory,
    options?: {
      description?: string
      frequency?: 'daily' | 'weekly' | 'custom'
      duration_minutes?: number
      reminder_time?: string
      color?: string
      icon?: string
    }
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('rituals')
        .insert([
          {
            name,
            category,
            description: options?.description,
            frequency: options?.frequency || 'daily',
            duration_minutes: options?.duration_minutes,
            reminder_time: options?.reminder_time,
            color: options?.color,
            icon: options?.icon,
            is_active: true,
            reminder_enabled: true,
          },
        ])
        .select('id')
        .single()

      if (error) throw error
      return data.id as string
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create ritual')
    }
  },

  /**
   * Get user's rituals
   */
  async getUserRituals(category?: RitualCategory, activeOnly = true): Promise<Ritual[]> {
    try {
      let query = supabase.from('rituals').select('*')

      if (category) {
        query = query.eq('category', category)
      }

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query.order('order_index', { ascending: true })

      if (error) throw error
      return (data || []) as Ritual[]
    } catch (err) {
      console.error('Error fetching rituals:', err)
      return []
    }
  },

  /**
   * Complete a ritual
   */
  async completeRitual(
    ritualId: string,
    durationMinutes?: number,
    options?: {
      notes?: string
      mood_before?: MoodLevel
      mood_after?: MoodLevel
    }
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('complete_ritual', {
        ritual_id_param: ritualId,
        duration_param: durationMinutes,
        notes_param: options?.notes,
        mood_before_param: options?.mood_before,
        mood_after_param: options?.mood_after,
      })

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to complete ritual')
    }
  },

  /**
   * Get ritual completion history
   */
  async getRitualCompletions(ritualId: string, limit = 30, offset = 0): Promise<RitualCompletion[]> {
    try {
      const { data, error } = await supabase
        .from('ritual_completions')
        .select('*')
        .eq('ritual_id', ritualId)
        .order('completed_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return (data || []) as RitualCompletion[]
    } catch (err) {
      console.error('Error fetching completions:', err)
      return []
    }
  },

  /**
   * Get wellness streaks
   */
  async getWellnessStreaks(): Promise<WellnessStreak[]> {
    try {
      const { data, error } = await supabase
        .from('wellness_streaks')
        .select('*')
        .order('current_streak', { ascending: false })

      if (error) throw error
      return (data || []) as WellnessStreak[]
    } catch (err) {
      console.error('Error fetching streaks:', err)
      return []
    }
  },

  /**
   * Get streak for specific activity type
   */
  async getActivityStreak(activityType: string): Promise<WellnessStreak | null> {
    try {
      const { data, error } = await supabase
        .from('wellness_streaks')
        .select('*')
        .eq('activity_type', activityType)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return (data || null) as WellnessStreak | null
    } catch (err) {
      console.error('Error fetching streak:', err)
      return null
    }
  },

  /**
   * Create wellness goal
   */
  async createGoal(
    goalType: GoalType,
    title: string,
    targetValue?: number,
    options?: {
      description?: string
      target_unit?: string
      frequency?: GoalFrequency
      end_date?: string
    }
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('wellness_goals')
        .insert([
          {
            goal_type: goalType,
            title,
            target_value: targetValue,
            target_unit: options?.target_unit,
            frequency: options?.frequency || 'daily',
            description: options?.description,
            end_date: options?.end_date,
            start_date: new Date().toISOString().split('T')[0],
            status: 'active',
          },
        ])
        .select('id')
        .single()

      if (error) throw error
      return data.id as string
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create goal')
    }
  },

  /**
   * Get user's wellness goals
   */
  async getUserGoals(status?: GoalStatus): Promise<WellnessGoal[]> {
    try {
      let query = supabase.from('wellness_goals').select('*')

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query.order('start_date', { ascending: false })

      if (error) throw error
      return (data || []) as WellnessGoal[]
    } catch (err) {
      console.error('Error fetching goals:', err)
      return []
    }
  },

  /**
   * Update goal progress
   */
  async updateGoalProgress(goalId: string, progress: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('wellness_goals')
        .update({ current_progress: progress })
        .eq('id', goalId)

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update goal')
    }
  },

  /**
   * Get wellness statistics
   */
  async getWellnessStats(): Promise<WellnessStats | null> {
    try {
      const { data, error } = await supabase
        .from('wellness_stats')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return (data || null) as WellnessStats | null
    } catch (err) {
      console.error('Error fetching stats:', err)
      return null
    }
  },

  /**
   * Delete ritual
   */
  async deleteRitual(ritualId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rituals')
        .update({ is_active: false })
        .eq('id', ritualId)

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete ritual')
    }
  },
}
