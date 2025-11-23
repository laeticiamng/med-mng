/**
 * User Favorites Service
 * Manages favorite items for users
 */

import { supabase } from '../lib/supabase'
import {
  UserFavorite,
  UserFavoriteInsert,
  ItemType,
} from '../types/database-custom'

export const userFavoritesService = {
  /**
   * Add an item to user's favorites
   */
  async addFavorite(
    userId: string,
    itemType: ItemType,
    itemId: string,
    itemData?: Record<string, any>
  ): Promise<UserFavorite> {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
        item_data: itemData,
      } as UserFavoriteInsert)
      .select()
      .single()

    if (error) throw new Error(`Failed to add favorite: ${error.message}`)
    return data as UserFavorite
  },

  /**
   * Remove an item from user's favorites
   */
  async removeFavorite(
    userId: string,
    itemType: ItemType,
    itemId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)

    if (error) throw new Error(`Failed to remove favorite: ${error.message}`)
  },

  /**
   * Check if an item is favorited by user
   */
  async isFavorited(
    userId: string,
    itemType: ItemType,
    itemId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check favorite: ${error.message}`)
    }

    return !!data
  },

  /**
   * Get all favorites for a user
   */
  async getUserFavorites(
    userId: string,
    itemType?: ItemType,
    limit?: number,
    offset?: number
  ): Promise<UserFavorite[]> {
    let query = supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (itemType) {
      query = query.eq('item_type', itemType)
    }

    if (limit) {
      query = query.limit(limit)
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch favorites: ${error.message}`)
    return data as UserFavorite[]
  },

  /**
   * Get favorite count for a user
   */
  async getFavoriteCount(userId: string, itemType?: ItemType): Promise<number> {
    let query = supabase
      .from('user_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (itemType) {
      query = query.eq('item_type', itemType)
    }

    const { count, error } = await query

    if (error) throw new Error(`Failed to get favorite count: ${error.message}`)
    return count || 0
  },

  /**
   * Get favorites for multiple items
   */
  async getFavoritesForItems(
    userId: string,
    items: Array<{ type: ItemType; id: string }>
  ): Promise<Map<string, boolean>> {
    const favorites = new Map<string, boolean>()

    for (const item of items) {
      const isFav = await this.isFavorited(userId, item.type, item.id)
      favorites.set(`${item.type}:${item.id}`, isFav)
    }

    return favorites
  },
}
