
import { Card } from '@/components/ui/card';
import { AudioPlayer } from '../AudioPlayer';
import { MusicLoadingIndicator } from './MusicLoadingIndicator';
import { MusicCardHeader } from './MusicCardHeader';
import { MissingParolesWarning } from './MissingParolesWarning';
import { ParolesDisplay } from './ParolesDisplay';
import { GenerateButton } from './GenerateButton';
import { MinimizedPlayerButton } from './MinimizedPlayerButton';
import { useMusicCardState } from './hooks/useMusicCardState';
import { formatParoles, hasValidParoles } from './utils/parolesFormatter';
import { getCardStyling } from './utils/cardStyling';

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
  onMinimize
}: MusicCardProps) => {
  const { isClicked, handleGenerateClick } = useMusicCardState(isGenerating);
  const styling = getCardStyling(rang);
  const parolesArray = formatParoles(paroles);
  const hasValidParolesData = hasValidParoles(parolesArray);
  const isButtonDisabled = isGenerating || isClicked || !selectedStyle || !hasValidParolesData;

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

      <Card className={`p-8 bg-gradient-to-br ${styling.gradientFrom} ${styling.gradientTo} ${styling.borderColor} shadow-xl ${isGenerating ? 'opacity-75' : ''}`}>
        <MusicCardHeader 
          title={title}
          iconColor={styling.iconColor}
          textColor={styling.textColor}
        />
        
        <MissingParolesWarning isVisible={!hasValidParolesData} />
        
        <ParolesDisplay 
          parolesArray={parolesArray}
          rang={rang}
          textColor={styling.textColor}
        />

        <div className="space-y-4">
          <GenerateButton
            rang={rang}
            isGenerating={isGenerating}
            isDisabled={isButtonDisabled}
            musicDuration={musicDuration}
            buttonColor={styling.buttonColor}
            onGenerate={onGenerateClick}
          />
          
          {!hasValidParolesData && (
            <p className="text-center text-sm text-gray-600">
              La génération nécessite des paroles valides depuis la base de données Supabase.
            </p>
          )}
          
          {generatedAudio && !isMinimized && (
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
          )}

          <MinimizedPlayerButton
            rang={rang}
            isVisible={!!(generatedAudio && isMinimized && isCurrentTrack)}
            onMinimize={onMinimize}
          />
        </div>
      </Card>
    </div>
  );
};
