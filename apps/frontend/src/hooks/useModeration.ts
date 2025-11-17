import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  moderationService,
  ModerationRule,
  ModerationTeam,
  ModerationAppeal,
  ModerationStatistics,
} from '@shared/services/moderation.service'

// Moderation Rules
export function useFetchModerationRules(active?: boolean) {
  return useQuery({
    queryKey: ['moderation', 'rules', active],
    queryFn: () => moderationService.getRules(active),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCreateModerationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleData: Partial<ModerationRule>) => moderationService.createRule(ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'rules'] })
    },
  })
}

export function useUpdateModerationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ruleId, updates }: { ruleId: string; updates: Partial<ModerationRule> }) =>
      moderationService.updateRule(ruleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'rules'] })
    },
  })
}

export function useDeleteModerationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleId: string) => moderationService.deleteRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'rules'] })
    },
  })
}

// Moderation Teams
export function useFetchModerationTeams() {
  return useQuery({
    queryKey: ['moderation', 'teams'],
    queryFn: () => moderationService.getTeams(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useFetchModerationTeam(teamId: string) {
  return useQuery({
    queryKey: ['moderation', 'teams', teamId],
    queryFn: () => moderationService.getTeam(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 10,
  })
}

export function useCreateModerationTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (teamData: Partial<ModerationTeam>) => moderationService.createTeam(teamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'teams'] })
    },
  })
}

export function useAddTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      userId,
      role,
      expertise,
    }: {
      teamId: string
      userId: string
      role: 'lead' | 'reviewer' | 'supervisor' | 'viewer'
      expertise?: string[]
    }) => moderationService.addTeamMember(teamId, userId, role, expertise),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'teams', teamId] })
    },
  })
}

export function useFetchTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ['moderation', 'team-members', teamId],
    queryFn: () => moderationService.getTeamMembers(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5,
  })
}

// Appeals
export function useCreateAppeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (appealData: {
      originalActionId: string
      userId: string
      reason: string
      appealType: 'content_not_violation' | 'account_error' | 'disproportionate'
      additionalContext?: string
    }) => moderationService.createAppeal(appealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'appeals'] })
    },
  })
}

export function useFetchUserAppeals(userId: string) {
  return useQuery({
    queryKey: ['moderation', 'appeals', 'user', userId],
    queryFn: () => moderationService.getUserAppeals(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchPendingAppeals() {
  return useQuery({
    queryKey: ['moderation', 'appeals', 'pending'],
    queryFn: () => moderationService.getPendingAppeals(),
    staleTime: 1000 * 60 * 2, // 2 minutes for pending items
  })
}

export function useReviewAppeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      appealId,
      status,
      reviewNotes,
      decisionReason,
    }: {
      appealId: string
      status: 'approved' | 'rejected' | 'escalated'
      reviewNotes?: string
      decisionReason?: string
    }) => moderationService.reviewAppeal(appealId, status, reviewNotes, decisionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'appeals'] })
    },
  })
}

// Statistics
export function useFetchModerationStats(date?: string, teamId?: string) {
  return useQuery({
    queryKey: ['moderation', 'statistics', date, teamId],
    queryFn: () => moderationService.getModerationStats(date, teamId),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useUpdateModerationStats() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      date,
      updates,
      teamId,
    }: {
      date: string
      updates: Partial<ModerationStatistics>
      teamId?: string
    }) => moderationService.updateModerationStats(date, updates, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'statistics'] })
    },
  })
}
