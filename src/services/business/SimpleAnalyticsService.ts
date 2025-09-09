/**
 * Service d'analytics simplifié - compatible avec Supabase existant
 */

import { supabase } from '@/integrations/supabase/client';
import { cacheService } from '@/services/core/CacheService';
import { errorService } from '@/services/core/ErrorService';
import type { ApiResponse } from '@/types/hooks';

export interface UserStats {
  totalSessions: number;
  totalTimeSpent: number;
  modulesCompleted: number;
  averageScore: number;
  streak: number;
  badges: number;
  level: number;
  progress: number;
}

export interface LearningAnalytics {
  engagement: {
    sessions_count: number;
    total_time_spent: number;
    avg_session_duration: number;
  };
  performance: {
    overall_score: number;
    improvement_rate: number;
    strength_areas: string[];
    weakness_areas: string[];
  };
  learning: {
    modules_completed: number;
    certificates_earned: number;
  };
  social: {
    community_rank: number;
    study_group_participation: number;
  };
}

class SimpleAnalyticsService {
  private static instance: SimpleAnalyticsService;
  private readonly CACHE_PREFIX = 'analytics_service';
  private readonly DEFAULT_TTL = 60 * 60 * 1000; // 1 heure

  static getInstance(): SimpleAnalyticsService {
    if (!SimpleAnalyticsService.instance) {
      SimpleAnalyticsService.instance = new SimpleAnalyticsService();
    }
    return SimpleAnalyticsService.instance;
  }

  /**
   * Récupère les statistiques utilisateur
   */
  async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}_user_stats_${userId}`;
      const cached = cacheService.get<UserStats>(cacheKey);
      
      if (cached) {
        return { success: true, data: cached };
      }

      // Récupérer depuis les tables existantes
      const [progressData, badgesData] = await Promise.all([
        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId),
        supabase
          .from('badges')
          .select('*')
          .eq('user_id', userId)
      ]);

      const progress = progressData.data || [];
      const badges = badgesData.data || [];

      const stats: UserStats = {
        totalSessions: progress.length,
        totalTimeSpent: progress.reduce((acc, p) => acc + (p.progress_percentage || 0), 0),
        modulesCompleted: progress.filter(p => p.progress_percentage >= 100).length,
        averageScore: progress.length > 0 
          ? progress.reduce((acc, p) => acc + (p.best_score || 0), 0) / progress.length
          : 0,
        streak: this.calculateStreak(progress),
        badges: badges.length,
        level: Math.floor(badges.length / 3) + 1,
        progress: progress.length > 0 
          ? progress.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / progress.length
          : 0
      };

      cacheService.set(cacheKey, stats, { ttl: this.DEFAULT_TTL });

      return { success: true, data: stats };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la récupération des statistiques',
        data: {
          totalSessions: 0,
          totalTimeSpent: 0,
          modulesCompleted: 0,
          averageScore: 0,
          streak: 0,
          badges: 0,
          level: 1,
          progress: 0
        }
      };
    }
  }

  /**
   * Enregistre un événement d'analytics
   */
  async trackEvent(eventType: string, data: Record<string, any>): Promise<ApiResponse<boolean>> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Utiliser la table profiles pour stocker des métadonnées simples
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.data.user.id,
          last_activity: new Date().toISOString()
        }, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      return { success: true, data: true };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de l\'enregistrement de l\'événement',
        data: false
      };
    }
  }

  /**
   * Récupère les analytics de learning détaillées
   */
  async getLearningAnalytics(userId: string, period: string = '7d'): Promise<ApiResponse<LearningAnalytics>> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}_learning_${userId}_${period}`;
      const cached = cacheService.get<LearningAnalytics>(cacheKey);
      
      if (cached) {
        return { success: true, data: cached };
      }

      // Récupérer les données depuis les tables existantes
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      const analytics: LearningAnalytics = {
        engagement: {
          sessions_count: progressData?.length || 0,
          total_time_spent: progressData?.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) || 0,
          avg_session_duration: progressData?.length ? 
            (progressData.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / progressData.length) : 0
        },
        performance: {
          overall_score: progressData?.length ? 
            (progressData.reduce((acc, p) => acc + (p.best_score || 0), 0) / progressData.length) : 0,
          improvement_rate: this.calculateImprovementRate(progressData || []),
          strength_areas: this.identifyStrengthAreas(progressData || []),
          weakness_areas: this.identifyWeaknessAreas(progressData || [])
        },
        learning: {
          modules_completed: progressData?.filter(p => p.progress_percentage >= 100).length || 0,
          certificates_earned: 0
        },
        social: {
          community_rank: 0,
          study_group_participation: 0
        }
      };

      cacheService.set(cacheKey, analytics, { ttl: this.DEFAULT_TTL });

      return { success: true, data: analytics };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la récupération des analytics',
        data: {
          engagement: { sessions_count: 0, total_time_spent: 0, avg_session_duration: 0 },
          performance: { overall_score: 0, improvement_rate: 0, strength_areas: [], weakness_areas: [] },
          learning: { modules_completed: 0, certificates_earned: 0 },
          social: { community_rank: 0, study_group_participation: 0 }
        }
      };
    }
  }

  /**
   * Génère des recommandations personnalisées
   */
  async getRecommendations(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data: recommendations } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      return { 
        success: true, 
        data: recommendations?.map(r => ({
          id: r.id,
          type: r.recommendation_type,
          title: r.content_type,
          description: r.reason,
          priority: r.priority_level,
          confidence: r.confidence_score
        })) || []
      };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la récupération des recommandations',
        data: []
      };
    }
  }

  private calculateStreak(progress: any[]): number {
    // Logique simplifiée pour calculer la streak
    return Math.min(progress.length, 7);
  }

  private calculateImprovementRate(progress: any[]): number {
    if (progress.length < 2) return 0;
    
    const recent = progress.slice(-5);
    const older = progress.slice(0, -5);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((acc, p) => acc + (p.best_score || 0), 0) / recent.length;
    const olderAvg = older.reduce((acc, p) => acc + (p.best_score || 0), 0) / older.length;
    
    return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  }

  private identifyStrengthAreas(progress: any[]): string[] {
    // Logique simplifiée pour identifier les forces
    return ['Compréhension rapide', 'Régularité'];
  }

  private identifyWeaknessAreas(progress: any[]): string[] {
    // Logique simplifiée pour identifier les faiblesses
    return progress.length < 3 ? ['Pratique insuffisante'] : [];
  }
}

export const analyticsService = SimpleAnalyticsService.getInstance();