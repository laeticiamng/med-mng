import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createTeam,
  getTeam,
  getTeamBySlug,
  getUserTeams,
  updateTeam,
  deleteTeam,
  searchTeams,
  addTeamMember,
  getTeamMembers,
  getTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  inviteToTeam,
  getTeamInvitations,
  acceptInvitation,
  declineInvitation,
  createChannel,
  getTeamChannels,
  getChannel,
  updateChannel,
  deleteChannel,
  postMessage,
  getChannelMessages,
  updateMessage,
  deleteMessage,
  logTeamActivity,
  getTeamActivityLog,
  Team,
  TeamMember,
  TeamInvitation,
  TeamChannel,
  TeamMessage,
} from '@/services/teams.service'

// Team Queries
export function useFetchTeam(teamId: string) {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => getTeam(teamId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useFetchTeamBySlug(slug: string) {
  return useQuery({
    queryKey: ['teams', 'slug', slug],
    queryFn: () => getTeamBySlug(slug),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchUserTeams(userId: string) {
  return useQuery({
    queryKey: ['teams', 'user', userId],
    queryFn: () => getUserTeams(userId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ['teams', teamId, 'members'],
    queryFn: () => getTeamMembers(teamId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchTeamMember(teamId: string, userId: string) {
  return useQuery({
    queryKey: ['teams', teamId, 'members', userId],
    queryFn: () => getTeamMember(teamId, userId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchTeamChannels(teamId: string) {
  return useQuery({
    queryKey: ['teams', teamId, 'channels'],
    queryFn: () => getTeamChannels(teamId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchChannel(channelId: string) {
  return useQuery({
    queryKey: ['teams', 'channels', channelId],
    queryFn: () => getChannel(channelId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchChannelMessages(channelId: string, limit: number = 50) {
  return useQuery({
    queryKey: ['teams', 'channels', channelId, 'messages'],
    queryFn: () => getChannelMessages(channelId, limit),
    staleTime: 1000 * 30, // 30 seconds for messages
  })
}

export function useFetchTeamInvitations(teamId: string) {
  return useQuery({
    queryKey: ['teams', teamId, 'invitations'],
    queryFn: () => getTeamInvitations(teamId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchTeamActivityLog(teamId: string) {
  return useQuery({
    queryKey: ['teams', teamId, 'activity'],
    queryFn: () => getTeamActivityLog(teamId),
    staleTime: 1000 * 60 * 10,
  })
}

export function useSearchTeams(query: string, visibility?: string) {
  return useQuery({
    queryKey: ['teams', 'search', query, visibility],
    queryFn: () => searchTeams(query, visibility),
    staleTime: 1000 * 60 * 5,
  })
}

// Team Mutations
export function useCreateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Parameters<typeof createTeam>[0]) => createTeam(data),
    onSuccess: (newTeam, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teamId, updates }: { teamId: string; updates: Partial<Team> }) =>
      updateTeam(teamId, updates),
    onSuccess: (updatedTeam, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] })
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

// Team Member Mutations
export function useAddTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      userId,
      role,
    }: {
      teamId: string
      userId: string
      role?: string
    }) => addTeamMember(teamId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] })
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] })
    },
  })
}

export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      userId,
      role,
    }: {
      teamId: string
      userId: string
      role: string
    }) => updateTeamMemberRole(teamId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] })
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeTeamMember(teamId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] })
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] })
    },
  })
}

// Team Invitation Mutations
export function useInviteToTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      invitedEmail,
      role,
      expiresAt,
    }: {
      teamId: string
      invitedEmail: string
      role?: string
      expiresAt?: string
    }) => inviteToTeam(teamId, invitedEmail, role, expiresAt),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'invitations'] })
    },
  })
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ invitationId, userId }: { invitationId: string; userId: string }) =>
      acceptInvitation(invitationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invitationId: string) => declineInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

// Channel Mutations
export function useCreateChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      name,
      options,
    }: {
      teamId: string
      name: string
      options?: Parameters<typeof createChannel>[2]
    }) => createChannel(teamId, name, options),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'channels'] })
    },
  })
}

export function useUpdateChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      channelId,
      updates,
    }: {
      channelId: string
      updates: Partial<TeamChannel>
    }) => updateChannel(channelId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'channels', variables.channelId] })
    },
  })
}

export function useDeleteChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (channelId: string) => deleteChannel(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

// Message Mutations
export function usePostMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      channelId,
      teamId,
      content,
    }: {
      channelId: string
      teamId: string
      content: string
    }) => postMessage(channelId, teamId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['teams', 'channels', variables.channelId, 'messages'],
      })
    },
  })
}

export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      updateMessage(messageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'channels'] })
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'channels'] })
    },
  })
}
