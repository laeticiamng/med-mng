
import { MusicCard } from './MusicCard';

interface MusicCardsSectionProps {
  paroles: string[];
  selectedStyle: string;
  musicDuration: number;
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
  musicDuration,
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
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <MusicCard
        rang="A"
        title={`Chanson Rang A - Colloque Singulier (${formatDuration(musicDuration)})`}
        paroles={paroles[0] || 'Aucune parole disponible pour le Rang A'}
        selectedStyle={selectedStyle}
        musicDuration={musicDuration}
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
        title={`Chanson Rang B - Outils Pratiques (${formatDuration(musicDuration)})`}
        paroles={paroles[1] || 'Aucune parole disponible pour le Rang B'}
        selectedStyle={selectedStyle}
        musicDuration={musicDuration}
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
    </div>
  );
};
