/**
 * Data Export Service
 * Manages user data export requests and file generation
 */

import { supabase } from '../lib/supabase'

export type DataExportType = 'personal_data' | 'posts' | 'comments' | 'interactions' | 'full_archive'
export type DataExportFormat = 'csv' | 'json' | 'pdf'
export type DataExportStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface DataExportJob {
  id: string
  user_id: string
  export_type: DataExportType
  format: DataExportFormat
  status: DataExportStatus
  progress: number
  total_items: number
  processed_items: number
  file_url?: string
  file_size?: number
  error_message?: string
  requested_at: string
  completed_at?: string
  expires_at: string
  created_at: string
  updated_at: string
}

export interface ExportLog {
  id: string
  export_job_id: string
  event_type: 'started' | 'processing' | 'completed' | 'error' | 'downloaded'
  message?: string
  created_at: string
}

export const dataExportService = {
  /**
   * Create a new export job
   */
  async createExportJob(exportType: DataExportType, format: DataExportFormat): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_export_job', {
        export_type_param: exportType,
        format_param: format,
      })

      if (error) throw error
      return data as string
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create export job')
    }
  },

  /**
   * Get user's export jobs
   */
  async getExportJobs(userId: string): Promise<DataExportJob[]> {
    try {
      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })

      if (error) throw error
      return (data || []) as DataExportJob[]
    } catch (err) {
      console.error('Error fetching export jobs:', err)
      return []
    }
  },

  /**
   * Get a specific export job
   */
  async getExportJob(jobId: string): Promise<DataExportJob | null> {
    try {
      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return (data || null) as DataExportJob | null
    } catch (err) {
      console.error('Error fetching export job:', err)
      return null
    }
  },

  /**
   * Update export progress
   */
  async updateProgress(jobId: string, progress: number, processedItems: number): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_export_progress', {
        job_id_param: jobId,
        progress_param: progress,
        processed_param: processedItems,
      })

      if (error) throw error
    } catch (err) {
      console.error('Error updating export progress:', err)
    }
  },

  /**
   * Complete export job
   */
  async completeExport(jobId: string, fileUrl: string, fileSize: number): Promise<void> {
    try {
      const { error } = await supabase.rpc('complete_export_job', {
        job_id_param: jobId,
        file_url_param: fileUrl,
        file_size_param: fileSize,
      })

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to complete export')
    }
  },

  /**
   * Fail export job
   */
  async failExport(jobId: string, errorMessage: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('fail_export_job', {
        job_id_param: jobId,
        error_message_param: errorMessage,
      })

      if (error) throw error
    } catch (err) {
      console.error('Error failing export:', err)
    }
  },

  /**
   * Get export job status
   */
  async getExportStatus(jobId: string): Promise<{
    status: DataExportStatus
    progress: number
    file_url?: string
    completed_at?: string
  } | null> {
    try {
      const { data, error } = await supabase.rpc('get_export_status', {
        job_id_param: jobId,
      })

      if (error && error.code !== 'PGRST116') throw error
      return (data?.[0] || null) as any
    } catch (err) {
      console.error('Error getting export status:', err)
      return null
    }
  },

  /**
   * Get export logs
   */
  async getExportLogs(jobId: string): Promise<ExportLog[]> {
    try {
      const { data, error } = await supabase
        .from('export_logs')
        .select('*')
        .eq('export_job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as ExportLog[]
    } catch (err) {
      console.error('Error fetching export logs:', err)
      return []
    }
  },

  /**
   * Delete old export jobs
   */
  async deleteExpiredExports(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('export_jobs')
        .delete()
        .eq('user_id', userId)
        .lt('expires_at', new Date().toISOString())

      if (error) throw error
    } catch (err) {
      console.error('Error deleting expired exports:', err)
    }
  },

  /**
   * Generate CSV data (client-side helper)
   */
  generateCSV(data: any[], headers: string[]): string {
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? ''
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(value).replace(/"/g, '""')
            return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped
          })
          .join(',')
      ),
    ].join('\n')

    return csvContent
  },

  /**
   * Generate JSON data
   */
  generateJSON(data: any[]): string {
    return JSON.stringify(data, null, 2)
  },

  /**
   * Download file helper
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  },
}
