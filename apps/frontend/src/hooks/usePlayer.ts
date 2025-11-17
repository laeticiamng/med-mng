import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Track } from '@shared/types/music';
import { useSecureStreaming } from './useSecureStreaming';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
}

export const usePlayer = () => {
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isLoading: false
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Initialiser l'audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Event listeners pour l'audio
    const handleLoadedMetadata = () => {
      setState(prev => ({ 
        ...prev, 
        duration: audio.duration,
        isLoading: false 
      }));
    };

    const handleTimeUpdate = () => {
      setState(prev => ({ 
        ...prev, 
        currentTime: audio.currentTime 
      }));
    };

    const handleEnded = () => {
      setState(prev => ({ 
        ...prev, 
        isPlaying: false,
        currentTime: 0 
      }));
    };

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    const handleError = () => {
      setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire cette piste audio",
        variant: "destructive"
      });
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [toast]);

  const playTrack = async (track: Track) => {
    if (!audioRef.current) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Si c'est la même piste, toggle play/pause
      if (state.currentTrack?.id === track.id) {
        if (state.isPlaying) {
          audioRef.current.pause();
          setState(prev => ({ ...prev, isPlaying: false }));
        } else {
          await audioRef.current.play();
          setState(prev => ({ ...prev, isPlaying: true }));
        }
        return;
      }

      // Nouvelle piste - URL déjà fournie ou par défaut
      if (!track.stream_url) {
        track.stream_url = track.stream_url || '';
      }

      audioRef.current.src = track.stream_url;
      audioRef.current.volume = state.volume;
      
      setState(prev => ({ 
        ...prev, 
        currentTrack: track,
        currentTime: 0 
      }));

      await audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));

    } catch (error) {
      console.error('Erreur lecture:', error);
      setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire cette piste",
        variant: "destructive"
      });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const play = async () => {
    if (audioRef.current && state.currentTrack) {
      try {
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      } catch (error) {
        console.error('Erreur play:', error);
      }
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState(prev => ({ 
      ...prev, 
      volume: clampedVolume,
      isMuted: clampedVolume === 0 
    }));
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (state.isMuted) {
        audioRef.current.volume = state.volume;
        setState(prev => ({ ...prev, isMuted: false }));
      } else {
        audioRef.current.volume = 0;
        setState(prev => ({ ...prev, isMuted: true }));
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    ...state,
    playTrack,
    pause,
    play,
    seek,
    setVolume,
    toggleMute,
    formatTime
  };
};