
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
      <h3 className="font-semibold">Paroles disponibles pour génération musicale Suno :</h3>
      
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

      {paroles[0] && paroles[1] && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            🎵 Section Combinée Rang A+B - Fusion des compétences
          </h4>
          <ParolesMusicalesRangSection
            rang="A"
            paroles={`${paroles[0]}\n\n--- TRANSITION RANG B ---\n\n${paroles[1]}`}
            musicDuration={musicDuration * 1.5} // Durée augmentée pour la fusion
            selectedStyle={selectedStyle}
            isGenerating={isGenerating.rangA || isGenerating.rangB}
            generatedAudio={undefined} // Pas encore d'audio combiné
            itemCode={`${itemCode}-FUSION`}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onGenerate={() => {
              // Pour l'instant, générer le Rang A puis B
              onGenerate('A');
              setTimeout(() => onGenerate('B'), 1000);
            }}
            onPlayAudio={onPlayAudio}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onStop={onStop}
            generationProgress={generationProgress?.rangA}
            title="Musique Complète A+B"
          />
          <p className="text-blue-600 text-sm mt-2">
            ✨ Cette section combine les compétences Rang A et Rang B pour une expérience musicale complète de {itemCode}
          </p>
        </div>
      )}
    </div>
  );
};
