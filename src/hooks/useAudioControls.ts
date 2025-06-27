
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';

export const useAudioControls = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMinimized,
    play,
    pause,
    resume,
    stop,
    seek,
    changeVolume,
    minimize,
  } = useGlobalAudio();

  const handlePlayPause = (rang: 'rangA' | 'rangB', generatedAudio: { rangA?: string; rangB?: string }) => {
    const audioUrl = generatedAudio[rang];
    if (!audioUrl) return;

    const trackTitle = rang === 'rangA' 
      ? 'Chanson Rang A - Colloque Singulier (4 min)'
      : 'Chanson Rang B - Outils Pratiques (4 min)';

    const track = {
      url: audioUrl,
      title: trackTitle,
      rang: rang === 'rangA' ? 'A' as const : 'B' as const
    };

    if (currentTrack?.url === audioUrl) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      play(track);
    }
  };

  const handleStop = () => {
    stop();
  };

  const isCurrentTrackPlaying = (rang: 'rangA' | 'rangB', generatedAudio: { rangA?: string; rangB?: string }) => {
    const audioUrl = generatedAudio[rang];
    return currentTrack?.url === audioUrl && isPlaying;
  };

  const isCurrentTrack = (rang: 'rangA' | 'rangB', generatedAudio: { rangA?: string; rangB?: string }) => {
    const audioUrl = generatedAudio[rang];
    return currentTrack?.url === audioUrl;
  };

  return {
    currentTrack,
    isPlaying,
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
  };
};
