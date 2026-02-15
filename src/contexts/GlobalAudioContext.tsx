import { useAudioMetrics } from '@/hooks/useAudioMetrics';
import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';

interface AudioTrack {
  url: string;
  title: string;
  rang: 'A' | 'B' | 'AB';
}

interface GlobalAudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMinimized: boolean;
  audioElement: HTMLAudioElement | null;
  play: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  changeVolume: (volume: number) => void;
  minimize: () => void;
  maximize: () => void;
}

const GlobalAudioContext = createContext<GlobalAudioContextType | undefined>(undefined);

export const useGlobalAudio = () => {
  const context = useContext(GlobalAudioContext);
  if (!context) {
    throw new Error('useGlobalAudio must be used within a GlobalAudioProvider');
  }
  return context;
};

interface GlobalAudioProviderProps {
  children: React.ReactNode;
}

// Type for stored event listener references
interface AudioListeners {
  loadedmetadata?: () => void;
  timeupdate?: () => void;
  ended?: () => void;
  error?: (e: Event) => void;
  canplay?: () => void;
  loadstart?: () => void;
  progress?: () => void;
}

export const GlobalAudioProvider = ({ children }: GlobalAudioProviderProps) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('audio-volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listenersRef = useRef<AudioListeners>({});

  const { updateMetric, calculateBufferHealth, logFinalMetrics } = useAudioMetrics();

  // Properly remove all tracked listeners from an audio element
  const removeAllListeners = useCallback((audio: HTMLAudioElement) => {
    const listeners = listenersRef.current;
    if (listeners.loadedmetadata) audio.removeEventListener('loadedmetadata', listeners.loadedmetadata);
    if (listeners.timeupdate) audio.removeEventListener('timeupdate', listeners.timeupdate);
    if (listeners.ended) audio.removeEventListener('ended', listeners.ended);
    if (listeners.error) audio.removeEventListener('error', listeners.error as EventListener);
    if (listeners.canplay) audio.removeEventListener('canplay', listeners.canplay);
    if (listeners.loadstart) audio.removeEventListener('loadstart', listeners.loadstart);
    if (listeners.progress) audio.removeEventListener('progress', listeners.progress);
    listenersRef.current = {};
  }, []);

  const play = useCallback((track: AudioTrack) => {
    const startTime = performance.now();

    if (!track.url || track.url === '' || track.url === 'undefined') {
      updateMetric(track.url, { errors: ['URL invalide'] });
      setIsPlaying(false);
      return;
    }

    // Clean up previous audio element and all its listeners
    if (audioRef.current) {
      audioRef.current.pause();
      removeAllListeners(audioRef.current);
    }

    const audio = new Audio();
    audioRef.current = audio;
    setCurrentTrack(track);
    audio.volume = volume;
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';

    // Named handler functions stored in ref for proper cleanup
    const handleLoadedMetadata = () => {
      const metadataTime = performance.now() - startTime;
      updateMetric(track.url, { metadataLoadTime: metadataTime });
      setDuration(audio.duration || 348);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (_e: Event) => {
      const errorTime = performance.now() - startTime;
      updateMetric(track.url, { errors: [`Error after ${errorTime.toFixed(0)}ms: ${audio.error?.message || 'unknown'}`] });
      setIsPlaying(false);
      setCurrentTrack(null);
    };

    const handleCanPlay = () => {
      const canPlayTime = performance.now() - startTime;
      updateMetric(track.url, { canPlayTime });

      if (!audio.paused) return;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          const playTime = performance.now() - startTime;
          updateMetric(track.url, {
            playStartTime: playTime,
            totalLoadTime: playTime
          });
          setIsPlaying(true);
          setTimeout(() => logFinalMetrics(track.url), 1000);
        }).catch((error) => {
          const errorMsg = `${error.name}: ${error.message}`;
          updateMetric(track.url, { errors: [errorMsg] });
          setIsPlaying(false);
          if (error.name === 'NotSupportedError') {
            setCurrentTrack(null);
          }
        });
      }
    };

    const handleLoadStart = () => {
      // Tracked by metrics via startTime
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const buffered = audio.buffered.end(audio.buffered.length - 1);
        const dur = audio.duration || 0;
        const bufferHealth = calculateBufferHealth(audio.buffered, dur, audio.currentTime);
        updateMetric(track.url, { bufferHealthScore: bufferHealth });
      }
    };

    // Store listener references for cleanup
    listenersRef.current = {
      loadedmetadata: handleLoadedMetadata,
      timeupdate: handleTimeUpdate,
      ended: handleEnded,
      error: handleError,
      canplay: handleCanPlay,
      loadstart: handleLoadStart,
      progress: handleProgress,
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('progress', handleProgress);

    audio.src = track.url;
    audio.load();
  }, [volume, updateMetric, calculateBufferHealth, logFinalMetrics, removeAllListeners]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentTrack(null);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem('audio-volume', newVolume.toString());
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const minimize = useCallback(() => setIsMinimized(true), []);
  const maximize = useCallback(() => setIsMinimized(false), []);

  // Cleanup on unmount: pause audio and remove all listeners
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        removeAllListeners(audioRef.current);
      }
    };
  }, [removeAllListeners]);

  return (
    <GlobalAudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMinimized,
        audioElement: audioRef.current,
        play,
        pause,
        resume,
        stop,
        seek,
        changeVolume,
        minimize,
        maximize,
      }}
    >
      {children}
    </GlobalAudioContext.Provider>
  );
};
