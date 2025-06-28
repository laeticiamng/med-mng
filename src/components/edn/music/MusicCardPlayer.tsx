
import { AudioPlayer } from '../AudioPlayer';
import { SaveMusicButton } from './SaveMusicButton';

interface MusicCardPlayerProps {
  generatedAudio: string;
  title: string;
  rang: 'A' | 'B';
  selectedStyle: string;
  itemCode?: string;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  isMinimized: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  musicDuration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
  onMinimize: () => void;
}

export const MusicCardPlayer = ({
  generatedAudio,
  title,
  rang,
  selectedStyle,
  itemCode,
  isPlaying,
  isCurrentTrack,
  isMinimized,
  currentTime,
  duration,
  volume,
  musicDuration,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onStop,
  onMinimize
}: MusicCardPlayerProps) => {
  if (!generatedAudio || isMinimized) {
    return null;
  }

  return (
    <div className="space-y-3">
      <AudioPlayer
        audioUrl={generatedAudio}
        title={title}
        isPlaying={isPlaying}
        currentTime={isCurrentTrack ? currentTime : 0}
        duration={isCurrentTrack ? duration : musicDuration}
        volume={volume}
        onPlayPause={onPlayPause}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        onStop={onStop}
        onClose={onMinimize}
      />
      
      <SaveMusicButton
        audioUrl={generatedAudio}
        title={title}
        rang={rang}
        style={selectedStyle}
        itemCode={itemCode}
        isVisible={true}
      />
    </div>
  );
};
