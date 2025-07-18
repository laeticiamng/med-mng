
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Square } from 'lucide-react';

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
  onClose 
}: AudioPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    onSeek(value[0] || 0);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = (value[0] || 0) / 100;
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
    <div className="bg-white rounded-lg shadow-lg p-6 border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-900 truncate">
          {title}
        </h3>
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-amber-600 hover:text-amber-800"
          >
            ✕
          </Button>
        )}
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-amber-600 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || 0)}</span>
        </div>
      </div>

      {/* Contrôles principaux */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          onClick={skipBackward}
          variant="outline"
          size="sm"
          className="border-amber-300 text-amber-600 hover:bg-amber-50"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          onClick={onPlayPause}
          className="bg-amber-600 hover:bg-amber-700 text-white w-12 h-12 rounded-full"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>

        <Button
          onClick={onStop}
          variant="outline"
          size="sm"
          className="border-amber-300 text-amber-600 hover:bg-amber-50"
        >
          <Square className="h-4 w-4" />
        </Button>

        <Button
          onClick={skipForward}
          variant="outline"
          size="sm"
          className="border-amber-300 text-amber-600 hover:bg-amber-50"
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
            className="text-amber-600 hover:bg-amber-50"
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
          <span className="text-xs text-amber-600 w-8">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
