
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { MusicHeader } from './music/MusicHeader';
import { MusicStyleSelector } from './music/MusicStyleSelector';
import { MusicErrorDisplay } from './music/MusicErrorDisplay';
import { MusicCard } from './music/MusicCard';
import { MusicStyleIndicator } from './music/MusicStyleIndicator';

interface ParolesMusicalesProps {
  paroles: string[];
}

export const ParolesMusicales = ({ paroles }: ParolesMusicalesProps) => {
  const [isGenerating, setIsGenerating] = useState<{ rangA: boolean; rangB: boolean }>({
    rangA: false,
    rangB: false
  });
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<{ rangA?: string; rangB?: string }>({});
  const [lastError, setLastError] = useState<string>('');
  const { toast } = useToast();
  
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

  const musicStyles = [
    { value: 'lofi-piano', label: 'Lo-fi Piano Doux' },
    { value: 'afrobeat', label: 'Afrobeat Énergique' },
    { value: 'jazz-moderne', label: 'Jazz Moderne' },
    { value: 'hip-hop-conscient', label: 'Hip-Hop Conscient' },
    { value: 'soul-rnb', label: 'Soul R&B' },
    { value: 'electro-chill', label: 'Electro Chill' }
  ];

  const generateMusic = async (rang: 'A' | 'B') => {
    if (!selectedStyle) {
      toast({
        title: "Style musical requis",
        description: "Veuillez sélectionner un style musical avant de générer la musique.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(prev => ({ ...prev, [rang === 'A' ? 'rangA' : 'rangB']: true }));
    setLastError('');
    const parolesIndex = rang === 'A' ? 0 : 1;
    const parolesText = paroles[parolesIndex];

    try {
      console.log(`Génération musique Rang ${rang} avec style ${selectedStyle} - Durée: 4 minutes`);
      
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          lyrics: parolesText,
          style: selectedStyle,
          rang: rang
        }
      });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(error.message || 'Erreur lors de l\'appel à la fonction');
      }

      if (data.status === 'error') {
        setLastError(data.error);
        throw new Error(data.error);
      }

      const audioKey = rang === 'A' ? 'rangA' : 'rangB';
      setGeneratedAudio(prev => ({
        ...prev,
        [audioKey]: data.audioUrl
      }));

      toast({
        title: `Musique Rang ${rang} générée`,
        description: "Chanson de 4 minutes générée avec succès !",
      });

      console.log(`Musique 4 minutes générée avec succès:`, data.audioUrl);
    } catch (error) {
      console.error('Erreur génération musique:', error);
      setLastError(error.message);
      toast({
        title: "Erreur de génération",
        description: error.message || "Impossible de générer la musique. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(prev => ({ ...prev, [rang === 'A' ? 'rangA' : 'rangB']: false }));
    }
  };

  const handlePlayPause = (rang: 'rangA' | 'rangB') => {
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

  const isCurrentTrackPlaying = (rang: 'rangA' | 'rangB') => {
    const audioUrl = generatedAudio[rang];
    return currentTrack?.url === audioUrl && isPlaying;
  };

  const isCurrentTrack = (rang: 'rangA' | 'rangB') => {
    const audioUrl = generatedAudio[rang];
    return currentTrack?.url === audioUrl;
  };

  return (
    <div className="space-y-8">
      <MusicHeader />
      
      <MusicStyleSelector 
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
        musicStyles={musicStyles}
      />

      {lastError && <MusicErrorDisplay error={lastError} />}

      <MusicCard
        rang="A"
        title="Chanson Rang A - "Colloque Singulier" (4 minutes)"
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
        onGenerateMusic={() => generateMusic('A')}
        onPlayPause={() => handlePlayPause('rangA')}
        onSeek={seek}
        onVolumeChange={changeVolume}
        onStop={handleStop}
        onMinimize={minimize}
      />

      <MusicCard
        rang="B"
        title="Chanson Rang B - "Outils Pratiques" (4 minutes)"
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
        onGenerateMusic={() => generateMusic('B')}
        onPlayPause={() => handlePlayPause('rangB')}
        onSeek={seek}
        onVolumeChange={changeVolume}
        onStop={handleStop}
        onMinimize={minimize}
      />

      <MusicStyleIndicator selectedStyle={selectedStyle} musicStyles={musicStyles} />
    </div>
  );
};
