
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Download, SkipBack, SkipForward } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  onClose?: () => void;
}

export const AudioPlayer = ({ audioUrl, title, onClose }: AudioPlayerProps) => {
  const { isPlaying, currentTime, duration, play, pause, seek } = useAudioPlayer();
  const [volume, setVolume] = useState(0.8);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play(audioUrl);
    }
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          onClick={() => seek(Math.max(0, currentTime - 10))}
          variant="outline"
          size="sm"
          className="border-amber-300 text-amber-600 hover:bg-amber-50"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          onClick={handlePlayPause}
          className="bg-amber-600 hover:bg-amber-700 text-white w-12 h-12 rounded-full"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>

        <Button
          onClick={() => seek(Math.min(duration, currentTime + 10))}
          variant="outline"
          size="sm"
          className="border-amber-300 text-amber-600 hover:bg-amber-50"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume et téléchargement */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Volume2 className="h-4 w-4 text-amber-600" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0] / 100)}
            className="w-20"
          />
        </div>

        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="border-amber-300 text-amber-600 hover:bg-amber-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
      </div>
    </div>
  );
};
