import { useAuth } from '@/components/med-mng/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface StreamingSession {
  sessionToken: string;
  streamUrl: string;
  expiresAt: number;
}

interface UseSecureStreamingReturn {
  isLoading: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  createSecureStream: (songId: string) => Promise<string | null>;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  cleanup: () => void;
}

export const useSecureStreaming = (): UseSecureStreamingReturn => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [_currentSession, setCurrentSession] = useState<StreamingSession | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyer les sessions expirées
  const cleanupExpiredSessions = useCallback(async () => {
    try {
      await supabase.functions.invoke('secure-streaming-proxy', {
        body: { action: 'cleanup' }
      });
    } catch (error) {
      console.error('Erreur nettoyage sessions:', error);
    }
  }, []);

  // Créer une session de streaming sécurisée
  const createSecureStream = useCallback(async (songId: string): Promise<string | null> => {
    if (!user) {
      toast.error('Connexion requise pour écouter');
      return null;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('secure-streaming-proxy', {
        body: {
          songId,
          userId: user.id,
          action: 'create-session'
        }
      });

      if (error) {
        throw error;
      }

      const session: StreamingSession = data;
      setCurrentSession(session);

      // Programmer le nettoyage automatique de la session
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
      }

      sessionTimerRef.current = setTimeout(() => {
        setCurrentSession(null);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
        toast.warning('Session d\'écoute expirée');
      }, session.expiresAt - Date.now());

      // Construire l'URL de stream sécurisée
      const streamUrl = `https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/secure-streaming-proxy${session.streamUrl}`;
      
      return streamUrl;

    } catch (error) {
      console.error('Erreur création session streaming:', error);
      toast.error('Erreur lors de la création de la session d\'écoute');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initialiser l'audio avec URL sécurisée
  const initializeAudio = useCallback((streamUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio();
    
    // Sécuriser l'audio element
    audio.crossOrigin = 'anonymous';
    audio.preload = 'none'; // Pas de préchargement pour éviter le cache
    
    // Empêcher le téléchargement via context menu
    audio.oncontextmenu = (e) => e.preventDefault();
    
    // Event listeners
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };
    
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    audio.onplay = () => {
      setIsPlaying(true);
    };
    
    audio.onpause = () => {
      setIsPlaying(false);
    };
    
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    audio.onerror = (e) => {
      console.error('Erreur audio:', e);
      toast.error('Erreur de lecture audio');
      setIsPlaying(false);
    };

    audio.src = streamUrl;
    audioRef.current = audio;
    
    return audio;
  }, []);

  // Contrôles de lecture
  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Erreur lecture:', error);
        toast.error('Erreur lors de la lecture');
      });
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const setVolumeControl = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, time));
    }
  }, [duration]);

  // Nettoyage
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    
    setCurrentSession(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // Nettoyage automatique à l'unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Nettoyage périodique des sessions expirées
  useEffect(() => {
    const interval = setInterval(cleanupExpiredSessions, 5 * 60 * 1000); // Toutes les 5 minutes
    return () => clearInterval(interval);
  }, [cleanupExpiredSessions]);

  return {
    isLoading,
    isPlaying,
    currentTime,
    duration,
    volume,
    createSecureStream: useCallback(async (songId: string) => {
      const streamUrl = await createSecureStream(songId);
      if (streamUrl) {
        initializeAudio(streamUrl);
      }
      return streamUrl;
    }, [createSecureStream, initializeAudio]),
    play,
    pause,
    setVolume: setVolumeControl,
    seek,
    cleanup
  };
};