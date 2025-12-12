import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

export const useAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const trackListening = async (songId: string, duration: number = 0) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .rpc('med_mng_track_listening', {
          p_song_id: songId,
          p_listen_duration: duration
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Erreur tracking écoute:', error);
    }
  };

  const logEvent = async (
    songId: string, 
    eventType: 'play' | 'pause' | 'skip' | 'complete',
    duration?: number,
    metadata: Record<string, any> = {}
  ) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .rpc('med_mng_log_listening_event', {
          p_song_id: songId,
          p_event_type: eventType,
          p_listen_duration: duration,
          p_metadata: metadata
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Erreur log event:', error);
    }
  };

  const toggleFavorite = async (songId: string) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('med_mng_toggle_favorite', {
          song_id: songId
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur toggle favorite:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getFavorites = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('med_mng_user_favorites')
        .select(`
          song_id,
          created_at,
          med_mng_songs(id, title, artist, duration, audio_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération favoris:', error);
      return [];
    }
  };

  const trackPerformance = async (metric: string, value: number, category: string = 'performance') => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .rpc('med_mng_log_listening_event', {
          p_song_id: '00000000-0000-0000-0000-000000000000', // UUID null pour les métriques de performance
          p_event_type: 'performance',
          p_listen_duration: Math.round(value),
          p_metadata: { metric, category }
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Erreur tracking performance:', error);
    }
  };

  // Get listening stats
  const getListeningStats = async (days: number = 30) => {
    if (!user) return null;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('med_mng_user_listening_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats = {
        totalListens: data?.length || 0,
        totalDuration: data?.reduce((sum, d) => sum + (d.listen_duration || 0), 0) || 0,
        uniqueSongs: new Set(data?.map(d => d.song_id)).size,
        byDay: {} as Record<string, number>
      };

      data?.forEach(d => {
        const day = d.created_at.split('T')[0];
        stats.byDay[day] = (stats.byDay[day] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting listening stats:', error);
      return null;
    }
  };

  // Track page view
  const trackPageView = async (page: string, metadata: Record<string, any> = {}) => {
    if (!user) return;

    try {
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: 'study',
        count: 1,
        metadata: { page, ...metadata }
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  // Track feature usage
  const trackFeatureUsage = async (feature: string, action: string = 'click') => {
    if (!user) return;

    try {
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: 'study',
        count: 1,
        metadata: { feature, action, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error tracking feature:', error);
    }
  };

  // Get user engagement score
  const getEngagementScore = async () => {
    if (!user) return 0;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data } = await supabase
        .from('user_activity_log')
        .select('activity_date')
        .eq('user_id', user.id)
        .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (!data) return 0;

      const uniqueDays = new Set(data.map(d => d.activity_date)).size;
      return Math.min(100, Math.round((uniqueDays / 30) * 100));
    } catch (error) {
      console.error('Error calculating engagement:', error);
      return 0;
    }
  };

  // Get top listened songs
  const getTopSongs = async (limit: number = 10) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('med_mng_user_listening_history')
        .select('song_id, med_mng_songs(title, artist)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const songCounts: Record<string, { count: number; title: string; artist: string }> = {};
      data?.forEach(d => {
        const song = d.med_mng_songs as any;
        if (!songCounts[d.song_id]) {
          songCounts[d.song_id] = {
            count: 0,
            title: song?.title || 'Unknown',
            artist: song?.artist || 'Unknown'
          };
        }
        songCounts[d.song_id].count++;
      });

      return Object.entries(songCounts)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top songs:', error);
      return [];
    }
  };

  // Track search query
  const trackSearch = async (query: string, resultsCount: number) => {
    if (!user) return;

    try {
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: 'study',
        count: 1,
        metadata: { type: 'search', query, resultsCount }
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  };

  // Get session duration estimate
  const getSessionDuration = (): number => {
    const sessionStart = sessionStorage.getItem('session_start');
    if (!sessionStart) {
      sessionStorage.setItem('session_start', Date.now().toString());
      return 0;
    }
    return Math.round((Date.now() - parseInt(sessionStart)) / 1000);
  };

  // Track error
  const trackError = async (error: Error, context: string) => {
    if (!user) return;

    try {
      await supabase.from('operation_logs').insert({
        type: 'error',
        message: `${context}: ${error.message}`,
        metadata: { stack: error.stack, context }
      });
    } catch (e) {
      console.error('Error tracking error:', e);
    }
  };

  // Check if user is active
  const isUserActive = async (): Promise<boolean> => {
    const engagement = await getEngagementScore();
    return engagement >= 30; // At least 30% engagement
  };

  return {
    trackListening,
    logEvent,
    toggleFavorite,
    getFavorites,
    trackPerformance,
    loading,
    getListeningStats,
    trackPageView,
    trackFeatureUsage,
    getEngagementScore,
    getTopSongs,
    trackSearch,
    getSessionDuration,
    trackError,
    isUserActive
  };
};