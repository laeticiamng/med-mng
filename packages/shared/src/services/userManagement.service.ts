/**
 * User Management Service
 * Manages user roles, permissions, groups, and status
 */

import { supabase } from '@/integrations/supabase/client'

export interface UserRoleAssignment {
  id: string
  userId: string
  role: string
  assignedBy?: string
  assignedAt: string
}

export interface UserPermission {
  id: string
  userId: string
  permission: string
  grantedBy?: string
  grantedAt: string
  expiresAt?: string
}

export interface UserStatusActivity {
  id: string
  userId: string
  status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending'
  statusReason?: string
  statusChangedBy?: string
  statusChangedAt: string
  lastLoginAt?: string
  lastActivityAt?: string
  activityCount: number
}

export interface UserGroup {
  id: string
  name: string
  description?: string
  color?: string
  memberCount: number
  isActive: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export const userManagementService = {
  // User Roles
  async assignRole(userId: string, role: string): Promise<UserRoleAssignment> {
    try {
      const { data, error } = await supabase
        .from('user_role_assignments')
        .insert({
          user_id: userId,
          role,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single()

      if (error) throw error
      return mapUserRoleAssignment(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to assign role')
    }
  },

  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_role_assignments')
        .select('role')
        .eq('user_id', userId)

      if (error) throw error
      return data?.map((r) => r.role) || []
    } catch (err) {
      console.error('Error fetching user roles:', err)
      return []
    }
  },

  async removeRole(userId: string, role: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_role_assignments')
        .delete()
        .eq('user_id', userId)
        .eq('role', role)

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to remove role')
    }
  },

  // User Permissions
  async grantPermission(
    userId: string,
    permission: string,
    expiresAt?: string
  ): Promise<UserPermission> {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission,
          granted_by: (await supabase.auth.getUser()).data.user?.id,
          expires_at: expiresAt,
        })
        .select()
        .single()

      if (error) throw error
      return mapUserPermission(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to grant permission')
    }
  },

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', userId)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

      if (error) throw error
      return data?.map((p) => p.permission) || []
    } catch (err) {
      console.error('Error fetching user permissions:', err)
      return []
    }
  },

  async revokePermission(userId: string, permission: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('permission', permission)

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to revoke permission')
    }
  },

  // User Status
  async getUserStatus(userId: string): Promise<UserStatusActivity | null> {
    try {
      const { data, error } = await supabase
        .from('user_status_activity')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? mapUserStatusActivity(data) : null
    } catch (err) {
      console.error('Error fetching user status:', err)
      return null
    }
  },

  async updateUserStatus(
    userId: string,
    status: string,
    reason?: string
  ): Promise<UserStatusActivity> {
    try {
      const { data, error } = await supabase
        .from('user_status_activity')
        .upsert(
          {
            user_id: userId,
            status,
            status_reason: reason,
            status_changed_by: (await supabase.auth.getUser()).data.user?.id,
            status_changed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single()

      if (error) throw error
      return mapUserStatusActivity(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update user status')
    }
  },

  // User Groups
  async createGroup(groupData: {
    name: string
    description?: string
    color?: string
  }): Promise<UserGroup> {
    try {
      const { data, error } = await supabase
        .from('user_groups')
        .insert({
          name: groupData.name,
          description: groupData.description,
          color: groupData.color,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single()

      if (error) throw error
      return mapUserGroup(data)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create group')
    }
  },

  async getGroups(): Promise<UserGroup[]> {
    try {
      const { data, error } = await supabase
        .from('user_groups')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return (data || []).map(mapUserGroup)
    } catch (err) {
      console.error('Error fetching groups:', err)
      return []
    }
  },

  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_group_members')
        .insert({
          user_id: userId,
          group_id: groupId,
        })

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add user to group')
    }
  },

  async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_group_members')
        .delete()
        .eq('user_id', userId)
        .eq('group_id', groupId)

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to remove user from group')
    }
  },

  async getGroupMembers(groupId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_group_members')
        .select('user_id')
        .eq('group_id', groupId)

      if (error) throw error
      return data?.map((m) => m.user_id) || []
    } catch (err) {
      console.error('Error fetching group members:', err)
      return []
    }
  },
}

// Mapping functions
function mapUserRoleAssignment(data: any): UserRoleAssignment {
  return {
    id: data.id,
    userId: data.user_id,
    role: data.role,
    assignedBy: data.assigned_by,
    assignedAt: data.assigned_at,
  }
}

function mapUserPermission(data: any): UserPermission {
  return {
    id: data.id,
    userId: data.user_id,
    permission: data.permission,
    grantedBy: data.granted_by,
    grantedAt: data.granted_at,
    expiresAt: data.expires_at,
  }
}

function mapUserStatusActivity(data: any): UserStatusActivity {
  return {
    id: data.id,
    userId: data.user_id,
    status: data.status,
    statusReason: data.status_reason,
    statusChangedBy: data.status_changed_by,
    statusChangedAt: data.status_changed_at,
    lastLoginAt: data.last_login_at,
    lastActivityAt: data.last_activity_at,
    activityCount: data.activity_count,
  }
}

function mapUserGroup(data: any): UserGroup {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    memberCount: data.member_count,
    isActive: data.is_active,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
