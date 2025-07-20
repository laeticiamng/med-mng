
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
    console.log('🎵 Tentative de lecture audio:', track.url);
    
    // Arrêter l'audio précédent s'il existe
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('loadedmetadata', () => {});
      audioRef.current.removeEventListener('timeupdate', () => {});
      audioRef.current.removeEventListener('ended', () => {});
      audioRef.current.removeEventListener('error', () => {});
    }

    const audio = new Audio();
    audioRef.current = audio;
    setCurrentTrack(track);
    audio.volume = volume;
    
    // Configuration des événements AVANT de définir la source
    audio.addEventListener('loadedmetadata', () => {
      console.log('📊 Métadonnées chargées - Durée:', audio.duration);
      setDuration(audio.duration || 348); // Fallback durée par défaut
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      console.log('🔚 Lecture terminée');
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener('error', (e) => {
      console.error('❌ Erreur audio globale:', e);
      console.error('❌ URL problématique:', track.url);
      setIsPlaying(false);
      setCurrentTrack(null);
    });

    audio.addEventListener('canplay', () => {
      console.log('✅ Audio prêt à être lu');
    });

    audio.addEventListener('loadstart', () => {
      console.log('🔄 Début du chargement audio');
    });

    // Définir la source APRÈS avoir configuré les événements
    audio.src = track.url;
    audio.load(); // Force le chargement

    // Tentative de lecture avec gestion d'erreur
    audio.play().then(() => {
      console.log('✅ Lecture audio démarrée avec succès');
      setIsPlaying(true);
    }).catch((error) => {
      console.error('❌ Erreur lors du démarrage de la lecture:', error);
      setIsPlaying(false);
    });
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('⏸️ Audio mis en pause');
    }
  };

  const resume = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        console.log('▶️ Audio repris');
      }).catch((error) => {
        console.error('❌ Erreur reprise audio globale:', error);
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
      console.log('⏹️ Audio arrêté');
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      console.log('⏭️ Recherche à:', time, 'secondes');
    }
  };

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      console.log('🔊 Volume changé à:', Math.round(newVolume * 100) + '%');
    }
  };

  const minimize = () => {
    setIsMinimized(true);
    console.log('🔽 Lecteur minimisé');
  };

  const maximize = () => {
    setIsMinimized(false);
    console.log('🔼 Lecteur maximisé');
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        console.log('🧹 Nettoyage audio context');
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
