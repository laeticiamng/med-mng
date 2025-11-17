import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recommendationsService, ContentType, UserPreferences } from '@shared/services/recommendations.service'

// Query keys for cache invalidation
const recommendationKeys = {
  all: ['recommendations'] as const,
  userRecs: (userId: string) => [...recommendationKeys.all, 'user', userId] as const,
  preferences: (userId: string) => [...recommendationKeys.all, 'preferences', userId] as const,
  trending: () => [...recommendationKeys.all, 'trending'] as const,
  trendingByType: (type: string) => [...recommendationKeys.trending(), type] as const,
  byCategory: (userId: string, category: string) => [...recommendationKeys.all, 'category', userId, category] as const,
  interactions: (userId: string) => [...recommendationKeys.all, 'interactions', userId] as const,
  similar: (contentId: string) => [...recommendationKeys.all, 'similar', contentId] as const,
}

/**
 * Hook to fetch user recommendations
 */
export function useFetchRecommendations(userId: string, limit = 10) {
  return useQuery({
    queryKey: recommendationKeys.userRecs(userId),
    queryFn: () => recommendationsService.getUserRecommendations(userId, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to fetch user preferences
 */
export function useFetchPreferences(userId: string) {
  return useQuery({
    queryKey: recommendationKeys.preferences(userId),
    queryFn: () => recommendationsService.getPreferences(userId),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to update user preferences
 */
export function useUpdatePreferences(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Partial<UserPreferences>) =>
      recommendationsService.updatePreferences(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recommendationKeys.preferences(userId),
      })
      queryClient.invalidateQueries({
        queryKey: recommendationKeys.userRecs(userId),
      })
    },
  })
}

/**
 * Hook to record user interaction
 */
export function useRecordInteraction(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: Parameters<typeof recommendationsService.recordInteraction>[0]) =>
      recommendationsService.recordInteraction(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recommendationKeys.userRecs(userId),
      })
      queryClient.invalidateQueries({
        queryKey: recommendationKeys.interactions(userId),
      })
    },
  })
}

/**
 * Hook to fetch trending content
 */
export function useFetchTrendingContent(limit = 10, contentType?: ContentType) {
  const queryKey = contentType
    ? recommendationKeys.trendingByType(contentType)
    : recommendationKeys.trending()

  return useQuery({
    queryKey,
    queryFn: () => recommendationsService.getTrendingContent(limit, contentType),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook to fetch recommendations by category
 */
export function useFetchRecommendationsByCategory(
  userId: string,
  category: string,
  limit = 10
) {
  return useQuery({
    queryKey: recommendationKeys.byCategory(userId, category),
    queryFn: () => recommendationsService.getRecommendationsByCategory(userId, category, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId && !!category,
  })
}

/**
 * Hook to fetch user interaction history
 */
export function useFetchInteractionHistory(
  userId: string,
  contentType?: ContentType,
  limit = 50
) {
  return useQuery({
    queryKey: recommendationKeys.interactions(userId),
    queryFn: () => recommendationsService.getInteractionHistory(userId, contentType, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to fetch similar content
 */
export function useFetchSimilarContent(contentId: string, limit = 5) {
  return useQuery({
    queryKey: recommendationKeys.similar(contentId),
    queryFn: () => recommendationsService.getSimilarContent(contentId, limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!contentId,
  })
}

/**
 * Hook to update content metadata
 */
export function useUpdateContentMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: Parameters<typeof recommendationsService.updateContentMetadata>[0] &
      Parameters<typeof recommendationsService.updateContentMetadata>[1] &
      Parameters<typeof recommendationsService.updateContentMetadata>[2]) =>
      recommendationsService.updateContentMetadata(
        params.contentId,
        params.contentType,
        params.updates
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recommendationKeys.trending(),
      })
    },
  })
}

/**
 * Hook to mark recommendation as clicked
 */
export function useMarkRecommendationAsClicked(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recommendationId: string) =>
      recommendationsService.markRecommendationAsClicked(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recommendationKeys.userRecs(userId),
      })
    },
  })
}
