import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { activityFeedService, ActivityType } from '@/services/activity-feed.service'

// Query keys for cache invalidation
const activityKeys = {
  all: ['activity'] as const,
  feeds: () => [...activityKeys.all, 'feeds'] as const,
  feed: (userId: string) => [...activityKeys.feeds(), userId] as const,
  feedWithPagination: (userId: string, limit: number, offset: number) => [
    ...activityKeys.feeds(),
    userId,
    'paginated',
    limit,
    offset,
  ] as const,
  byType: (userId: string, type: string) => [...activityKeys.feeds(), userId, 'type', type] as const,
  unread: (userId: string) => [...activityKeys.all, 'unread', userId] as const,
  history: (userId: string) => [...activityKeys.all, 'history', userId] as const,
  byTarget: (targetId: string) => [...activityKeys.all, 'target', targetId] as const,
}

/**
 * Hook to fetch user's activity feed with pagination
 */
export function useFetchActivityFeed(userId: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: activityKeys.feedWithPagination(userId, limit, offset),
    queryFn: () => activityFeedService.getUserActivityFeed(userId, limit, offset),
    staleTime: 1000 * 60, // 1 minute
    enabled: !!userId,
  })
}

/**
 * Hook to fetch following activity feed
 */
export function useFetchFollowingActivityFeed(userId: string, limit = 50) {
  return useQuery({
    queryKey: activityKeys.feed(userId),
    queryFn: () => activityFeedService.getFollowingActivityFeed(userId, limit),
    staleTime: 1000 * 60, // 1 minute
    enabled: !!userId,
  })
}

/**
 * Hook to get unread activity count
 */
export function useUnreadActivityCount(userId: string) {
  return useQuery({
    queryKey: activityKeys.unread(userId),
    queryFn: () => activityFeedService.getUnreadCount(userId),
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!userId,
  })
}

/**
 * Hook to mark activity as read
 */
export function useMarkActivityAsRead(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) => activityFeedService.markAsRead(activityId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: activityKeys.feed(userId),
      })
      queryClient.invalidateQueries({
        queryKey: activityKeys.unread(userId),
      })
    },
  })
}

/**
 * Hook to mark all activities as read
 */
export function useMarkAllActivitiesAsRead(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => activityFeedService.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.feed(userId),
      })
      queryClient.invalidateQueries({
        queryKey: activityKeys.unread(userId),
      })
    },
  })
}

/**
 * Hook to delete an activity
 */
export function useDeleteActivity(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) => activityFeedService.deleteActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.feed(userId),
      })
    },
  })
}

/**
 * Hook to delete all activities
 */
export function useDeleteAllActivities(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => activityFeedService.deleteAllActivities(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.feed(userId),
      })
    },
  })
}

/**
 * Hook to fetch activities by type
 */
export function useFetchActivitiesByType(userId: string, activityType: ActivityType) {
  return useQuery({
    queryKey: activityKeys.byType(userId, activityType),
    queryFn: () => activityFeedService.getActivitiesByType(userId, activityType),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to fetch user's activity history
 */
export function useFetchActivityHistory(userId: string, days = 30) {
  return useQuery({
    queryKey: activityKeys.history(userId),
    queryFn: () => activityFeedService.getUserActivityHistory(userId, days),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to fetch activities by target
 */
export function useFetchActivitiesByTarget(targetId: string) {
  return useQuery({
    queryKey: activityKeys.byTarget(targetId),
    queryFn: () => activityFeedService.getActivitiesByTarget(targetId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!targetId,
  })
}

/**
 * Hook to create a new activity
 */
export function useCreateActivity(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: Parameters<typeof activityFeedService.createActivity>[0]) =>
      activityFeedService.createActivity(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.feed(userId),
      })
      queryClient.invalidateQueries({
        queryKey: activityKeys.unread(userId),
      })
    },
  })
}
