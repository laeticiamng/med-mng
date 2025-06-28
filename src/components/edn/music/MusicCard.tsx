
import { MusicLoadingIndicator } from './MusicLoadingIndicator';
import { MusicCardContent } from './MusicCardContent';
import { MusicCardActions } from './MusicCardActions';
import { MusicCardPlayer } from './MusicCardPlayer';
import { MinimizedPlayerButton } from './MinimizedPlayerButton';
import { useMusicCardState } from './hooks/useMusicCardState';

interface MusicCardProps {
  rang: 'A' | 'B';
  title: string;
  paroles: string;
  selectedStyle: string;
  musicDuration: number;
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
  itemCode?: string;
}

export const MusicCard = ({
  rang,
  title,
  paroles,
  selectedStyle,
  musicDuration,
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
  onMinimize,
  itemCode
}: MusicCardProps) => {
  const { isClicked, handleGenerateClick } = useMusicCardState(isGenerating);

  const onGenerateClick = () => {
    handleGenerateClick(rang, onGenerateMusic);
  };

  return (
    <div>
      <MusicLoadingIndicator 
        rang={rang}
        duration={musicDuration}
        isVisible={isGenerating}
      />

      <MusicCardContent
        rang={rang}
        title={title}
        paroles={paroles}
        isGenerating={isGenerating}
      >
        <MusicCardActions
          rang={rang}
          paroles={paroles}
          selectedStyle={selectedStyle}
          musicDuration={musicDuration}
          isGenerating={isGenerating}
          isClicked={isClicked}
          onGenerate={onGenerateClick}
        />
        
        <MusicCardPlayer
          generatedAudio={generatedAudio || ''}
          title={title}
          rang={rang}
          selectedStyle={selectedStyle}
          itemCode={itemCode}
          isPlaying={isPlaying}
          isCurrentTrack={isCurrentTrack}
          isMinimized={isMinimized}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          musicDuration={musicDuration}
          onPlayPause={onPlayPause}
          onSeek={onSeek}
          onVolumeChange={onVolumeChange}
          onStop={onStop}
          onMinimize={onMinimize}
        />

        <MinimizedPlayerButton
          rang={rang}
          isVisible={!!(generatedAudio && isMinimized && isCurrentTrack)}
          onMinimize={onMinimize}
        />
      </MusicCardContent>
    </div>
  );
};
