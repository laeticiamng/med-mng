/**
 * Content Reporting & Appeals Service
 * Manages user reports and content appeals
 */

import { supabase } from '../lib/supabase'

export interface ContentComplaintReport {
  id: string
  userId: string
  contentType: string
  contentId: string
  reportCategory: string
  severity: 'low' | 'medium' | 'high'
  description: string
  attachments?: any
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed' | 'escalated'
  resolutionNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ContentAppealRequest {
  id: string
  userId: string
  originalReportId?: string
  appealReason: string
  appealType: string
  supportingEvidence?: string
  attachments?: any
  status: 'pending' | 'under_review' | 'granted' | 'denied' | 'escalated'
  decisionNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ReportAnalytics {
  id: string
  reportDate: string
  totalReports: number
  reportsResolved: number
  reportsEscalated: number
  appealsSubmitted: number
  appealsGranted: number
  categoryBreakdown?: Record<string, number>
  severityBreakdown?: Record<string, number>
  avgResolutionTimeHours?: number
}

export const contentReportingService = {
  // Content Reports
  async createComplaintReport(params: {
    contentType: string
    contentId: string
    reportCategory: string
    severity?: 'low' | 'medium' | 'high'
    description: string
    attachments?: any
  }): Promise<ContentComplaintReport> {
    try {
      const { data, error } = await supabase
        .from('content_complaint_reports')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content_type: params.contentType,
          content_id: params.contentId,
          report_category: params.reportCategory,
          severity: params.severity || 'medium',
          description: params.description,
          attachments: params.attachments,
        })
        .select()
        .single()

      if (error) throw error
      return mapComplaintReport(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create report')
    }
  },

  async getUserReports(userId: string): Promise<ContentComplaintReport[]> {
    try {
      const { data, error } = await supabase
        .from('content_complaint_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapComplaintReport)
    } catch (err) {
      console.error('Error fetching user reports:', err)
      return []
    }
  },

  async getReport(reportId: string): Promise<ContentComplaintReport | null> {
    try {
      const { data, error } = await supabase
        .from('content_complaint_reports')
        .select('*')
        .eq('id', reportId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? mapComplaintReport(data) : null
    } catch (err) {
      console.error('Error fetching report:', err)
      return null
    }
  },

  async getAdminReports(status?: string, category?: string): Promise<ContentComplaintReport[]> {
    try {
      let query = supabase
        .from('content_complaint_reports')
        .select('*')

      if (status) {
        query = query.eq('status', status)
      }
      if (category) {
        query = query.eq('report_category', category)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapComplaintReport)
    } catch (err) {
      console.error('Error fetching reports:', err)
      return []
    }
  },

  async updateReportStatus(
    reportId: string,
    status: string,
    resolutionNotes?: string
  ): Promise<ContentComplaintReport> {
    try {
      const { data, error } = await supabase
        .from('content_complaint_reports')
        .update({
          status,
          resolution_notes: resolutionNotes,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId)
        .select()
        .single()

      if (error) throw error
      return mapComplaintReport(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update report')
    }
  },

  async addReportTag(reportId: string, tag: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('report_tags')
        .insert({
          report_id: reportId,
          tag,
          added_by: (await supabase.auth.getUser()).data.user?.id,
        })

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add tag')
    }
  },

  // Content Appeals
  async createAppealRequest(params: {
    originalReportId?: string
    appealReason: string
    appealType: string
    supportingEvidence?: string
    attachments?: any
  }): Promise<ContentAppealRequest> {
    try {
      const { data, error } = await supabase
        .from('content_appeal_requests')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          original_report_id: params.originalReportId,
          appeal_reason: params.appealReason,
          appeal_type: params.appealType,
          supporting_evidence: params.supportingEvidence,
          attachments: params.attachments,
        })
        .select()
        .single()

      if (error) throw error
      return mapAppealRequest(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create appeal')
    }
  },

  async getUserAppeals(userId: string): Promise<ContentAppealRequest[]> {
    try {
      const { data, error } = await supabase
        .from('content_appeal_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapAppealRequest)
    } catch (err) {
      console.error('Error fetching user appeals:', err)
      return []
    }
  },

  async getAdminAppeals(status?: string): Promise<ContentAppealRequest[]> {
    try {
      let query = supabase
        .from('content_appeal_requests')
        .select('*')

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapAppealRequest)
    } catch (err) {
      console.error('Error fetching appeals:', err)
      return []
    }
  },

  async reviewAppeal(
    appealId: string,
    status: string,
    decisionNotes?: string
  ): Promise<ContentAppealRequest> {
    try {
      const { data, error } = await supabase
        .from('content_appeal_requests')
        .update({
          status,
          decision_notes: decisionNotes,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', appealId)
        .select()
        .single()

      if (error) throw error
      return mapAppealRequest(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to review appeal')
    }
  },

  // Analytics
  async getReportAnalytics(date?: string): Promise<ReportAnalytics | null> {
    try {
      const analyticsDate = date || new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('report_analytics')
        .select('*')
        .eq('report_date', analyticsDate)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? mapReportAnalytics(data) : null
    } catch (err) {
      console.error('Error fetching report analytics:', err)
      return null
    }
  },

  async getReportsTrend(days: number = 7): Promise<ReportAnalytics[]> {
    try {
      const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('report_analytics')
        .select('*')
        .gte('report_date', sinceDate)
        .order('report_date', { ascending: true })

      if (error) throw error
      return (data || []).map(mapReportAnalytics)
    } catch (err) {
      console.error('Error fetching reports trend:', err)
      return []
    }
  },
}

// Mapping functions
function mapComplaintReport(data: any): ContentComplaintReport {
  return {
    id: data.id,
    userId: data.user_id,
    contentType: data.content_type,
    contentId: data.content_id,
    reportCategory: data.report_category,
    severity: data.severity,
    description: data.description,
    attachments: data.attachments,
    status: data.status,
    resolutionNotes: data.resolution_notes,
    reviewedBy: data.reviewed_by,
    reviewedAt: data.reviewed_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapAppealRequest(data: any): ContentAppealRequest {
  return {
    id: data.id,
    userId: data.user_id,
    originalReportId: data.original_report_id,
    appealReason: data.appeal_reason,
    appealType: data.appeal_type,
    supportingEvidence: data.supporting_evidence,
    attachments: data.attachments,
    status: data.status,
    decisionNotes: data.decision_notes,
    reviewedBy: data.reviewed_by,
    reviewedAt: data.reviewed_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapReportAnalytics(data: any): ReportAnalytics {
  return {
    id: data.id,
    reportDate: data.report_date,
    totalReports: data.total_reports,
    reportsResolved: data.reports_resolved,
    reportsEscalated: data.reports_escalated,
    appealsSubmitted: data.appeals_submitted,
    appealsGranted: data.appeals_granted,
    categoryBreakdown: data.category_breakdown,
    severityBreakdown: data.severity_breakdown,
    avgResolutionTimeHours: data.avg_resolution_time_hours,
  }
}
