/**
 * Post Comments Service
 * Manages post comments and replies
 */

import { supabase } from '../lib/supabase'
import {
  PostComment,
  PostCommentInsert,
  PostCommentUpdate,
  CommentLike,
  CommentLikeInsert,
} from '../types/database-custom'

export const postCommentsService = {
  /**
   * Create a comment on a post
   */
  async createComment(
    postId: string,
    userId: string,
    content: string,
    parentCommentId?: string
  ): Promise<PostComment> {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        parent_comment_id: parentCommentId || null,
      } as PostCommentInsert)
      .select()
      .single()

    if (error) throw new Error(`Failed to create comment: ${error.message}`)
    return data as PostComment
  },

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    content: string
  ): Promise<PostComment> {
    const { data, error } = await supabase
      .from('post_comments')
      .update({
        content,
        edited_at: new Date().toISOString(),
      } as PostCommentUpdate)
      .eq('id', commentId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update comment: ${error.message}`)
    return data as PostComment
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw new Error(`Failed to delete comment: ${error.message}`)
  },

  /**
   * Get a single comment
   */
  async getComment(commentId: string): Promise<PostComment> {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('id', commentId)
      .single()

    if (error) throw new Error(`Failed to fetch comment: ${error.message}`)
    return data as PostComment
  },

  /**
   * Get all comments on a post
   */
  async getPostComments(
    postId: string,
    options?: {
      limit?: number
      offset?: number
      parentCommentIdOnly?: boolean
    }
  ): Promise<PostComment[]> {
    let query = supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)

    // Only get top-level comments (not replies)
    if (options?.parentCommentIdOnly) {
      query = query.is('parent_comment_id', null)
    }

    query = query.order('created_at', { ascending: false })

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
      throw new Error(`Failed to fetch post comments: ${error.message}`)
    return data as PostComment[]
  },

  /**
   * Get replies to a comment
   */
  async getCommentReplies(
    commentId: string,
    limit?: number
  ): Promise<PostComment[]> {
    let query = supabase
      .from('post_comments')
      .select('*')
      .eq('parent_comment_id', commentId)
      .order('created_at', { ascending: true })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error)
      throw new Error(`Failed to fetch comment replies: ${error.message}`)
    return data as PostComment[]
  },

  /**
   * Get all comments by a user
   */
  async getUserComments(
    userId: string,
    limit: number = 50
  ): Promise<PostComment[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error)
      throw new Error(`Failed to fetch user comments: ${error.message}`)
    return data as PostComment[]
  },

  /**
   * Get comment count for a post
   */
  async getCommentCount(postId: string): Promise<number> {
    const { count, error } = await supabase
      .from('post_comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (error)
      throw new Error(`Failed to get comment count: ${error.message}`)
    return count || 0
  },

  /**
   * Get reply count for a comment
   */
  async getReplyCount(commentId: string): Promise<number> {
    const { count, error } = await supabase
      .from('post_comments')
      .select('id', { count: 'exact', head: true })
      .eq('parent_comment_id', commentId)

    if (error)
      throw new Error(`Failed to get reply count: ${error.message}`)
    return count || 0
  },

  // ============ COMMENT LIKES ============

  /**
   * Like a comment
   */
  async likeComment(commentId: string, userId: string): Promise<CommentLike> {
    const { data, error } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: userId,
      } as CommentLikeInsert)
      .select()
      .single()

    if (error) throw new Error(`Failed to like comment: ${error.message}`)
    return data as CommentLike
  },

  /**
   * Unlike a comment
   */
  async unlikeComment(commentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to unlike comment: ${error.message}`)
  },

  /**
   * Check if user liked a comment
   */
  async hasUserLikedComment(
    commentId: string,
    userId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check comment like: ${error.message}`)
    }

    return !!data
  },

  /**
   * Get comment likes count
   */
  async getCommentLikesCount(commentId: string): Promise<number> {
    const { count, error } = await supabase
      .from('comment_likes')
      .select('id', { count: 'exact', head: true })
      .eq('comment_id', commentId)

    if (error)
      throw new Error(`Failed to get comment likes count: ${error.message}`)
    return count || 0
  },

  /**
   * Get users who liked a comment
   */
  async getCommentLikers(
    commentId: string,
    limit: number = 10
  ): Promise<string[]> {
    const { data, error } = await supabase
      .from('comment_likes')
      .select('user_id')
      .eq('comment_id', commentId)
      .limit(limit)

    if (error)
      throw new Error(`Failed to get comment likers: ${error.message}`)
    return data?.map((item) => item.user_id) || []
  },

  /**
   * Get all activity on a post (comments + replies)
   */
  async getPostActivity(
    postId: string,
    limit: number = 100
  ): Promise<PostComment[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error)
      throw new Error(`Failed to fetch post activity: ${error.message}`)
    return data as PostComment[]
  },

  /**
   * Get recent comments from all posts
   */
  async getRecentComments(limit: number = 50): Promise<PostComment[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error)
      throw new Error(`Failed to fetch recent comments: ${error.message}`)
    return data as PostComment[]
  },
}
