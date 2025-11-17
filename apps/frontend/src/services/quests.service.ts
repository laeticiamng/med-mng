import { supabase } from '@/integrations/supabase/client'

export interface Badge {
  id: string
  name: string
  description: string
  icon_emoji: string
  color: string
  category: string
  criteria_type: string
  criteria_value: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge: Badge
}

export interface CompletedQuest extends UserBadge {
  xp_reward: number
}

export interface GamificationStats {
  id: string
  user_id: string
  total_points: number
  badges_earned: number
  streaks_count: number
  posts_count: number
  comments_count: number
  goals_completed: number
  activities_logged: number
  community_contributions: number
  created_at: string
  updated_at: string
}

// Get user's completed quests (badges earned)
export async function getUserCompletedQuests(userId: string): Promise<CompletedQuest[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badge_definitions (*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) throw error

  // Transform to CompletedQuest format with XP calculation
  return (data || []).map((userBadge: any) => ({
    ...userBadge,
    xp_reward: calculateXPReward(userBadge.badge.rarity, userBadge.badge.criteria_value),
  }))
}

// Calculate XP reward based on badge rarity and criteria
function calculateXPReward(rarity: string, criteriaValue: number): number {
  const baseXP = criteriaValue * 10

  const rarityMultipliers: Record<string, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
  }

  const multiplier = rarityMultipliers[rarity] || 1
  return Math.round(baseXP * multiplier)
}

// Get gamification stats for a user
export async function getUserGamificationStats(userId: string): Promise<GamificationStats | null> {
  const { data, error } = await supabase
    .from('gamification_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // If no stats exist yet, return default values
    if (error.code === 'PGRST116') {
      return {
        id: '',
        user_id: userId,
        total_points: 0,
        badges_earned: 0,
        streaks_count: 0,
        posts_count: 0,
        comments_count: 0,
        goals_completed: 0,
        activities_logged: 0,
        community_contributions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
    throw error
  }

  return data
}

// Get all badge definitions
export async function getBadgeDefinitions(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badge_definitions')
    .select('*')
    .order('rarity', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get available badges (not yet earned by user)
export async function getAvailableBadges(userId: string): Promise<Badge[]> {
  // Get all badges
  const allBadges = await getBadgeDefinitions()

  // Get user's earned badges
  const { data: userBadges, error } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)

  if (error) throw error

  const earnedBadgeIds = new Set((userBadges || []).map(ub => ub.badge_id))

  // Return badges not yet earned
  return allBadges.filter(badge => !earnedBadgeIds.has(badge.id))
}

// Award a badge to a user (typically called by triggers)
export async function awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
  // Check if user already has this badge
  const { data: existing } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single()

  if (existing) {
    // Already has badge, return existing
    return existing as UserBadge
  }

  // Award the badge
  const { data, error } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
    })
    .select(`
      *,
      badge:badge_definitions (*)
    `)
    .single()

  if (error) throw error

  // Update gamification_stats
  await supabase.rpc('increment_badges_earned', { user_id_param: userId })

  return data as UserBadge
}

// Get badge progress for a specific badge type
export async function getBadgeProgress(
  userId: string,
  badgeId: string
): Promise<{ current: number; required: number; percentage: number }> {
  // Get badge definition
  const { data: badge, error: badgeError } = await supabase
    .from('badge_definitions')
    .select('*')
    .eq('id', badgeId)
    .single()

  if (badgeError) throw badgeError

  // Get user's current progress based on criteria_type
  let current = 0

  switch (badge.criteria_type) {
    case 'quiz_count': {
      const { count } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      current = count || 0
      break
    }
    case 'perfect_score_count': {
      const { count } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('score', 100)
      current = count || 0
      break
    }
    case 'edn_completed_count': {
      const { count } = await supabase
        .from('user_edn_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['completed', 'mastered'])
      current = count || 0
      break
    }
    case 'streak_days': {
      const stats = await getUserGamificationStats(userId)
      current = stats?.streaks_count || 0
      break
    }
    case 'post_count': {
      const stats = await getUserGamificationStats(userId)
      current = stats?.posts_count || 0
      break
    }
    case 'comment_count': {
      const stats = await getUserGamificationStats(userId)
      current = stats?.comments_count || 0
      break
    }
    default:
      current = 0
  }

  const required = badge.criteria_value
  const percentage = Math.min(100, Math.round((current / required) * 100))

  return { current, required, percentage }
}
