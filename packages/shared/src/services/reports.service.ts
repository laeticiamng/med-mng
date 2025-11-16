import { supabase } from '@/lib/supabase'

export interface Report {
  id: string
  userId: string
  title: string
  reportType: 'activity' | 'analytics' | 'gamification' | 'wellness' | 'custom'
  description?: string
  dateRangeStart?: string
  dateRangeEnd?: string
  filters?: Record<string, any>
  content: Record<string, any>
  format: 'json' | 'csv' | 'pdf'
  fileUrl?: string
  status: 'completed' | 'pending' | 'processing' | 'failed'
  isPublic: boolean
  downloadCount: number
  createdAt: string
  updatedAt: string
}

export interface DataExport {
  id: string
  userId: string
  exportType: 'personal_data' | 'activity' | 'posts' | 'events' | 'all'
  status: 'pending' | 'processing' | 'ready' | 'expired'
  fileUrl?: string
  fileSize?: number
  fileFormat: 'json' | 'csv' | 'zip'
  expiresAt?: string
  requestReason?: string
  createdAt: string
  updatedAt: string
}

// Reports
export async function createReport(
  userId: string,
  reportData: Partial<Report>
): Promise<Report> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        title: reportData.title,
        report_type: reportData.reportType,
        description: reportData.description,
        date_range_start: reportData.dateRangeStart,
        date_range_end: reportData.dateRangeEnd,
        filters: reportData.filters,
        content: reportData.content,
        format: reportData.format || 'json',
        status: 'completed',
      })
      .select()
      .single()

    if (error) throw error
    return mapReport(data)
  } catch (error) {
    console.error('Create report error:', error)
    throw error
  }
}

export async function getUserReports(userId: string): Promise<Report[]> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapReport)
  } catch (error) {
    console.error('Get user reports error:', error)
    throw error
  }
}

export async function deleteReport(reportId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)

    if (error) throw error
  } catch (error) {
    console.error('Delete report error:', error)
    throw error
  }
}

// Data Exports
export async function requestDataExport(
  userId: string,
  exportType: string,
  requestReason?: string
): Promise<DataExport> {
  try {
    const { data, error } = await supabase
      .from('data_exports')
      .insert({
        user_id: userId,
        export_type: exportType,
        request_reason: requestReason,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return mapDataExport(data)
  } catch (error) {
    console.error('Request data export error:', error)
    throw error
  }
}

export async function getUserDataExports(userId: string): Promise<DataExport[]> {
  try {
    const { data, error } = await supabase
      .from('data_exports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapDataExport)
  } catch (error) {
    console.error('Get user data exports error:', error)
    throw error
  }
}

export async function deleteDataExport(exportId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('data_exports')
      .delete()
      .eq('id', exportId)

    if (error) throw error
  } catch (error) {
    console.error('Delete data export error:', error)
    throw error
  }
}

// Analytics
export async function getAnalyticsSnapshot(
  userId: string,
  date: Date
): Promise<Record<string, any> | null> {
  try {
    const dateStr = date.toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('analytics_snapshots')
      .select('metrics')
      .eq('user_id', userId)
      .eq('metric_date', dateStr)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data?.metrics || null
  } catch (error) {
    console.error('Get analytics snapshot error:', error)
    return null
  }
}

function mapReport(data: any): Report {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    reportType: data.report_type,
    description: data.description,
    dateRangeStart: data.date_range_start,
    dateRangeEnd: data.date_range_end,
    filters: data.filters,
    content: data.content,
    format: data.format,
    fileUrl: data.file_url,
    status: data.status,
    isPublic: data.is_public,
    downloadCount: data.download_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapDataExport(data: any): DataExport {
  return {
    id: data.id,
    userId: data.user_id,
    exportType: data.export_type,
    status: data.status,
    fileUrl: data.file_url,
    fileSize: data.file_size,
    fileFormat: data.file_format,
    expiresAt: data.expires_at,
    requestReason: data.request_reason,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
