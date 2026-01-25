import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export interface MusicGeneration {
  id: string;
  item_code: string;
  generation_type: string;
  suno_task_id?: string;
  generation_status: string;
  started_at: string;
  completed_at?: string;
  generation_duration_seconds?: number;
  success: boolean;
  error_message?: string;
  audio_url?: string;
  song_id?: string;
  credits_consumed: number;
}

export interface StreamingSession {
  id: string;
  song_id: string;
  session_start: string;
  session_end?: string;
  duration_seconds: number;
  completion_percentage: number;
  playback_source: string;
}

export interface GenerationStats {
  total_generations: number;
  success_rate: number;
  failure_rate: number;
  avg_generation_time_seconds: number;
  slow_generations: number;
  by_type: Record<string, number>;
  total_credits_consumed: number;
}

export const useSpotifyAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generations, setGenerations] = useState<MusicGeneration[]>([]);

  const generateMusic = async (params: {
    item_code: string;
    type: string;
    paroles: string[];
    style?: string;
    add_to_playlist_id?: string;
    priority?: string;
  }): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const { _data, error } = await supabase.functions.invoke('spotify-ai-complete/generate', {
        body: params
      });

      if (error) throw error;

      if (!_data.success) {
        throw new Error(_data.error || 'Erreur génération musicale');
      }

      return _data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      console.error('❌ Erreur generateMusic:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGenerationStatus = async (_generationId: string): Promise<any> => {
    try {
      const { _data, error } = await supabase.functions.invoke('spotify-ai-complete/status', {
        method: 'GET'
      });

      if (error) throw error;
      return _data;
    } catch (err) {
      console.error('❌ Erreur getGenerationStatus:', err);
      return null;
    }
  };

  const getStreamingUrl = async (_songId: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { _data, error } = await supabase.functions.invoke('spotify-ai-complete/stream', {
        method: 'GET'
      });

      if (error) throw error;

      if (_data.success) {
        return _data.streaming_url;
      }

      return null;
    } catch (err) {
      console.error('❌ Erreur getStreamingUrl:', err);
      return null;
    }
  };

  const trackListeningSession = async (songId: string, sessionData: {
    duration_seconds?: number;
    completion_percentage?: number;
    bytes_streamed?: number;
    buffer_events?: number;
    seek_events?: number;
    playback_source?: string;
  }): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { _error } = await supabase
        .from('med_mng_listening_sessions')
        .insert({
          user_id: user.id,
          song_id: songId,
          session_end: new Date().toISOString(),
          ...sessionData
        });

      return !_error;
    } catch (err) {
      console.error('❌ Erreur trackListeningSession:', err);
      return false;
    }
  };

  const getUserGenerations = async (timeframe = '7d'): Promise<MusicGeneration[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const timeframeMappings: { [key: string]: string } = {
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days'
      };

      const period = timeframeMappings[timeframe] || '7 days';

      const { _data, _error } = await supabase
        .from('med_mng_music_generation_logs')
        .select(`
          *,
          med_mng_songs(id, title, audio_url)
        `)
        .eq('user_id', user.id)
        .gte('started_at', `now() - interval '${period}'`)
        .order('started_at', { ascending: false });

      if (_error) throw _error;

      setGenerations(_data as MusicGeneration[] || []);
      return _data as MusicGeneration[] || [];
    } catch (err) {
      console.error('❌ Erreur getUserGenerations:', err);
      return [];
    }
  };

  const getAdminStats = async (_timeframe = '24h'): Promise<{ logs: MusicGeneration[], stats: GenerationStats, alerts: any[] } | null> => {
    try {
      const { _data, error } = await supabase.functions.invoke('spotify-ai-complete/admin-logs', {
        method: 'GET'
      });

      if (error) throw error;
      return _data;
    } catch (err) {
      console.error('❌ Erreur getAdminStats:', err);
      return null;
    }
  };

  const pollGenerationStatus = (generationId: string, onUpdate: (status: any) => void, interval = 5000) => {
    const poll = async () => {
      try {
        const status = await getGenerationStatus(generationId);
        if (status) {
          onUpdate(status);

          // Arrêter le polling si terminé
          if (['completed', 'failed', 'timeout'].includes(status.status)) {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error('❌ Erreur polling:', err);
        clearInterval(intervalId);
      }
    };

    const intervalId = setInterval(poll, interval);
    
    // Poll immédiatement
    poll();

    // Retourner fonction de cleanup
    return () => clearInterval(intervalId);
  };

  return {
    loading,
    error,
    generations,
    generateMusic,
    getGenerationStatus,
    getStreamingUrl,
    trackListeningSession,
    getUserGenerations,
    getAdminStats,
    pollGenerationStatus
  };
};