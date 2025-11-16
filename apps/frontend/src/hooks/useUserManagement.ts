import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  userManagementService,
  UserStatusActivity,
  UserGroup,
} from '@/services/userManagement.service'

// User Roles
export function useAssignRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      userManagementService.assignRole(userId, role),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'roles', userId] })
    },
  })
}

export function useFetchUserRoles(userId: string) {
  return useQuery({
    queryKey: ['user', 'roles', userId],
    queryFn: () => userManagementService.getUserRoles(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useRemoveRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      userManagementService.removeRole(userId, role),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'roles', userId] })
    },
  })
}

// User Permissions
export function useGrantPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      permission,
      expiresAt,
    }: {
      userId: string
      permission: string
      expiresAt?: string
    }) => userManagementService.grantPermission(userId, permission, expiresAt),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'permissions', userId] })
    },
  })
}

export function useFetchUserPermissions(userId: string) {
  return useQuery({
    queryKey: ['user', 'permissions', userId],
    queryFn: () => userManagementService.getUserPermissions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useRevokePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, permission }: { userId: string; permission: string }) =>
      userManagementService.revokePermission(userId, permission),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'permissions', userId] })
    },
  })
}

// User Status
export function useFetchUserStatus(userId: string) {
  return useQuery({
    queryKey: ['user', 'status', userId],
    queryFn: () => userManagementService.getUserStatus(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      status,
      reason,
    }: {
      userId: string
      status: string
      reason?: string
    }) => userManagementService.updateUserStatus(userId, status, reason),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'status', userId] })
    },
  })
}

// User Groups
export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (groupData: { name: string; description?: string; color?: string }) =>
      userManagementService.createGroup(groupData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'groups'] })
    },
  })
}

export function useFetchGroups() {
  return useQuery({
    queryKey: ['user', 'groups'],
    queryFn: () => userManagementService.getGroups(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useAddUserToGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, groupId }: { userId: string; groupId: string }) =>
      userManagementService.addUserToGroup(userId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'groups'] })
    },
  })
}

export function useRemoveUserFromGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, groupId }: { userId: string; groupId: string }) =>
      userManagementService.removeUserFromGroup(userId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'groups'] })
    },
  })
}

export function useFetchGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ['user', 'group-members', groupId],
    queryFn: () => userManagementService.getGroupMembers(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5,
  })
}
