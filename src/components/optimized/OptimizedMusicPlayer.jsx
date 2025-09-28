import { memo, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSimpleState } from '@/hooks/useSimpleState';

// Lecteur audio optimisé avec gestion d'état simplifiée
export const OptimizedMusicPlayer = memo(({ 
  audioUrl,
  title = "Musique générée",
  onPlay,
  onPause,
  onEnded,
  autoPlay = false,
  className = ""
}) => {
  const audioRef = useRef(null);
  const [state, setState] = useSimpleState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isLoading: false
  });

  const formatTime = useCallback((time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      audio.pause();
      onPause?.();
    } else {
      audio.play();
      onPlay?.();
    }
    setState({ isPlaying: !state.isPlaying });
  }, [state.isPlaying, onPlay, onPause, setState]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setState({ 
        currentTime: audio.currentTime,
        duration: audio.duration || 0
      });
    }
  }, [setState]);

  const handleSeek = useCallback((value) => {
    const audio = audioRef.current;
    if (audio && value?.[0] !== undefined) {
      audio.currentTime = value[0];
      setState({ currentTime: value[0] });
    }
  }, [setState]);

  const handleVolumeChange = useCallback((value) => {
    const audio = audioRef.current;
    const newVolume = value?.[0] || 0;
    
    if (audio) {
      audio.volume = newVolume;
    }
    setState({ 
      volume: newVolume,
      isMuted: newVolume === 0
    });
  }, [setState]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      const newMuted = !state.isMuted;
      audio.volume = newMuted ? 0 : state.volume;
      setState({ isMuted: newMuted });
    }
  }, [state.isMuted, state.volume, setState]);

  const handleEnded = useCallback(() => {
    setState({ 
      isPlaying: false,
      currentTime: 0 
    });
    onEnded?.();
  }, [setState, onEnded]);

  // Effets optimisés
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const events = {
      timeupdate: handleTimeUpdate,
      ended: handleEnded,
      loadstart: () => setState({ isLoading: true }),
      canplaythrough: () => setState({ isLoading: false }),
      error: () => setState({ isLoading: false, isPlaying: false })
    };

    Object.entries(events).forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });

    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        audio.removeEventListener(event, handler);
      });
    };
  }, [handleTimeUpdate, handleEnded, setState]);

  useEffect(() => {
    if (autoPlay && audioUrl) {
      const timer = setTimeout(() => {
        audioRef.current?.play();
        setState({ isPlaying: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [audioUrl, autoPlay, setState]);

  const progressPercentage = useMemo(() => {
    return state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  }, [state.currentTime, state.duration]);

  if (!audioUrl) return null;

  return (
    <div className={`bg-card border rounded-lg p-4 space-y-4 ${className}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />
      
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm truncate flex-1 mr-4">{title}</h4>
        <div className="text-xs text-muted-foreground">
          {formatTime(state.currentTime)} / {formatTime(state.duration)}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="space-y-2">
        <Slider
          value={[state.currentTime]}
          max={state.duration}
          step={1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div 
          className="h-1 bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            disabled={state.isLoading}
            className="h-10 w-10 rounded-full"
          >
            {state.isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            ) : state.isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Contrôle volume */}
        <div className="flex items-center space-x-2 min-w-0 flex-1 max-w-32">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-8 w-8 flex-shrink-0"
          >
            {state.isMuted || state.volume === 0 ? (
              <VolumeX className="h-3 w-3" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
          </Button>
          <Slider
            value={[state.isMuted ? 0 : state.volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
});

OptimizedMusicPlayer.displayName = 'OptimizedMusicPlayer';