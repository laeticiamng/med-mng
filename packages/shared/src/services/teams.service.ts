import { supabase } from '../lib/supabase'

export interface Team {
  id: string
  name: string
  description: string | null
  slug: string
  owner_id: string
  avatar_url: string | null
  cover_url: string | null
  visibility: 'private' | 'internal' | 'public'
  member_count: number
  max_members: number | null
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'moderator' | 'member'
  joined_at: string
  created_at: string
}

export interface TeamInvitation {
  id: string
  team_id: string
  invited_by: string
  invited_email: string | null
  invited_user_id: string | null
  role: 'owner' | 'admin' | 'moderator' | 'member'
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface TeamChannel {
  id: string
  team_id: string
  name: string
  description: string | null
  is_private: boolean
  created_by: string
  topic: string | null
  created_at: string
  updated_at: string
}

export interface TeamMessage {
  id: string
  channel_id: string
  team_id: string
  author_id: string
  content: string
  edited_at: string | null
  created_at: string
  updated_at: string
}

// Team Methods
export async function createTeam(data: {
  name: string
  description?: string
  slug: string
  visibility?: 'private' | 'internal' | 'public'
  max_members?: number
}): Promise<Team> {
  const { data: team, error } = await supabase
    .from('teams')
    .insert([
      {
        name: data.name,
        description: data.description,
        slug: data.slug,
        visibility: data.visibility || 'private',
        max_members: data.max_members,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return team
}

export async function getTeam(teamId: string): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()

  if (error) throw error
  return data
}

export async function getTeamBySlug(slug: string): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('teams(*)')
    .eq('user_id', userId)

  if (error) throw error
  return data?.map((m: any) => m.teams) || []
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', teamId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId)

  if (error) throw error
}

export async function searchTeamsService(query: string, visibility?: string): Promise<Team[]> {
  let qs = supabase
    .from('teams')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)

  if (visibility) {
    qs = qs.eq('visibility', visibility)
  }

  const { data, error } = await qs

  if (error) throw error
  return data || []
}

/**
 * Search teams by query string
 * Alias for backward compatibility with useTeams hook
 */
export async function searchTeams(query: string, visibility?: string): Promise<Team[]> {
  return searchTeamsService(query, visibility)
}

// Team Member Methods
export async function addTeamMember(
  teamId: string,
  userId: string,
  role: string = 'member'
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert([
      {
        team_id: teamId,
        user_id: userId,
        role,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)

  if (error) throw error
  return data || []
}

export async function getTeamMember(teamId: string, userId: string): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateTeamMemberRole(
  teamId: string,
  userId: string,
  role: string
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId)

  if (error) throw error
}

// Team Invitation Methods
export async function inviteToTeam(
  teamId: string,
  invitedEmail: string,
  role: string = 'member',
  expiresAt?: string
): Promise<TeamInvitation> {
  const { data, error } = await supabase
    .from('team_invitations')
    .insert([
      {
        team_id: teamId,
        invited_email: invitedEmail,
        role,
        expires_at: expiresAt,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  const { data, error } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('team_id', teamId)

  if (error) throw error
  return data || []
}

export async function acceptInvitation(invitationId: string, userId: string): Promise<void> {
  const invitation = await supabase
    .from('team_invitations')
    .select('*')
    .eq('id', invitationId)
    .single()

  if (!invitation.data) throw new Error('Invitation not found')

  // Add user to team
  await addTeamMember(invitation.data.team_id, userId, invitation.data.role)

  // Update invitation status
  await supabase
    .from('team_invitations')
    .update({
      status: 'accepted',
      invited_user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitationId)
}

export async function declineInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from('team_invitations')
    .update({
      status: 'declined',
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitationId)

  if (error) throw error
}

// Team Channel Methods
export async function createChannel(
  teamId: string,
  name: string,
  options?: {
    description?: string
    is_private?: boolean
    topic?: string
  }
): Promise<TeamChannel> {
  const { data, error } = await supabase
    .from('team_channels')
    .insert([
      {
        team_id: teamId,
        name,
        description: options?.description,
        is_private: options?.is_private || false,
        topic: options?.topic,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTeamChannels(teamId: string): Promise<TeamChannel[]> {
  const { data, error } = await supabase
    .from('team_channels')
    .select('*')
    .eq('team_id', teamId)

  if (error) throw error
  return data || []
}

export async function getChannel(channelId: string): Promise<TeamChannel> {
  const { data, error } = await supabase
    .from('team_channels')
    .select('*')
    .eq('id', channelId)
    .single()

  if (error) throw error
  return data
}

export async function updateChannel(
  channelId: string,
  updates: Partial<TeamChannel>
): Promise<TeamChannel> {
  const { data, error } = await supabase
    .from('team_channels')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', channelId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteChannel(channelId: string): Promise<void> {
  const { error } = await supabase
    .from('team_channels')
    .delete()
    .eq('id', channelId)

  if (error) throw error
}

// Team Message Methods
export async function postMessage(
  channelId: string,
  teamId: string,
  content: string
): Promise<TeamMessage> {
  const { data, error } = await supabase
    .from('team_messages')
    .insert([
      {
        channel_id: channelId,
        team_id: teamId,
        content,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getChannelMessages(
  channelId: string,
  limit: number = 50,
  offset: number = 0
): Promise<TeamMessage[]> {
  const { data, error } = await supabase
    .from('team_messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data || []).reverse()
}

export async function updateMessage(messageId: string, content: string): Promise<TeamMessage> {
  const { data, error } = await supabase
    .from('team_messages')
    .update({
      content,
      edited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('team_messages')
    .delete()
    .eq('id', messageId)

  if (error) throw error
}

// Team Activity Log Methods
export async function logTeamActivity(
  teamId: string,
  action: string,
  options?: {
    userId?: string
    resourceType?: string
    resourceId?: string
    details?: Record<string, any>
  }
): Promise<void> {
  const { error } = await supabase
    .from('team_activity_logs')
    .insert([
      {
        team_id: teamId,
        user_id: options?.userId,
        action,
        resource_type: options?.resourceType,
        resource_id: options?.resourceId,
        details: options?.details,
      },
    ])

  if (error) throw error
}

export async function getTeamActivityLog(
  teamId: string,
  limit: number = 50
): Promise<any[]> {
  const { data, error } = await supabase
    .from('team_activity_logs')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
