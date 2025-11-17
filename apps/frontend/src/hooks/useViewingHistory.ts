import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userViewingHistoryService } from '@shared/services/user-viewing-history.service'

export const useViewingHistory = () => {
  const queryClient = useQueryClient()

  /**
   * Record a view for an item
   */
  const useRecordView = () => {
    return useMutation({
      mutationFn: (params: {
        itemId: string
        itemType: 'fiche' | 'post' | 'collection'
        userId: string
        viewSource?: 'feed' | 'detail' | 'search' | 'recommendation' | 'direct'
        metadata?: Record<string, any>
      }) => {
        return userViewingHistoryService.recordView({
          item_id: params.itemId,
          item_type: params.itemType,
          user_id: params.userId,
          view_source: params.viewSource || 'direct',
          metadata: params.metadata,
        })
      },
      onSuccess: (_, params) => {
        // Invalidate user history queries
        queryClient.invalidateQueries({
          queryKey: ['viewingHistory', 'user', params.userId],
        })
      },
    })
  }

  /**
   * Fetch user's viewing history
   */
  const useFetchHistory = (userId?: string) => {
    return useQuery({
      queryKey: ['viewingHistory', 'user', userId],
      queryFn: async () => {
        if (!userId) return []
        return await userViewingHistoryService.getUserHistory(userId)
      },
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  /**
   * Fetch recent views
   */
  const useFetchRecentViews = (userId?: string, limit?: number) => {
    return useQuery({
      queryKey: ['viewingHistory', 'recent', userId, limit],
      queryFn: async () => {
        if (!userId) return []
        return await userViewingHistoryService.getRecentViews(userId, limit || 10)
      },
      enabled: !!userId,
      staleTime: 3 * 60 * 1000, // 3 minutes
    })
  }

  /**
   * Get completed items (items user finished viewing)
   */
  const useFetchCompletedItems = (userId?: string) => {
    return useQuery({
      queryKey: ['viewingHistory', 'completed', userId],
      queryFn: async () => {
        if (!userId) return []
        return await userViewingHistoryService.getCompletedItems(userId)
      },
      enabled: !!userId,
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }

  /**
   * Get viewing statistics
   */
  const useFetchViewingStats = (userId?: string) => {
    return useQuery({
      queryKey: ['viewingHistory', 'stats', userId],
      queryFn: async () => {
        if (!userId) return null
        return await userViewingHistoryService.getViewingStats(userId)
      },
      enabled: !!userId,
      staleTime: 15 * 60 * 1000, // 15 minutes
    })
  }

  /**
   * Get history for specific items
   */
  const useFetchItemViewers = (itemId?: string) => {
    return useQuery({
      queryKey: ['viewingHistory', 'item', itemId],
      queryFn: async () => {
        if (!itemId) return []
        return await userViewingHistoryService.getItemViewers(itemId)
      },
      enabled: !!itemId,
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }

  /**
   * Clear viewing history
   */
  const useClearHistory = () => {
    return useMutation({
      mutationFn: (userId: string) => {
        return userViewingHistoryService.clearHistory(userId)
      },
      onSuccess: (_, userId) => {
        queryClient.invalidateQueries({
          queryKey: ['viewingHistory'],
        })
      },
    })
  }

  return {
    useRecordView,
    useFetchHistory,
    useFetchRecentViews,
    useFetchCompletedItems,
    useFetchViewingStats,
    useFetchItemViewers,
    useClearHistory,
  }
}
