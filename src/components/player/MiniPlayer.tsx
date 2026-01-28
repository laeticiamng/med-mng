import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { usePlayer } from '@/hooks/usePlayer';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Pause, Play, SkipBack, SkipForward, Star, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface MiniPlayerProps {
  className?: string;
}

export const MiniPlayer = ({ className = '' }: MiniPlayerProps) => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    formatTime
  } = usePlayer();

  const { logActivity } = useActivityTracking();
  const { stats, loadStats } = useGamification();
  const [_isDragging, setIsDragging] = useState(false);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const loadUserStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    loadUserStats();
  }, [loadStats]);

  useEffect(() => {
    if (currentTrack && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'mini_player', action: 'track_loaded', trackId: currentTrack.item_code }
      });
    }
  }, [currentTrack]);

  if (!currentTrack) {
    return null;
  }

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seek(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg ${className}`}>
      <div className="flex items-center gap-4 p-4">
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
              <div className="text-xs font-mono">{currentTrack.item_code}</div>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium truncate">{currentTrack.title}</h4>
              <p className="text-sm text-muted-foreground">
                {currentTrack.item_code} • Rang {currentTrack.type.replace('rang_', '').toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8"
              disabled
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="sm"
              className="h-10 w-10 rounded-full"
              onClick={isPlaying ? pause : play}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8"
              disabled
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1">
              <Slider
                value={[progress]}
                onValueChange={handleProgressChange}
                max={100}
                step={0.1}
                className="cursor-pointer"
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={() => setIsDragging(false)}
              />
            </div>
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <div className="w-20">
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Gamification Stats */}
        {stats && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
            <div className="flex items-center gap-1 text-warning">
              <Flame className="h-3 w-3" />
              <span className="text-xs font-bold">{stats.currentStreak}</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center gap-1 text-primary">
              <Star className="h-3 w-3" />
              <span className="text-xs font-bold">Nv.{stats.level}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};