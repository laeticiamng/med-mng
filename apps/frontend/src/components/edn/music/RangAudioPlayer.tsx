
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer';

interface RangAudioPlayerProps {
  rang: 'A' | 'B';
  generatedAudio: string;
  itemCode: string;
  currentTrack: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  musicDuration: number;
  onPlayAudio: (audioUrl: string, title: string) => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
}

export const RangAudioPlayer: React.FC<RangAudioPlayerProps> = ({
  rang,
  generatedAudio,
  itemCode,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  musicDuration,
  onPlayAudio,
  onSeek,
  onVolumeChange,
  onStop
}) => {
  return (
    <div className="mt-4 space-y-2">
      {/* Bouton de test simple */}
      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
        <Button
          onClick={() => onPlayAudio(generatedAudio, `Rang ${rang} - ${itemCode}`)}
          className="flex items-center gap-2"
        >
          {currentTrack?.url === generatedAudio && isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Test Audio Suno {rang}
        </Button>
        <span className="text-sm text-gray-600">
          {currentTrack?.url === generatedAudio && isPlaying ? '🎵 En cours...' : '⏸️ Prêt'}
        </span>
      </div>
      
      <AudioPlayer
        audioUrl={generatedAudio}
        title={`Suno Rang ${rang} - ${itemCode}`}
        isPlaying={currentTrack?.url === generatedAudio && isPlaying}
        currentTime={currentTrack?.url === generatedAudio ? currentTime : 0}
        duration={currentTrack?.url === generatedAudio ? duration : musicDuration}
        volume={volume}
        onPlayPause={() => onPlayAudio(generatedAudio, `Rang ${rang} - ${itemCode}`)}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        onStop={onStop}
      />
    </div>
  );
};
