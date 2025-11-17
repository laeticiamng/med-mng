import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserCompletedQuests,
  getUserGamificationStats,
  getBadgeDefinitions,
  getAvailableBadges,
  awardBadge,
  getBadgeProgress,
} from '@/services/quests.service'

// Get user's completed quests (earned badges)
export function useGetCompletedQuests(userId: string) {
  return useQuery({
    queryKey: ['completed-quests', userId],
    queryFn: () => getUserCompletedQuests(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get user's gamification stats
export function useGetGamificationStats(userId: string) {
  return useQuery({
    queryKey: ['gamification-stats', userId],
    queryFn: () => getUserGamificationStats(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Get all badge definitions
export function useGetBadgeDefinitions() {
  return useQuery({
    queryKey: ['badge-definitions'],
    queryFn: () => getBadgeDefinitions(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// Get available badges (not yet earned)
export function useGetAvailableBadges(userId: string) {
  return useQuery({
    queryKey: ['available-badges', userId],
    queryFn: () => getAvailableBadges(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// Award a badge
export function useAwardBadge(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (badgeId: string) => awardBadge(userId, badgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completed-quests', userId] })
      queryClient.invalidateQueries({ queryKey: ['gamification-stats', userId] })
      queryClient.invalidateQueries({ queryKey: ['available-badges', userId] })
    },
  })
}

// Get badge progress
export function useGetBadgeProgress(userId: string, badgeId: string) {
  return useQuery({
    queryKey: ['badge-progress', userId, badgeId],
    queryFn: () => getBadgeProgress(userId, badgeId),
    enabled: !!userId && !!badgeId,
    staleTime: 1000 * 60 * 2,
  })
}
