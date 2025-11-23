/**
 * Recommendations Service
 * Manages personalized content recommendations and user preferences
 */

import { supabase } from '../lib/supabase'

export type InteractionType = 'view' | 'like' | 'comment' | 'share' | 'bookmark' | 'read'
export type ContentType = 'post' | 'article' | 'video' | 'audio' | 'collection'
export type RecommendationSource = 'collaborative' | 'content_based' | 'trending' | 'personalized' | 'social'
export type LearningStyle = 'visual' | 'auditory' | 'reading' | 'kinesthetic' | 'mixed'
export type EngagementLevel = 'low' | 'medium' | 'high'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface UserPreferences {
  id: string
  user_id: string
  interests: string[]
  preferred_categories: string[]
  reading_time: number
  engagement_level: EngagementLevel
  learning_style: LearningStyle
  created_at: string
  updated_at: string
}

export interface ContentMetadata {
  id: string
  content_id: string
  content_type: ContentType
  title: string
  description?: string
  categories: string[]
  tags: string[]
  difficulty_level: DifficultyLevel
  estimated_reading_time?: number
  engagement_score: number
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  created_at: string
  updated_at: string
}

export interface Recommendation {
  id: string
  user_id: string
  content_id: string
  content_type: ContentType
  title: string
  description?: string
  relevance_score: number
  reason?: string
  recommendation_source: RecommendationSource
  clicked?: boolean
}

export interface UserInteraction {
  id: string
  user_id: string
  content_id: string
  content_type: ContentType
  interaction_type: InteractionType
  duration_seconds?: number
  created_at: string
}

export const recommendationsService = {
  /**
   * Get user recommendations
   */
  async getUserRecommendations(userId: string, limit = 10): Promise<Recommendation[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_recommendations', {
          user_id_param: userId,
          limit_param: limit,
        })

      if (error) throw error
      return (data || []) as Recommendation[]
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      return []
    }
  },

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return (data || null) as UserPreferences | null
    } catch (err) {
      console.error('Error fetching user preferences:', err)
      return null
    }
  },

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      // Check if preferences exist
      const existing = await this.getPreferences(userId)

      if (!existing) {
        // Create new preferences
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            ...updates,
          })
          .select()
          .single()

        if (error) throw error
        return data as UserPreferences
      } else {
        // Update existing
        const { data, error } = await supabase
          .from('user_preferences')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()
          .single()

        if (error) throw error
        return data as UserPreferences
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update preferences')
    }
  },

  /**
   * Record user interaction
   */
  async recordInteraction(params: {
    user_id: string
    content_id: string
    content_type: ContentType
    interaction_type: InteractionType
    duration_seconds?: number
  }): Promise<void> {
    try {
      const { error } = await supabase.rpc('record_user_interaction', {
        user_id_param: params.user_id,
        content_id_param: params.content_id,
        content_type_param: params.content_type,
        interaction_type_param: params.interaction_type,
        duration_seconds_param: params.duration_seconds,
      })

      if (error) throw error
    } catch (err) {
      console.error('Error recording interaction:', err)
      // Non-blocking - don't throw
    }
  },

  /**
   * Get trending content
   */
  async getTrendingContent(
    limit = 10,
    contentType?: ContentType
  ): Promise<ContentMetadata[]> {
    try {
      let query = supabase.from('content_metadata').select('*')

      if (contentType) {
        query = query.eq('content_type', contentType)
      }

      const { data, error } = await query
        .order('engagement_score', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as ContentMetadata[]
    } catch (err) {
      console.error('Error fetching trending content:', err)
      return []
    }
  },

  /**
   * Get content recommendations by category
   */
  async getRecommendationsByCategory(
    userId: string,
    category: string,
    limit = 10
  ): Promise<Recommendation[]> {
    try {
      // Get recommendations first
      const { data, error } = await supabase
        .from('recommendations')
        .select(
          `
          id,
          user_id,
          content_id,
          content_type,
          relevance_score,
          reason,
          recommendation_source,
          content_metadata!inner(title, description, categories)
        `
        )
        .eq('user_id', userId)
        .contains('content_metadata.categories', [category])
        .order('relevance_score', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as any
    } catch (err) {
      console.error('Error fetching recommendations by category:', err)
      return []
    }
  },

  /**
   * Get user interaction history
   */
  async getInteractionHistory(
    userId: string,
    contentType?: ContentType,
    limit = 50
  ): Promise<UserInteraction[]> {
    try {
      let query = supabase.from('user_interactions').select('*').eq('user_id', userId)

      if (contentType) {
        query = query.eq('content_type', contentType)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as UserInteraction[]
    } catch (err) {
      console.error('Error fetching interaction history:', err)
      return []
    }
  },

  /**
   * Get similar content based on tags
   */
  async getSimilarContent(
    contentId: string,
    limit = 5
  ): Promise<ContentMetadata[]> {
    try {
      // Get the original content
      const { data: originalContent, error: contentError } = await supabase
        .from('content_metadata')
        .select('tags')
        .eq('content_id', contentId)
        .single()

      if (contentError) throw contentError

      if (!originalContent || !originalContent.tags || originalContent.tags.length === 0) {
        return []
      }

      // Find similar content with matching tags
      const { data, error } = await supabase
        .from('content_metadata')
        .select('*')
        .neq('content_id', contentId)
        .overlaps('tags', originalContent.tags)
        .order('engagement_score', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as ContentMetadata[]
    } catch (err) {
      console.error('Error fetching similar content:', err)
      return []
    }
  },

  /**
   * Update content engagement metrics
   */
  async updateContentMetadata(
    contentId: string,
    contentType: ContentType,
    updates: Partial<ContentMetadata>
  ): Promise<ContentMetadata> {
    try {
      const { data, error } = await supabase
        .from('content_metadata')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .select()
        .single()

      if (error) throw error
      return data as ContentMetadata
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update content metadata')
    }
  },

  /**
   * Mark recommendation as clicked
   */
  async markRecommendationAsClicked(recommendationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ clicked: true })
        .eq('id', recommendationId)

      if (error) throw error
    } catch (err) {
      console.error('Error marking recommendation as clicked:', err)
      // Non-blocking
    }
  },
}
