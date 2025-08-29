import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  total_events: number;
  event_types: Record<string, number>;
  recent_activity: any[];
  analytics_data: any[];
}

interface DashboardStats {
  profile: any;
  weekly_activity: number;
  unread_notifications: number;
  recent_events: any[];
  notifications: any[];
}

export const usePlatformAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const trackEvent = useCallback(async (eventType: string, eventData?: any, pageUrl?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('platform-analytics', {
        body: {
          action: 'track_event',
          event_type: eventType,
          event_data: eventData,
          page_url: pageUrl || window.location.pathname
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to track event';
      setError(errorMessage);
      console.error('Track event error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAnalytics = useCallback(async (): Promise<AnalyticsData | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('platform-analytics', {
        body: { action: 'get_analytics' }
      });

      if (error) throw error;

      return data as AnalyticsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get analytics';
      setError(errorMessage);
      console.error('Get analytics error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDashboardStats = useCallback(async (): Promise<DashboardStats | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('platform-analytics', {
        body: { action: 'get_dashboard_stats' }
      });

      if (error) throw error;

      return data as DashboardStats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get dashboard stats';
      setError(errorMessage);
      console.error('Get dashboard stats error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: { display_name?: string; bio?: string; preferences?: any }) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('platform-analytics', {
        body: {
          action: 'update_profile',
          ...profileData
        }
      });

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });

      return { success: true, profile: data.profile };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('platform-analytics', {
        body: {
          action: 'mark_notification_read',
          notification_id: notificationId
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(errorMessage);
      console.error('Mark notification read error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    trackEvent,
    getAnalytics,
    getDashboardStats,
    updateProfile,
    markNotificationRead
  };
};