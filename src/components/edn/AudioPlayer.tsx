import { AudioLoadingIndicator } from '@/components/ui/AudioLoadingIndicator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAudioBuffering } from '@/hooks/useAudioBuffering';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Pause, Play, SkipBack, SkipForward, Square, Star, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  audioUrl?: string;
  title: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
  onClose?: () => void;
  audioElement?: HTMLAudioElement | null;
  playbackRate?: number;
  onPlaybackRateChange?: (rate: number) => void;
}

export const AudioPlayer = ({
  title,
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onStop,
  onClose,
  audioElement,
  playbackRate = 1,
  onPlaybackRateChange
}: AudioPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const hasTrackedRef = useRef(false);
  const { logActivity } = useActivityTracking();
  const { loadStats, stats } = useGamification();
  
  // Hook de buffering pour optimiser l'affichage
  const bufferingState = useAudioBuffering(audioElement || null);

  // Load gamification stats
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  // Track audio playback
  useEffect(() => {
    if (isPlaying && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { type: 'audio_playback', title }
      });
    }
    if (!isPlaying) {
      hasTrackedRef.current = false;
    }
  }, [isPlaying, logActivity, title]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    onSeek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    onVolumeChange(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      onVolumeChange(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  const skipForward = () => {
    onSeek(Math.min(duration, currentTime + 10));
  };

  const skipBackward = () => {
    onSeek(Math.max(0, currentTime - 10));
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-6 border border-warning/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-warning truncate flex-1">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {stats && (
            <>
              <Badge variant="outline" className="gap-1 text-xs">
                <Flame className="h-3 w-3 text-warning" />
                {stats.currentStreak ?? 0}j
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <Star className="h-3 w-3 text-warning" />
                Niv. {stats.level ?? 1}
              </Badge>
            </>
          )}
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-warning hover:text-warning/80"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Indicateur de chargement optimisé */}
      {(bufferingState.isBuffering || !bufferingState.readyToPlay) && (
        <div className="mb-4">
          <AudioLoadingIndicator
            isBuffering={bufferingState.isBuffering}
            bufferPercent={bufferingState.bufferPercent}
            readyToPlay={bufferingState.readyToPlay}
            estimatedLoadTime={bufferingState.estimatedLoadTime}
            onRetry={() => {
              onStop();
              setTimeout(() => onPlayPause(), 500);
            }}
          />
        </div>
      )}

      {/* Barre de progression */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-warning mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Contrôles principaux */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          onClick={skipBackward}
          variant="outline"
          size="sm"
          className="border-warning/30 text-warning hover:bg-warning/10"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          onClick={onPlayPause}
          className="bg-warning hover:bg-warning/90 text-warning-foreground w-12 h-12 rounded-full"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>

        <Button
          onClick={onStop}
          variant="outline"
          size="sm"
          className="border-warning/30 text-warning hover:bg-warning/10"
        >
          <Square className="h-4 w-4" />
        </Button>

        <Button
          onClick={skipForward}
          variant="outline"
          size="sm"
          className="border-warning/30 text-warning hover:bg-warning/10"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume et vitesse */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
            className="text-warning hover:bg-warning/10"
          >
            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
          <span className="text-xs text-warning w-8">{Math.round(volume * 100)}%</span>
        </div>
        
        {/* Vitesse de lecture */}
        {onPlaybackRateChange && (
          <div className="flex items-center gap-1">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <Button
                key={rate}
                variant={playbackRate === rate ? "default" : "ghost"}
                size="sm"
                onClick={() => onPlaybackRateChange(rate)}
                aria-label={`Vitesse ${rate}x`}
                aria-pressed={playbackRate === rate}
                className={`h-6 px-2 text-xs ${playbackRate === rate ? 'bg-warning text-warning-foreground' : 'text-warning hover:bg-warning/10'}`}
              >
                {rate}x
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
