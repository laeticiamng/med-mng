import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  contentReportingService,
  ContentComplaintReport,
  ContentAppealRequest,
} from '@/services/contentReporting.service'

// Content Reports
export function useCreateComplaintReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      contentType: string
      contentId: string
      reportCategory: string
      severity?: 'low' | 'medium' | 'high'
      description: string
      attachments?: any
    }) => contentReportingService.createComplaintReport(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useFetchUserReports(userId: string) {
  return useQuery({
    queryKey: ['reports', 'user', userId],
    queryFn: () => contentReportingService.getUserReports(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchReport(reportId: string) {
  return useQuery({
    queryKey: ['reports', reportId],
    queryFn: () => contentReportingService.getReport(reportId),
    enabled: !!reportId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchAdminReports(status?: string, category?: string) {
  return useQuery({
    queryKey: ['reports', 'admin', status, category],
    queryFn: () => contentReportingService.getAdminReports(status, category),
    staleTime: 1000 * 60 * 2,
  })
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reportId,
      status,
      resolutionNotes,
    }: {
      reportId: string
      status: string
      resolutionNotes?: string
    }) => contentReportingService.updateReportStatus(reportId, status, resolutionNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useAddReportTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, tag }: { reportId: string; tag: string }) =>
      contentReportingService.addReportTag(reportId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

// Content Appeals
export function useCreateAppealRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      originalReportId?: string
      appealReason: string
      appealType: string
      supportingEvidence?: string
      attachments?: any
    }) => contentReportingService.createAppealRequest(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] })
    },
  })
}

export function useFetchUserAppeals(userId: string) {
  return useQuery({
    queryKey: ['appeals', 'user', userId],
    queryFn: () => contentReportingService.getUserAppeals(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchAdminAppeals(status?: string) {
  return useQuery({
    queryKey: ['appeals', 'admin', status],
    queryFn: () => contentReportingService.getAdminAppeals(status),
    staleTime: 1000 * 60 * 2,
  })
}

export function useReviewAppeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      appealId,
      status,
      decisionNotes,
    }: {
      appealId: string
      status: string
      decisionNotes?: string
    }) => contentReportingService.reviewAppeal(appealId, status, decisionNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] })
    },
  })
}

// Analytics
export function useFetchReportAnalytics(date?: string) {
  return useQuery({
    queryKey: ['report-analytics', date],
    queryFn: () => contentReportingService.getReportAnalytics(date),
    staleTime: 1000 * 60 * 30,
  })
}

export function useFetchReportsTrend(days: number = 7) {
  return useQuery({
    queryKey: ['report-analytics', 'trend', days],
    queryFn: () => contentReportingService.getReportsTrend(days),
    staleTime: 1000 * 60 * 30,
  })
}
