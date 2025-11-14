import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userProfileService, AchievementType } from '@/services/user-profile.service'

// Query keys for cache invalidation
const profileKeys = {
  all: ['profiles'] as const,
  profile: (userId: string) => [...profileKeys.all, 'profile', userId] as const,
  stats: (userId: string) => [...profileKeys.all, 'stats', userId] as const,
  achievements: (userId: string) => [...profileKeys.all, 'achievements', userId] as const,
  followers: (userId: string) => [...profileKeys.all, 'followers', userId] as const,
  following: (userId: string) => [...profileKeys.all, 'following', userId] as const,
  isFollowing: (targetUserId: string) => [...profileKeys.all, 'isFollowing', targetUserId] as const,
  profileWithStats: (userId: string) => [...profileKeys.all, 'profileWithStats', userId] as const,
  search: (query: string) => [...profileKeys.all, 'search', query] as const,
  trending: () => [...profileKeys.all, 'trending'] as const,
}

/**
 * Hook to fetch user profile
 */
export function useFetchProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.profile(userId),
    queryFn: () => userProfileService.getProfile(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Parameters<typeof userProfileService.updateProfile>[1]) =>
      userProfileService.updateProfile(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.profile(userId),
      })
      queryClient.invalidateQueries({
        queryKey: profileKeys.profileWithStats(userId),
      })
    },
  })
}

/**
 * Hook to fetch user statistics
 */
export function useFetchStatistics(userId: string) {
  return useQuery({
    queryKey: profileKeys.stats(userId),
    queryFn: () => userProfileService.getStatistics(userId),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to fetch user achievements
 */
export function useFetchAchievements(userId: string) {
  return useQuery({
    queryKey: profileKeys.achievements(userId),
    queryFn: () => userProfileService.getAchievements(userId),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to award achievement
 */
export function useAwardAchievement(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      type: AchievementType
      title: string
      description?: string
    }) =>
      userProfileService.awardAchievement(userId, params.type, params.title, params.description),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.achievements(userId),
      })
    },
  })
}

/**
 * Hook to follow a user
 */
export function useFollowUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (targetUserId: string) => userProfileService.followUser(targetUserId),
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.isFollowing(targetUserId),
      })
      queryClient.invalidateQueries({
        queryKey: profileKeys.stats(targetUserId),
      })
    },
  })
}

/**
 * Hook to unfollow a user
 */
export function useUnfollowUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (targetUserId: string) => userProfileService.unfollowUser(targetUserId),
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.isFollowing(targetUserId),
      })
      queryClient.invalidateQueries({
        queryKey: profileKeys.stats(targetUserId),
      })
    },
  })
}

/**
 * Hook to check if following a user
 */
export function useIsFollowing(targetUserId: string) {
  return useQuery({
    queryKey: profileKeys.isFollowing(targetUserId),
    queryFn: () => userProfileService.isFollowing(targetUserId),
    staleTime: 1000 * 60, // 1 minute
    enabled: !!targetUserId,
  })
}

/**
 * Hook to fetch user followers
 */
export function useFetchFollowers(userId: string, limit = 50) {
  return useQuery({
    queryKey: profileKeys.followers(userId),
    queryFn: () => userProfileService.getFollowers(userId, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to fetch users being followed
 */
export function useFetchFollowing(userId: string, limit = 50) {
  return useQuery({
    queryKey: profileKeys.following(userId),
    queryFn: () => userProfileService.getFollowing(userId, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to fetch profile with statistics
 */
export function useFetchProfileWithStats(userId: string) {
  return useQuery({
    queryKey: profileKeys.profileWithStats(userId),
    queryFn: () => userProfileService.getProfileWithStats(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * Hook to search profiles
 */
export function useSearchProfiles(query: string, limit = 20) {
  return useQuery({
    queryKey: profileKeys.search(query),
    queryFn: () => userProfileService.searchProfiles(query, limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!query && query.length > 0,
  })
}

/**
 * Hook to fetch trending users
 */
export function useFetchTrendingUsers(limit = 10) {
  return useQuery({
    queryKey: profileKeys.trending(),
    queryFn: () => userProfileService.getTrendingUsers(limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}
