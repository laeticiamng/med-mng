import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wellnessService, ActivityType, RitualCategory, GoalType, GoalStatus } from '@/services/wellness.service'

const wellnessKeys = {
  all: ['wellness'] as const,
  activities: () => [...wellnessKeys.all, 'activities'] as const,
  activity: (type: ActivityType) => [...wellnessKeys.activities(), type] as const,
  summary: (startDate: string, endDate: string) => [...wellnessKeys.activities(), 'summary', startDate, endDate] as const,
  rituals: () => [...wellnessKeys.all, 'rituals'] as const,
  ritual: (id: string) => [...wellnessKeys.rituals(), id] as const,
  completions: (ritualId: string) => [...wellnessKeys.ritual(ritualId), 'completions'] as const,
  streaks: () => [...wellnessKeys.all, 'streaks'] as const,
  streak: (activityType: string) => [...wellnessKeys.streaks(), activityType] as const,
  goals: () => [...wellnessKeys.all, 'goals'] as const,
  stats: () => [...wellnessKeys.all, 'stats'] as const,
}

/**
 * Log wellness activity
 */
export function useLogActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      activityType: ActivityType
      name: string
      duration_minutes?: number
      intensity_level?: string
      mood_before?: string
      mood_after?: string
      location?: string
      notes?: string
      activity_date?: string
    }) => {
      const result = await wellnessService.logActivity(params.activityType, params.name, {
        duration_minutes: params.duration_minutes,
        intensity_level: params.intensity_level as any,
        mood_before: params.mood_before as any,
        mood_after: params.mood_after as any,
        location: params.location,
        notes: params.notes,
        activity_date: params.activity_date,
      })
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wellnessKeys.activities() })
      queryClient.invalidateQueries({ queryKey: wellnessKeys.stats() })
      queryClient.invalidateQueries({ queryKey: wellnessKeys.streaks() })
    },
  })
}

/**
 * Fetch user's wellness activities
 */
export function useFetchActivities(
  limit = 20,
  offset = 0,
  activityType?: ActivityType,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: [...wellnessKeys.activities(), limit, offset, activityType, startDate, endDate],
    queryFn: async () => {
      const result = await wellnessService.getUserActivities(limit, offset, activityType, startDate, endDate)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Fetch activity summary for date range
 */
export function useFetchActivitySummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: wellnessKeys.summary(startDate, endDate),
    queryFn: async () => {
      const result = await wellnessService.getActivitySummary(startDate, endDate)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!startDate && !!endDate,
  })
}

/**
 * Create ritual
 */
export function useCreateRitual() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      name: string
      category: RitualCategory
      description?: string
      frequency?: string
      duration_minutes?: number
      reminder_time?: string
      color?: string
      icon?: string
    }) => {
      const result = await wellnessService.createRitual(params.name, params.category, {
        description: params.description,
        frequency: params.frequency as any,
        duration_minutes: params.duration_minutes,
        reminder_time: params.reminder_time,
        color: params.color,
        icon: params.icon,
      })
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wellnessKeys.rituals() })
    },
  })
}

/**
 * Fetch user's rituals
 */
export function useFetchRituals(category?: RitualCategory, activeOnly = true) {
  return useQuery({
    queryKey: [...wellnessKeys.rituals(), category, activeOnly],
    queryFn: async () => {
      const result = await wellnessService.getUserRituals(category, activeOnly)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Complete ritual
 */
export function useCompleteRitual(ritualId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { durationMinutes?: number; notes?: string; mood_before?: string; mood_after?: string }) => {
      const result = await wellnessService.completeRitual(ritualId, params.durationMinutes, {
        notes: params.notes,
        mood_before: params.mood_before as any,
        mood_after: params.mood_after as any,
      })
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wellnessKeys.completions(ritualId) })
      queryClient.invalidateQueries({ queryKey: wellnessKeys.stats() })
    },
  })
}

/**
 * Fetch ritual completions
 */
export function useFetchRitualCompletions(ritualId: string, limit = 30, offset = 0) {
  return useQuery({
    queryKey: [...wellnessKeys.completions(ritualId), limit, offset],
    queryFn: async () => {
      const result = await wellnessService.getRitualCompletions(ritualId, limit, offset)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!ritualId,
  })
}

/**
 * Fetch wellness streaks
 */
export function useFetchWellnessStreaks() {
  return useQuery({
    queryKey: wellnessKeys.streaks(),
    queryFn: async () => {
      const result = await wellnessService.getWellnessStreaks()
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Fetch specific activity streak
 */
export function useFetchActivityStreak(activityType: string) {
  return useQuery({
    queryKey: wellnessKeys.streak(activityType),
    queryFn: async () => {
      const result = await wellnessService.getActivityStreak(activityType)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!activityType,
  })
}

/**
 * Create wellness goal
 */
export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      goalType: GoalType
      title: string
      targetValue?: number
      description?: string
      target_unit?: string
      frequency?: string
      end_date?: string
    }) => {
      const result = await wellnessService.createGoal(params.goalType, params.title, params.targetValue, {
        description: params.description,
        target_unit: params.target_unit,
        frequency: params.frequency as any,
        end_date: params.end_date,
      })
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wellnessKeys.goals() })
    },
  })
}

/**
 * Fetch user's wellness goals
 */
export function useFetchGoals(status?: GoalStatus) {
  return useQuery({
    queryKey: [...wellnessKeys.goals(), status],
    queryFn: async () => {
      const result = await wellnessService.getUserGoals(status)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Update goal progress
 */
export function useUpdateGoalProgress(goalId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (progress: number) => {
      const result = await wellnessService.updateGoalProgress(goalId, progress)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wellnessKeys.goals() })
    },
  })
}

/**
 * Fetch wellness stats
 */
export function useFetchWellnessStats() {
  return useQuery({
    queryKey: wellnessKeys.stats(),
    queryFn: async () => {
      const result = await wellnessService.getWellnessStats()
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}

/**
 * Delete ritual
 */
export function useDeleteRitual() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ritualId: string) => {
      const result = await wellnessService.deleteRitual(ritualId)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wellnessKeys.rituals() })
    },
  })
}
