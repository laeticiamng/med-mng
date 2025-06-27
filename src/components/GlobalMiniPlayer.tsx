
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Square, Maximize2 } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useState } from 'react';

export const GlobalMiniPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMinimized,
    pause,
    resume,
    stop,
    seek,
    changeVolume,
    maximize,
  } = useGlobalAudio();

  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    changeVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      changeVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      changeVolume(0);
      setIsMuted(true);
    }
  };

  const skipForward = () => {
    seek(Math.min(duration, currentTime + 10));
  };

  const skipBackward = () => {
    seek(Math.max(0, currentTime - 10));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Info piste */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-amber-900 truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-amber-600">
                Rang {currentTrack.rang}
              </p>
            </div>
          </div>

          {/* Contrôles centraux */}
          <div className="flex items-center gap-2">
            <Button
              onClick={skipBackward}
              variant="ghost"
              size="sm"
              className="text-amber-600 hover:bg-amber-50"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              onClick={handlePlayPause}
              className="bg-amber-600 hover:bg-amber-700 text-white w-10 h-10 rounded-full"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              onClick={stop}
              variant="ghost"
              size="sm"
              className="text-amber-600 hover:bg-amber-50"
            >
              <Square className="h-4 w-4" />
            </Button>

            <Button
              onClick={skipForward}
              variant="ghost"
              size="sm"
              className="text-amber-600 hover:bg-amber-50"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Barre de progression et volume */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs text-amber-600 whitespace-nowrap">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-amber-600 whitespace-nowrap">
                {formatTime(duration)}
              </span>
            </div>

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
                className="w-20"
              />
            </div>

            {isMinimized && (
              <Button
                onClick={maximize}
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:bg-amber-50"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
