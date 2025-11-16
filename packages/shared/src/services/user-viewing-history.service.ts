/**
 * User Viewing History Service
 * Tracks and manages user item viewing history
 */

import { supabase } from '@/integrations/supabase/client'
import {
  UserViewingHistory,
  UserViewingHistoryInsert,
  ItemType,
  ViewSource,
} from '@/types/database-custom'

export const userViewingHistoryService = {
  /**
   * Record a view of an item
   */
  async recordView(
    userId: string,
    itemType: ItemType,
    itemId: string,
    options?: {
      itemTitle?: string
      durationSeconds?: number
      scrollDepth?: number
      completed?: boolean
      viewSource?: ViewSource
    }
  ): Promise<UserViewingHistory> {
    const { data, error } = await supabase
      .from('user_viewing_history')
      .insert({
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
        item_title: options?.itemTitle,
        duration_seconds: options?.durationSeconds || 0,
        scroll_depth: options?.scrollDepth,
        completed: options?.completed || false,
        view_source: options?.viewSource,
      } as UserViewingHistoryInsert)
      .select()
      .single()

    if (error)
      throw new Error(`Failed to record view: ${error.message}`)
    return data as UserViewingHistory
  },

  /**
   * Get viewing history for a user
   */
  async getUserHistory(
    userId: string,
    options?: {
      itemType?: ItemType
      limit?: number
      offset?: number
    }
  ): Promise<UserViewingHistory[]> {
    let query = supabase
      .from('user_viewing_history')
      .select('*')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })

    if (options?.itemType) {
      query = query.eq('item_type', options.itemType)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 20) - 1
      )
    }

    const { data, error } = await query

    if (error)
      throw new Error(`Failed to fetch history: ${error.message}`)
    return data as UserViewingHistory[]
  },

  /**
   * Get most recently viewed items
   */
  async getRecentViews(userId: string, limit: number = 10): Promise<UserViewingHistory[]> {
    const { data, error } = await supabase
      .from('user_viewing_history')
      .select('*')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(limit)

    if (error)
      throw new Error(`Failed to fetch recent views: ${error.message}`)
    return data as UserViewingHistory[]
  },

  /**
   * Get completed items by user
   */
  async getCompletedItems(
    userId: string,
    itemType?: ItemType
  ): Promise<UserViewingHistory[]> {
    let query = supabase
      .from('user_viewing_history')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('viewed_at', { ascending: false })

    if (itemType) {
      query = query.eq('item_type', itemType)
    }

    const { data, error } = await query

    if (error)
      throw new Error(`Failed to fetch completed items: ${error.message}`)
    return data as UserViewingHistory[]
  },

  /**
   * Get viewing statistics for a user
   */
  async getViewingStats(userId: string): Promise<{
    totalViews: number
    completedItems: number
    totalTimeSpent: number
    itemTypeBreakdown: Record<ItemType, number>
  }> {
    const { data, error } = await supabase
      .from('user_viewing_history')
      .select('*')
      .eq('user_id', userId)

    if (error)
      throw new Error(`Failed to fetch viewing stats: ${error.message}`)

    const histories = data as UserViewingHistory[]
    const itemTypeBreakdown: Record<ItemType, number> = {
      edn: 0,
      ecos: 0,
      song: 0,
      product: 0,
    }

    let totalTime = 0
    let completedCount = 0

    histories.forEach((h) => {
      itemTypeBreakdown[h.item_type]++
      totalTime += h.duration_seconds
      if (h.completed) completedCount++
    })

    return {
      totalViews: histories.length,
      completedItems: completedCount,
      totalTimeSpent: totalTime,
      itemTypeBreakdown,
    }
  },

  /**
   * Clear viewing history for a user
   */
  async clearHistory(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_viewing_history')
      .delete()
      .eq('user_id', userId)

    if (error)
      throw new Error(`Failed to clear history: ${error.message}`)
  },

  /**
   * Delete specific history entry
   */
  async deleteHistoryEntry(historyId: string): Promise<void> {
    const { error } = await supabase
      .from('user_viewing_history')
      .delete()
      .eq('id', historyId)

    if (error)
      throw new Error(`Failed to delete history entry: ${error.message}`)
  },

  /**
   * Get viewing history for a specific item across all users
   */
  async getItemViewers(
    itemType: ItemType,
    itemId: string
  ): Promise<UserViewingHistory[]> {
    const { data, error } = await supabase
      .from('user_viewing_history')
      .select('*')
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .order('viewed_at', { ascending: false })

    if (error)
      throw new Error(`Failed to fetch item viewers: ${error.message}`)
    return data as UserViewingHistory[]
  },
}
