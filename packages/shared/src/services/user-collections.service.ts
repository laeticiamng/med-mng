/**
 * User Collections Service
 * Manages user-created collections of items
 */

import { supabase } from '@/integrations/supabase/client'
import {
  UserCollection,
  UserCollectionInsert,
  UserCollectionUpdate,
  CollectionItem,
  CollectionItemInsert,
  ItemType,
} from '@/types/database-custom'

export const userCollectionsService = {
  // ============ COLLECTIONS ============

  /**
   * Create a new collection
   */
  async createCollection(
    userId: string,
    name: string,
    options?: {
      description?: string
      color?: string
      isPublic?: boolean
    }
  ): Promise<UserCollection> {
    const { data, error } = await supabase
      .from('user_collections')
      .insert({
        user_id: userId,
        name,
        description: options?.description,
        color: options?.color,
        is_public: options?.isPublic || false,
      } as UserCollectionInsert)
      .select()
      .single()

    if (error) throw new Error(`Failed to create collection: ${error.message}`)
    return data as UserCollection
  },

  /**
   * Update a collection
   */
  async updateCollection(
    collectionId: string,
    updates: Partial<UserCollectionUpdate>
  ): Promise<UserCollection> {
    const { data, error } = await supabase
      .from('user_collections')
      .update(updates)
      .eq('id', collectionId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update collection: ${error.message}`)
    return data as UserCollection
  },

  /**
   * Delete a collection
   */
  async deleteCollection(collectionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_collections')
      .delete()
      .eq('id', collectionId)

    if (error) throw new Error(`Failed to delete collection: ${error.message}`)
  },

  /**
   * Get user's collections
   */
  async getUserCollections(userId: string): Promise<UserCollection[]> {
    const { data, error } = await supabase
      .from('user_collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error)
      throw new Error(`Failed to fetch collections: ${error.message}`)
    return data as UserCollection[]
  },

  /**
   * Get a single collection
   */
  async getCollection(collectionId: string): Promise<UserCollection> {
    const { data, error } = await supabase
      .from('user_collections')
      .select('*')
      .eq('id', collectionId)
      .single()

    if (error) throw new Error(`Failed to fetch collection: ${error.message}`)
    return data as UserCollection
  },

  /**
   * Get public collections
   */
  async getPublicCollections(limit: number = 20): Promise<UserCollection[]> {
    const { data, error } = await supabase
      .from('user_collections')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error)
      throw new Error(`Failed to fetch public collections: ${error.message}`)
    return data as UserCollection[]
  },

  // ============ COLLECTION ITEMS ============

  /**
   * Add an item to a collection
   */
  async addItemToCollection(
    collectionId: string,
    itemType: ItemType,
    itemId: string,
    itemData?: Record<string, any>
  ): Promise<CollectionItem> {
    const { data, error } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        item_type: itemType,
        item_id: itemId,
        item_data: itemData,
      } as CollectionItemInsert)
      .select()
      .single()

    if (error)
      throw new Error(`Failed to add item to collection: ${error.message}`)
    return data as CollectionItem
  },

  /**
   * Remove an item from a collection
   */
  async removeItemFromCollection(
    collectionId: string,
    itemType: ItemType,
    itemId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', collectionId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)

    if (error)
      throw new Error(`Failed to remove item from collection: ${error.message}`)
  },

  /**
   * Get items in a collection
   */
  async getCollectionItems(
    collectionId: string,
    limit?: number,
    offset?: number
  ): Promise<CollectionItem[]> {
    let query = supabase
      .from('collection_items')
      .select('*')
      .eq('collection_id', collectionId)
      .order('position', { ascending: true, nullsFirst: false })

    if (limit) query = query.limit(limit)
    if (offset) query = query.range(offset, offset + (limit || 20) - 1)

    const { data, error } = await query

    if (error)
      throw new Error(`Failed to fetch collection items: ${error.message}`)
    return data as CollectionItem[]
  },

  /**
   * Update item position in collection
   */
  async updateItemPosition(
    itemId: string,
    position: number
  ): Promise<CollectionItem> {
    const { data, error } = await supabase
      .from('collection_items')
      .update({ position })
      .eq('id', itemId)
      .select()
      .single()

    if (error)
      throw new Error(`Failed to update item position: ${error.message}`)
    return data as CollectionItem
  },

  /**
   * Check if item is in collection
   */
  async isItemInCollection(
    collectionId: string,
    itemType: ItemType,
    itemId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('collection_items')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check item in collection: ${error.message}`)
    }

    return !!data
  },

  /**
   * Get item count in collection
   */
  async getCollectionItemCount(collectionId: string): Promise<number> {
    const { count, error } = await supabase
      .from('collection_items')
      .select('id', { count: 'exact', head: true })
      .eq('collection_id', collectionId)

    if (error)
      throw new Error(`Failed to get item count: ${error.message}`)
    return count || 0
  },

  /**
   * Get all collections containing an item
   */
  async getCollectionsForItem(
    userId: string,
    itemType: ItemType,
    itemId: string
  ): Promise<UserCollection[]> {
    const { data, error } = await supabase
      .from('collection_items')
      .select('collection_id')
      .eq('item_type', itemType)
      .eq('item_id', itemId)

    if (error)
      throw new Error(`Failed to fetch collections for item: ${error.message}`)

    if (!data || data.length === 0) return []

    const collectionIds = data.map((item) => item.collection_id)

    const { data: collections, error: collectError } = await supabase
      .from('user_collections')
      .select('*')
      .in('id', collectionIds)
      .eq('user_id', userId)

    if (collectError)
      throw new Error(`Failed to fetch collections: ${collectError.message}`)
    return collections as UserCollection[]
  },
}
