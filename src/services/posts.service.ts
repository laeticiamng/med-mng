/**
 * Posts Service
 * Manages post CRUD operations and interactions
 */

import { supabase } from '@/integrations/supabase/client'
import {
  Post,
  PostInsert,
  PostUpdate,
  PostStatus,
  PostLike,
  PostLikeInsert,
} from '@/types/database-custom'

export const postsService = {
  /**
   * Create a new post
   */
  async createPost(
    userId: string,
    title: string,
    content: string,
    options?: {
      excerpt?: string
      tags?: string[]
      thumbnailUrl?: string
      status?: PostStatus
    }
  ): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title,
        content,
        excerpt: options?.excerpt,
        tags: options?.tags || [],
        thumbnail_url: options?.thumbnailUrl,
        status: options?.status || 'draft',
      } as PostInsert)
      .select()
      .single()

    if (error) throw new Error(`Failed to create post: ${error.message}`)
    return data as Post
  },

  /**
   * Update a post
   */
  async updatePost(
    postId: string,
    updates: Partial<PostUpdate>
  ): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update post: ${error.message}`)
    return data as Post
  },

  /**
   * Publish a post (changes status to published)
   */
  async publishPost(postId: string): Promise<Post> {
    return this.updatePost(postId, {
      status: 'published',
      published_at: new Date().toISOString(),
    })
  },

  /**
   * Archive a post
   */
  async archivePost(postId: string): Promise<Post> {
    return this.updatePost(postId, { status: 'archived' })
  },

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) throw new Error(`Failed to delete post: ${error.message}`)
  },

  /**
   * Get a single post by ID
   */
  async getPost(postId: string): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error) throw new Error(`Failed to fetch post: ${error.message}`)
    return data as Post
  },

  /**
   * Get all published posts
   */
  async getPublishedPosts(options?: {
    limit?: number
    offset?: number
    tags?: string[]
    sortBy?: 'recent' | 'popular' | 'mostliked'
  }): Promise<Post[]> {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')

    // Filter by tags if provided
    if (options?.tags && options.tags.length > 0) {
      query = query.filter(
        'tags',
        'cs',
        `{${options.tags.map((t) => `"${t}"`).join(',')}}`
      )
    }

    // Sort by requested order
    if (options?.sortBy === 'popular') {
      query = query.order('view_count', { ascending: false })
    } else if (options?.sortBy === 'mostliked') {
      query = query.order('like_count', { ascending: false })
    } else {
      query = query.order('published_at', { ascending: false })
    }

    // Pagination
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

    if (error) throw new Error(`Failed to fetch posts: ${error.message}`)
    return data as Post[]
  },

  /**
   * Get user's posts
   */
  async getUserPosts(
    userId: string,
    options?: {
      status?: PostStatus
      limit?: number
      offset?: number
    }
  ): Promise<Post[]> {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
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

    if (error) throw new Error(`Failed to fetch user posts: ${error.message}`)
    return data as Post[]
  },

  /**
   * Increment view count for a post
   */
  async incrementViewCount(postId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_post_views', {
      post_id: postId,
    })

    if (error && error.code !== 'PGRST107') {
      // PGRST107 = function not found, which is ok if we're using raw SQL instead
      // Fall back to manual increment
      const post = await this.getPost(postId)
      await this.updatePost(postId, {
        view_count: post.view_count + 1,
      })
    }
  },

  /**
   * Search posts by keyword
   */
  async searchPosts(
    keyword: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<Post[]> {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)
      .order('published_at', { ascending: false })

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

    if (error) throw new Error(`Failed to search posts: ${error.message}`)
    return data as Post[]
  },

  /**
   * Get trending posts
   */
  async getTrendingPosts(limit: number = 10): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('like_count', { ascending: false })
      .limit(limit)

    if (error)
      throw new Error(`Failed to fetch trending posts: ${error.message}`)
    return data as Post[]
  },

  /**
   * Get posts by tag
   */
  async getPostsByTag(tag: string, limit: number = 20): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .filter('tags', 'cs', `["${tag}"]`)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error)
      throw new Error(`Failed to fetch posts by tag: ${error.message}`)
    return data as Post[]
  },

  // ============ POST LIKES ============

  /**
   * Like a post
   */
  async likePost(postId: string, userId: string): Promise<PostLike> {
    const { data, error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
      } as PostLikeInsert)
      .select()
      .single()

    if (error) throw new Error(`Failed to like post: ${error.message}`)
    return data as PostLike
  },

  /**
   * Unlike a post
   */
  async unlikePost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to unlike post: ${error.message}`)
  },

  /**
   * Check if user liked a post
   */
  async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check like status: ${error.message}`)
    }

    return !!data
  },

  /**
   * Get post likes count
   */
  async getPostLikesCount(postId: string): Promise<number> {
    const { count, error } = await supabase
      .from('post_likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (error)
      throw new Error(`Failed to get likes count: ${error.message}`)
    return count || 0
  },

  /**
   * Get users who liked a post
   */
  async getPostLikers(postId: string, limit: number = 10): Promise<string[]> {
    const { data, error } = await supabase
      .from('post_likes')
      .select('user_id')
      .eq('post_id', postId)
      .limit(limit)

    if (error)
      throw new Error(`Failed to get post likers: ${error.message}`)
    return data?.map((item) => item.user_id) || []
  },
}
