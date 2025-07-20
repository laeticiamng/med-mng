
import { MusicLoadingIndicator } from './MusicLoadingIndicator';
import { MusicGenerationProgress } from './MusicGenerationProgress';
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
  generationProgress?: {
    progress: number;
    attempts: number;
    maxAttempts: number;
    estimatedTimeRemaining?: number;
  };
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
  itemCode,
  generationProgress
}: MusicCardProps) => {
  const { isClicked, handleGenerateClick } = useMusicCardState(isGenerating);

  const onGenerateClick = () => {
    handleGenerateClick(rang, onGenerateMusic);
  };

  return (
    <div className="space-y-4">
      <MusicLoadingIndicator 
        rang={rang}
        duration={musicDuration}
        isVisible={isGenerating && !generationProgress}
      />

      <MusicGenerationProgress
        rang={rang}
        progress={generationProgress?.progress || 0}
        attempts={generationProgress?.attempts || 0}
        maxAttempts={generationProgress?.maxAttempts || 12}
        estimatedTimeRemaining={generationProgress?.estimatedTimeRemaining}
        style={selectedStyle}
        isVisible={isGenerating && !!generationProgress}
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
