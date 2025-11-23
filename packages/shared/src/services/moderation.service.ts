/**
 * Content Moderation Service
 * Manages moderation workflows, rules, teams, and appeals
 */

import { supabase } from '../lib/supabase'

// Types
export interface ModerationRule {
  id: string
  name: string
  description?: string
  ruleType: 'keyword' | 'pattern' | 'user_behavior' | 'content_type'
  condition: Record<string, any>
  action: 'flag' | 'hide' | 'remove' | 'escalate' | 'ban'
  actionConfig?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  priority: number
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface ModerationTeam {
  id: string
  name: string
  description?: string
  expertise: string[]
  maxQueueSize: number
  autoEscalateAfterHours: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ModerationTeamMember {
  id: string
  teamId: string
  userId: string
  role: 'lead' | 'reviewer' | 'supervisor' | 'viewer'
  expertise?: string[]
  maxDailyReviews: number
  available: boolean
  lastActionAt?: string
  createdAt: string
  updatedAt: string
}

export interface ModerationAppeal {
  id: string
  originalActionId: string
  userId: string
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  reason: string
  appealType: 'content_not_violation' | 'account_error' | 'disproportionate'
  additionalContext?: string
  reviewedBy?: string
  reviewNotes?: string
  decisionReason?: string
  createdAt: string
  reviewedAt?: string
  updatedAt: string
}

export interface ContentFilterResult {
  contentId: string
  contentType: string
  detectedIssues: string[]
  confidenceScore: number
  requiresReview: boolean
}

export interface ModerationStatistics {
  id: string
  statisticDate: string
  totalReviewed: number
  totalEscalated: number
  totalAppeals: number
  appealApprovalRate?: number
  avgReviewTimeSeconds?: number
  moderationTeamId?: string
}

// Moderation Rules
export const moderationService = {
  // Rules Management
  async createRule(ruleData: Partial<ModerationRule>): Promise<ModerationRule> {
    try {
      const { data, error } = await supabase
        .from('moderation_rules')
        .insert({
          name: ruleData.name,
          description: ruleData.description,
          rule_type: ruleData.ruleType,
          condition: ruleData.condition,
          action: ruleData.action,
          action_config: ruleData.actionConfig,
          severity: ruleData.severity,
          priority: ruleData.priority || 0,
        })
        .select()
        .single()

      if (error) throw error
      return mapModerationRule(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create moderation rule')
    }
  },

  async getRules(active?: boolean): Promise<ModerationRule[]> {
    try {
      let query = supabase.from('moderation_rules').select('*')
      if (active !== undefined) {
        query = query.eq('is_active', active)
      }
      const { data, error } = await query.order('priority', { ascending: false })

      if (error) throw error
      return (data || []).map(mapModerationRule)
    } catch (err) {
      console.error('Error fetching moderation rules:', err)
      return []
    }
  },

  async updateRule(ruleId: string, updates: Partial<ModerationRule>): Promise<ModerationRule> {
    try {
      const updateData: Record<string, any> = {}
      if (updates.name) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.condition) updateData.condition = updates.condition
      if (updates.action) updateData.action = updates.action
      if (updates.severity) updateData.severity = updates.severity
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      if (updates.priority !== undefined) updateData.priority = updates.priority

      const { data, error } = await supabase
        .from('moderation_rules')
        .update(updateData)
        .eq('id', ruleId)
        .select()
        .single()

      if (error) throw error
      return mapModerationRule(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update moderation rule')
    }
  },

  async deleteRule(ruleId: string): Promise<void> {
    try {
      const { error } = await supabase.from('moderation_rules').delete().eq('id', ruleId)
      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete moderation rule')
    }
  },

  // Moderation Teams
  async createTeam(teamData: Partial<ModerationTeam>): Promise<ModerationTeam> {
    try {
      const { data, error } = await supabase
        .from('moderation_teams')
        .insert({
          name: teamData.name,
          description: teamData.description,
          expertise: teamData.expertise,
          max_queue_size: teamData.maxQueueSize || 100,
          auto_escalate_after_hours: teamData.autoEscalateAfterHours || 24,
        })
        .select()
        .single()

      if (error) throw error
      return mapModerationTeam(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create moderation team')
    }
  },

  async getTeams(): Promise<ModerationTeam[]> {
    try {
      const { data, error } = await supabase
        .from('moderation_teams')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return (data || []).map(mapModerationTeam)
    } catch (err) {
      console.error('Error fetching moderation teams:', err)
      return []
    }
  },

  async getTeam(teamId: string): Promise<ModerationTeam | null> {
    try {
      const { data, error } = await supabase
        .from('moderation_teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? mapModerationTeam(data) : null
    } catch (err) {
      console.error('Error fetching moderation team:', err)
      return null
    }
  },

  async addTeamMember(
    teamId: string,
    userId: string,
    role: 'lead' | 'reviewer' | 'supervisor' | 'viewer',
    expertise?: string[]
  ): Promise<ModerationTeamMember> {
    try {
      const { data, error } = await supabase
        .from('moderation_team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
          expertise,
        })
        .select()
        .single()

      if (error) throw error
      return mapModerationTeamMember(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add team member')
    }
  },

  async getTeamMembers(teamId: string): Promise<ModerationTeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('moderation_team_members')
        .select('*')
        .eq('team_id', teamId)
        .order('role')

      if (error) throw error
      return (data || []).map(mapModerationTeamMember)
    } catch (err) {
      console.error('Error fetching team members:', err)
      return []
    }
  },

  // Appeals Management
  async createAppeal(appealData: {
    originalActionId: string
    userId: string
    reason: string
    appealType: 'content_not_violation' | 'account_error' | 'disproportionate'
    additionalContext?: string
  }): Promise<ModerationAppeal> {
    try {
      const { data, error } = await supabase
        .from('moderation_appeals')
        .insert({
          original_action_id: appealData.originalActionId,
          user_id: appealData.userId,
          reason: appealData.reason,
          appeal_type: appealData.appealType,
          additional_context: appealData.additionalContext,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error
      return mapModerationAppeal(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create appeal')
    }
  },

  async getAppeal(appealId: string): Promise<ModerationAppeal | null> {
    try {
      const { data, error } = await supabase
        .from('moderation_appeals')
        .select('*')
        .eq('id', appealId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? mapModerationAppeal(data) : null
    } catch (err) {
      console.error('Error fetching appeal:', err)
      return null
    }
  },

  async getUserAppeals(userId: string): Promise<ModerationAppeal[]> {
    try {
      const { data, error } = await supabase
        .from('moderation_appeals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapModerationAppeal)
    } catch (err) {
      console.error('Error fetching user appeals:', err)
      return []
    }
  },

  async reviewAppeal(
    appealId: string,
    status: 'approved' | 'rejected' | 'escalated',
    reviewNotes?: string,
    decisionReason?: string
  ): Promise<ModerationAppeal> {
    try {
      const { data, error } = await supabase
        .from('moderation_appeals')
        .update({
          status,
          review_notes: reviewNotes,
          decision_reason: decisionReason,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', appealId)
        .select()
        .single()

      if (error) throw error
      return mapModerationAppeal(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to review appeal')
    }
  },

  async getPendingAppeals(): Promise<ModerationAppeal[]> {
    try {
      const { data, error } = await supabase
        .from('moderation_appeals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) throw error
      return (data || []).map(mapModerationAppeal)
    } catch (err) {
      console.error('Error fetching pending appeals:', err)
      return []
    }
  },

  // Content Filter Cache
  async cacheFilterResult(result: ContentFilterResult): Promise<void> {
    try {
      const { error } = await supabase.from('content_filter_cache').upsert(
        {
          content_id: result.contentId,
          content_type: result.contentType,
          filter_results: result,
          detected_issues: result.detectedIssues,
          confidence_score: result.confidenceScore,
          requires_review: result.requiresReview,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'content_id,content_type' }
      )

      if (error) throw error
    } catch (err) {
      console.error('Error caching filter result:', err)
    }
  },

  async getFilterCache(contentId: string, contentType: string): Promise<ContentFilterResult | null> {
    try {
      const { data, error } = await supabase
        .from('content_filter_cache')
        .select('filter_results')
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data?.filter_results || null
    } catch (err) {
      console.error('Error fetching filter cache:', err)
      return null
    }
  },

  // Statistics
  async getModerationStats(date?: string, teamId?: string): Promise<ModerationStatistics | null> {
    try {
      const statDate = date || new Date().toISOString().split('T')[0]
      let query = supabase
        .from('moderation_statistics')
        .select('*')
        .eq('statistic_date', statDate)

      if (teamId) {
        query = query.eq('moderation_team_id', teamId)
      } else {
        query = query.is('moderation_team_id', null)
      }

      const { data, error } = await query.single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? mapModerationStatistics(data) : null
    } catch (err) {
      console.error('Error fetching moderation stats:', err)
      return null
    }
  },

  async updateModerationStats(
    date: string,
    updates: Partial<ModerationStatistics>,
    teamId?: string
  ): Promise<ModerationStatistics> {
    try {
      const updateData: Record<string, any> = {}
      if (updates.totalReviewed !== undefined) updateData.total_reviewed = updates.totalReviewed
      if (updates.totalEscalated !== undefined) updateData.total_escalated = updates.totalEscalated
      if (updates.totalAppeals !== undefined) updateData.total_appeals = updates.totalAppeals
      if (updates.avgReviewTimeSeconds !== undefined) updateData.avg_review_time_seconds = updates.avgReviewTimeSeconds

      const { data, error } = await supabase
        .from('moderation_statistics')
        .upsert(
          {
            statistic_date: date,
            moderation_team_id: teamId,
            ...updateData,
          },
          { onConflict: 'statistic_date,moderation_team_id' }
        )
        .select()
        .single()

      if (error) throw error
      return mapModerationStatistics(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update moderation stats')
    }
  },
}

// Mapping functions
function mapModerationRule(data: any): ModerationRule {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    ruleType: data.rule_type,
    condition: data.condition,
    action: data.action,
    actionConfig: data.action_config,
    severity: data.severity,
    isActive: data.is_active,
    priority: data.priority,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapModerationTeam(data: any): ModerationTeam {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    expertise: data.expertise || [],
    maxQueueSize: data.max_queue_size,
    autoEscalateAfterHours: data.auto_escalate_after_hours,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapModerationTeamMember(data: any): ModerationTeamMember {
  return {
    id: data.id,
    teamId: data.team_id,
    userId: data.user_id,
    role: data.role,
    expertise: data.expertise,
    maxDailyReviews: data.max_daily_reviews,
    available: data.available,
    lastActionAt: data.last_action_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapModerationAppeal(data: any): ModerationAppeal {
  return {
    id: data.id,
    originalActionId: data.original_action_id,
    userId: data.user_id,
    status: data.status,
    reason: data.reason,
    appealType: data.appeal_type,
    additionalContext: data.additional_context,
    reviewedBy: data.reviewed_by,
    reviewNotes: data.review_notes,
    decisionReason: data.decision_reason,
    createdAt: data.created_at,
    reviewedAt: data.reviewed_at,
    updatedAt: data.updated_at,
  }
}

function mapModerationStatistics(data: any): ModerationStatistics {
  return {
    id: data.id,
    statisticDate: data.statistic_date,
    totalReviewed: data.total_reviewed,
    totalEscalated: data.total_escalated,
    totalAppeals: data.total_appeals,
    appealApprovalRate: data.appeal_approval_rate,
    avgReviewTimeSeconds: data.avg_review_time_seconds,
    moderationTeamId: data.moderation_team_id,
  }
}
