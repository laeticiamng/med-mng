import { supabase } from '../lib/supabase'

export interface ModerationItem {
  id: string
  contentType: string
  contentId: string
  authorId?: string
  reason?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'approved' | 'rejected' | 'deleted'
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
  createdAt: string
}

export interface ContentReport {
  id: string
  contentType: string
  contentId: string
  authorId?: string
  reportedBy: string
  reason: string
  description?: string
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  resolution?: string
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
}

export interface UserAction {
  id: string
  userId: string
  actionType: 'warn' | 'suspend' | 'ban' | 'unban'
  reason?: string
  durationDays?: number
  expiresAt?: string
  actionBy: string
  appealText?: string
  appealStatus?: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface PlatformMetrics {
  id: string
  metricDate: string
  totalUsers: number
  activeUsers: number
  newUsers: number
  totalPosts: number
  newPosts: number
  totalComments: number
  newComments: number
  totalEvents: number
  totalTeams: number
  reportedContent: number
  moderatedContent: number
  bannedUsers: number
  suspendedUsers: number
  systemErrors: number
  apiCalls: number
  averageResponseTimeMs: number
  createdAt: string
}

// Moderation Management
export async function getModerationQueue(status?: string): Promise<ModerationItem[]> {
  try {
    let query = supabase
      .from('moderation_queue')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(mapModerationItem)
  } catch (error) {
    console.error('Get moderation queue error:', error)
    throw error
  }
}

export async function reviewModerationItem(
  itemId: string,
  status: 'approved' | 'rejected' | 'deleted',
  notes?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('moderation_queue')
      .update({
        status,
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        reviewed_at: new Date().toISOString(),
        notes,
      })
      .eq('id', itemId)

    if (error) throw error
  } catch (error) {
    console.error('Review moderation item error:', error)
    throw error
  }
}

// Content Reports
export async function getContentReports(status?: string): Promise<ContentReport[]> {
  try {
    let query = supabase
      .from('content_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(mapContentReport)
  } catch (error) {
    console.error('Get content reports error:', error)
    throw error
  }
}

export async function createContentReport(
  contentType: string,
  contentId: string,
  reason: string,
  description?: string
): Promise<ContentReport> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('content_reports')
      .insert({
        content_type: contentType,
        content_id: contentId,
        reported_by: user?.id,
        reason,
        description,
      })
      .select()
      .single()

    if (error) throw error
    return mapContentReport(data)
  } catch (error) {
    console.error('Create content report error:', error)
    throw error
  }
}

export async function resolveContentReport(
  reportId: string,
  resolution: string,
  status: 'resolved' | 'dismissed'
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('content_reports')
      .update({
        status,
        resolution,
        resolved_by: user?.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (error) throw error
  } catch (error) {
    console.error('Resolve content report error:', error)
    throw error
  }
}

// User Actions (Ban, Suspend, Warn)
export async function createUserAction(
  userId: string,
  actionType: 'warn' | 'suspend' | 'ban',
  reason?: string,
  durationDays?: number
): Promise<UserAction> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const expiresAt = durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null

    const { data, error } = await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_type: actionType,
        reason,
        duration_days: durationDays,
        expires_at: expiresAt,
        action_by: user?.id,
      })
      .select()
      .single()

    if (error) throw error
    return mapUserAction(data)
  } catch (error) {
    console.error('Create user action error:', error)
    throw error
  }
}

export async function getUserActions(userId: string): Promise<UserAction[]> {
  try {
    const { data, error } = await supabase
      .from('user_actions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapUserAction)
  } catch (error) {
    console.error('Get user actions error:', error)
    throw error
  }
}

// Audit Logging
export async function logAuditAction(
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user?.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
      })

    if (error) throw error
  } catch (error) {
    console.error('Log audit action error:', error)
  }
}

export async function getAuditLogs(limit: number = 100): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Get audit logs error:', error)
    throw error
  }
}

// Platform Metrics
export async function getPlatformMetrics(date?: string): Promise<PlatformMetrics | null> {
  try {
    const queryDate = date || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('platform_metrics')
      .select('*')
      .eq('metric_date', queryDate)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data ? mapPlatformMetrics(data) : null
  } catch (error) {
    console.error('Get platform metrics error:', error)
    return null
  }
}

export async function getMetricsHistory(days: number = 30): Promise<PlatformMetrics[]> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const { data, error } = await supabase
      .from('platform_metrics')
      .select('*')
      .gte('metric_date', startDate)
      .order('metric_date', { ascending: true })

    if (error) throw error
    return (data || []).map(mapPlatformMetrics)
  } catch (error) {
    console.error('Get metrics history error:', error)
    throw error
  }
}

export async function updatePlatformMetrics(updates: Partial<PlatformMetrics>): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]

    const updateData: Record<string, any> = {}
    if (updates.totalUsers !== undefined) updateData.total_users = updates.totalUsers
    if (updates.activeUsers !== undefined) updateData.active_users = updates.activeUsers
    if (updates.newUsers !== undefined) updateData.new_users = updates.newUsers
    if (updates.reportedContent !== undefined) updateData.reported_content = updates.reportedContent
    if (updates.systemErrors !== undefined) updateData.system_errors = updates.systemErrors

    const { error } = await supabase
      .from('platform_metrics')
      .upsert({
        metric_date: today,
        ...updateData,
      })

    if (error) throw error
  } catch (error) {
    console.error('Update platform metrics error:', error)
  }
}

// Helper functions
function mapModerationItem(data: any): ModerationItem {
  return {
    id: data.id,
    contentType: data.content_type,
    contentId: data.content_id,
    authorId: data.author_id,
    reason: data.reason,
    severity: data.severity,
    status: data.status,
    reviewedBy: data.reviewed_by,
    reviewedAt: data.reviewed_at,
    notes: data.notes,
    createdAt: data.created_at,
  }
}

function mapContentReport(data: any): ContentReport {
  return {
    id: data.id,
    contentType: data.content_type,
    contentId: data.content_id,
    authorId: data.author_id,
    reportedBy: data.reported_by,
    reason: data.reason,
    description: data.description,
    status: data.status,
    resolution: data.resolution,
    resolvedBy: data.resolved_by,
    resolvedAt: data.resolved_at,
    createdAt: data.created_at,
  }
}

function mapUserAction(data: any): UserAction {
  return {
    id: data.id,
    userId: data.user_id,
    actionType: data.action_type,
    reason: data.reason,
    durationDays: data.duration_days,
    expiresAt: data.expires_at,
    actionBy: data.action_by,
    appealText: data.appeal_text,
    appealStatus: data.appeal_status,
    createdAt: data.created_at,
  }
}

function mapPlatformMetrics(data: any): PlatformMetrics {
  return {
    id: data.id,
    metricDate: data.metric_date,
    totalUsers: data.total_users,
    activeUsers: data.active_users,
    newUsers: data.new_users,
    totalPosts: data.total_posts,
    newPosts: data.new_posts,
    totalComments: data.total_comments,
    newComments: data.new_comments,
    totalEvents: data.total_events,
    totalTeams: data.total_teams,
    reportedContent: data.reported_content,
    moderatedContent: data.moderated_content,
    bannedUsers: data.banned_users,
    suspendedUsers: data.suspended_users,
    systemErrors: data.system_errors,
    apiCalls: data.api_calls,
    averageResponseTimeMs: data.average_response_time_ms,
    createdAt: data.created_at,
  }
}
