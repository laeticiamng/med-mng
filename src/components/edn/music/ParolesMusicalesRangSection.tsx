
import React from 'react';
import { MusicCard } from './MusicCard';

interface ParolesMusicalesRangSectionProps {
  rang: 'A' | 'B';
  paroles: string;
  musicDuration: number;
  isGenerating: boolean;
  generatedAudio?: string;
  itemCode?: string;
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
  generationProgress?: {
    progress: number;
    attempts: number;
    maxAttempts: number;
    estimatedTimeRemaining?: number;
  };
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
  onStop,
  generationProgress
}) => {
  const title = `Musique Rang ${rang}`;
  const selectedStyle = 'lofi-piano'; // Style par défaut, peut être modifié
  
  const isCurrentTrack = currentTrack?.url === generatedAudio;
  const isMinimized = false; // Peut être géré par un état parent si nécessaire

  const handlePlayPause = () => {
    if (generatedAudio) {
      onPlayAudio(generatedAudio, title);
    }
  };

  const handleMinimize = () => {
    // Logique de minimisation si nécessaire
  };

  return (
    <MusicCard
      rang={rang}
      title={title}
      paroles={paroles}
      selectedStyle={selectedStyle}
      musicDuration={musicDuration}
      isGenerating={isGenerating}
      generatedAudio={generatedAudio}
      isPlaying={isPlaying}
      isCurrentTrack={isCurrentTrack}
      isMinimized={isMinimized}
      currentTime={currentTime}
      duration={duration}
      volume={volume}
      onGenerateMusic={onGenerate}
      onPlayPause={handlePlayPause}
      onSeek={onSeek}
      onVolumeChange={onVolumeChange}
      onStop={onStop}
      onMinimize={handleMinimize}
      itemCode={itemCode}
      generationProgress={generationProgress}
    />
  );
};
