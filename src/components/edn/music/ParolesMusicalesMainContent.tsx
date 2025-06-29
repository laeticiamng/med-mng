
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ParolesMusicalesRangSection } from './ParolesMusicalesRangSection';

interface ParolesMusicalesMainContentProps {
  paroles: string[];
  itemCode: string;
  musicDuration: number;
  selectedStyle: string; // Add this prop
  isGenerating: { rangA: boolean; rangB: boolean };
  generatedAudio: { rangA?: string; rangB?: string };
  currentTrack: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  generationProgress?: {
    rangA?: {
      progress: number;
      attempts: number;
      maxAttempts: number;
      estimatedTimeRemaining?: number;
    };
    rangB?: {
      progress: number;
      attempts: number;
      maxAttempts: number;
      estimatedTimeRemaining?: number;
    };
  };
  onGenerate: (rang: 'A' | 'B') => void;
  onPlayAudio: (audioUrl: string, title: string) => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
}

export const ParolesMusicalesMainContent: React.FC<ParolesMusicalesMainContentProps> = ({
  paroles,
  itemCode,
  musicDuration,
  selectedStyle,
  isGenerating,
  generatedAudio,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  generationProgress,
  onGenerate,
  onPlayAudio,
  onSeek,
  onVolumeChange,
  onStop
}) => {
  if (!paroles || paroles.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Aucune parole disponible</span>
        </div>
        <p className="text-yellow-700 mt-2">
          Cet item ne contient pas encore de paroles musicales pour Suno.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Paroles disponibles pour Suno :</h3>
      
      {paroles[0] && (
        <ParolesMusicalesRangSection
          rang="A"
          paroles={paroles[0]}
          musicDuration={musicDuration}
          selectedStyle={selectedStyle}
          isGenerating={isGenerating.rangA}
          generatedAudio={generatedAudio.rangA}
          itemCode={itemCode}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          onGenerate={() => onGenerate('A')}
          onPlayAudio={onPlayAudio}
          onSeek={onSeek}
          onVolumeChange={onVolumeChange}
          onStop={onStop}
          generationProgress={generationProgress?.rangA}
        />
      )}

      {paroles[1] && (
        <ParolesMusicalesRangSection
          rang="B"
          paroles={paroles[1]}
          musicDuration={musicDuration}
          selectedStyle={selectedStyle}
          isGenerating={isGenerating.rangB}
          generatedAudio={generatedAudio.rangB}
          itemCode={itemCode}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          onGenerate={() => onGenerate('B')}
          onPlayAudio={onPlayAudio}
          onSeek={onSeek}
          onVolumeChange={onVolumeChange}
          onStop={onStop}
          generationProgress={generationProgress?.rangB}
        />
      )}
    </div>
  );
};
