
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Minimize2, Loader2 } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer';

interface MusicCardProps {
  rang: 'A' | 'B';
  title: string;
  paroles: string;
  selectedStyle: string;
  isGenerating: boolean;
  generatedAudio?: string;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  isMinimized: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onGenerateMusic: () => void;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
  onMinimize: () => void;
}

export const MusicCard = ({
  rang,
  title,
  paroles,
  selectedStyle,
  isGenerating,
  generatedAudio,
  isPlaying,
  isCurrentTrack,
  isMinimized,
  currentTime,
  duration,
  volume,
  onGenerateMusic,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onStop,
  onMinimize
}: MusicCardProps) => {
  const formatParoles = (text: string) => {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\n\n+/g, '\n\n')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const cardColor = rang === 'A' ? 'amber' : 'blue';
  const gradientFrom = rang === 'A' ? 'from-amber-50' : 'from-blue-50';
  const gradientTo = rang === 'A' ? 'to-orange-50' : 'to-indigo-50';
  const borderColor = rang === 'A' ? 'border-amber-300' : 'border-blue-300';
  const textColor = rang === 'A' ? 'text-amber-900' : 'text-blue-900';
  const iconColor = rang === 'A' ? 'text-amber-600' : 'text-blue-600';
  const buttonColor = rang === 'A' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700';

  return (
    <Card className={`p-8 bg-gradient-to-br ${gradientFrom} ${gradientTo} ${borderColor} shadow-xl`}>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Music className={`h-6 w-6 ${iconColor} mr-3`} />
          <h3 className={`text-2xl font-serif ${textColor} font-bold`}>
            {title}
          </h3>
        </div>
      </div>
      
      <div className={`prose prose-lg max-w-none ${textColor} mb-8`}>
        {formatParoles(paroles).map((ligne, index) => {
          if (ligne.startsWith('[') && ligne.endsWith(']')) {
            return (
              <div key={index} className={`text-xl font-bold ${rang === 'A' ? 'text-amber-800' : 'text-blue-800'} my-4 text-center`}>
                {ligne}
              </div>
            );
          }
          if (ligne.includes(' - ')) {
            return (
              <div key={index} className={`text-2xl font-bold ${textColor} mb-6 text-center border-b-2 ${rang === 'A' ? 'border-amber-300' : 'border-blue-300'} pb-3`}>
                {ligne}
              </div>
            );
          }
          return (
            <div key={index} className="text-lg leading-relaxed mb-2 italic font-medium">
              {ligne}
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <Button
            onClick={onGenerateMusic}
            disabled={isGenerating || !selectedStyle}
            className={`${buttonColor} text-white px-6 py-3`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération 4 min en cours...
              </>
            ) : (
              `Générer Musique Rang ${rang} (4 min)`
            )}
          </Button>
        </div>
        
        {generatedAudio && !isMinimized && (
          <AudioPlayer
            audioUrl={generatedAudio}
            title={title}
            isPlaying={isPlaying}
            currentTime={isCurrentTrack ? currentTime : 0}
            duration={isCurrentTrack ? duration : 240}
            volume={volume}
            onPlayPause={onPlayPause}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onStop={onStop}
            onClose={onMinimize}
          />
        )}

        {generatedAudio && isMinimized && isCurrentTrack && (
          <div className="text-center">
            <Button
              onClick={onMinimize}
              variant="outline"
              className={`${rang === 'A' ? 'border-amber-300 text-amber-600 hover:bg-amber-50' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}`}
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Lecteur minimisé - Continuer l'écoute
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
