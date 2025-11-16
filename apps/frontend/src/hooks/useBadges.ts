import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllBadges,
  getBadgesByCategory,
  getUserBadges,
  getUserBadgesCount,
  awardBadge,
  checkBadgeEligibility,
  getUserAura,
  addXP,
  setAuraColor,
  getGamificationStats,
  updateGamificationStats,
  addPoints,
  incrementBadgesEarned,
  getLeaderboard,
  getLeaderboardByScore,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
  getUserRank,
  updateLeaderboardEntry,
  checkAndAwardBadges,
  BadgeDefinition,
  UserBadge,
  UserAura,
  GamificationStats,
  LeaderboardEntry,
} from '@/services/badges.service'

// Badge Definition Queries
export function useFetchAllBadges() {
  return useQuery({
    queryKey: ['badges', 'all'],
    queryFn: getAllBadges,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useFetchBadgesByCategory(category: string) {
  return useQuery({
    queryKey: ['badges', 'category', category],
    queryFn: () => getBadgesByCategory(category),
    staleTime: 1000 * 60 * 30,
  })
}

// User Badge Queries
export function useFetchUserBadges(userId: string) {
  return useQuery({
    queryKey: ['badges', 'user', userId],
    queryFn: () => getUserBadges(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useFetchUserBadgesCount(userId: string) {
  return useQuery({
    queryKey: ['badges', 'user', userId, 'count'],
    queryFn: () => getUserBadgesCount(userId),
    staleTime: 1000 * 60 * 5,
  })
}

// User Badge Mutations
export function useAwardBadge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, badgeId }: { userId: string; badgeId: string }) =>
      awardBadge(userId, badgeId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['badges', 'user', variables.userId] })
      queryClient.invalidateQueries({
        queryKey: ['badges', 'user', variables.userId, 'count'],
      })
      queryClient.invalidateQueries({
        queryKey: ['gamification', 'stats', variables.userId],
      })
    },
  })
}

export function useCheckBadgeEligibility(userId: string, criteriaType: string, currentValue: number) {
  return useQuery({
    queryKey: ['badges', 'eligible', userId, criteriaType, currentValue],
    queryFn: () => checkBadgeEligibility(userId, criteriaType, currentValue),
    staleTime: 0, // Always fresh
  })
}

// User Aura Queries
export function useFetchUserAura(userId: string) {
  return useQuery({
    queryKey: ['aura', 'user', userId],
    queryFn: () => getUserAura(userId),
    staleTime: 1000 * 60 * 5,
  })
}

// User Aura Mutations
export function useAddXP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, xpAmount }: { userId: string; xpAmount: number }) =>
      addXP(userId, xpAmount),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['aura', 'user', variables.userId] })
      queryClient.invalidateQueries({
        queryKey: ['leaderboard', 'entries', variables.userId],
      })
    },
  })
}

export function useSetAuraColor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, color }: { userId: string; color: string }) =>
      setAuraColor(userId, color),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['aura', 'user', variables.userId] })
    },
  })
}

// Gamification Stats Queries
export function useFetchGamificationStats(userId: string) {
  return useQuery({
    queryKey: ['gamification', 'stats', userId],
    queryFn: () => getGamificationStats(userId),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Gamification Stats Mutations
export function useUpdateGamificationStats() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string
      updates: Partial<GamificationStats>
    }) => updateGamificationStats(userId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['gamification', 'stats', variables.userId],
      })
    },
  })
}

export function useAddPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, points }: { userId: string; points: number }) =>
      addPoints(userId, points),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['gamification', 'stats', variables.userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['leaderboard', 'entries', variables.userId],
      })
    },
  })
}

export function useIncrementBadgesEarned() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => incrementBadgesEarned(userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['gamification', 'stats', variables],
      })
    },
  })
}

// Leaderboard Queries
export function useFetchLeaderboard(limit: number = 50) {
  return useQuery({
    queryKey: ['leaderboard', 'entries', limit],
    queryFn: () => getLeaderboard(limit),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchLeaderboardByScore(limit: number = 50) {
  return useQuery({
    queryKey: ['leaderboard', 'score', limit],
    queryFn: () => getLeaderboardByScore(limit),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchWeeklyLeaderboard(limit: number = 50) {
  return useQuery({
    queryKey: ['leaderboard', 'weekly', limit],
    queryFn: () => getWeeklyLeaderboard(limit),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchMonthlyLeaderboard(limit: number = 50) {
  return useQuery({
    queryKey: ['leaderboard', 'monthly', limit],
    queryFn: () => getMonthlyLeaderboard(limit),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchUserRank(userId: string) {
  return useQuery({
    queryKey: ['leaderboard', 'user', userId],
    queryFn: () => getUserRank(userId),
    staleTime: 1000 * 60 * 5,
  })
}

// Leaderboard Mutations
export function useUpdateLeaderboardEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string
      updates: Partial<LeaderboardEntry>
    }) => updateLeaderboardEntry(userId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['leaderboard', 'user', variables.userId],
      })
      queryClient.invalidateQueries({ queryKey: ['leaderboard', 'entries'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard', 'score'] })
    },
  })
}

// Complex mutations
export function useCheckAndAwardBadges() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      criteriaType,
      currentValue,
    }: {
      userId: string
      criteriaType: string
      currentValue: number
    }) => checkAndAwardBadges(userId, criteriaType, currentValue),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['badges', 'user', variables.userId] })
      queryClient.invalidateQueries({
        queryKey: ['badges', 'user', variables.userId, 'count'],
      })
      queryClient.invalidateQueries({
        queryKey: ['gamification', 'stats', variables.userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['leaderboard', 'user', variables.userId],
      })
    },
  })
}

// Combined hook for dashboard usage
export function useBadges() {
  // Return empty/demo data structure for compatibility
  return {
    badges: [],
    earnedBadges: [],
    totalBadges: 0,
    progressPercentage: 0,
  }
}
