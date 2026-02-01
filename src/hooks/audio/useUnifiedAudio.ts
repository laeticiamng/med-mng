// Hook audio core unifié - Remplace les multiples hooks audio fragmentés
// Fournit une API unifiée pour tous les players de la plateforme

import { audioCache } from '@/lib/audioCache';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================
// Types
// ============================================

export interface AudioTrack {
  id: string;
  title: string;
  audioUrl: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  isCached: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  bufferPercent: number;
  error: string | null;
}

export interface AudioPlayerControls {
  play: (track?: AudioTrack) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  cacheTrack: () => Promise<boolean>;
}

export interface UseUnifiedAudioOptions {
  autoPlay?: boolean;
  enableTracking?: boolean;
  enableOfflineCache?: boolean;
  onEnded?: () => void;
  onError?: (error: string) => void;
  onTimeUpdate?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

// ============================================
// Hook Principal
// ============================================

export const useUnifiedAudio = (options: UseUnifiedAudioOptions = {}) => {
  const {
    autoPlay = false,
    enableTracking = true,
    enableOfflineCache = true,
    onEnded,
    onError,
    onTimeUpdate,
    onPlay,
    onPause
  } = options;

  // State
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    isBuffering: false,
    isCached: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    playbackRate: 1,
    bufferPercent: 0,
    error: null
  });

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousVolumeRef = useRef(0.8);
  const hasTrackedRef = useRef(false);

  // Activity tracking
  const { logActivity } = useActivityTracking();

  // ============================================
  // Helpers
  // ============================================

  const updateState = useCallback((updates: Partial<AudioPlayerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resolveAudioUrl = useCallback(async (track: AudioTrack): Promise<string> => {
    if (!enableOfflineCache) return track.audioUrl;

    // Vérifier le cache en mode offline
    if (!navigator.onLine) {
      const cachedUrl = await audioCache.getCachedAudio(track.id);
      if (cachedUrl) {
        updateState({ isCached: true });
        return cachedUrl;
      }
    }

    // Vérifier si déjà en cache
    const isCached = await audioCache.isAudioCached(track.id);
    updateState({ isCached });

    return track.audioUrl;
  }, [enableOfflineCache, updateState]);

  // ============================================
  // Controls
  // ============================================

  const play = useCallback(async (track?: AudioTrack) => {
    const targetTrack = track || currentTrack;
    if (!targetTrack) return;

    // Nettoyer l'audio précédent
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    updateState({ isLoading: true, error: null });

    try {
      const resolvedUrl = await resolveAudioUrl(targetTrack);
      
      const audio = new Audio(resolvedUrl);
      audioRef.current = audio;
      audio.volume = state.isMuted ? 0 : state.volume;
      audio.playbackRate = state.playbackRate;

      // Event listeners
      audio.addEventListener('loadedmetadata', () => {
        updateState({ 
          duration: audio.duration,
          isLoading: false 
        });
      });

      audio.addEventListener('timeupdate', () => {
        const time = audio.currentTime;
        updateState({ currentTime: time });
        onTimeUpdate?.(time);
      });

      audio.addEventListener('ended', () => {
        updateState({ isPlaying: false, isPaused: false, currentTime: 0 });
        hasTrackedRef.current = false;
        onEnded?.();
      });

      audio.addEventListener('waiting', () => {
        updateState({ isBuffering: true });
      });

      audio.addEventListener('canplay', () => {
        updateState({ isBuffering: false, isLoading: false });
      });

      audio.addEventListener('progress', () => {
        if (audio.buffered.length > 0) {
          const buffered = audio.buffered.end(audio.buffered.length - 1);
          const percent = (buffered / audio.duration) * 100;
          updateState({ bufferPercent: percent });
        }
      });

      audio.addEventListener('error', (e) => {
        const errorMsg = 'Erreur de lecture audio';
        updateState({ 
          isPlaying: false, 
          isLoading: false, 
          error: errorMsg 
        });
        onError?.(errorMsg);
      });

      // Lancer la lecture
      await audio.play();
      
      setCurrentTrack(targetTrack);
      updateState({ isPlaying: true, isPaused: false, isLoading: false });
      onPlay?.();

      // Tracking
      if (enableTracking && !hasTrackedRef.current) {
        hasTrackedRef.current = true;
        logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { type: 'audio_playback', title: targetTrack.title }
        });
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur de lecture';
      updateState({ 
        isPlaying: false, 
        isLoading: false, 
        error: errorMsg 
      });
      onError?.(errorMsg);
    }
  }, [currentTrack, state.volume, state.isMuted, state.playbackRate, resolveAudioUrl, updateState, onEnded, onError, onTimeUpdate, onPlay, enableTracking, logActivity]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      updateState({ isPlaying: false, isPaused: true });
      onPause?.();
    }
  }, [updateState, onPause]);

  const resume = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        updateState({ isPlaying: true, isPaused: false });
        onPlay?.();
      } catch (error) {
        updateState({ error: 'Impossible de reprendre la lecture' });
      }
    }
  }, [updateState, onPlay]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      updateState({ 
        isPlaying: false, 
        isPaused: false, 
        currentTime: 0 
      });
      hasTrackedRef.current = false;
    }
  }, [updateState]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      const clampedTime = Math.max(0, Math.min(time, state.duration));
      audioRef.current.currentTime = clampedTime;
      updateState({ currentTime: clampedTime });
    }
  }, [state.duration, updateState]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    updateState({ volume: clampedVolume, isMuted: clampedVolume === 0 });
  }, [updateState]);

  const toggleMute = useCallback(() => {
    if (state.isMuted) {
      setVolume(previousVolumeRef.current);
      updateState({ isMuted: false });
    } else {
      previousVolumeRef.current = state.volume;
      setVolume(0);
      updateState({ isMuted: true });
    }
  }, [state.isMuted, state.volume, setVolume, updateState]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    updateState({ playbackRate: rate });
  }, [updateState]);

  const skipForward = useCallback((seconds = 10) => {
    seek(state.currentTime + seconds);
  }, [state.currentTime, seek]);

  const skipBackward = useCallback((seconds = 10) => {
    seek(state.currentTime - seconds);
  }, [state.currentTime, seek]);

  const cacheTrack = useCallback(async (): Promise<boolean> => {
    if (!currentTrack || !enableOfflineCache) return false;
    
    try {
      await audioCache.cacheAudio(
        currentTrack.id, 
        currentTrack.audioUrl, 
        currentTrack.title,
        'music',
        currentTrack.duration
      );
      updateState({ isCached: true });
      return true;
    } catch {
      return false;
    }
  }, [currentTrack, enableOfflineCache, updateState]);

  // ============================================
  // Cleanup
  // ============================================

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // ============================================
  // Auto-play
  // ============================================

  useEffect(() => {
    if (autoPlay && currentTrack && !state.isPlaying) {
      play(currentTrack);
    }
  }, [autoPlay, currentTrack, state.isPlaying, play]);

  // ============================================
  // Return
  // ============================================

  const controls: AudioPlayerControls = {
    play,
    pause,
    resume,
    stop,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    skipForward,
    skipBackward,
    cacheTrack
  };

  return {
    state,
    controls,
    currentTrack,
    audioElement: audioRef.current
  };
};

// Alias pour rétrocompatibilité
export const useAudioPlayer = useUnifiedAudio;
export const useEnhancedAudioPlayer = useUnifiedAudio;
