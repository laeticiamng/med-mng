import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService, Notification, NotificationPreferences, NotificationType } from '@shared/services/notifications.service'

// Query keys for cache invalidation
const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (userId: string) => [...notificationKeys.lists(), userId] as const,
  unread: (userId: string) => [...notificationKeys.all, 'unread', userId] as const,
  byType: (userId: string, type: string) => [...notificationKeys.lists(), userId, 'type', type] as const,
  preferences: (userId: string) => [...notificationKeys.all, 'preferences', userId] as const,
  recent: (userId: string) => [...notificationKeys.all, 'recent', userId] as const,
}

/**
 * Hook to fetch user's notifications with pagination
 */
export function useFetchNotifications(userId: string, limit = 20) {
  return useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: () => notificationsService.getUserNotifications(userId, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to get unread notification count
 */
export function useUnreadCount(userId: string) {
  return useQuery({
    queryKey: notificationKeys.unread(userId),
    queryFn: () => notificationsService.getUnreadCount(userId),
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!userId,
  })
}

/**
 * Hook to mark a notification as read
 */
export function useMarkAsRead(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(userId),
      })
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unread(userId),
      })
    },
  })
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(userId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(userId),
      })
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unread(userId),
      })
    },
  })
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.deleteNotification(notificationId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(userId),
      })
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unread(userId),
      })
    },
  })
}

/**
 * Hook to delete all notifications
 */
export function useDeleteAllNotifications(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsService.deleteAllNotifications(userId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(userId),
      })
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unread(userId),
      })
    },
  })
}

/**
 * Hook to fetch notification preferences
 */
export function useFetchPreferences(userId: string) {
  return useQuery({
    queryKey: notificationKeys.preferences(userId),
    queryFn: () => notificationsService.getPreferences(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to update notification preferences
 */
export function useUpdatePreferences(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Partial<NotificationPreferences>) =>
      notificationsService.updatePreferences(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(userId),
      })
    },
  })
}

/**
 * Hook to fetch recent activity notifications
 */
export function useFetchRecentActivity(userId: string, days = 7) {
  return useQuery({
    queryKey: notificationKeys.recent(userId),
    queryFn: () => notificationsService.getRecentActivity(userId, days),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to fetch notifications by type
 */
export function useFetchNotificationsByType(userId: string, type: NotificationType) {
  return useQuery({
    queryKey: notificationKeys.byType(userId, type),
    queryFn: () => notificationsService.getNotificationsByType(userId, type),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to create a notification (for testing/admin)
 */
export function useCreateNotification(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: Parameters<typeof notificationsService.createNotification>[0]) =>
      notificationsService.createNotification(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(userId),
      })
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unread(userId),
      })
    },
  })
}
