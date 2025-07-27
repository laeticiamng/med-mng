
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
    
    // Vérifier si l'URL est valide
    if (!track.url || track.url === '' || track.url === 'undefined') {
      console.error('❌ URL audio invalide:', track.url);
      setIsPlaying(false);
      return;
    }
    
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
    audio.crossOrigin = 'anonymous'; // Fix CORS potentiel
    
    // Configuration des événements AVANT de définir la source
    const handleLoadedMetadata = () => {
      console.log('📊 Métadonnées chargées - Durée:', audio.duration);
      setDuration(audio.duration || 348); // Fallback durée par défaut
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      console.log('🔚 Lecture terminée');
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: any) => {
      console.error('❌ Erreur audio globale:', e);
      console.error('❌ Code erreur:', audio.error?.code, 'Message:', audio.error?.message);
      console.error('❌ URL problématique:', track.url);
      setIsPlaying(false);
      setCurrentTrack(null);
    };

    const handleCanPlay = () => {
      console.log('✅ Audio prêt à être lu');
    };

    const handleLoadStart = () => {
      console.log('🔄 Début du chargement audio');
    };

    // Ajouter les événements
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);

    // Définir la source APRÈS avoir configuré les événements
    audio.src = track.url;
    audio.load(); // Force le chargement

    // Tentative de lecture avec gestion d'erreur + autoplay policy
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('✅ Lecture audio démarrée avec succès');
        setIsPlaying(true);
      }).catch((error) => {
        console.error('❌ Erreur lors du démarrage de la lecture:', error);
        
        // Gestion spécifique pour autoplay policy
        if (error.name === 'NotAllowedError') {
          console.warn('⚠️ Autoplay bloqué - interaction utilisateur requise');
          // On garde l'état prêt mais pas en lecture
          setIsPlaying(false);
        } else if (error.name === 'NotSupportedError') {
          console.error('❌ Format audio non supporté');
          setCurrentTrack(null);
        } else {
          setIsPlaying(false);
        }
      });
    }
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
