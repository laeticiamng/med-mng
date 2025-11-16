import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createReport,
  getUserReports,
  deleteReport,
  requestDataExport,
  getUserDataExports,
  deleteDataExport,
  Report,
} from '@/services/reports.service'

export function useFetchReports(userId: string) {
  return useQuery({
    queryKey: ['reports', userId],
    queryFn: () => getUserReports(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      reportData,
    }: {
      userId: string
      reportData: Partial<Report>
    }) => createReport(userId, reportData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports', variables.userId] })
    },
  })
}

export function useDeleteReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reportId: string) => deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useFetchDataExports(userId: string) {
  return useQuery({
    queryKey: ['data-exports', userId],
    queryFn: () => getUserDataExports(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useRequestDataExport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      exportType,
      requestReason,
    }: {
      userId: string
      exportType: string
      requestReason?: string
    }) => requestDataExport(userId, exportType, requestReason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['data-exports', variables.userId] })
    },
  })
}

export function useDeleteDataExport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (exportId: string) => deleteDataExport(exportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-exports'] })
    },
  })
}
