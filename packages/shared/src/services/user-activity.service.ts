/**
 * User Activity Service
 * Logs and tracks user activities for audit trails
 */

import { supabase } from '../lib/supabase'
import {
  UserActivity,
  UserActivityInsert,
  ActivityAction,
  ActivityStatus,
} from '../types/database-custom'

export const userActivityService = {
  /**
   * Log a user activity
   */
  async logActivity(
    userId: string,
    action: ActivityAction,
    resourceType: string,
    options?: {
      resourceId?: string
      resourceName?: string
      ipAddress?: string
      userAgent?: string
      metadata?: Record<string, any>
      status?: ActivityStatus
      errorMessage?: string
    }
  ): Promise<UserActivity> {
    const { data, error } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: options?.resourceId,
        resource_name: options?.resourceName,
        ip_address: options?.ipAddress,
        user_agent: options?.userAgent,
        metadata: options?.metadata,
        status: options?.status || 'success',
        error_message: options?.errorMessage,
      } as UserActivityInsert)
      .select()
      .single()

    if (error) throw new Error(`Failed to log activity: ${error.message}`)
    return data as UserActivity
  },

  /**
   * Get user's activity log
   */
  async getUserActivity(
    userId: string,
    options?: {
      action?: ActivityAction
      resourceType?: string
      limit?: number
      offset?: number
      startDate?: Date
      endDate?: Date
    }
  ): Promise<UserActivity[]> {
    let query = supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.action) {
      query = query.eq('action', options.action)
    }

    if (options?.resourceType) {
      query = query.eq('resource_type', options.resourceType)
    }

    if (options?.startDate) {
      query = query.gte('created_at', options.startDate.toISOString())
    }

    if (options?.endDate) {
      query = query.lte('created_at', options.endDate.toISOString())
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 50) - 1
      )
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch activity: ${error.message}`)
    return data as UserActivity[]
  },

  /**
   * Get recent activities
   */
  async getRecentActivities(userId: string, limit: number = 20): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error)
      throw new Error(`Failed to fetch recent activities: ${error.message}`)
    return data as UserActivity[]
  },

  /**
   * Get activities by action type
   */
  async getActivitiesByAction(
    userId: string,
    action: ActivityAction,
    limit: number = 50
  ): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('action', action)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error)
      throw new Error(
        `Failed to fetch activities by action: ${error.message}`
      )
    return data as UserActivity[]
  },

  /**
   * Get failed activities
   */
  async getFailedActivities(
    userId: string,
    limit: number = 50
  ): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error)
      throw new Error(`Failed to fetch failed activities: ${error.message}`)
    return data as UserActivity[]
  },

  /**
   * Get activity stats for a user
   */
  async getActivityStats(userId: string): Promise<{
    totalActivities: number
    successfulActivities: number
    failedActivities: number
    actionBreakdown: Record<ActivityAction, number>
  }> {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to fetch activity stats: ${error.message}`)

    const activities = data as UserActivity[]
    const actionBreakdown: Record<string, number> = {}

    let successCount = 0
    let failCount = 0

    activities.forEach((activity) => {
      actionBreakdown[activity.action] =
        (actionBreakdown[activity.action] || 0) + 1

      if (activity.status === 'success') {
        successCount++
      } else if (activity.status === 'failed') {
        failCount++
      }
    })

    return {
      totalActivities: activities.length,
      successfulActivities: successCount,
      failedActivities: failCount,
      actionBreakdown: actionBreakdown as Record<ActivityAction, number>,
    }
  },

  /**
   * Get activities by resource
   */
  async getActivitiesByResource(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false })

    if (error)
      throw new Error(
        `Failed to fetch activities by resource: ${error.message}`
      )
    return data as UserActivity[]
  },

  /**
   * Get all activities across all users (admin only)
   */
  async getAllActivities(
    limit: number = 100,
    offset: number = 0
  ): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error)
      throw new Error(`Failed to fetch all activities: ${error.message}`)
    return data as UserActivity[]
  },
}
