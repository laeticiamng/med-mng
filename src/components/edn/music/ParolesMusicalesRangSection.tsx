
import React from 'react';
import { RangParolesDisplay } from './RangParolesDisplay';
import { RangGenerateButton } from './RangGenerateButton';
import { RangAudioPlayer } from './RangAudioPlayer';

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
      <RangParolesDisplay
        rang={rang}
        paroles={paroles}
        textColor={style.text}
      />
      
      <div className="space-y-3">
        <RangGenerateButton
          rang={rang}
          musicDuration={musicDuration}
          isGenerating={isGenerating}
          buttonColor={style.button}
          onGenerate={onGenerate}
        />

        {generatedAudio && (
          <RangAudioPlayer
            rang={rang}
            generatedAudio={generatedAudio}
            itemCode={itemCode}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            musicDuration={musicDuration}
            onPlayAudio={onPlayAudio}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onStop={onStop}
          />
        )}
      </div>
    </div>
  );
};
