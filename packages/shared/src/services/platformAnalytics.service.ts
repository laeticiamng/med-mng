/**
 * Platform Analytics & Health Service
 * Tracks platform health metrics, user activity, content analytics
 */

import { supabase } from '../lib/supabase'

export interface PlatformHealthMetrics {
  id: string
  metricDate: string
  metricHour?: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  avgResponseTimeMs?: number
  p95ResponseTimeMs?: number
  p99ResponseTimeMs?: number
  dbConnectionCount: number
  avgQueryTimeMs?: number
  slowQueries: number
  cpuUsagePercent?: number
  memoryUsagePercent?: number
  storageUsagePercent?: number
  totalErrors: number
  errorTypes?: Record<string, number>
}

export interface UserActivityAnalytics {
  id: string
  activityDate: string
  totalUsers: number
  activeUsers: number
  newUsers: number
  churnedUsers: number
  totalSessions: number
  avgSessionDurationMinutes?: number
  pageViews: number
  featureUsage?: Record<string, number>
}

export interface PlatformContentAnalytics {
  id: string
  analyticsDate: string
  totalPosts: number
  newPosts: number
  deletedPosts: number
  totalComments: number
  newComments: number
  totalLikes: number
  totalShares: number
  engagementRate?: number
  contentCategories?: Record<string, number>
}

export interface PerformanceTrend {
  id: string
  trendDate: string
  metricName: string
  metricValue: number
  trendDirection?: 'up' | 'down' | 'stable'
  changePercent?: number
}

export interface SystemAlert {
  id: string
  alertType: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  description?: string
  affectedMetric?: string
  thresholdExceeded?: number
  actualValue?: number
  status: 'active' | 'acknowledged' | 'resolved'
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export const platformAnalyticsService = {
  // Health Metrics
  async getHealthMetrics(date: string, hour?: number): Promise<PlatformHealthMetrics | null> {
    try {
      let query = supabase
        .from('platform_health_metrics')
        .select('*')
        .eq('metric_date', date)

      if (hour !== undefined) {
        query = query.eq('metric_hour', hour)
      } else {
        query = query.is('metric_hour', null)
      }

      const { data, error } = await query.single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? mapHealthMetrics(data) : null
    } catch (err) {
      console.error('Error fetching health metrics:', err)
      return null
    }
  },

  async getHealthMetricsHistory(days: number = 7): Promise<PlatformHealthMetrics[]> {
    try {
      const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('platform_health_metrics')
        .select('*')
        .gte('metric_date', sinceDate)
        .is('metric_hour', null)
        .order('metric_date', { ascending: true })

      if (error) throw error
      return (data || []).map(mapHealthMetrics)
    } catch (err) {
      console.error('Error fetching health metrics history:', err)
      return []
    }
  },

  // User Activity Analytics
  async getUserActivityAnalytics(date?: string): Promise<UserActivityAnalytics | null> {
    try {
      const analyticsDate = date || new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('user_activity_analytics')
        .select('*')
        .eq('activity_date', analyticsDate)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? mapUserActivityAnalytics(data) : null
    } catch (err) {
      console.error('Error fetching user activity analytics:', err)
      return null
    }
  },

  async getUserActivityTrend(days: number = 30): Promise<UserActivityAnalytics[]> {
    try {
      const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('user_activity_analytics')
        .select('*')
        .gte('activity_date', sinceDate)
        .order('activity_date', { ascending: true })

      if (error) throw error
      return (data || []).map(mapUserActivityAnalytics)
    } catch (err) {
      console.error('Error fetching user activity trend:', err)
      return []
    }
  },

  // Content Analytics
  async getPlatformContentAnalytics(date?: string): Promise<PlatformContentAnalytics | null> {
    try {
      const analyticsDate = date || new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('content_analytics')
        .select('*')
        .eq('analytics_date', analyticsDate)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? mapPlatformContentAnalytics(data) : null
    } catch (err) {
      console.error('Error fetching content analytics:', err)
      return null
    }
  },

  async getPlatformContentAnalyticsTrend(days: number = 30): Promise<PlatformContentAnalytics[]> {
    try {
      const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('content_analytics')
        .select('*')
        .gte('analytics_date', sinceDate)
        .order('analytics_date', { ascending: true })

      if (error) throw error
      return (data || []).map(mapPlatformContentAnalytics)
    } catch (err) {
      console.error('Error fetching content analytics trend:', err)
      return []
    }
  },

  // Performance Trends
  async getPerformanceTrends(days: number = 30): Promise<PerformanceTrend[]> {
    try {
      const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('performance_trends')
        .select('*')
        .gte('trend_date', sinceDate)
        .order('trend_date', { ascending: true })

      if (error) throw error
      return (data || []).map(mapPerformanceTrend)
    } catch (err) {
      console.error('Error fetching performance trends:', err)
      return []
    }
  },

  async getMetricTrend(metricName: string, days: number = 30): Promise<PerformanceTrend[]> {
    try {
      const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('performance_trends')
        .select('*')
        .eq('metric_name', metricName)
        .gte('trend_date', sinceDate)
        .order('trend_date', { ascending: true })

      if (error) throw error
      return (data || []).map(mapPerformanceTrend)
    } catch (err) {
      console.error('Error fetching metric trend:', err)
      return []
    }
  },

  // System Alerts
  async getActiveAlerts(): Promise<SystemAlert[]> {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('status', 'active')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapSystemAlert)
    } catch (err) {
      console.error('Error fetching active alerts:', err)
      return []
    }
  },

  async getAllAlerts(limit: number = 50): Promise<SystemAlert[]> {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []).map(mapSystemAlert)
    } catch (err) {
      console.error('Error fetching all alerts:', err)
      return []
    }
  },

  async createAlert(alertData: {
    alertType: string
    severity: 'info' | 'warning' | 'critical'
    title: string
    description?: string
    affectedMetric?: string
    thresholdExceeded?: number
    actualValue?: number
  }): Promise<SystemAlert> {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .insert({
          alert_type: alertData.alertType,
          severity: alertData.severity,
          title: alertData.title,
          description: alertData.description,
          affected_metric: alertData.affectedMetric,
          threshold_exceeded: alertData.thresholdExceeded,
          actual_value: alertData.actualValue,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error
      return mapSystemAlert(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create alert')
    }
  },

  async acknowledgeAlert(alertId: string): Promise<SystemAlert> {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId)
        .select()
        .single()

      if (error) throw error
      return mapSystemAlert(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to acknowledge alert')
    }
  },

  async resolveAlert(alertId: string): Promise<SystemAlert> {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId)
        .select()
        .single()

      if (error) throw error
      return mapSystemAlert(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to resolve alert')
    }
  },
}

// Mapping functions
function mapHealthMetrics(data: any): PlatformHealthMetrics {
  return {
    id: data.id,
    metricDate: data.metric_date,
    metricHour: data.metric_hour,
    totalRequests: data.total_requests,
    successfulRequests: data.successful_requests,
    failedRequests: data.failed_requests,
    avgResponseTimeMs: data.avg_response_time_ms,
    p95ResponseTimeMs: data.p95_response_time_ms,
    p99ResponseTimeMs: data.p99_response_time_ms,
    dbConnectionCount: data.db_connection_count,
    avgQueryTimeMs: data.avg_query_time_ms,
    slowQueries: data.slow_queries,
    cpuUsagePercent: data.cpu_usage_percent,
    memoryUsagePercent: data.memory_usage_percent,
    storageUsagePercent: data.storage_usage_percent,
    totalErrors: data.total_errors,
    errorTypes: data.error_types,
  }
}

function mapUserActivityAnalytics(data: any): UserActivityAnalytics {
  return {
    id: data.id,
    activityDate: data.activity_date,
    totalUsers: data.total_users,
    activeUsers: data.active_users,
    newUsers: data.new_users,
    churnedUsers: data.churned_users,
    totalSessions: data.total_sessions,
    avgSessionDurationMinutes: data.avg_session_duration_minutes,
    pageViews: data.page_views,
    featureUsage: data.feature_usage,
  }
}

function mapPlatformContentAnalytics(data: any): PlatformContentAnalytics {
  return {
    id: data.id,
    analyticsDate: data.analytics_date,
    totalPosts: data.total_posts,
    newPosts: data.new_posts,
    deletedPosts: data.deleted_posts,
    totalComments: data.total_comments,
    newComments: data.new_comments,
    totalLikes: data.total_likes,
    totalShares: data.total_shares,
    engagementRate: data.engagement_rate,
    contentCategories: data.content_categories,
  }
}

function mapPerformanceTrend(data: any): PerformanceTrend {
  return {
    id: data.id,
    trendDate: data.trend_date,
    metricName: data.metric_name,
    metricValue: data.metric_value,
    trendDirection: data.trend_direction,
    changePercent: data.change_percent,
  }
}

function mapSystemAlert(data: any): SystemAlert {
  return {
    id: data.id,
    alertType: data.alert_type,
    severity: data.severity,
    title: data.title,
    description: data.description,
    affectedMetric: data.affected_metric,
    thresholdExceeded: data.threshold_exceeded,
    actualValue: data.actual_value,
    status: data.status,
    acknowledgedBy: data.acknowledged_by,
    acknowledgedAt: data.acknowledged_at,
    resolvedAt: data.resolved_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
