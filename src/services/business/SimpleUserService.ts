/**
 * Service utilisateur simplifié - compatible avec Supabase existant
 */

import { supabase } from '@/integrations/supabase/client';
import { cacheService } from '@/services/core/CacheService';
import { errorService } from '@/services/core/ErrorService';
import type { ApiResponse } from '@/types/hooks';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  contentId: string;
  sessionType: string;
  duration: number;
  score?: number;
  completed: boolean;
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
  unlockedAt?: Date;
}

class SimpleUserService {
  private static instance: SimpleUserService;
  private readonly CACHE_PREFIX = 'user_service';
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  static getInstance(): SimpleUserService {
    if (!SimpleUserService.instance) {
      SimpleUserService.instance = new SimpleUserService();
    }
    return SimpleUserService.instance;
  }

  /**
   * Récupère le profil utilisateur
   */
  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile | null>> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}_profile_${userId}`;
      const cached = cacheService.get<UserProfile>(cacheKey);
      
      if (cached) {
        return { success: true, data: cached };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { success: true, data: null };

      const profile: UserProfile = {
        id: data.id,
        email: data.email || '',
        name: data.name || '',
        avatar: data.avatar_url || '',
        role: data.role || 'user',
        preferences: (data.preferences as Record<string, any>) || {},
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      cacheService.set(cacheKey, profile, { ttl: this.DEFAULT_TTL });

      return { success: true, data: profile };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la récupération du profil',
        data: null
      };
    }
  }

  /**
   * Met à jour le profil utilisateur
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          avatar_url: updates.avatar,
          preferences: updates.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Invalider le cache
      const cacheKey = `${this.CACHE_PREFIX}_profile_${userId}`;
      cacheService.delete(cacheKey);

      return { success: true, data: true };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la mise à jour du profil',
        data: false
      };
    }
  }

  /**
   * Enregistre une session d'apprentissage
   */
  async recordLearningSession(
    userId: string,
    contentId: string,
    sessionType: string,
    duration: number,
    score?: number,
    completed: boolean = false
  ): Promise<ApiResponse<boolean>> {
    try {
      // Utiliser user_progress à la place de learning_sessions
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          content_id: contentId,
          content_type: sessionType,
          progress_percentage: completed ? 100 : Math.floor((score || 0) / 100 * 100),
          best_score: score || 0,
          last_accessed: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true, data: true };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de l\'enregistrement de la session',
        data: false
      };
    }
  }

  /**
   * Récupère les achievements de l'utilisateur
   */
  async getUserAchievements(userId: string): Promise<ApiResponse<UserAchievement[]>> {
    try {
      const { data: badges, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const achievements = badges?.map(badge => ({
        id: badge.id,
        title: badge.name,
        description: badge.description,
        progress: 100, // Badge déjà obtenu
        completed: true,
        unlockedAt: new Date(badge.awarded_at)
      })) || [];

      return { success: true, data: achievements };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la récupération des achievements',
        data: []
      };
    }
  }

  /**
   * Récupère le classement de l'utilisateur
   */
  async getUserRanking(userId: string): Promise<ApiResponse<{
    rank: number;
    totalUsers: number;
    points: number;
    percentile: number;
  }>> {
    try {
      // Retourner des données basiques basées sur les badges
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId);

      const points = badges?.length || 0;

      return {
        success: true,
        data: {
          rank: Math.max(1, 100 - points * 10),
          totalUsers: 100,
          points: points * 100,
          percentile: Math.min(100, points * 10)
        }
      };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la récupération du classement',
        data: {
          rank: 1,
          totalUsers: 1,
          points: 0,
          percentile: 100
        }
      };
    }
  }

  /**
   * Génère des recommandations personnalisées
   */
  async getPersonalizedRecommendations(userId: string): Promise<ApiResponse<{
    modules: string[];
    exercises: string[];
    studyPlan: string[];
  }>> {
    try {
      // Utiliser les recommandations AI existantes
      const { data: recommendations } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(10);

      return {
        success: true,
        data: {
          modules: recommendations?.filter(r => r.content_type === 'module').map(r => r.content_id) || [],
          exercises: recommendations?.filter(r => r.content_type === 'exercise').map(r => r.content_id) || [],
          studyPlan: recommendations?.filter(r => r.content_type === 'study_plan').map(r => r.content_id) || []
        }
      };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la génération des recommandations',
        data: {
          modules: [],
          exercises: [],
          studyPlan: []
        }
      };
    }
  }

  /**
   * Supprime le compte utilisateur
   */
  async deleteUserAccount(userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Supprimer les données utilisateur en cascade
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;

      return { success: true, data: true };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la suppression du compte',
        data: false
      };
    }
  }

  /**
   * Met à jour les statistiques utilisateur
   */
  async updateUserStats(userId: string, stats: Record<string, any>): Promise<ApiResponse<boolean>> {
    try {
      // Mettre à jour le profil avec les nouvelles stats
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          last_activity: new Date().toISOString(),
          preferences: { ...stats }
        });
      
      if (error) throw error;

      return { success: true, data: true };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la mise à jour des statistiques',
        data: false
      };
    }
  }
}

export const userService = SimpleUserService.getInstance();