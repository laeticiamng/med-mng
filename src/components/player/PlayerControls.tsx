import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
  ListMusic,
  Download
} from 'lucide-react';
import { DownloadButton } from '@/components/library/DownloadButton';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  repeatMode: 'none' | 'one' | 'all';
  onRepeatModeChange: () => void;
  isShuffled: boolean;
  onShuffleToggle: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onAddToPlaylist?: () => void;
  audioUrl?: string;
  title?: string;
  hasPrevious?: boolean;
  hasNext?: boolean;
  showAdvanced?: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
  repeatMode,
  onRepeatModeChange,
  isShuffled,
  onShuffleToggle,
  isFavorite = false,
  onFavoriteToggle,
  onAddToPlaylist,
  audioUrl,
  title,
  hasPrevious = true,
  hasNext = true,
  showAdvanced = true
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Format time (seconds to MM:SS)
  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle seek from slider
  const handleSeek = useCallback((values: number[]) => {
    const seekTime = (values[0] / 100) * duration;
    onSeek(seekTime);
  }, [duration, onSeek]);

  // Get repeat icon and label
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one': return <Repeat1 className="h-4 w-4" />;
      case 'all': return <Repeat className="h-4 w-4" />;
      default: return <Repeat className="h-4 w-4 opacity-50" />;
    }
  };

  const getRepeatLabel = () => {
    switch (repeatMode) {
      case 'one': return 'Répéter 1';
      case 'all': return 'Répéter tout';
      default: return 'Répéter off';
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <Slider
          value={[progress]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="w-full cursor-pointer"
          aria-label="Position de lecture"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main controls */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {/* Shuffle */}
        {showAdvanced && (
          <Button
            variant={isShuffled ? 'secondary' : 'ghost'}
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={onShuffleToggle}
            title={isShuffled ? 'Aléatoire ON' : 'Aléatoire OFF'}
          >
            <Shuffle className={`h-4 w-4 ${isShuffled ? 'text-primary' : 'opacity-50'}`} />
          </Button>
        )}

        {/* Previous */}
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={onPrevious}
          disabled={!hasPrevious}
          title="Précédent"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        {/* Play/Pause */}
        <Button
          variant="default"
          size="icon"
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          onClick={onPlayPause}
          title={isPlaying ? 'Pause' : 'Lecture'}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Play className="h-6 w-6 text-primary-foreground ml-1" />
          )}
        </Button>

        {/* Next */}
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={onNext}
          disabled={!hasNext}
          title="Suivant"
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        {/* Repeat */}
        {showAdvanced && (
          <Button
            variant={repeatMode !== 'none' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={onRepeatModeChange}
            title={getRepeatLabel()}
          >
            {getRepeatIcon()}
          </Button>
        )}
      </div>

      {/* Secondary controls */}
      <div className="flex items-center justify-between">
        {/* Volume control */}
        <div 
          className="flex items-center gap-2"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onMuteToggle}
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <div className={`
            overflow-hidden transition-all duration-200
            ${showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'}
          `}>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={(values) => onVolumeChange(values[0] / 100)}
              max={100}
              step={1}
              className="w-24"
              aria-label="Volume"
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1">
          {/* Favorite */}
          {onFavoriteToggle && (
            <Button
              variant={isFavorite ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9"
              onClick={onFavoriteToggle}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-destructive' : ''}`} />
            </Button>
          )}

          {/* Add to playlist */}
          {onAddToPlaylist && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onAddToPlaylist}
              title="Ajouter à une playlist"
            >
              <ListMusic className="h-4 w-4" />
            </Button>
          )}

          {/* Download */}
          {audioUrl && title && (
            <DownloadButton 
              audioUrl={audioUrl} 
              title={title}
              variant="ghost"
              size="icon"
            />
          )}
        </div>
      </div>

      {/* Status badges */}
      {showAdvanced && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {repeatMode !== 'none' && (
            <Badge variant="secondary" className="text-xs">
              {repeatMode === 'one' ? '🔂 Répéter 1' : '🔁 Répéter tout'}
            </Badge>
          )}
          {isShuffled && (
            <Badge variant="secondary" className="text-xs">
              🔀 Aléatoire
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
