import { supabase } from '@/integrations/supabase/client'

// Types
export interface Team {
  id: string
  name: string
  slug: string
  description?: string
  avatar_url?: string
  visibility: 'public' | 'private'
  max_members?: number
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }
}

export interface TeamInvitation {
  id: string
  team_id: string
  invited_by: string
  invited_email: string
  role: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at?: string
  created_at: string
  team?: Team
}

export interface TeamChannel {
  id: string
  team_id: string
  name: string
  description?: string
  is_private: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface TeamMessage {
  id: string
  channel_id: string
  team_id: string
  user_id: string
  content: string
  edited: boolean
  created_at: string
  updated_at: string
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }
}

export interface TeamActivity {
  id: string
  team_id: string
  user_id: string
  action: string
  details?: any
  created_at: string
  user?: {
    id: string
    email: string
    full_name?: string
  }
}

// Team CRUD Operations
export async function createTeam(data: {
  name: string
  slug: string
  description?: string
  visibility?: 'public' | 'private'
  max_members?: number
}): Promise<Team> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data: team, error } = await supabase
    .from('teams')
    .insert({
      ...data,
      owner_id: user.id,
      visibility: data.visibility || 'public',
    })
    .select()
    .single()

  if (error) throw error

  // Add creator as owner member
  await addTeamMember(team.id, user.id, 'owner')

  // Log activity
  await logTeamActivity(team.id, user.id, 'team_created', { team_name: data.name })

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
    .select('team:teams(*)')
    .eq('user_id', userId)

  if (error) throw error
  return data.map((item: any) => item.team)
}

export async function updateTeam(
  teamId: string,
  updates: Partial<Omit<Team, 'id' | 'created_at' | 'owner_id'>>
): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', teamId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    await logTeamActivity(teamId, user.id, 'team_updated', { updates })
  }

  return data
}

export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await supabase.from('teams').delete().eq('id', teamId)

  if (error) throw error
}

export async function searchTeams(query: string, visibility?: string): Promise<Team[]> {
  let queryBuilder = supabase
    .from('teams')
    .select('*')
    .ilike('name', `%${query}%`)

  if (visibility) {
    queryBuilder = queryBuilder.eq('visibility', visibility)
  }

  const { data, error } = await queryBuilder.limit(20)

  if (error) throw error
  return data || []
}

// Team Members Operations
export async function addTeamMember(
  teamId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: userId,
      role,
    })
    .select()
    .single()

  if (error) throw error

  // Log activity
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    await logTeamActivity(teamId, user.id, 'member_added', { added_user_id: userId, role })
  }

  return data
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select(
      `
      *,
      user:profiles(id, email, full_name, avatar_url)
    `
    )
    .eq('team_id', teamId)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getTeamMember(teamId: string, userId: string): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateTeamMemberRole(
  teamId: string,
  userId: string,
  role: 'admin' | 'member'
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    await logTeamActivity(teamId, user.id, 'member_role_updated', { user_id: userId, new_role: role })
  }

  return data
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId)

  if (error) throw error

  // Log activity
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    await logTeamActivity(teamId, user.id, 'member_removed', { removed_user_id: userId })
  }
}

// Team Invitations
export async function inviteToTeam(
  teamId: string,
  invitedEmail: string,
  role: 'admin' | 'member' = 'member',
  expiresAt?: string
): Promise<TeamInvitation> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('team_invitations')
    .insert({
      team_id: teamId,
      invited_by: user.id,
      invited_email: invitedEmail,
      role,
      status: 'pending',
      expires_at: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days default
    })
    .select()
    .single()

  if (error) throw error

  // Log activity
  await logTeamActivity(teamId, user.id, 'invitation_sent', { invited_email: invitedEmail, role })

  return data
}

export async function getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  const { data, error } = await supabase
    .from('team_invitations')
    .select(
      `
      *,
      team:teams(*)
    `
    )
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function acceptInvitation(invitationId: string, userId: string): Promise<void> {
  // Get invitation
  const { data: invitation, error: invError } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('id', invitationId)
    .single()

  if (invError) throw invError

  // Add to team
  await addTeamMember(invitation.team_id, userId, invitation.role as 'admin' | 'member')

  // Update invitation status
  const { error } = await supabase
    .from('team_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId)

  if (error) throw error

  // Log activity
  await logTeamActivity(invitation.team_id, userId, 'invitation_accepted', { invitation_id: invitationId })
}

export async function declineInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from('team_invitations')
    .update({ status: 'declined' })
    .eq('id', invitationId)

  if (error) throw error
}

// Team Channels
export async function createChannel(
  teamId: string,
  name: string,
  options?: { description?: string; is_private?: boolean }
): Promise<TeamChannel> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('team_channels')
    .insert({
      team_id: teamId,
      name,
      description: options?.description,
      is_private: options?.is_private || false,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  // Log activity
  await logTeamActivity(teamId, user.id, 'channel_created', { channel_name: name })

  return data
}

export async function getTeamChannels(teamId: string): Promise<TeamChannel[]> {
  const { data, error } = await supabase
    .from('team_channels')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true })

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
  updates: Partial<Omit<TeamChannel, 'id' | 'team_id' | 'created_by' | 'created_at'>>
): Promise<TeamChannel> {
  const { data, error } = await supabase
    .from('team_channels')
    .update(updates)
    .eq('id', channelId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteChannel(channelId: string): Promise<void> {
  const { error } = await supabase.from('team_channels').delete().eq('id', channelId)

  if (error) throw error
}

// Team Messages
export async function postMessage(
  channelId: string,
  teamId: string,
  content: string
): Promise<TeamMessage> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('team_messages')
    .insert({
      channel_id: channelId,
      team_id: teamId,
      user_id: user.id,
      content,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getChannelMessages(channelId: string, limit = 50): Promise<TeamMessage[]> {
  const { data, error } = await supabase
    .from('team_messages')
    .select(
      `
      *,
      user:profiles(id, email, full_name, avatar_url)
    `
    )
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).reverse() // Reverse to show oldest first
}

export async function updateMessage(messageId: string, content: string): Promise<TeamMessage> {
  const { data, error } = await supabase
    .from('team_messages')
    .update({ content, edited: true })
    .eq('id', messageId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase.from('team_messages').delete().eq('id', messageId)

  if (error) throw error
}

// Team Activity Log
export async function logTeamActivity(
  teamId: string,
  userId: string,
  action: string,
  details?: any
): Promise<void> {
  await supabase.from('team_activity_log').insert({
    team_id: teamId,
    user_id: userId,
    action,
    details,
  })
}

export async function getTeamActivityLog(teamId: string, limit = 50): Promise<TeamActivity[]> {
  const { data, error } = await supabase
    .from('team_activity_log')
    .select(
      `
      *,
      user:profiles(id, email, full_name)
    `
    )
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
