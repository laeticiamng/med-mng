/**
 * Posts Service
 * Manages user posts and comments for the social platform
 */

import { supabase } from '@/integrations/supabase/client'
import { Result, success, failure } from '@/types/result'
import { extractErrorMessage } from '@/lib/error-messages'

export type PostVisibility = 'public' | 'followers' | 'private'
export type PostStatus = 'draft' | 'published' | 'archived'
export type PostCategory = 'lifestyle' | 'learning' | 'wellness' | 'achievement' | 'question'

export interface Post {
  id: string
  user_id: string
  title: string
  content: string
  description?: string
  image_url?: string
  category?: PostCategory
  tags: string[]
  visibility: PostVisibility
  allows_comments: boolean
  allows_likes: boolean
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  engagement_score: number
  is_pinned: boolean
  is_featured: boolean
  status: PostStatus
  is_liked?: boolean
  created_at: string
  updated_at: string
  published_at?: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_comment_id?: string
  likes_count: number
  is_edited: boolean
  status: 'published' | 'deleted' | 'moderated'
  created_at: string
  updated_at: string
}

export interface PostShare {
  id: string
  post_id: string
  user_id: string
  shared_to: 'followers' | 'direct' | 'public'
  message?: string
  created_at: string
}

export const postsService = {
  /**
   * Create a new post
   */
  async createPost(
    title: string,
    content: string,
    options?: {
      description?: string
      imageUrl?: string
      category?: PostCategory
      tags?: string[]
      visibility?: PostVisibility
      allowsComments?: boolean
      allowsLikes?: boolean
    }
  ): Promise<Result<string, Error>> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title,
            content,
            description: options?.description,
            image_url: options?.imageUrl,
            category: options?.category || 'lifestyle',
            tags: options?.tags || [],
            visibility: options?.visibility || 'public',
            allows_comments: options?.allowsComments ?? true,
            allows_likes: options?.allowsLikes ?? true,
            status: 'published',
            published_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data.id as string)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get user's posts
   */
  async getUserPosts(userId: string, limit = 20, offset = 0): Promise<Result<Post[], Error>> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || []) as Post[])
    } catch (err) {
      console.error('Error fetching user posts:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get feed posts
   */
  async getFeedPosts(limit = 20, offset = 0): Promise<Result<Post[], Error>> {
    try {
      const { data, error } = await supabase.rpc('get_feed_posts', {
        limit_param: limit,
        offset_param: offset,
      })

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || []) as Post[])
    } catch (err) {
      console.error('Error fetching feed posts:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get a specific post
   */
  async getPost(postId: string): Promise<Result<Post | null, Error>> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .is('deleted_at', null)
        .single()

      // PGRST116 means no rows found - this is not an error
      if (error && error.code !== 'PGRST116') {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || null) as Post | null)
    } catch (err) {
      console.error('Error fetching post:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Update post
   */
  async updatePost(postId: string, updates: Partial<Post>): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Delete post (soft delete)
   */
  async deletePost(postId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', postId)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Like a post
   */
  async likePost(postId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase.rpc('like_post', {
        post_id_param: postId,
      })

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Unlike a post
   */
  async unlikePost(postId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase.rpc('unlike_post', {
        post_id_param: postId,
      })

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Check if user has liked a post
   */
  async isPostLiked(postId: string): Promise<Result<boolean, Error>> {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .single()

      // PGRST116 means no rows found - not an error, just not liked
      if (error && error.code !== 'PGRST116') {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(!!data)
    } catch (err) {
      console.error('Error checking like status:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Create a comment
   */
  async createComment(postId: string, content: string, parentCommentId?: string): Promise<Result<string, Error>> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            content,
            parent_comment_id: parentCommentId,
            status: 'published',
          },
        ])
        .select('id')
        .single()

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      // Update post comments count
      await supabase.rpc('increment_post_comments', {
        post_id_param: postId,
      })

      return success(data.id as string)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get post comments
   */
  async getPostComments(postId: string, limit = 20, offset = 0): Promise<Result<Comment[], Error>> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || []) as Comment[])
    } catch (err) {
      console.error('Error fetching comments:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get comment replies
   */
  async getCommentReplies(commentId: string): Promise<Result<Comment[], Error>> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('parent_comment_id', commentId)
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || []) as Comment[])
    } catch (err) {
      console.error('Error fetching replies:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Update comment
   */
  async updateComment(commentId: string, content: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content, is_edited: true, edited_at: new Date().toISOString() })
        .eq('id', commentId)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Delete comment (soft delete)
   */
  async deleteComment(commentId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ deleted_at: new Date().toISOString(), status: 'deleted' })
        .eq('id', commentId)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Bookmark a post
   */
  async bookmarkPost(postId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('post_bookmarks')
        .insert([{ post_id: postId }])
        .on('conflict', 'post_id,user_id', 'DO NOTHING')

      // 23505 is duplicate key error - acceptable for bookmarks
      if (error && error.code !== '23505') {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Remove bookmark
   */
  async removeBookmark(postId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('post_bookmarks')
        .delete()
        .eq('post_id', postId)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get user's bookmarks
   */
  async getUserBookmarks(userId: string, limit = 20, offset = 0): Promise<Result<Post[], Error>> {
    try {
      const { data, error } = await supabase
        .from('post_bookmarks')
        .select('posts(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(data?.map((item: any) => item.posts) || [])
    } catch (err) {
      console.error('Error fetching bookmarks:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Search posts
   */
  async searchPosts(query: string, limit = 20, offset = 0): Promise<Result<Post[], Error>> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || []) as Post[])
    } catch (err) {
      console.error('Error searching posts:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get trending posts
   */
  async getTrendingPosts(limit = 10): Promise<Result<Post[], Error>> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('engagement_score', { ascending: false })
        .limit(limit)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || []) as Post[])
    } catch (err) {
      console.error('Error fetching trending posts:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Get posts by category
   */
  async getPostsByCategory(category: PostCategory, limit = 20, offset = 0): Promise<Result<Post[], Error>> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('category', category)
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success((data || []) as Post[])
    } catch (err) {
      console.error('Error fetching posts by category:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Increment post views
   */
  async incrementViews(postId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase.rpc('increment_post_views', {
        post_id_param: postId,
      })

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      return success(undefined)
    } catch (err) {
      console.error('Error incrementing views:', err)
      return failure(new Error(extractErrorMessage(err)))
    }
  },

  /**
   * Share a post
   */
  async sharePost(
    postId: string,
    sharedTo: 'followers' | 'direct' | 'public',
    message?: string
  ): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('post_shares')
        .insert([
          {
            post_id: postId,
            shared_to: sharedTo,
            message,
          },
        ])

      if (error) {
        return failure(new Error(extractErrorMessage(error)))
      }

      // Update post shares count
      await supabase.rpc('increment_post_shares', {
        post_id_param: postId,
      })

      return success(undefined)
    } catch (err) {
      return failure(new Error(extractErrorMessage(err)))
    }
  },
}
