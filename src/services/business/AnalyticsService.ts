/**
 * Service analytics - Métriques, insights, rapports
 * Performance utilisateur, contenu, engagement
 */

import { supabase } from '@/integrations/supabase/client';
import { cacheService } from '@/services/core/CacheService';
import { errorService } from '@/services/core/ErrorService';

export interface UserAnalytics {
  userId: string;
  period: DateRange;
  engagement: EngagementMetrics;
  performance: PerformanceMetrics;
  learning: LearningMetrics;
  social: SocialMetrics;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface EngagementMetrics {
  sessionsCount: number;
  totalTimeSpent: number; // minutes
  avgSessionDuration: number;
  streakData: StreakData;
  deviceUsage: DeviceUsage;
  timeOfDayPattern: HourlyUsage[];
  retentionRate: number;
}

export interface StreakData {
  current: number;
  longest: number;
  streakHistory: DailyStreak[];
}

export interface DailyStreak {
  date: string;
  active: boolean;
  timeSpent: number;
}

export interface DeviceUsage {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface HourlyUsage {
  hour: number;
  sessions: number;
  avgDuration: number;
}

export interface PerformanceMetrics {
  overallScore: number;
  improvementRate: number;
  strengthAreas: SkillArea[];
  weaknessAreas: SkillArea[];
  scoreHistory: ScoreDataPoint[];
  accuracyByType: AccuracyByType;
  timeToComplete: TimeMetrics;
}

export interface SkillArea {
  name: string;
  score: number;
  trend: 'improving' | 'declining' | 'stable';
  confidence: number;
}

export interface ScoreDataPoint {
  date: string;
  module: string;
  score: number;
  maxScore: number;
  category: string;
}

export interface AccuracyByType {
  multipleChoice: number;
  trueFalse: number;
  fillInBlank: number;
  essay: number;
  simulation: number;
}

export interface TimeMetrics {
  avgTimePerModule: number;
  avgTimePerQuestion: number;
  efficiencyIndex: number; // score/time ratio
}

export interface LearningMetrics {
  modulesCompleted: number;
  certificatesEarned: number;
  achievementsUnlocked: number;
  learningPath: LearningPathProgress[];
  knowledgeMap: KnowledgeNode[];
  adaptiveLearning: AdaptiveMetrics;
}

export interface LearningPathProgress {
  pathId: string;
  pathName: string;
  progress: number;
  estimatedCompletion: string;
  currentModule: string;
}

export interface KnowledgeNode {
  concept: string;
  mastery: number; // 0-100
  connections: string[];
  lastReviewed: string;
  needsReview: boolean;
}

export interface AdaptiveMetrics {
  difficultyLevel: number;
  personalizedContent: number; // percentage
  recommendationAccuracy: number;
  adaptationHistory: AdaptationEvent[];
}

export interface AdaptationEvent {
  date: string;
  type: 'difficulty' | 'pace' | 'content' | 'schedule';
  reason: string;
  impact: number;
}

export interface SocialMetrics {
  communityRank: number;
  studyGroupParticipation: number;
  peerInteractions: number;
  mentorSessions: number;
  forumContributions: ForumContribution;
  collaborativeProjects: number;
}

export interface ForumContribution {
  posts: number;
  helpfulAnswers: number;
  reputation: number;
  badgesEarned: string[];
}

export interface PlatformAnalytics {
  period: DateRange;
  users: UserStatsOverview;
  content: ContentMetrics;
  engagement: PlatformEngagement;
  performance: PlatformPerformance;
  technical: TechnicalMetrics;
}

export interface UserStatsOverview {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  churnRate: number;
  userGrowthRate: number;
  demographicsBreakdown: Demographics;
}

export interface Demographics {
  byAge: AgeGroup[];
  bySpecialty: SpecialtyGroup[];
  byUniversity: UniversityGroup[];
  byYear: YearGroup[];
}

export interface AgeGroup {
  range: string;
  count: number;
  percentage: number;
}

export interface SpecialtyGroup {
  specialty: string;
  count: number;
  avgPerformance: number;
}

export interface UniversityGroup {
  university: string;
  count: number;
  avgEngagement: number;
}

export interface YearGroup {
  year: number;
  count: number;
  completionRate: number;
}

export interface ContentMetrics {
  totalModules: number;
  avgModuleRating: number;
  mostPopularModules: PopularModule[];
  contentEffectiveness: EffectivenessData[];
  userGeneratedContent: number;
}

export interface PopularModule {
  id: string;
  title: string;
  enrollments: number;
  completionRate: number;
  satisfaction: number;
}

export interface EffectivenessData {
  moduleId: string;
  title: string;
  learningOutcomeAchievement: number;
  timeEfficiency: number;
  userSatisfaction: number;
  difficultyRating: number;
}

export interface PlatformEngagement {
  dailyActiveUsers: number;
  sessionDuration: number;
  featureUsage: FeatureUsage;
  userJourney: JourneyStep[];
  dropoffPoints: DropoffPoint[];
}

export interface FeatureUsage {
  [featureName: string]: {
    users: number;
    sessions: number;
    timeSpent: number;
  };
}

export interface JourneyStep {
  step: string;
  users: number;
  conversionRate: number;
  avgTime: number;
}

export interface DropoffPoint {
  location: string;
  dropoffRate: number;
  commonReasons: string[];
}

export interface PlatformPerformance {
  systemUptime: number;
  avgResponseTime: number;
  errorRate: number;
  userSatisfaction: number;
  supportTickets: SupportMetrics;
}

export interface SupportMetrics {
  totalTickets: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  commonIssues: IssueCategory[];
}

export interface IssueCategory {
  category: string;
  count: number;
  avgResolutionTime: number;
}

export interface TechnicalMetrics {
  apiResponseTimes: ResponseTimeMetric[];
  databasePerformance: DatabaseMetric[];
  cacheEfficiency: number;
  bandwidthUsage: BandwidthMetric[];
  errorLogs: ErrorSummary[];
}

export interface ResponseTimeMetric {
  endpoint: string;
  avgResponseTime: number;
  p95ResponseTime: number;
  requestCount: number;
}

export interface DatabaseMetric {
  query: string;
  avgExecutionTime: number;
  executionCount: number;
  slowQueries: number;
}

export interface BandwidthMetric {
  date: string;
  upload: number; // MB
  download: number; // MB
}

export interface ErrorSummary {
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Analytics utilisateur
  async getUserAnalytics(userId: string, period: DateRange): Promise<UserAnalytics> {
    try {
      const cacheKey = `user_analytics_${userId}_${period.start}_${period.end}`;
      const cached = cacheService.get<UserAnalytics>(cacheKey, 'sessionStorage');
      
      if (cached) {
        return cached;
      }

      // Mock analytics data for now - replace with actual implementation
      const data = {
        engagement: { sessions_count: 0, total_time_spent: 0, avg_session_duration: 0 },
        performance: { overall_score: 0, improvement_rate: 0, strength_areas: [], weakness_areas: [] },
        learning: { modules_completed: 0, certificates_earned: 0 },
        social: { community_rank: 0, study_group_participation: 0 }
      };

      if (error) throw error;

      const analytics = this.transformUserAnalytics(data, userId, period);

      // Cache pour 1 heure
      cacheService.set(cacheKey, analytics, {
        storage: 'sessionStorage',
        ttl: 60 * 60 * 1000
      });

      return analytics;

    } catch (error) {
      errorService.handleError(error, 'api_call');
      throw error;
    }
  }

  // Analytics plateforme (admin)
  async getPlatformAnalytics(period: DateRange): Promise<PlatformAnalytics> {
    try {
      const cacheKey = `platform_analytics_${period.start}_${period.end}`;
      const cached = cacheService.get<PlatformAnalytics>(cacheKey, 'sessionStorage');
      
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .rpc('get_platform_analytics', {
          start_date: period.start,
          end_date: period.end
        });

      if (error) throw error;

      const analytics = this.transformPlatformAnalytics(data, period);

      // Cache pour 30 minutes
      cacheService.set(cacheKey, analytics, {
        storage: 'sessionStorage',
        ttl: 30 * 60 * 1000
      });

      return analytics;

    } catch (error) {
      errorService.handleError(error, 'api_call');
      throw error;
    }
  }

  // Enregistrer un événement
  async trackEvent(userId: string, event: {
    type: string;
    category: string;
    action: string;
    label?: string;
    value?: number;
    metadata?: any;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: userId,
          event_type: event.type,
          category: event.category,
          action: event.action,
          label: event.label,
          value: event.value,
          metadata: event.metadata,
          timestamp: new Date().toISOString(),
          session_id: this.getSessionId(),
          user_agent: navigator.userAgent,
          url: window.location.href,
        });

      if (error) throw error;

    } catch (error) {
      // Analytics tracking failures should not disrupt user experience
      console.warn('Failed to track event:', error);
    }
  }

  // Générer un rapport personnalisé
  async generateReport(type: 'user' | 'content' | 'engagement' | 'performance', filters: any): Promise<{
    report: any;
    visualizations: any[];
    recommendations: string[];
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-analytics-report', {
        body: {
          report_type: type,
          filters,
          user_id: filters.userId
        }
      });

      if (error) throw error;

      return data;

    } catch (error) {
      errorService.handleError(error, 'api_call');
      throw error;
    }
  }

  // Prédictions et insights IA
  async getPredictiveInsights(userId: string): Promise<{
    riskFactors: RiskFactor[];
    recommendations: Recommendation[];
    predictions: Prediction[];
  }> {
    try {
      const cacheKey = `insights_${userId}`;
      const cached = cacheService.get(cacheKey, 'sessionStorage');
      
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase.functions.invoke('predictive-insights', {
        body: { user_id: userId }
      });

      if (error) throw error;

      // Cache pour 2 heures
      cacheService.set(cacheKey, data, {
        storage: 'sessionStorage',
        ttl: 2 * 60 * 60 * 1000
      });

      return data;

    } catch (error) {
      errorService.handleError(error, 'api_call');
      return {
        riskFactors: [],
        recommendations: [],
        predictions: []
      };
    }
  }

  // Export des données (RGPD)
  async exportAnalyticsData(userId: string): Promise<Blob> {
    try {
      // Mock implementation - replace with actual table
      const data: any[] = [];

      if (error) throw error;

      const exportData = {
        userId,
        events: data,
        exportedAt: new Date().toISOString(),
        dataRetentionPolicy: '2 years',
        version: '1.0'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      return new Blob([jsonString], { type: 'application/json' });

    } catch (error) {
      errorService.handleError(error, 'user_action');
      throw error;
    }
  }

  private transformUserAnalytics(data: any, userId: string, period: DateRange): UserAnalytics {
    return {
      userId,
      period,
      engagement: {
        sessionsCount: data.engagement?.sessions_count || 0,
        totalTimeSpent: data.engagement?.total_time_spent || 0,
        avgSessionDuration: data.engagement?.avg_session_duration || 0,
        streakData: data.engagement?.streak_data || { current: 0, longest: 0, streakHistory: [] },
        deviceUsage: data.engagement?.device_usage || { desktop: 0, mobile: 0, tablet: 0 },
        timeOfDayPattern: data.engagement?.time_of_day_pattern || [],
        retentionRate: data.engagement?.retention_rate || 0,
      },
      performance: {
        overallScore: data.performance?.overall_score || 0,
        improvementRate: data.performance?.improvement_rate || 0,
        strengthAreas: data.performance?.strength_areas || [],
        weaknessAreas: data.performance?.weakness_areas || [],
        scoreHistory: data.performance?.score_history || [],
        accuracyByType: data.performance?.accuracy_by_type || {},
        timeToComplete: data.performance?.time_to_complete || {},
      },
      learning: {
        modulesCompleted: data.learning?.modules_completed || 0,
        certificatesEarned: data.learning?.certificates_earned || 0,
        achievementsUnlocked: data.learning?.achievements_unlocked || 0,
        learningPath: data.learning?.learning_path || [],
        knowledgeMap: data.learning?.knowledge_map || [],
        adaptiveLearning: data.learning?.adaptive_learning || {},
      },
      social: {
        communityRank: data.social?.community_rank || 0,
        studyGroupParticipation: data.social?.study_group_participation || 0,
        peerInteractions: data.social?.peer_interactions || 0,
        mentorSessions: data.social?.mentor_sessions || 0,
        forumContributions: data.social?.forum_contributions || {},
        collaborativeProjects: data.social?.collaborative_projects || 0,
      },
    };
  }

  private transformPlatformAnalytics(data: any, period: DateRange): PlatformAnalytics {
    return {
      period,
      users: data.users || {},
      content: data.content || {},
      engagement: data.engagement || {},
      performance: data.performance || {},
      technical: data.technical || {},
    };
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
  mitigation: string;
}

export interface Recommendation {
  type: 'learning' | 'engagement' | 'performance';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: string;
}

export interface Prediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

export const analyticsService = AnalyticsService.getInstance();
export default analyticsService;