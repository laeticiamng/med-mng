
import { useAudioMetrics } from '@/hooks/useAudioMetrics';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

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
  _stop: () => void;
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
  const [volume, setVolume] = useState(() => {
    // Restore volume from localStorage
    const saved = localStorage.getItem('audio-volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Hook de métriques pour le monitoring
  const { updateMetric, calculateBufferHealth, logFinalMetrics } = useAudioMetrics();

  const play = (track: AudioTrack) => {
    const startTime = performance.now();
    console.log('🎵 [PERF] Démarrage lecture - URL:', track.url);
    
    // Démarrer le tracking des métriques
    // Vérifier si l'URL est valide
    if (!track.url || track.url === '' || track.url === 'undefined') {
      console.error('❌ URL audio invalide:', track.url);
      updateMetric(track.url, { errors: ['URL invalide'] });
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
    audio.crossOrigin = 'anonymous';
    
    // OPTIMISATION 1: Précharger avec hints
    audio.preload = 'auto'; // Force le préchargement
    
    // Configuration des événements AVANT de définir la source
    const handleLoadedMetadata = () => {
      const metadataTime = performance.now() - startTime;
      console.log(`📊 [PERF] Métadonnées chargées en ${metadataTime.toFixed(2)}ms - Durée:`, audio.duration);
      updateMetric(track.url, { metadataLoadTime: metadataTime });
      setDuration(audio.duration || 348);
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
      const errorTime = performance.now() - startTime;
      console.error(`❌ [PERF] Erreur audio après ${errorTime.toFixed(2)}ms:`, e);
      console.error('❌ Code erreur:', audio.error?.code, 'Message:', audio.error?.message);
      console.error('❌ URL problématique:', track.url);
      setIsPlaying(false);
      setCurrentTrack(null);
    };

    const handleCanPlay = () => {
      const canPlayTime = performance.now() - startTime;
      console.log(`✅ [PERF] Audio prêt à être lu en ${canPlayTime.toFixed(2)}ms`);
      updateMetric(track.url, { canPlayTime });
      
      // OPTIMISATION 2: Démarrage immédiat dès que possible
      if (!audio.paused) return; // Déjà en cours
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          const playTime = performance.now() - startTime;
          console.log(`✅ [PERF] Lecture démarrée avec succès en ${playTime.toFixed(2)}ms`);
          updateMetric(track.url, { 
            playStartTime: playTime,
            totalLoadTime: playTime
          });
          setIsPlaying(true);
          
          // Log final des métriques après démarrage réussi
          setTimeout(() => logFinalMetrics(track.url), 1000);
        }).catch((error) => {
          const errorMsg = `${error.name}: ${error.message}`;
          updateMetric(track.url, { errors: [errorMsg] });
          
          if (error.name === 'NotAllowedError') {
            setIsPlaying(false);
          } else if (error.name === 'NotSupportedError') {
            setCurrentTrack(null);
          } else {
            setIsPlaying(false);
          }
        });
      }
    };

    const handleLoadStart = () => {
      const loadStartTime = performance.now() - startTime;
      console.log(`🔄 [PERF] Début du chargement audio en ${loadStartTime.toFixed(2)}ms`);
    };
    
    // OPTIMISATION 3: Buffer pour réduire les interruptions
    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const buffered = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration || 0;
        const bufferPercent = duration > 0 ? (buffered / duration) * 100 : 0;
        const bufferHealth = calculateBufferHealth(audio.buffered, duration, audio.currentTime);
        
        updateMetric(track.url, { bufferHealthScore: bufferHealth });
        console.log(`📦 [PERF] Buffer: ${bufferPercent.toFixed(1)}% - Santé: ${bufferHealth.toFixed(0)}%`);
      }
    };

    // Ajouter les événements
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('progress', handleProgress);

    // OPTIMISATION 4: Définir la source avec optimisations réseau
    audio.src = track.url;
    audio.load(); // Force le chargement immédiat
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
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      console.log('⏭️ Recherche à:', time, 'secondes');
    }
  };

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem('audio-volume', newVolume.toString()); // Persist volume
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
        audioElement: audioRef.current,
        play,
        pause,
        resume,
        _stop,
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
