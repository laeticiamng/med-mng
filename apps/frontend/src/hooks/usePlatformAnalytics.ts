import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  platformAnalyticsService,
  SystemAlert,
} from '@shared/services/platformAnalytics.service'

// Health Metrics
export function useFetchHealthMetrics(date?: string, hour?: number) {
  return useQuery({
    queryKey: ['analytics', 'health', date, hour],
    queryFn: () => platformAnalyticsService.getHealthMetrics(date || new Date().toISOString().split('T')[0], hour),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchHealthMetricsHistory(days: number = 7) {
  return useQuery({
    queryKey: ['analytics', 'health-history', days],
    queryFn: () => platformAnalyticsService.getHealthMetricsHistory(days),
    staleTime: 1000 * 60 * 30,
  })
}

// User Activity Analytics
export function useFetchUserActivityAnalytics(date?: string) {
  return useQuery({
    queryKey: ['analytics', 'user-activity', date],
    queryFn: () => platformAnalyticsService.getUserActivityAnalytics(date),
    staleTime: 1000 * 60 * 30,
  })
}

export function useFetchUserActivityTrend(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'user-activity-trend', days],
    queryFn: () => platformAnalyticsService.getUserActivityTrend(days),
    staleTime: 1000 * 60 * 30,
  })
}

// Content Analytics
export function useFetchContentAnalytics(date?: string) {
  return useQuery({
    queryKey: ['analytics', 'content', date],
    queryFn: () => platformAnalyticsService.getContentAnalytics(date),
    staleTime: 1000 * 60 * 30,
  })
}

export function useFetchContentAnalyticsTrend(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'content-trend', days],
    queryFn: () => platformAnalyticsService.getContentAnalyticsTrend(days),
    staleTime: 1000 * 60 * 30,
  })
}

// Performance Trends
export function useFetchPerformanceTrends(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'performance-trends', days],
    queryFn: () => platformAnalyticsService.getPerformanceTrends(days),
    staleTime: 1000 * 60 * 30,
  })
}

export function useFetchMetricTrend(metricName: string, days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'metric-trend', metricName, days],
    queryFn: () => platformAnalyticsService.getMetricTrend(metricName, days),
    enabled: !!metricName,
    staleTime: 1000 * 60 * 30,
  })
}

// System Alerts
export function useFetchActiveAlerts() {
  return useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: () => platformAnalyticsService.getActiveAlerts(),
    staleTime: 1000 * 60 * 2, // More frequent refresh for alerts
  })
}

export function useFetchAllAlerts(limit: number = 50) {
  return useQuery({
    queryKey: ['alerts', 'all', limit],
    queryFn: () => platformAnalyticsService.getAllAlerts(limit),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alertData: {
      alertType: string
      severity: 'info' | 'warning' | 'critical'
      title: string
      description?: string
      affectedMetric?: string
      thresholdExceeded?: number
      actualValue?: number
    }) => platformAnalyticsService.createAlert(alertData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alertId: string) => platformAnalyticsService.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useResolveAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alertId: string) => platformAnalyticsService.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}
