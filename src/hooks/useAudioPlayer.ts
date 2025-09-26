
import { useState, useRef, useEffect, useCallback } from 'react';
import { errorService } from '@/services/core/ErrorService';

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentTrack: string | null;
}

export const useAudioPlayer = () => {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    currentTrack: null,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const eventListenersRef = useRef<{
    loadedmetadata?: (e: Event) => void;
    timeupdate?: (e: Event) => void;
    ended?: (e: Event) => void;
    error?: (e: Event) => void;
  }>({});

  // Gestionnaires d'événements stables
  const handleLoadedMetadata = useCallback((e: Event) => {
    const audio = e.target as HTMLAudioElement;
    setState(prev => ({ ...prev, duration: audio.duration }));
  }, []);

  const handleTimeUpdate = useCallback((e: Event) => {
    const audio = e.target as HTMLAudioElement;
    setState(prev => ({ ...prev, currentTime: audio.currentTime }));
  }, []);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
  }, []);

  const handleError = useCallback((e: Event) => {
    errorService.handleError(new Error('Erreur audio'), 'system', true);
    setState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      currentTrack: null 
    }));
  }, []);

  // Fonction pour nettoyer les anciens écouteurs
  const cleanupAudio = useCallback(() => {
    if (audioRef.current && eventListenersRef.current) {
      audioRef.current.pause();
      
      // Supprimer les event listeners s'ils existent
      if (eventListenersRef.current.loadedmetadata) {
        audioRef.current.removeEventListener('loadedmetadata', eventListenersRef.current.loadedmetadata);
      }
      if (eventListenersRef.current.timeupdate) {
        audioRef.current.removeEventListener('timeupdate', eventListenersRef.current.timeupdate);
      }
      if (eventListenersRef.current.ended) {
        audioRef.current.removeEventListener('ended', eventListenersRef.current.ended);
      }
      if (eventListenersRef.current.error) {
        audioRef.current.removeEventListener('error', eventListenersRef.current.error);
      }
      
      audioRef.current = null;
      eventListenersRef.current = {};
    }
  }, []);

  const play = useCallback((audioUrl: string) => {
    // Nettoyer l'audio précédent
    cleanupAudio();

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    setState(prev => ({ 
      ...prev, 
      currentTrack: audioUrl 
    }));
    
    audio.volume = state.volume;

    // Stocker les références des handlers et les ajouter
    eventListenersRef.current = {
      loadedmetadata: handleLoadedMetadata,
      timeupdate: handleTimeUpdate,
      ended: handleEnded,
      error: handleError
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    audio.play().then(() => {
      setState(prev => ({ ...prev, isPlaying: true }));
    }).catch((error) => {
      errorService.handleError(error, 'user_action', true);
      setState(prev => ({ ...prev, isPlaying: false }));
    });
  }, [state.volume, cleanupAudio, handleLoadedMetadata, handleTimeUpdate, handleEnded, handleError]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setState(prev => ({ ...prev, isPlaying: true }));
      }).catch((error) => {
        errorService.handleError(error, 'user_action', true);
        setState(prev => ({ ...prev, isPlaying: false }));
      });
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        currentTime: 0, 
        currentTrack: null 
      }));
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    setState(prev => ({ ...prev, volume: newVolume }));
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  // Nettoyage complet lors du démontage du composant
  useEffect(() => {
    return cleanupAudio;
  }, [cleanupAudio]);

  return {
    isPlaying: state.isPlaying,
    currentTime: state.currentTime,
    duration: state.duration,
    volume: state.volume,
    currentTrack: state.currentTrack,
    play,
    pause,
    resume,
    stop,
    seek,
    changeVolume
  };
};
