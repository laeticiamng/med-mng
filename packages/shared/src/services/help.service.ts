/**
 * Help Center Service
 * Manages help articles, FAQs, tutorials, and support
 */

import { supabase } from '../lib/supabase'

export type HelpCategory = 'getting-started' | 'features' | 'troubleshooting' | 'account' | 'billing' | 'other'
export type TutorialDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type TicketStatus = 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export interface HelpArticle {
  id: string
  title: string
  slug: string
  content: string
  description?: string
  category: HelpCategory
  subcategory?: string
  tags: string[]
  views_count: number
  helpful_count: number
  unhelpful_count: number
  is_featured: boolean
  is_published: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
  published_at?: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  views_count: number
  helpful_count: number
  unhelpful_count: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Tutorial {
  id: string
  title: string
  description?: string
  content: string
  difficulty_level: TutorialDifficulty
  category: string
  video_url?: string
  estimated_duration_minutes?: number
  tags: string[]
  views_count: number
  helpful_count: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface HelpSupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  resolution_notes?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  closed_at?: string
}

export const helpService = {
  /**
   * Get featured help articles
   */
  async getFeaturedArticles(limit = 6): Promise<HelpArticle[]> {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('is_featured', true)
        .eq('is_published', true)
        .order('views_count', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as HelpArticle[]
    } catch (err) {
      console.error('Error fetching featured articles:', err)
      return []
    }
  },

  /**
   * Get articles by category
   */
  async getArticlesByCategory(category: HelpCategory, limit = 20, offset = 0): Promise<HelpArticle[]> {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('category', category)
        .eq('is_published', true)
        .order('views_count', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return (data || []) as HelpArticle[]
    } catch (err) {
      console.error('Error fetching articles by category:', err)
      return []
    }
  },

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string): Promise<HelpArticle | null> {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      // Increment views
      if (data) {
        await supabase
          .from('help_articles')
          .update({ views_count: data.views_count + 1 })
          .eq('id', data.id)
      }

      return (data || null) as HelpArticle | null
    } catch (err) {
      console.error('Error fetching article:', err)
      return null
    }
  },

  /**
   * Search help articles
   */
  async searchArticles(query: string, limit = 20): Promise<HelpArticle[]> {
    try {
      const { data, error } = await supabase.rpc('search_help_articles', {
        search_query: query,
        limit_param: limit,
      })

      if (error) throw error
      return (data || []) as HelpArticle[]
    } catch (err) {
      console.error('Error searching articles:', err)
      return []
    }
  },

  /**
   * Get all FAQs
   */
  async getFAQs(category?: string, limit = 50, offset = 0): Promise<FAQ[]> {
    try {
      let query = supabase.from('faqs').select('*').eq('is_published', true)

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query
        .order('order_index', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return (data || []) as FAQ[]
    } catch (err) {
      console.error('Error fetching FAQs:', err)
      return []
    }
  },

  /**
   * Get all tutorials
   */
  async getTutorials(difficulty?: TutorialDifficulty, limit = 20, offset = 0): Promise<Tutorial[]> {
    try {
      let query = supabase.from('tutorials').select('*').eq('is_published', true)

      if (difficulty) {
        query = query.eq('difficulty_level', difficulty)
      }

      const { data, error } = await query
        .order('order_index', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return (data || []) as Tutorial[]
    } catch (err) {
      console.error('Error fetching tutorials:', err)
      return []
    }
  },

  /**
   * Get tutorial by ID
   */
  async getTutorial(tutorialId: string): Promise<Tutorial | null> {
    try {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .eq('id', tutorialId)
        .eq('is_published', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      // Increment views
      if (data) {
        await supabase
          .from('tutorials')
          .update({ views_count: data.views_count + 1 })
          .eq('id', data.id)
      }

      return (data || null) as Tutorial | null
    } catch (err) {
      console.error('Error fetching tutorial:', err)
      return null
    }
  },

  /**
   * Log search query
   */
  async logSearchQuery(query: string, resultsCount?: number, clickedArticleId?: string): Promise<void> {
    try {
      await supabase.from('help_search_logs').insert([
        {
          search_query: query,
          results_count: resultsCount,
          clicked_article_id: clickedArticleId,
        },
      ])
    } catch (err) {
      console.error('Error logging search:', err)
    }
  },

  /**
   * Submit help feedback
   */
  async submitFeedback(
    articleId: string,
    isHelpful: boolean,
    feedbackText?: string
  ): Promise<void> {
    try {
      await supabase.from('help_feedback').insert([
        {
          article_id: articleId,
          is_helpful: isHelpful,
          feedback_text: feedbackText,
        },
      ])

      // Update article helpful count
      const column = isHelpful ? 'helpful_count' : 'unhelpful_count'
      const { data: article } = await supabase
        .from('help_articles')
        .select(column)
        .eq('id', articleId)
        .single()

      if (article) {
        await supabase
          .from('help_articles')
          .update({ [column]: (article[column] || 0) + 1 })
          .eq('id', articleId)
      }
    } catch (err) {
      console.error('Error submitting feedback:', err)
    }
  },

  /**
   * Create support ticket
   */
  async createTicket(
    subject: string,
    description: string,
    category: string,
    priority: TicketPriority = 'medium'
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([
          {
            subject,
            description,
            category,
            priority,
            status: 'open',
          },
        ])
        .select('id')
        .single()

      if (error) throw error
      return data.id as string
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create support ticket')
    }
  },

  /**
   * Get user's support tickets
   */
  async getUserTickets(limit = 20, offset = 0): Promise<HelpSupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return (data || []) as HelpSupportTicket[]
    } catch (err) {
      console.error('Error fetching tickets:', err)
      return []
    }
  },

  /**
   * Get support ticket by ID
   */
  async getTicket(ticketId: string): Promise<HelpSupportTicket | null> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return (data || null) as HelpSupportTicket | null
    } catch (err) {
      console.error('Error fetching ticket:', err)
      return null
    }
  },

  /**
   * Update support ticket status
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus, notes?: string): Promise<void> {
    try {
      const updates: any = { status }
      if (notes) updates.resolution_notes = notes
      if (status === 'resolved') updates.resolved_at = new Date().toISOString()
      if (status === 'closed') updates.closed_at = new Date().toISOString()

      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId)

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update ticket')
    }
  },
}
