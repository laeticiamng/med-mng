/**
 * Notifications Service
 * Manages user notifications and notification preferences
 */

import { supabase } from '@/integrations/supabase/client'
import { Result, success, failure } from '@/types/result'
import { extractErrorMessage } from '@/lib/error-messages'

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'system'
export type EmailFrequency = 'instant' | 'daily' | 'weekly' | 'never'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message?: string
  related_user_id?: string
  related_post_id?: string
  related_comment_id?: string
  action_url?: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  likes_enabled: boolean
  comments_enabled: boolean
  follows_enabled: boolean
  mentions_enabled: boolean
  system_enabled: boolean
  email_frequency: EmailFrequency
  push_enabled: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
  created_at: string
  updated_at: string
}

export const notificationsService = {
  /**
   * Create a new notification
   */
  async createNotification(params: {
    user_id: string
    type: NotificationType
    title: string
    message?: string
    related_user_id?: string
    related_post_id?: string
    related_comment_id?: string
    action_url?: string
  }): Promise<Result<Notification, Error>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: params.user_id,
          type: params.type,
          title: params.title,
          message: params.message,
          related_user_id: params.related_user_id,
          related_post_id: params.related_post_id,
          related_comment_id: params.related_comment_id,
          action_url: params.action_url,
        })
        .select()
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as Notification)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: string, limit = 20): Promise<Result<Notification[], Error>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || []) as Notification[])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string): Promise<Result<number, Error>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data?.length || 0)
    } catch (err) {
      console.error('Error fetching unread count:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<Result<number, Error>> {
    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_as_read')

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data || 0)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get notification preferences
   */
  async getPreferences(userId: string): Promise<Result<NotificationPreferences, Error>> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      // PGRST116 means no rows found - return defaults
      if (error && error.code !== 'PGRST116') {
        return failure(new Error(extractErrorMessage(error)))
      }

      // Return defaults if not found
      if (!data) {
        return success({
          id: '',
          user_id: userId,
          likes_enabled: true,
          comments_enabled: true,
          follows_enabled: true,
          mentions_enabled: true,
          system_enabled: true,
          email_frequency: 'daily',
          push_enabled: true,
          quiet_hours_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      return success(data as NotificationPreferences)
    } catch (err) {
      console.error('Error fetching notification preferences:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<Result<NotificationPreferences, Error>> {
    try {
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (!existing) {
        // Create new preferences if they don't exist
        const { data, error } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: userId,
            ...updates,
          })
          .select()
          .single()

        if (error) {
          return failure(new Error(extractErrorMessage(error)))
        }

        return success(data as NotificationPreferences)
      } else {
        // Update existing preferences
        const { data, error } = await supabase
          .from('notification_preferences')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()
          .single()

        if (error) {
          return failure(new Error(extractErrorMessage(error)))
        }

        return success(data as NotificationPreferences)
      }
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get recent activity notifications
   */
  async getRecentActivity(userId: string, days = 7): Promise<Result<Notification[], Error>> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .gt('created_at', since)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || []) as Notification[])
    } catch (err) {
      console.error('Error fetching recent activity:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get notifications by type
   */
  async getNotificationsByType(userId: string, type: NotificationType): Promise<Result<Notification[], Error>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || []) as Notification[])
    } catch (err) {
      console.error('Error fetching notifications by type:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },
}

// Extended notification preferences management
export interface NotificationPreferencesExt {
  id: string
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  inAppNotifications: boolean
  smsNotifications: boolean
  newsletter: boolean
  instantAlerts: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  quietHoursEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface AlertRule {
  id: string
  userId: string
  name: string
  description?: string
  ruleType: string
  triggerCondition: Record<string, any>
  actionType: 'email' | 'push' | 'in_app' | 'sms'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const alertService = {
  // Alert Rules Management
  async createAlertRule(userId: string, ruleData: Partial<AlertRule>): Promise<Result<AlertRule, Error>> {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .insert({
          user_id: userId,
          name: ruleData.name,
          description: ruleData.description,
          rule_type: ruleData.ruleType,
          trigger_condition: ruleData.triggerCondition,
          action_type: ruleData.actionType,
        })
        .select()
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as AlertRule)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  async getUserAlertRules(userId: string): Promise<Result<AlertRule[], Error>> {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || []) as AlertRule[])
    } catch (err) {
      console.error('Error fetching alert rules:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<Result<AlertRule, Error>> {
    try {
      const updateData: Record<string, any> = {}
      if (updates.name) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      if (updates.triggerCondition) updateData.trigger_condition = updates.triggerCondition
      if (updates.actionType) updateData.action_type = updates.actionType

      const { data, error } = await supabase
        .from('alert_rules')
        .update(updateData)
        .eq('id', ruleId)
        .select()
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data as AlertRule)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  async deleteAlertRule(ruleId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .delete()
        .eq('id', ruleId)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },
}
