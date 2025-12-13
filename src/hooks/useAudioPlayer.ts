
import { useState, useRef, useEffect } from 'react';
import { audioCache } from '@/lib/audioCache';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = async (audioUrl: string, audioId?: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Try to get cached audio first (for offline support)
    let resolvedUrl = audioUrl;
    if (audioId && !navigator.onLine) {
      const cachedUrl = await audioCache.getCachedAudio(audioId);
      if (cachedUrl) {
        resolvedUrl = cachedUrl;
        setIsOfflineCached(true);
      }
    } else {
      setIsOfflineCached(false);
    }

    const audio = new Audio(resolvedUrl);
    audioRef.current = audio;
    setCurrentTrack(audioUrl);
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
      console.error('Erreur audio:', e);
      setIsPlaying(false);
      setCurrentTrack(null);
    });

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((error) => {
      console.error('Erreur lecture audio:', error);
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
        console.error('Erreur reprise audio:', error);
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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrack,
    play,
    pause,
    resume,
    stop,
    seek,
    changeVolume
  };
};
