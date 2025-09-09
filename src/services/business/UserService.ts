/**
 * Service métier utilisateur - Gestion complète des profils
 * Données, préférences, progression, analytics
 */

import { supabase } from '@/integrations/supabase/client';
import { cacheService } from '@/services/core/CacheService';
import { errorService } from '@/services/core/ErrorService';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  specialty?: string;
  yearOfStudy?: number;
  university?: string;
  preferences: UserPreferences;
  progress: LearningProgress;
  stats: UserStats;
  createdAt: string;
  lastActive: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
    community: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
  privacy: {
    showProfile: boolean;
    showProgress: boolean;
    analyticsConsent: boolean;
  };
}

export interface LearningProgress {
  totalPoints: number;
  currentLevel: number;
  completedModules: string[];
  currentStreak: number;
  bestStreak: number;
  timeSpent: number; // en minutes
  certificates: Certificate[];
  achievements: Achievement[];
}

export interface Certificate {
  id: string;
  title: string;
  category: string;
  issuedAt: string;
  credentialId: string;
  verified: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  progress: number;
  maxProgress: number;
}

export interface UserStats {
  sessionsCount: number;
  avgSessionDuration: number;
  favoriteModules: string[];
  weakAreas: string[];
  strongAreas: string[];
  studyHours: { [date: string]: number };
  performanceHistory: PerformanceEntry[];
}

export interface PerformanceEntry {
  date: string;
  moduleId: string;
  score: number;
  timeSpent: number;
  attempts: number;
}

class UserService {
  private static instance: UserService;

  private constructor() {}

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Récupérer le profil complet
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      const cacheKey = `user_profile_${userId}`;
      const cached = cacheService.get<UserProfile>(cacheKey, 'localStorage');
      
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_preferences(*),
          learning_progress(*),
          user_stats(*)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      const profile = this.transformProfileData(data);
      
      // Cache pour 15 minutes
      cacheService.set(cacheKey, profile, {
        storage: 'localStorage',
        ttl: 15 * 60 * 1000
      });

      return profile;

    } catch (error) {
      errorService.handleError(error, 'api_call');
      throw error;
    }
  }

  // Mettre à jour le profil
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          bio: updates.bio,
          specialty: updates.specialty,
          year_of_study: updates.yearOfStudy,
          university: updates.university,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Invalider le cache
      cacheService.delete(`user_profile_${userId}`, 'localStorage');

      return this.transformProfileData(data);

    } catch (error) {
      errorService.handleError(error, 'user_action');
      throw error;
    }
  }

  // Mettre à jour les préférences
  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Invalider le cache
      cacheService.delete(`user_profile_${userId}`, 'localStorage');

    } catch (error) {
      errorService.handleError(error, 'user_action');
      throw error;
    }
  }

  // Enregistrer une session d'étude
  async recordStudySession(userId: string, moduleId: string, duration: number, score?: number): Promise<void> {
    try {
      // Enregistrer la session
      const { error: sessionError } = await supabase
        .from('study_sessions')
        .insert({
          user_id: userId,
          module_id: moduleId,
          duration_minutes: duration,
          score: score || null,
          completed_at: new Date().toISOString(),
        });

      if (sessionError) throw sessionError;

      // Mettre à jour les statistiques
      await this.updateUserStats(userId, moduleId, duration, score);

    } catch (error) {
      errorService.handleError(error, 'user_action');
      throw error;
    }
  }

  // Débloquer un achievement
  async unlockAchievement(userId: string, achievementId: string): Promise<Achievement> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString(),
        })
        .select(`
          *,
          achievements(*)
        `)
        .single();

      if (error) throw error;

      const achievement: Achievement = {
        id: data.achievements.id,
        title: data.achievements.title,
        description: data.achievements.description,
        icon: data.achievements.icon,
        unlockedAt: data.unlocked_at,
        progress: data.achievements.max_progress,
        maxProgress: data.achievements.max_progress,
      };

      // Invalider le cache
      cacheService.delete(`user_profile_${userId}`, 'localStorage');

      return achievement;

    } catch (error) {
      errorService.handleError(error, 'user_action');
      throw error;
    }
  }

  // Obtenir le classement de l'utilisateur
  async getUserRanking(userId: string): Promise<{
    rank: number;
    totalUsers: number;
    points: number;
    percentile: number;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_ranking', { user_id: userId });

      if (error) throw error;

      return data;

    } catch (error) {
      errorService.handleError(error, 'api_call');
      throw error;
    }
  }

  // Obtenir les recommandations personnalisées
  async getPersonalizedRecommendations(userId: string): Promise<{
    modules: string[];
    exercises: string[];
    studyPlan: string[];
  }> {
    try {
      const cacheKey = `recommendations_${userId}`;
      const cached = cacheService.get(cacheKey, 'sessionStorage');
      
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .rpc('get_personalized_recommendations', { user_id: userId });

      if (error) throw error;

      // Cache pour 1 heure
      cacheService.set(cacheKey, data, {
        storage: 'sessionStorage',
        ttl: 60 * 60 * 1000
      });

      return data;

    } catch (error) {
      errorService.handleError(error, 'api_call');
      return { modules: [], exercises: [], studyPlan: [] };
    }
  }

  // Exporter les données utilisateur (RGPD)
  async exportUserData(userId: string): Promise<Blob> {
    try {
      const profile = await this.getProfile(userId);
      
      const { data: sessions, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const exportData = {
        profile,
        sessions,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      return new Blob([jsonString], { type: 'application/json' });

    } catch (error) {
      errorService.handleError(error, 'user_action');
      throw error;
    }
  }

  // Supprimer le compte (RGPD)
  async deleteAccount(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('delete_user_account', { user_id: userId });

      if (error) throw error;

      // Nettoyer le cache
      cacheService.clear('localStorage');
      cacheService.clear('sessionStorage');

    } catch (error) {
      errorService.handleError(error, 'user_action');
      throw error;
    }
  }

  private async updateUserStats(userId: string, moduleId: string, duration: number, score?: number): Promise<void> {
    const { error } = await supabase
      .rpc('update_user_stats', {
        user_id: userId,
        module_id: moduleId,
        session_duration: duration,
        session_score: score
      });

    if (error) {
      console.warn('Failed to update user stats:', error);
    }
  }

  private transformProfileData(data: any): UserProfile {
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      avatar: data.avatar_url,
      bio: data.bio,
      specialty: data.specialty,
      yearOfStudy: data.year_of_study,
      university: data.university,
      preferences: data.user_preferences || this.getDefaultPreferences(),
      progress: data.learning_progress || this.getDefaultProgress(),
      stats: data.user_stats || this.getDefaultStats(),
      createdAt: data.created_at,
      lastActive: data.last_active_at || new Date().toISOString(),
    };
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'auto',
      language: 'fr',
      notifications: {
        email: true,
        push: true,
        reminders: true,
        community: false,
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
      },
      privacy: {
        showProfile: true,
        showProgress: true,
        analyticsConsent: true,
      },
    };
  }

  private getDefaultProgress(): LearningProgress {
    return {
      totalPoints: 0,
      currentLevel: 1,
      completedModules: [],
      currentStreak: 0,
      bestStreak: 0,
      timeSpent: 0,
      certificates: [],
      achievements: [],
    };
  }

  private getDefaultStats(): UserStats {
    return {
      sessionsCount: 0,
      avgSessionDuration: 0,
      favoriteModules: [],
      weakAreas: [],
      strongAreas: [],
      studyHours: {},
      performanceHistory: [],
    };
  }
}

export const userService = UserService.getInstance();
export default userService;