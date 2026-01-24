import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { PremiumCard } from '@/components/ui/premium-card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Track {
  id: string;
  title: string;
  audioUrl: string;
  style?: string;
  rang?: string;
  duration?: number;
}

interface ContinuousPlayerProps {
  tracks: Track[];
  initialTrackIndex?: number;
  onTrackChange?: (track: Track, index: number) => void;
  onPlaybackEnd?: () => void;
  className?: string;
}

export const ContinuousPlayer: React.FC<ContinuousPlayerProps> = ({
  tracks,
  initialTrackIndex = 0,
  onTrackChange,
  onPlaybackEnd,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialTrackIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const currentTrack = tracks[currentIndex];
  const hasAutoStarted = useRef(false);

  // Charger la piste actuelle
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      
      // Auto-play au premier chargement ou quand on change de piste
      const shouldPlay = isPlaying || !hasAutoStarted.current;
      if (shouldPlay) {
        hasAutoStarted.current = true;
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
      
      onTrackChange?.(currentTrack, currentIndex);
    }
  }, [currentIndex, currentTrack]);

  // Gestion du temps
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  // Fin de piste - passer à la suivante
  const handleEnded = useCallback(() => {
    if (isRepeat) {
      // Rejouer la même piste
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else if (currentIndex < tracks.length - 1) {
      // Passer à la suivante
      // Deterministic next track in shuffle mode
      const nextIndex = isShuffle 
        ? (currentIndex + 3) % tracks.length  // Step through with fixed offset
        : currentIndex + 1;
      setCurrentIndex(nextIndex);
    } else {
      // Fin de la playlist
      setIsPlaying(false);
      onPlaybackEnd?.();
    }
  }, [isRepeat, isShuffle, currentIndex, tracks.length, onPlaybackEnd]);

  // Contrôles
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const playPrevious = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // Si on est à plus de 3 secondes, revenir au début
      audioRef.current.currentTime = 0;
    } else if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const playNext = useCallback(() => {
    if (currentIndex < tracks.length - 1) {
      // Deterministic next track in shuffle mode
      const nextIndex = isShuffle 
        ? (currentIndex + 3) % tracks.length
        : currentIndex + 1;
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, tracks.length, isShuffle]);

  const handleSeek = useCallback((values: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = values[0];
      setCurrentTime(values[0]);
    }
  }, []);

  const handleVolumeChange = useCallback((values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const jumpToTrack = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <PremiumCard variant="glass" className={`p-4 ${className}`}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Info piste actuelle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0">
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-4">
              <div className="w-1 bg-primary-foreground animate-pulse" style={{ height: '60%' }} />
              <div className="w-1 bg-primary-foreground animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }} />
              <div className="w-1 bg-primary-foreground animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }} />
            </div>
          ) : (
            <Play className="h-5 w-5 text-primary-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{currentTrack.title}</p>
          <div className="flex items-center gap-2">
            {currentTrack.style && (
              <Badge variant="outline" className="text-xs">{currentTrack.style}</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1}/{tracks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="space-y-2 mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsShuffle(!isShuffle)}
          className={`h-8 w-8 p-0 ${isShuffle ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Shuffle className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={playPrevious}
          disabled={currentIndex === 0}
          className="h-10 w-10 p-0"
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={togglePlay}
          className="h-12 w-12 rounded-full p-0"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={playNext}
          disabled={currentIndex === tracks.length - 1}
          className="h-10 w-10 p-0"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsRepeat(!isRepeat)}
          className={`h-8 w-8 p-0 ${isRepeat ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Repeat className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume et file d'attente */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-8 w-8 p-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowQueue(!showQueue)}
          className={`h-8 gap-1 ${showQueue ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <List className="h-4 w-4" />
          <span className="text-xs">File</span>
        </Button>
      </div>

      {/* File d'attente */}
      {showQueue && (
        <div className="mt-4 pt-4 border-t border-border/30 max-h-[200px] overflow-y-auto">
          <div className="space-y-1">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => jumpToTrack(index)}
                className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                  index === currentIndex 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <span className="text-xs text-muted-foreground w-5">{index + 1}</span>
                <span className="flex-1 truncate text-sm">{track.title}</span>
                {track.style && (
                  <Badge variant="outline" className="text-xs">{track.style}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </PremiumCard>
  );
};
