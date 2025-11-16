import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAudioMetrics } from '@/hooks/useAudioMetrics';

interface EnhancedAudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentTrack: string | null;
  isBuffering: boolean;
  bufferPercent: number;
  readyToPlay: boolean;
  loadStartTime: number | null;
  playStartTime: number | null;
  streamingDelay: number | null;
  hasError: boolean;
  errorMessage: string | null;
  retryCount: number;
}

export const useEnhancedAudioPlayer = () => {
  const { toast } = useToast();
  const { startTracking, updateMetric, logFinalMetrics } = useAudioMetrics();
  
  const [state, setState] = useState<EnhancedAudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    currentTrack: null,
    isBuffering: false,
    bufferPercent: 0,
    readyToPlay: false,
    loadStartTime: null,
    playStartTime: null,
    streamingDelay: null,
    hasError: false,
    errorMessage: null,
    retryCount: 0
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);

  // Préchargement audio intelligent
  const preloadAudio = useCallback((audioUrl: string) => {
    console.log('🎵 Préchargement de l\'audio:', audioUrl);
    
    if (preloadRef.current) {
      preloadRef.current.pause();
      preloadRef.current = null;
    }

    const preloadAudio = new Audio();
    preloadAudio.preload = 'metadata';
    preloadAudio.src = audioUrl;
    
    preloadAudio.addEventListener('canplaythrough', () => {
      console.log('✅ Audio préchargé et prêt');
      setState(prev => ({ ...prev, readyToPlay: true }));
    });

    preloadAudio.addEventListener('error', (e) => {
      console.warn('⚠️ Erreur préchargement audio:', e);
    });

    preloadRef.current = preloadAudio;
  }, []);

  // Logging des métriques détaillées
  const logAudioMetrics = useCallback((eventType: string, data: any) => {
    console.log(`🎵 METRIC [${eventType}]:`, {
      timestamp: Date.now(),
      track: state.currentTrack,
      ...data
    });
  }, [state.currentTrack]);

  const play = useCallback(async (audioUrl: string) => {
    const playStartTime = performance.now();
    setState(prev => ({ 
      ...prev, 
      playStartTime,
      loadStartTime: playStartTime,
      hasError: false,
      errorMessage: null,
      isBuffering: true,
      streamingDelay: null
    }));

    logAudioMetrics('PLAY_INITIATED', { audioUrl, startTime: playStartTime });

    // Démarrer le tracking des métriques
    const metrics = startTracking(audioUrl);

    try {
      // Nettoyer l'ancien audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setState(prev => ({ ...prev, currentTrack: audioUrl }));
      audio.volume = state.volume;

      // Event listeners pour tracking détaillé
      audio.addEventListener('loadstart', () => {
        logAudioMetrics('LOAD_START', {});
        updateMetric(audioUrl, { loadStartTime: performance.now() });
      });

      audio.addEventListener('loadedmetadata', () => {
        const metadataTime = performance.now();
        const metadataDelay = metadataTime - playStartTime;
        
        logAudioMetrics('METADATA_LOADED', { 
          duration: audio.duration,
          metadataDelay 
        });
        
        setState(prev => ({ 
          ...prev, 
          duration: audio.duration,
          isBuffering: false
        }));
        
        updateMetric(audioUrl, { 
          metadataLoadTime: metadataTime,
          metadataDelay 
        });
      });

      audio.addEventListener('canplay', () => {
        const canPlayTime = performance.now();
        const canPlayDelay = canPlayTime - playStartTime;
        
        logAudioMetrics('CAN_PLAY', { canPlayDelay });
        
        setState(prev => ({ 
          ...prev, 
          readyToPlay: true,
          bufferPercent: 25
        }));
        
        updateMetric(audioUrl, { canPlayTime, canPlayDelay });
      });

      audio.addEventListener('canplaythrough', () => {
        const canPlayThroughTime = performance.now();
        const totalLoadDelay = canPlayThroughTime - playStartTime;
        
        logAudioMetrics('CAN_PLAY_THROUGH', { totalLoadDelay });
        
        setState(prev => ({ 
          ...prev, 
          bufferPercent: 100,
          isBuffering: false
        }));
        
        updateMetric(audioUrl, { 
          canPlayThroughTime,
          totalLoadDelay 
        });
      });

      audio.addEventListener('playing', () => {
        const actualPlayTime = performance.now();
        const streamingDelay = actualPlayTime - playStartTime;
        
        logAudioMetrics('AUDIO_STARTED_PLAYING', { 
          streamingDelay,
          target: '< 3000ms'
        });
        
        setState(prev => ({ 
          ...prev, 
          isPlaying: true,
          streamingDelay,
          isBuffering: false
        }));
        
        updateMetric(audioUrl, { 
          actualPlayTime,
          streamingDelay 
        });

        // Alerte si délai > 3 secondes
        if (streamingDelay > 3000) {
          console.warn('⚠️ STREAMING TROP LENT:', streamingDelay + 'ms');
          toast({
            title: "Lecture plus lente que prévu",
            description: `Délai: ${Math.round(streamingDelay)}ms (objectif: <3s)`,
            variant: "destructive"
          });
        }
      });

      audio.addEventListener('timeupdate', () => {
        setState(prev => ({ ...prev, currentTime: audio.currentTime }));
      });

      audio.addEventListener('ended', () => {
        logAudioMetrics('AUDIO_ENDED', {});
        setState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          currentTime: 0 
        }));
        logFinalMetrics(audioUrl);
      });

      audio.addEventListener('error', (e) => {
        const errorTime = performance.now();
        const errorDelay = errorTime - playStartTime;
        
        logAudioMetrics('AUDIO_ERROR', { 
          error: e,
          errorDelay,
          retryCount: state.retryCount 
        });
        
        setState(prev => ({ 
          ...prev, 
          isPlaying: false,
          hasError: true,
          errorMessage: 'Erreur de lecture audio',
          isBuffering: false
        }));

        updateMetric(audioUrl, { 
          errorTime,
          errorCount: (metrics.errorCount || 0) + 1 
        });
      });

      audio.addEventListener('waiting', () => {
        logAudioMetrics('AUDIO_WAITING', {});
        setState(prev => ({ ...prev, isBuffering: true }));
      });

      audio.addEventListener('progress', () => {
        const buffered = audio.buffered;
        const duration = audio.duration || 0;
        
        if (buffered.length > 0 && duration > 0) {
          const bufferedEnd = buffered.end(buffered.length - 1);
          const bufferPercent = Math.round((bufferedEnd / duration) * 100);
          
          setState(prev => ({ ...prev, bufferPercent }));
        }
      });

      // Lancer la lecture
      await audio.play();
      
    } catch (error) {
      const errorTime = performance.now();
      const errorDelay = errorTime - playStartTime;
      
      logAudioMetrics('PLAY_ERROR', { 
        error: error.message,
        errorDelay 
      });
      
      setState(prev => ({ 
        ...prev, 
        isPlaying: false,
        hasError: true,
        errorMessage: error.message,
        isBuffering: false
      }));
      
      console.error('❌ Erreur lecture audio:', error);
    }
  }, [state.volume, logAudioMetrics, startTracking, updateMetric, logFinalMetrics, toast]);

  const retry = useCallback(() => {
    if (state.currentTrack && state.retryCount < 3) {
      setState(prev => ({ 
        ...prev, 
        retryCount: prev.retryCount + 1,
        hasError: false,
        errorMessage: null
      }));
      
      logAudioMetrics('RETRY_ATTEMPT', { 
        retryCount: state.retryCount + 1 
      });
      
      play(state.currentTrack);
    }
  }, [state.currentTrack, state.retryCount, play, logAudioMetrics]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
      logAudioMetrics('PAUSED', {});
    }
  }, [logAudioMetrics]);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setState(prev => ({ ...prev, isPlaying: true }));
        logAudioMetrics('RESUMED', {});
      }).catch((error) => {
        console.error('Erreur reprise audio:', error);
        setState(prev => ({ 
          ...prev, 
          isPlaying: false,
          hasError: true,
          errorMessage: 'Erreur reprise audio'
        }));
      });
    }
  }, [logAudioMetrics]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        currentTime: 0, 
        currentTrack: null,
        hasError: false,
        errorMessage: null,
        streamingDelay: null
      }));
      logAudioMetrics('STOPPED', {});
    }
  }, [logAudioMetrics]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
      logAudioMetrics('SEEKED', { time });
    }
  }, [logAudioMetrics]);

  const changeVolume = useCallback((newVolume: number) => {
    setState(prev => ({ ...prev, volume: newVolume }));
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (preloadRef.current) {
        preloadRef.current.pause();
      }
    };
  }, []);

  return {
    ...state,
    play,
    pause,
    resume,
    stop,
    seek,
    changeVolume,
    retry,
    preloadAudio
  };
};