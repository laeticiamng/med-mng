import { supabase } from '@/integrations/supabase/client'

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon_emoji: string
  color: string
  category: 'achievement' | 'streak' | 'social' | 'wellness' | 'learning'
  criteria_type: string
  criteria_value: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  unlock_at_percentage: boolean
  created_at: string
  updated_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  created_at: string
  badge_definition?: BadgeDefinition
}

export interface UserAura {
  id: string
  user_id: string
  current_level: number
  current_xp: number
  total_xp: number
  aura_color: string
  aura_intensity: string
  last_level_up: string | null
  created_at: string
  updated_at: string
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

export interface LeaderboardEntry {
  id: string
  user_id: string
  rank: number
  score: number
  badges_count: number
  aura_level: number
  week_points: number
  month_points: number
  all_time_points: number
  created_at: string
  updated_at: string
  user?: {
    id: string
    email?: string
  }
}

// Badge Definition Methods
export async function getAllBadges(): Promise<BadgeDefinition[]> {
  const { data, error } = await supabase
    .from('badge_definitions')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getBadgesByCategory(
  category: string
): Promise<BadgeDefinition[]> {
  const { data, error } = await supabase
    .from('badge_definitions')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getBadgeDefinition(badgeId: string): Promise<BadgeDefinition> {
  const { data, error } = await supabase
    .from('badge_definitions')
    .select('*')
    .eq('id', badgeId)
    .single()

  if (error) throw error
  return data
}

// User Badge Methods
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select(
      `
      *,
      badge_definition:badge_definitions(*)
    `
    )
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getUserBadgesCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_badges')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count || 0
}

export async function awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
  const { data, error } = await supabase
    .from('user_badges')
    .insert([
      {
        user_id: userId,
        badge_id: badgeId,
        earned_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    // Ignore duplicate badge awards
    if (error.code === '23505') {
      return { id: '', user_id: userId, badge_id: badgeId, earned_at: '', created_at: '' }
    }
    throw error
  }

  return data
}

export async function checkBadgeEligibility(
  userId: string,
  criteriaType: string,
  currentValue: number
): Promise<BadgeDefinition[]> {
  const { data, error } = await supabase
    .from('badge_definitions')
    .select('*')
    .eq('criteria_type', criteriaType)
    .lte('criteria_value', currentValue)

  if (error) throw error

  // Filter out already earned badges
  const earnedBadges = await getUserBadges(userId)
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badge_id))

  return (data || []).filter((badge) => !earnedBadgeIds.has(badge.id))
}

// User Aura Methods
export async function getUserAura(userId: string): Promise<UserAura> {
  let { data, error } = await supabase
    .from('user_auras')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No aura found, create one
      const { data: newAura, error: createError } = await supabase
        .from('user_auras')
        .insert([
          {
            user_id: userId,
            current_level: 1,
            current_xp: 0,
            total_xp: 0,
            aura_color: 'blue',
            aura_intensity: 'low',
          },
        ])
        .select()
        .single()

      if (createError) throw createError
      return newAura
    }
    throw error
  }

  return data
}

export async function addXP(userId: string, xpAmount: number): Promise<UserAura> {
  const aura = await getUserAura(userId)

  const xpPerLevel = 1000
  const newTotalXP = aura.total_xp + xpAmount
  const newLevel = Math.floor(newTotalXP / xpPerLevel) + 1
  const newCurrentXP = newTotalXP % xpPerLevel

  const auraColors = ['blue', 'green', 'purple', 'gold', 'red', 'orange']
  const auraIntensities = ['low', 'medium', 'high', 'intense']
  const newColor = auraColors[(newLevel - 1) % auraColors.length]
  const newIntensity = auraIntensities[Math.min(Math.floor((newLevel - 1) / 6), 3)]

  const { data, error } = await supabase
    .from('user_auras')
    .update({
      current_level: newLevel,
      current_xp: newCurrentXP,
      total_xp: newTotalXP,
      aura_color: newColor,
      aura_intensity: newIntensity,
      last_level_up: newLevel > aura.current_level ? new Date().toISOString() : aura.last_level_up,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function setAuraColor(userId: string, color: string): Promise<UserAura> {
  const { data, error } = await supabase
    .from('user_auras')
    .update({
      aura_color: color,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Gamification Stats Methods
export async function getGamificationStats(userId: string): Promise<GamificationStats> {
  let { data, error } = await supabase
    .from('gamification_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No stats found, create one
      const { data: newStats, error: createError } = await supabase
        .from('gamification_stats')
        .insert([
          {
            user_id: userId,
            total_points: 0,
            badges_earned: 0,
            streaks_count: 0,
            posts_count: 0,
            comments_count: 0,
            goals_completed: 0,
            activities_logged: 0,
            community_contributions: 0,
          },
        ])
        .select()
        .single()

      if (createError) throw createError
      return newStats
    }
    throw error
  }

  return data
}

export async function updateGamificationStats(
  userId: string,
  updates: Partial<GamificationStats>
): Promise<GamificationStats> {
  const { data, error } = await supabase
    .from('gamification_stats')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addPoints(userId: string, points: number): Promise<GamificationStats> {
  const stats = await getGamificationStats(userId)
  return updateGamificationStats(userId, {
    total_points: stats.total_points + points,
  })
}

export async function incrementBadgesEarned(userId: string): Promise<GamificationStats> {
  const stats = await getGamificationStats(userId)
  return updateGamificationStats(userId, {
    badges_earned: stats.badges_earned + 1,
  })
}

// Leaderboard Methods
export async function getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('*')
    .order('rank', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getLeaderboardByScore(limit: number = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getWeeklyLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('*')
    .order('week_points', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getMonthlyLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('*')
    .order('month_points', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getUserRank(userId: string): Promise<LeaderboardEntry | null> {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

export async function updateLeaderboardEntry(
  userId: string,
  updates: Partial<LeaderboardEntry>
): Promise<LeaderboardEntry> {
  let entry = await getUserRank(userId)

  if (!entry) {
    // Create new leaderboard entry
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .insert([
        {
          user_id: userId,
          rank: 999999,
          score: updates.score || 0,
          badges_count: updates.badges_count || 0,
          aura_level: updates.aura_level || 1,
          week_points: updates.week_points || 0,
          month_points: updates.month_points || 0,
          all_time_points: updates.all_time_points || 0,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('leaderboard_entries')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLeaderboardRanks(): Promise<void> {
  // Get all leaderboard entries ordered by score
  const { data: entries, error } = await supabase
    .from('leaderboard_entries')
    .select('id, user_id, score')
    .order('score', { ascending: false })

  if (error) throw error

  // Update ranks
  for (let i = 0; i < (entries || []).length; i++) {
    const entry = entries![i]
    await supabase
      .from('leaderboard_entries')
      .update({ rank: i + 1, updated_at: new Date().toISOString() })
      .eq('id', entry.id)
  }
}

// Helper function to check and award badges based on activity
export async function checkAndAwardBadges(userId: string, criteriaType: string, currentValue: number): Promise<BadgeDefinition[]> {
  const eligibleBadges = await checkBadgeEligibility(userId, criteriaType, currentValue)

  const awardedBadges: BadgeDefinition[] = []

  for (const badge of eligibleBadges) {
    await awardBadge(userId, badge.id)
    await incrementBadgesEarned(userId)
    awardedBadges.push(badge)
  }

  // Update leaderboard if badges were awarded
  if (awardedBadges.length > 0) {
    const badgesCount = await getUserBadgesCount(userId)
    const aura = await getUserAura(userId)
    const stats = await getGamificationStats(userId)
    await updateLeaderboardEntry(userId, {
      badges_count: badgesCount,
      aura_level: aura.current_level,
      score: stats.total_points,
    })
  }

  return awardedBadges
}
