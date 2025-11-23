/**
 * Export Jobs Service
 * Manages data export operations
 */

import { supabase } from '../lib/supabase'
import {
  ExportJob,
  ExportJobInsert,
  ExportJobUpdate,
  ExportType,
  ExportStatus,
} from '../types/database-custom'

export const exportJobsService = {
  /**
   * Create an export job
   */
  async createExportJob(
    userId: string,
    exportType: ExportType,
    resourceType: string,
    options?: {
      expiresAt?: Date
    }
  ): Promise<ExportJob> {
    const { data, error } = await supabase
      .from('export_jobs')
      .insert({
        user_id: userId,
        export_type: exportType,
        resource_type: resourceType,
        status: 'pending',
        expires_at: options?.expiresAt?.toISOString(),
      } as ExportJobInsert)
      .select()
      .single()

    if (error) throw new Error(`Failed to create export job: ${error.message}`)
    return data as ExportJob
  },

  /**
   * Update export job
   */
  async updateExportJob(
    jobId: string,
    updates: Partial<ExportJobUpdate>
  ): Promise<ExportJob> {
    const { data, error } = await supabase
      .from('export_jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single()

    if (error)
      throw new Error(`Failed to update export job: ${error.message}`)
    return data as ExportJob
  },

  /**
   * Mark job as processing
   */
  async markAsProcessing(jobId: string): Promise<ExportJob> {
    return this.updateExportJob(jobId, { status: 'processing' })
  },

  /**
   * Mark job as completed
   */
  async markAsCompleted(
    jobId: string,
    fileUrl: string,
    fileSize: number,
    rowCount: number
  ): Promise<ExportJob> {
    return this.updateExportJob(jobId, {
      status: 'completed',
      file_url: fileUrl,
      file_size: fileSize,
      row_count: rowCount,
      completed_at: new Date().toISOString(),
    })
  },

  /**
   * Mark job as failed
   */
  async markAsFailed(jobId: string, errorMessage: string): Promise<ExportJob> {
    return this.updateExportJob(jobId, {
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    })
  },

  /**
   * Get export job
   */
  async getExportJob(jobId: string): Promise<ExportJob> {
    const { data, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) throw new Error(`Failed to fetch export job: ${error.message}`)
    return data as ExportJob
  },

  /**
   * Get user's export jobs
   */
  async getUserExportJobs(
    userId: string,
    options?: {
      status?: ExportStatus
      limit?: number
      offset?: number
    }
  ): Promise<ExportJob[]> {
    let query = supabase
      .from('export_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
    }

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
      throw new Error(`Failed to fetch export jobs: ${error.message}`)
    return data as ExportJob[]
  },

  /**
   * Get pending export jobs
   */
  async getPendingExportJobs(): Promise<ExportJob[]> {
    const { data, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error)
      throw new Error(`Failed to fetch pending export jobs: ${error.message}`)
    return data as ExportJob[]
  },

  /**
   * Get completed export jobs for user
   */
  async getCompletedExportJobs(userId: string): Promise<ExportJob[]> {
    const { data, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })

    if (error)
      throw new Error(`Failed to fetch completed export jobs: ${error.message}`)
    return data as ExportJob[]
  },

  /**
   * Delete export job
   */
  async deleteExportJob(jobId: string): Promise<void> {
    const { error } = await supabase
      .from('export_jobs')
      .delete()
      .eq('id', jobId)

    if (error)
      throw new Error(`Failed to delete export job: ${error.message}`)
  },

  /**
   * Clean up expired export jobs
   * This should be called periodically (via cron job or Edge Function)
   */
  async cleanupExpiredExports(): Promise<number> {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('export_jobs')
      .select('id')
      .lt('expires_at', now)
      .not('expires_at', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch expired exports: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return 0
    }

    const ids = data.map((item) => item.id)

    const { error: deleteError } = await supabase
      .from('export_jobs')
      .delete()
      .in('id', ids)

    if (deleteError) {
      throw new Error(`Failed to delete expired exports: ${deleteError.message}`)
    }

    return ids.length
  },

  /**
   * Get export stats for user
   */
  async getExportStats(userId: string): Promise<{
    totalExports: number
    completedExports: number
    failedExports: number
    pendingExports: number
    totalDataExported: number // in bytes
  }> {
    const { data, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('user_id', userId)

    if (error)
      throw new Error(`Failed to fetch export stats: ${error.message}`)

    const exports = data as ExportJob[]
    let totalSize = 0
    let completed = 0
    let failed = 0
    let pending = 0

    exports.forEach((exp) => {
      if (exp.status === 'completed') {
        completed++
        if (exp.file_size) totalSize += exp.file_size
      } else if (exp.status === 'failed') {
        failed++
      } else if (exp.status === 'pending') {
        pending++
      }
    })

    return {
      totalExports: exports.length,
      completedExports: completed,
      failedExports: failed,
      pendingExports: pending,
      totalDataExported: totalSize,
    }
  },
}
