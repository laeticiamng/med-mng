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

  return {
    trackListening,
    logEvent,
    toggleFavorite,
    getFavorites,
    trackPerformance,
    loading
  };
};