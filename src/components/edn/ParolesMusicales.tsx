
import { useState } from 'react';
import { MusicHeader } from './music/MusicHeader';
import { MusicStyleSelector } from './music/MusicStyleSelector';
import { MusicDurationSelector } from './music/MusicDurationSelector';
import { MusicErrorDisplay } from './music/MusicErrorDisplay';
import { MusicCardsSection } from './music/MusicCardsSection';
import { MusicStyleIndicator } from './music/MusicStyleIndicator';
import { useMusicGeneration } from '@/hooks/useMusicGeneration';
import { useAudioControls } from '@/hooks/useAudioControls';

interface ParolesMusicalesProps {
  paroles: string[];
}

export const ParolesMusicales = ({ paroles }: ParolesMusicalesProps) => {
  const [selectedStyle, setSelectedStyle] = useState('');
  const [musicDuration, setMusicDuration] = useState(240); // 4 minutes par défaut
  
  const { isGenerating, generatedAudio, lastError, generateMusic } = useMusicGeneration();
  
  const {
    currentTime,
    duration,
    volume,
    isMinimized,
    handlePlayPause,
    handleStop,
    isCurrentTrackPlaying,
    isCurrentTrack,
    seek,
    changeVolume,
    minimize
  } = useAudioControls();

  const musicStyles = [
    { value: 'lofi-piano', label: 'Lo-fi Piano Doux' },
    { value: 'afrobeat', label: 'Afrobeat Énergique' },
    { value: 'jazz-moderne', label: 'Jazz Moderne' },
    { value: 'hip-hop-conscient', label: 'Hip-Hop Conscient' },
    { value: 'soul-rnb', label: 'Soul R&B' },
    { value: 'electro-chill', label: 'Electro Chill' }
  ];

  const handleGenerateMusic = async (rang: 'A' | 'B') => {
    await generateMusic(rang, paroles, selectedStyle, musicDuration);
  };

  const handlePlayPauseWrapper = (rang: 'rangA' | 'rangB') => {
    handlePlayPause(rang, generatedAudio);
  };

  const isCurrentTrackPlayingWrapper = (rang: 'rangA' | 'rangB') => {
    return isCurrentTrackPlaying(rang, generatedAudio);
  };

  const isCurrentTrackWrapper = (rang: 'rangA' | 'rangB') => {
    return isCurrentTrack(rang, generatedAudio);
  };

  return (
    <div className="space-y-8">
      <MusicHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MusicStyleSelector 
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
          musicStyles={musicStyles}
        />
        
        <MusicDurationSelector
          duration={musicDuration}
          onDurationChange={setMusicDuration}
          disabled={isGenerating.rangA || isGenerating.rangB}
        />
      </div>

      {lastError && <MusicErrorDisplay error={lastError} />}

      <MusicCardsSection
        paroles={paroles}
        selectedStyle={selectedStyle}
        musicDuration={musicDuration}
        isGenerating={isGenerating}
        generatedAudio={generatedAudio}
        onGenerateMusic={handleGenerateMusic}
        onPlayPause={handlePlayPauseWrapper}
        isCurrentTrackPlaying={isCurrentTrackPlayingWrapper}
        isCurrentTrack={isCurrentTrackWrapper}
        isMinimized={isMinimized}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onSeek={seek}
        onVolumeChange={changeVolume}
        onStop={handleStop}
        onMinimize={minimize}
      />

      <MusicStyleIndicator selectedStyle={selectedStyle} musicStyles={musicStyles} />
    </div>
  );
};
