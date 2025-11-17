import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wellnessService, ActivityType, RitualCategory, GoalType, GoalStatus } from '@shared/services/wellness.service'

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
    mutationFn: (params: {
      activityType: ActivityType
      name: string
      duration_minutes?: number
      intensity_level?: string
      mood_before?: string
      mood_after?: string
      location?: string
      notes?: string
      activity_date?: string
    }) =>
      wellnessService.logActivity(params.activityType, params.name, {
        duration_minutes: params.duration_minutes,
        intensity_level: params.intensity_level as any,
        mood_before: params.mood_before as any,
        mood_after: params.mood_after as any,
        location: params.location,
        notes: params.notes,
        activity_date: params.activity_date,
      }),
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
    queryFn: () => wellnessService.getUserActivities(limit, offset, activityType, startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Fetch activity summary for date range
 */
export function useFetchActivitySummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: wellnessKeys.summary(startDate, endDate),
    queryFn: () => wellnessService.getActivitySummary(startDate, endDate),
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
    mutationFn: (params: {
      name: string
      category: RitualCategory
      description?: string
      frequency?: string
      duration_minutes?: number
      reminder_time?: string
      color?: string
      icon?: string
    }) =>
      wellnessService.createRitual(params.name, params.category, {
        description: params.description,
        frequency: params.frequency as any,
        duration_minutes: params.duration_minutes,
        reminder_time: params.reminder_time,
        color: params.color,
        icon: params.icon,
      }),
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
    queryFn: () => wellnessService.getUserRituals(category, activeOnly),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Complete ritual
 */
export function useCompleteRitual(ritualId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { durationMinutes?: number; notes?: string; mood_before?: string; mood_after?: string }) =>
      wellnessService.completeRitual(ritualId, params.durationMinutes, {
        notes: params.notes,
        mood_before: params.mood_before as any,
        mood_after: params.mood_after as any,
      }),
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
    queryFn: () => wellnessService.getRitualCompletions(ritualId, limit, offset),
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
    queryFn: () => wellnessService.getWellnessStreaks(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Fetch specific activity streak
 */
export function useFetchActivityStreak(activityType: string) {
  return useQuery({
    queryKey: wellnessKeys.streak(activityType),
    queryFn: () => wellnessService.getActivityStreak(activityType),
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
    mutationFn: (params: {
      goalType: GoalType
      title: string
      targetValue?: number
      description?: string
      target_unit?: string
      frequency?: string
      end_date?: string
    }) =>
      wellnessService.createGoal(params.goalType, params.title, params.targetValue, {
        description: params.description,
        target_unit: params.target_unit,
        frequency: params.frequency as any,
        end_date: params.end_date,
      }),
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
    queryFn: () => wellnessService.getUserGoals(status),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Update goal progress
 */
export function useUpdateGoalProgress(goalId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (progress: number) => wellnessService.updateGoalProgress(goalId, progress),
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
    queryFn: () => wellnessService.getWellnessStats(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}

/**
 * Delete ritual
 */
export function useDeleteRitual() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ritualId: string) => wellnessService.deleteRitual(ritualId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wellnessKeys.rituals() })
    },
  })
}
