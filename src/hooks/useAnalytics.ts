import { useAuth } from '@/components/med-mng/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export const useAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const trackListening = async (songId: string, duration: number = 0) => {
    if (!user) return;
    
    try {
      const { _error } = await supabase
        .rpc('med_mng_track_listening', {
          p_song_id: songId,
          p_listen_duration: duration
        });
      
      if (_error) throw _error;
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
      const { _error } = await supabase
        .rpc('med_mng_log_listening_event', {
          p_song_id: songId,
          p_event_type: eventType,
          p_listen_duration: duration,
          p_metadata: metadata
        });
      
      if (_error) throw _error;
    } catch (error) {
      console.error('Erreur log event:', error);
    }
  };

  const toggleFavorite = async (songId: string) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      const { _data, _error } = await supabase
        .rpc('med_mng_toggle_favorite', {
          song_id: songId
        });
      
      if (_error) throw _error;
      return _data;
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
      const { _data, _error } = await supabase
        .from('med_mng_user_favorites')
        .select(`
          song_id,
          created_at,
          med_mng_songs(id, title, artist, duration, audio_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (_error) throw _error;
      return _data || [];
    } catch (error) {
      console.error('Erreur récupération favoris:', error);
      return [];
    }
  };

  const trackPerformance = async (metric: string, value: number, category: string = 'performance') => {
    if (!user) return;
    
    try {
      const { _error } = await supabase
        .rpc('med_mng_log_listening_event', {
          p_song_id: '00000000-0000-0000-0000-000000000000', // UUID null pour les métriques de performance
          p_event_type: 'performance',
          p_listen_duration: Math.round(value),
          p_metadata: { metric, category }
        });
      
      if (_error) throw _error;
    } catch (error) {
      console.error('Erreur tracking performance:', error);
    }
  };

  // Get listening stats (using user_activity_log since med_mng_user_listening_history doesn't exist)
  const getListeningStats = async (days: number = 30) => {
    if (!user) return null;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { _data, _error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', 'music_generation')
        .gte('activity_date', startDate.toISOString().split('T')[0]);

      if (_error) throw _error;

      const stats = {
        totalListens: _data?.length || 0,
        totalDuration: _data?.reduce((sum, d: any) => sum + ((d.metadata as any)?.duration || 0), 0) || 0,
        uniqueSongs: new Set(_data?.map((d: any) => (d.metadata as any)?.song_id)).size,
        byDay: {} as Record<string, number>
      };

      _data?.forEach((d: any) => {
        const day = d.activity_date;
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

      const { _data } = await supabase
        .from('user_activity_log')
        .select('activity_date')
        .eq('user_id', user.id)
        .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (!_data) return 0;

      const uniqueDays = new Set(_data.map(d => d.activity_date)).size;
      return Math.min(100, Math.round((uniqueDays / 30) * 100));
    } catch (error) {
      console.error('Error calculating engagement:', error);
      return 0;
    }
  };

  // Get top listened songs (using activity log since listening history table doesn't exist)
  const getTopSongs = async (limit: number = 10) => {
    if (!user) return [];

    try {
      const { _data, _error } = await supabase
        .from('user_activity_log')
        .select('metadata')
        .eq('user_id', user.id)
        .eq('activity_type', 'music_generation')
        .order('activity_date', { ascending: false })
        .limit(100);

      if (_error) throw _error;

      const songCounts: Record<string, { count: number; title: string; artist: string }> = {};
      _data?.forEach((d: any) => {
        const songId = (d.metadata as any)?.song_id;
        if (songId && !songCounts[songId]) {
          songCounts[songId] = {
            count: 0,
            title: (d.metadata as any)?.title || 'Unknown',
            artist: (d.metadata as any)?.artist || 'Unknown'
          };
        }
        if (songId) songCounts[songId].count++;
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

  // Get session duration estimate (in-memory for performance)
  const [sessionStartRef] = useState(() => Date.now());
  
  const getSessionDuration = (): number => {
    return Math.round((Date.now() - sessionStartRef) / 1000);
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