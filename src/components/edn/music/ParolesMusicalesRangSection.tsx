
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer';

interface ParolesMusicalesRangSectionProps {
  rang: 'A' | 'B';
  paroles: string;
  musicDuration: number;
  isGenerating: boolean;
  generatedAudio?: string;
  itemCode: string;
  currentTrack: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onGenerate: () => void;
  onPlayAudio: (audioUrl: string, title: string) => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
}

export const ParolesMusicalesRangSection: React.FC<ParolesMusicalesRangSectionProps> = ({
  rang,
  paroles,
  musicDuration,
  isGenerating,
  generatedAudio,
  itemCode,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  onGenerate,
  onPlayAudio,
  onSeek,
  onVolumeChange,
  onStop
}) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const colors = {
    A: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      textLight: 'text-amber-700',
      button: 'bg-amber-600 hover:bg-amber-700'
    },
    B: {
      bg: 'bg-blue-50',
      border: 'border-blue-200', 
      text: 'text-blue-800',
      textLight: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const style = colors[rang];

  if (!paroles) return null;

  return (
    <div className={`border ${style.border} rounded-lg p-4 ${style.bg}`}>
      <h4 className={`font-medium ${style.text} mb-2`}>Rang {rang} :</h4>
      <p className={`text-sm ${style.textLight} whitespace-pre-wrap mb-4`}>
        {paroles.substring(0, 200)}
        {paroles.length > 200 && '...'}
      </p>
      
      <div className="space-y-3">
        <Button 
          className={`${style.button} text-white`}
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération Suno en cours...
            </>
          ) : (
            `Générer avec Suno Rang ${rang} (${formatDuration(musicDuration)})`
          )}
        </Button>

        {generatedAudio && (
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
        )}
      </div>
    </div>
  );
};
