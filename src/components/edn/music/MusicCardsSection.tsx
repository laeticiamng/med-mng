
import { MusicCard } from './MusicCard';

interface MusicCardsSectionProps {
  paroles: string[];
  selectedStyle: string;
  isGenerating: { rangA: boolean; rangB: boolean };
  generatedAudio: { rangA?: string; rangB?: string };
  onGenerateMusic: (rang: 'A' | 'B') => void;
  onPlayPause: (rang: 'rangA' | 'rangB') => void;
  isCurrentTrackPlaying: (rang: 'rangA' | 'rangB') => boolean;
  isCurrentTrack: (rang: 'rangA' | 'rangB') => boolean;
  isMinimized: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
  onMinimize: () => void;
}

export const MusicCardsSection = ({
  paroles,
  selectedStyle,
  isGenerating,
  generatedAudio,
  onGenerateMusic,
  onPlayPause,
  isCurrentTrackPlaying,
  isCurrentTrack,
  isMinimized,
  currentTime,
  duration,
  volume,
  onSeek,
  onVolumeChange,
  onStop,
  onMinimize
}: MusicCardsSectionProps) => {
  return (
    <>
      <MusicCard
        rang="A"
        title="Chanson Rang A - Colloque Singulier (4 minutes)"
        paroles={paroles[0]}
        selectedStyle={selectedStyle}
        isGenerating={isGenerating.rangA}
        generatedAudio={generatedAudio.rangA}
        isPlaying={isCurrentTrackPlaying('rangA')}
        isCurrentTrack={isCurrentTrack('rangA')}
        isMinimized={isMinimized}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onGenerateMusic={() => onGenerateMusic('A')}
        onPlayPause={() => onPlayPause('rangA')}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        onStop={onStop}
        onMinimize={onMinimize}
      />

      <MusicCard
        rang="B"
        title="Chanson Rang B - Outils Pratiques (4 minutes)"
        paroles={paroles[1]}
        selectedStyle={selectedStyle}
        isGenerating={isGenerating.rangB}
        generatedAudio={generatedAudio.rangB}
        isPlaying={isCurrentTrackPlaying('rangB')}
        isCurrentTrack={isCurrentTrack('rangB')}
        isMinimized={isMinimized}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onGenerateMusic={() => onGenerateMusic('B')}
        onPlayPause={() => onPlayPause('rangB')}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        onStop={onStop}
        onMinimize={onMinimize}
      />
    </>
  );
};
