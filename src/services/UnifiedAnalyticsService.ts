/**
 * Service d'analytics unifié - Consolidation de tous les services d'analytics
 * Combine les meilleures fonctionnalités des services existants
 */

import { supabase } from '@/integrations/supabase/client';
import { cacheService } from '@/services/core/CacheService';
import { errorService } from '@/services/core/ErrorService';
import type { ApiResponse } from '@/types/hooks';

// Types unifiés
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

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

export interface AnalyticsMetrics {
  daily_active_users: number;
  total_generations: number;
  success_rate: number;
  average_response_time: number;
  top_content: Array<{
    id: string;
    title: string;
    usage_count: number;
  }>;
}

class UnifiedAnalyticsService {
  private static instance: UnifiedAnalyticsService;
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;
  private readonly CACHE_PREFIX = 'unified_analytics';
  private readonly DEFAULT_TTL = 60 * 60 * 1000; // 1 heure

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.startBatchFlush();
  }

  static getInstance(): UnifiedAnalyticsService {
    if (!UnifiedAnalyticsService.instance) {
      UnifiedAnalyticsService.instance = new UnifiedAnalyticsService();
    }
    return UnifiedAnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  // ========== MÉTHODES DE TRACKING (du core/AnalyticsService) ==========

  /**
   * Track un événement avec batching automatique
   */
  track(eventName: string, properties: Record<string, unknown> = {}, userId?: string): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date(),
      userId,
      sessionId: this.sessionId
    };

    this.events.push(event);

    // Flush si le batch est plein
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Track une page vue
   */
  trackPageView(path: string, userId?: string): void {
    this.track('page_view', {
      path,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      timestamp: Date.now()
    }, userId);
  }

  /**
   * Track une action utilisateur
   */
  trackUserAction(action: string, target: string, properties: Record<string, unknown> = {}, userId?: string): void {
    this.track('user_action', {
      action,
      target,
      ...properties
    }, userId);
  }

  /**
   * Track une erreur
   */
  trackError(error: Error, context: Record<string, unknown> = {}, userId?: string): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context
    }, userId);
  }

  /**
   * Track des métriques de performance
   */
  trackPerformance(metric: string, value: number, properties: Record<string, unknown> = {}): void {
    this.track('performance', {
      metric,
      value,
      ...properties
    });
  }

  // ========== MÉTHODES BUSINESS (du SimpleAnalyticsService) ==========

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
   * Récupère les analytics de learning détaillées
   */
  async getLearningAnalytics(userId: string, period: string = '7d'): Promise<ApiResponse<LearningAnalytics>> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}_learning_${userId}_${period}`;
      const cached = cacheService.get<LearningAnalytics>(cacheKey);
      
      if (cached) {
        return { success: true, data: cached };
      }

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
   * Enregistre un événement d'analytics (compatibilité avec SimpleAnalyticsService)
   */
  async trackEvent(eventType: string, data: Record<string, any>): Promise<ApiResponse<boolean>> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        // Track même sans utilisateur connecté
        this.track(eventType, data);
        return { success: true, data: true };
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

      // Track l'événement aussi
      this.track(eventType, data, user.data.user.id);

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
   * Génère des recommandations personnalisées (compatibilité avec SimpleAnalyticsService)
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
  async getMetrics(): Promise<AnalyticsMetrics> {
    try {
      const mockMetrics: AnalyticsMetrics = {
        daily_active_users: 150,
        total_generations: 1200,
        success_rate: 0.95,
        average_response_time: 2500,
        top_content: [
          { id: '1', title: 'IC-001', usage_count: 45 },
          { id: '2', title: 'IC-002', usage_count: 38 },
          { id: '3', title: 'IC-003', usage_count: 32 }
        ]
      };

      return mockMetrics;
    } catch (error) {
      throw error;
    }
  }

  // ========== MÉTHODES SIMPLES (de l'AnalyticsService original) ==========

  /**
   * Track le progrès utilisateur (méthode statique compatible)
   */
  static trackUserProgress(userId: string, itemCode: string, score: number): void {
    const instance = UnifiedAnalyticsService.getInstance();
    instance.trackUserAction('progress_update', 'learning_item', {
      itemCode,
      score,
      completion: score >= 80 ? 'completed' : 'in_progress'
    }, userId);
  }

  /**
   * Track l'usage des fonctionnalités (méthode statique compatible)
   */
  static trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>): void {
    const instance = UnifiedAnalyticsService.getInstance();
    instance.track('feature_usage', {
      feature,
      action,
      ...metadata
    });
  }

  /**
   * Génère un rapport de progrès (méthode statique compatible)
   */
  static async generateProgressReport(userId: string): Promise<any> {
    const instance = UnifiedAnalyticsService.getInstance();
    const stats = await instance.getUserStats(userId);
    
    if (stats.success) {
      return {
        completionRate: stats.data.progress / 100,
        totalTimeSpent: stats.data.totalTimeSpent,
        masteredItems: stats.data.modulesCompleted,
        totalItems: stats.data.totalSessions,
        knowledgeGaps: [],
        userLevel: stats.data.level > 3 ? 'advanced' : stats.data.level > 1 ? 'intermediate' : 'beginner'
      };
    }
    
    return {
      completionRate: 0,
      totalTimeSpent: 0,
      masteredItems: 0,
      totalItems: 0,
      knowledgeGaps: [],
      userLevel: 'beginner'
    };
  }

  // ========== MÉTHODES PRIVÉES ET UTILITAIRES ==========

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // Enregistrer dans Supabase si possible
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.data.user.id,
            last_activity: new Date().toISOString()
          }, { 
            onConflict: 'id',
            ignoreDuplicates: false
          });
      }
    } catch (error) {
      // Remettre les événements dans la queue en cas d'erreur
      this.events.unshift(...eventsToSend);
    }
  }

  private calculateStreak(progress: any[]): number {
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
    return ['Compréhension rapide', 'Régularité'];
  }

  private identifyWeaknessAreas(progress: any[]): string[] {
    return progress.length < 3 ? ['Pratique insuffisante'] : [];
  }

  /**
   * Nettoie les ressources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Exports
export const analyticsService = UnifiedAnalyticsService.getInstance();
export default UnifiedAnalyticsService;