import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getModerationQueue,
  reviewModerationItem,
  getContentReports,
  createContentReport,
  resolveContentReport,
  createUserAction,
  getUserActions,
  logAuditAction,
  getAuditLogs,
  getPlatformMetrics,
  getMetricsHistory,
  updatePlatformMetrics,
  ModerationItem,
  ContentReport,
  UserAction,
  PlatformMetrics,
} from '@/services/admin.service'

// Moderation Queue
export function useFetchModerationQueue(status?: string) {
  return useQuery({
    queryKey: ['admin', 'moderation', status],
    queryFn: () => getModerationQueue(status),
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useReviewModerationItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      itemId,
      status,
      notes,
    }: {
      itemId: string
      status: 'approved' | 'rejected' | 'deleted'
      notes?: string
    }) => reviewModerationItem(itemId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'moderation'] })
    },
  })
}

// Content Reports
export function useFetchContentReports(status?: string) {
  return useQuery({
    queryKey: ['admin', 'reports', status],
    queryFn: () => getContentReports(status),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useCreateContentReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      contentType,
      contentId,
      reason,
      description,
    }: {
      contentType: string
      contentId: string
      reason: string
      description?: string
    }) => createContentReport(contentType, contentId, reason, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
    },
  })
}

export function useResolveContentReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reportId,
      resolution,
      status,
    }: {
      reportId: string
      resolution: string
      status: 'resolved' | 'dismissed'
    }) => resolveContentReport(reportId, resolution, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
    },
  })
}

// User Actions
export function useFetchUserActions(userId: string) {
  return useQuery({
    queryKey: ['user-actions', userId],
    queryFn: () => getUserActions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateUserAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      actionType,
      reason,
      durationDays,
    }: {
      userId: string
      actionType: 'warn' | 'suspend' | 'ban'
      reason?: string
      durationDays?: number
    }) => createUserAction(userId, actionType, reason, durationDays),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-actions', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
  })
}

// Audit Logs
export function useFetchAuditLogs(limit?: number) {
  return useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => getAuditLogs(limit),
    staleTime: 1000 * 60 * 5,
  })
}

export function useLogAuditAction() {
  return useMutation({
    mutationFn: ({
      action,
      resourceType,
      resourceId,
      details,
    }: {
      action: string
      resourceType?: string
      resourceId?: string
      details?: Record<string, any>
    }) => logAuditAction(action, resourceType, resourceId, details),
  })
}

// Platform Metrics
export function useFetchPlatformMetrics(date?: string) {
  return useQuery({
    queryKey: ['admin', 'metrics', 'today', date],
    queryFn: () => getPlatformMetrics(date),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchMetricsHistory(days: number = 30) {
  return useQuery({
    queryKey: ['admin', 'metrics', 'history', days],
    queryFn: () => getMetricsHistory(days),
    staleTime: 1000 * 60 * 30,
  })
}

export function useUpdatePlatformMetrics() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Partial<PlatformMetrics>) => updatePlatformMetrics(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
  })
}
