/**
 * User Profile Service
 * Manages user profiles, statistics, achievements, and following relationships
 */

import { supabase } from '../lib/supabase'

export type AchievementType =
  | 'first_post'
  | 'first_comment'
  | 'first_like'
  | 'ten_posts'
  | 'hundred_posts'
  | 'ten_followers'
  | 'hundred_followers'
  | 'thousand_followers'
  | 'top_contributor'
  | 'helpful_member'
  | 'verified_user'
  | 'streak_10_days'
  | 'streak_100_days'
  | 'engagement_master'
  | 'trending_post'

export interface UserProfile {
  id: string
  user_id: string
  display_name?: string
  bio?: string
  avatar_url?: string
  banner_url?: string
  location?: string
  website?: string
  occupation?: string
  education?: string
  social_links?: Record<string, string>
  verified: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface UserStatistics {
  id: string
  user_id: string
  posts_count: number
  comments_count: number
  likes_received: number
  followers_count: number
  following_count: number
  total_views: number
  engagement_score: number
  last_active_at?: string
  created_at: string
  updated_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_type: AchievementType
  title: string
  description?: string
  icon_url?: string
  earned_at: string
  created_at: string
}

export interface UserFollowing {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export const userProfileService = {
  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return (data || null) as UserProfile | null
    } catch (err) {
      console.error('Error fetching user profile:', err)
      return null
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data as UserProfile
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update profile')
    }
  },

  /**
   * Create user profile
   */
  async createProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          ...profile,
        })
        .select()
        .single()

      if (error) throw error
      return data as UserProfile
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create profile')
    }
  },

  /**
   * Get user statistics
   */
  async getStatistics(userId: string): Promise<UserStatistics | null> {
    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return (data || null) as UserStatistics | null
    } catch (err) {
      console.error('Error fetching user statistics:', err)
      return null
    }
  },

  /**
   * Update user statistics
   */
  async updateStatistics(userId: string, updates: Partial<UserStatistics>): Promise<UserStatistics> {
    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data as UserStatistics
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update statistics')
    }
  },

  /**
   * Get user achievements
   */
  async getAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) throw error
      return (data || []) as UserAchievement[]
    } catch (err) {
      console.error('Error fetching achievements:', err)
      return []
    }
  },

  /**
   * Award achievement to user
   */
  async awardAchievement(
    userId: string,
    achievementType: AchievementType,
    title: string,
    description?: string
  ): Promise<UserAchievement> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_type: achievementType,
          title,
          description,
        })
        .select()
        .single()

      if (error) throw error
      return data as UserAchievement
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to award achievement')
    }
  },

  /**
   * Follow a user
   */
  async followUser(targetUserId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('follow_user', {
        following_id_param: targetUserId,
      })

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to follow user')
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(targetUserId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('unfollow_user', {
        following_id_param: targetUserId,
      })

      if (error) throw error
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to unfollow user')
    }
  },

  /**
   * Check if user is following another user
   */
  async isFollowing(targetUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_user_following', {
        target_user_id: targetUserId,
      })

      if (error) throw error
      return data as boolean
    } catch (err) {
      console.error('Error checking follow status:', err)
      return false
    }
  },

  /**
   * Get user followers
   */
  async getFollowers(userId: string, limit = 50): Promise<UserFollowing[]> {
    try {
      const { data, error } = await supabase
        .from('user_following')
        .select('*')
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as UserFollowing[]
    } catch (err) {
      console.error('Error fetching followers:', err)
      return []
    }
  },

  /**
   * Get users that a user is following
   */
  async getFollowing(userId: string, limit = 50): Promise<UserFollowing[]> {
    try {
      const { data, error } = await supabase
        .from('user_following')
        .select('*')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as UserFollowing[]
    } catch (err) {
      console.error('Error fetching following:', err)
      return []
    }
  },

  /**
   * Get user profile with statistics
   */
  async getProfileWithStats(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_user_profile_with_stats', {
        user_id_param: userId,
      })

      if (error) throw error
      return data?.[0] || null
    } catch (err) {
      console.error('Error fetching profile with stats:', err)
      return null
    }
  },

  /**
   * Search user profiles
   */
  async searchProfiles(query: string, limit = 20): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`display_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .eq('is_public', true)
        .limit(limit)

      if (error) throw error
      return (data || []) as UserProfile[]
    } catch (err) {
      console.error('Error searching profiles:', err)
      return []
    }
  },

  /**
   * Get trending users
   */
  async getTrendingUsers(limit = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .select('user_id, followers_count, engagement_score')
        .order('followers_count', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as any[]
    } catch (err) {
      console.error('Error fetching trending users:', err)
      return []
    }
  },
}
