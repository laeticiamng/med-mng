/**
 * Activity Feed Service
 * Manages user activities and activity feed
 */

import { supabase } from '../lib/supabase'

export type ActivityType = 'post_created' | 'comment_created' | 'post_liked' | 'comment_liked' | 'user_followed' | 'user_unfollowed' | 'post_shared' | 'collection_created' | 'item_added_to_collection'
export type TargetType = 'post' | 'comment' | 'user' | 'collection' | 'item'

export interface ActivityItem {
  id: string
  user_id: string
  activity_type: ActivityType
  actor_id: string
  target_id?: string
  target_type?: TargetType
  metadata?: Record<string, any>
  is_read: boolean
  created_at: string
  updated_at: string
}

export const activityFeedService = {
  /**
   * Create a new activity
   */
  async createActivity(params: {
    user_id: string
    activity_type: ActivityType
    actor_id: string
    target_id?: string
    target_type?: TargetType
    metadata?: Record<string, any>
  }): Promise<ActivityItem> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .insert({
          user_id: params.user_id,
          activity_type: params.activity_type,
          actor_id: params.actor_id,
          target_id: params.target_id,
          target_type: params.target_type,
          metadata: params.metadata,
        })
        .select()
        .single()

      if (error) throw error
      return data as ActivityItem
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create activity')
    }
  },

  /**
   * Get user's activity feed
   */
  async getUserActivityFeed(userId: string, limit = 50, offset = 0): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return (data || []) as ActivityItem[]
    } catch (err) {
      console.error('Error fetching activity feed:', err)
      return []
    }
  },

  /**
   * Get activities from followed users
   */
  async getFollowingActivityFeed(userId: string, limit = 50): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as ActivityItem[]
    } catch (err) {
      console.error('Error fetching following activity feed:', err)
      return []
    }
  },

  /**
   * Get recent activities by type
   */
  async getActivitiesByType(userId: string, activityType: ActivityType, limit = 20): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', activityType)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as ActivityItem[]
    } catch (err) {
      console.error('Error fetching activities by type:', err)
      return []
    }
  },

  /**
   * Get unread activity count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return data?.length || 0
    } catch (err) {
      console.error('Error fetching unread count:', err)
      return 0
    }
  },

  /**
   * Mark activity as read
   */
  async markAsRead(activityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_feed')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', activityId)

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to mark activity as read')
    }
  },

  /**
   * Mark all activities as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('mark_all_activities_as_read')

      if (error) throw error
      return data || 0
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to mark all activities as read')
    }
  },

  /**
   * Delete an activity
   */
  async deleteActivity(activityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_feed')
        .delete()
        .eq('id', activityId)

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete activity')
    }
  },

  /**
   * Delete all activities for a user
   */
  async deleteAllActivities(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_feed')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete activities')
    }
  },

  /**
   * Get activities by target
   */
  async getActivitiesByTarget(targetId: string, limit = 20): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('target_id', targetId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as ActivityItem[]
    } catch (err) {
      console.error('Error fetching activities by target:', err)
      return []
    }
  },

  /**
   * Get user's activity history
   */
  async getUserActivityHistory(userId: string, days = 30, limit = 100): Promise<ActivityItem[]> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('actor_id', userId)
        .gt('created_at', since)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as ActivityItem[]
    } catch (err) {
      console.error('Error fetching user activity history:', err)
      return []
    }
  },
}
