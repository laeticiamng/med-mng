import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dataExportService, ExportType, ExportFormat } from '@shared/services/data-export.service'

// Query keys for cache invalidation
const exportKeys = {
  all: ['exports'] as const,
  jobs: (userId: string) => [...exportKeys.all, 'jobs', userId] as const,
  job: (jobId: string) => [...exportKeys.all, 'job', jobId] as const,
  status: (jobId: string) => [...exportKeys.all, 'status', jobId] as const,
  logs: (jobId: string) => [...exportKeys.all, 'logs', jobId] as const,
}

/**
 * Hook to fetch user's export jobs
 */
export function useFetchExportJobs(userId: string) {
  return useQuery({
    queryKey: exportKeys.jobs(userId),
    queryFn: () => dataExportService.getExportJobs(userId),
    staleTime: 1000 * 60, // 1 minute
    enabled: !!userId,
  })
}

/**
 * Hook to fetch a specific export job
 */
export function useFetchExportJob(jobId: string) {
  return useQuery({
    queryKey: exportKeys.job(jobId),
    queryFn: () => dataExportService.getExportJob(jobId),
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!jobId,
  })
}

/**
 * Hook to fetch export job status
 */
export function useFetchExportStatus(jobId: string) {
  return useQuery({
    queryKey: exportKeys.status(jobId),
    queryFn: () => dataExportService.getExportStatus(jobId),
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: (data) => {
      // Stop polling if completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false
      }
      return 5000 // Poll every 5 seconds
    },
    enabled: !!jobId,
  })
}

/**
 * Hook to create an export job
 */
export function useCreateExportJob(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { exportType: ExportType; format: ExportFormat }) =>
      dataExportService.createExportJob(params.exportType, params.format),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: exportKeys.jobs(userId),
      })
    },
  })
}

/**
 * Hook to get export logs
 */
export function useFetchExportLogs(jobId: string) {
  return useQuery({
    queryKey: exportKeys.logs(jobId),
    queryFn: () => dataExportService.getExportLogs(jobId),
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!jobId,
  })
}

/**
 * Hook to delete expired exports
 */
export function useDeleteExpiredExports(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => dataExportService.deleteExpiredExports(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: exportKeys.jobs(userId),
      })
    },
  })
}
