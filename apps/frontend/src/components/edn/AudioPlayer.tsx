
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Square } from 'lucide-react';
import { AudioLoadingIndicator } from '@/components/ui/AudioLoadingIndicator';
import { useAudioBuffering } from '@/hooks/useAudioBuffering';

interface AudioPlayerProps {
  audioUrl: string;
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
}

export const AudioPlayer = ({ 
  audioUrl, 
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
  audioElement 
}: AudioPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  
  // Hook de buffering pour optimiser l'affichage
  const bufferingState = useAudioBuffering(audioElement || null);

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
        <h3 className="text-lg font-semibold text-warning truncate">
          {title}
        </h3>
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

      {/* Indicateur de chargement optimisé */}
      {(bufferingState.isBuffering || !bufferingState.readyToPlay) && (
        <div className="mb-4">
          <AudioLoadingIndicator
            isBuffering={bufferingState.isBuffering}
            bufferPercent={bufferingState.bufferPercent}
            readyToPlay={bufferingState.readyToPlay}
            estimatedLoadTime={bufferingState.estimatedLoadTime}
            onRetry={() => {
              console.log('🔄 Retry audio loading...');
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

      {/* Volume uniquement */}
      <div className="flex items-center justify-center">
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
            className="w-32"
          />
          <span className="text-xs text-warning w-8">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
