
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface AudioTrack {
  url: string;
  title: string;
  rang: 'A' | 'B';
}

interface GlobalAudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMinimized: boolean;
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

export const GlobalAudioProvider = ({ children }: GlobalAudioProviderProps) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMinimized, setIsMinimized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = (track: AudioTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(track.url);
    audioRef.current = audio;
    setCurrentTrack(track);
    audio.volume = volume;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener('error', (e) => {
      console.error('Erreur audio globale:', e);
      setIsPlaying(false);
      setCurrentTrack(null);
    });

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((error) => {
      console.error('Erreur lecture audio globale:', error);
      setIsPlaying(false);
    });
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Erreur reprise audio globale:', error);
        setIsPlaying(false);
      });
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentTrack(null);
      setIsMinimized(false);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const minimize = () => {
    setIsMinimized(true);
  };

  const maximize = () => {
    setIsMinimized(false);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <GlobalAudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMinimized,
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
