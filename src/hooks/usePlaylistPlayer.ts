import { useCallback, useEffect, useRef, useState } from 'react';

export type RepeatMode = 'none' | 'one' | 'all';

interface Track {
  id: string;
  title: string;
  audioUrl: string;
  [key: string]: any;
}

interface UsePlaylistPlayerOptions {
  tracks: Track[];
  initialIndex?: number;
  autoPlay?: boolean;
  onTrackChange?: (track: Track, index: number) => void;
  onPlaylistEnd?: () => void;
}

export const usePlaylistPlayer = ({
  tracks,
  initialIndex = 0,
  autoPlay = false,
  onTrackChange,
  onPlaylistEnd
}: UsePlaylistPlayerOptions) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current track
  const currentTrack = tracks[currentIndex] || null;

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    // Event listeners
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => handleTrackEnd();
    const handleError = (_e: ErrorEvent) => {
      setError('Erreur de lecture audio');
      setIsLoading(false);
    };
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadStart = () => setIsLoading(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as any);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as any);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  // Generate shuffled order with deterministic seed
  const generateShuffledOrder = useCallback(() => {
    const order = [...Array(tracks.length).keys()];
    // Fisher-Yates shuffle with timestamp seed for variety
    const seed = Date.now();
    for (let i = order.length - 1; i > 0; i--) {
      const j = (seed + i * 17) % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, [tracks.length]);

  // Load current track
  useEffect(() => {
    if (!audioRef.current || !currentTrack?.audioUrl) return;

    const audio = audioRef.current;
    const wasPlaying = isPlaying;
    
    audio.src = currentTrack.audioUrl;
    audio.load();
    
    if (wasPlaying || autoPlay) {
      audio.play().catch(console.error);
    }

    onTrackChange?.(currentTrack, currentIndex);
  }, [currentTrack?.audioUrl, currentIndex]);

  // Handle track end
  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      // Repeat current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      // Try to go to next track
      const nextIndex = getNextIndex();
      if (nextIndex !== null) {
        setCurrentIndex(nextIndex);
      } else {
        // End of playlist
        setIsPlaying(false);
        onPlaylistEnd?.();
      }
    }
  }, [repeatMode, isShuffled, shuffledOrder, currentIndex, tracks.length]);

  // Get next index based on shuffle/repeat mode
  const getNextIndex = useCallback((): number | null => {
    if (tracks.length === 0) return null;

    if (isShuffled) {
      const currentShuffleIndex = shuffledOrder.indexOf(currentIndex);
      const nextShuffleIndex = currentShuffleIndex + 1;
      
      if (nextShuffleIndex >= shuffledOrder.length) {
        if (repeatMode === 'all') {
          return shuffledOrder[0];
        }
        return null;
      }
      return shuffledOrder[nextShuffleIndex];
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= tracks.length) {
      if (repeatMode === 'all') {
        return 0;
      }
      return null;
    }
    return nextIndex;
  }, [isShuffled, shuffledOrder, currentIndex, tracks.length, repeatMode]);

  // Get previous index
  const getPreviousIndex = useCallback((): number | null => {
    if (tracks.length === 0) return null;

    // If more than 3 seconds played, restart current track
    if (currentTime > 3) {
      return currentIndex;
    }

    if (isShuffled) {
      const currentShuffleIndex = shuffledOrder.indexOf(currentIndex);
      const prevShuffleIndex = currentShuffleIndex - 1;
      
      if (prevShuffleIndex < 0) {
        if (repeatMode === 'all') {
          return shuffledOrder[shuffledOrder.length - 1];
        }
        return null;
      }
      return shuffledOrder[prevShuffleIndex];
    }

    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        return tracks.length - 1;
      }
      return null;
    }
    return prevIndex;
  }, [isShuffled, shuffledOrder, currentIndex, tracks.length, repeatMode, currentTime]);

  // Controls
  const play = useCallback(() => {
    audioRef.current?.play().catch(console.error);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    const nextIndex = getNextIndex();
    if (nextIndex !== null) {
      setCurrentIndex(nextIndex);
    }
  }, [getNextIndex]);

  const previous = useCallback(() => {
    const prevIndex = getPreviousIndex();
    if (prevIndex !== null) {
      if (prevIndex === currentIndex) {
        // Restart current track
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      } else {
        setCurrentIndex(prevIndex);
      }
    }
  }, [getPreviousIndex, currentIndex]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
    }
  }, [duration]);

  const setVolumeValue = useCallback((value: number) => {
    const normalizedVolume = Math.max(0, Math.min(1, value));
    setVolume(normalizedVolume);
    if (audioRef.current) {
      audioRef.current.volume = normalizedVolume;
    }
    if (normalizedVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      switch (prev) {
        case 'none': return 'all';
        case 'all': return 'one';
        case 'one': return 'none';
      }
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    if (!isShuffled) {
      // Enable shuffle
      setShuffledOrder(generateShuffledOrder());
    }
    setIsShuffled(!isShuffled);
  }, [isShuffled, generateShuffledOrder]);

  const goToTrack = useCallback((index: number) => {
    if (index >= 0 && index < tracks.length) {
      setCurrentIndex(index);
    }
  }, [tracks.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return {
    // State
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    isLoading,
    error,
    
    // Derived
    hasNext: getNextIndex() !== null,
    hasPrevious: currentIndex > 0 || currentTime > 3 || repeatMode === 'all',
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
    
    // Controls
    play,
    pause,
    togglePlayPause,
    next,
    previous,
    seek,
    setVolume: setVolumeValue,
    toggleMute,
    cycleRepeatMode,
    toggleShuffle,
    goToTrack
  };
};
