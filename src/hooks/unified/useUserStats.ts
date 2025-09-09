/**
 * Hook unifié pour les statistiques utilisateur
 */

import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '@/services/business/SimpleAnalyticsService';
import { userService } from '@/services/business/SimpleUserService';
import { useAuth } from './useAuth';
import { useErrorHandler } from './useErrorHandler';
import type { UserStats, LearningAnalytics } from '@/services/business/SimpleAnalyticsService';
import type { UserProfile, UserAchievement } from '@/services/business/SimpleUserService';

export const useUserStats = () => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);

  // Charger les données utilisateur
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  const loadUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const [statsResponse, profileResponse, achievementsResponse, analyticsResponse] = await Promise.all([
        analyticsService.getUserStats(user.id),
        userService.getUserProfile(user.id),
        userService.getUserAchievements(user.id),
        analyticsService.getLearningAnalytics(user.id)
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data);
      }

      if (achievementsResponse.success && achievementsResponse.data) {
        setAchievements(achievementsResponse.data);
      }

      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data);
      }
    } catch (error) {
      handleError(error as Error, 'api_call');
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await userService.updateUserProfile(user.id, updates);
      
      if (response.success) {
        // Recharger le profil
        await loadUserData();
        return true;
      }

      return false;
    } catch (error) {
      handleError(error as Error, 'user_action');
      return false;
    }
  }, [user?.id, handleError, loadUserData]);

  const trackEvent = useCallback(async (eventType: string, data: Record<string, any>): Promise<boolean> => {
    try {
      const response = await analyticsService.trackEvent(eventType, data);
      return response.success;
    } catch (error) {
      handleError(error as Error, 'api_call');
      return false;
    }
  }, [handleError]);

  const recordSession = useCallback(async (
    contentId: string,
    sessionType: string,
    duration: number,
    score?: number,
    completed: boolean = false
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await userService.recordLearningSession(
        user.id,
        contentId,
        sessionType,
        duration,
        score,
        completed
      );

      if (response.success) {
        // Recharger les stats
        await loadUserData();
        return true;
      }

      return false;
    } catch (error) {
      handleError(error as Error, 'api_call');
      return false;
    }
  }, [user?.id, handleError, loadUserData]);

  const getRanking = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const response = await userService.getUserRanking(user.id);
      return response.success ? response.data : null;
    } catch (error) {
      handleError(error as Error, 'api_call');
      return null;
    }
  }, [user?.id, handleError]);

  const getRecommendations = useCallback(async () => {
    if (!user?.id) return [];

    try {
      const response = await analyticsService.getRecommendations(user.id);
      return response.success ? response.data || [] : [];
    } catch (error) {
      handleError(error as Error, 'api_call');
      return [];
    }
  }, [user?.id, handleError]);

  const refreshData = useCallback(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id, loadUserData]);

  return {
    loading,
    stats,
    profile,
    achievements,
    analytics,
    updateProfile,
    trackEvent,
    recordSession,
    getRanking,
    getRecommendations,
    refreshData
  };
};