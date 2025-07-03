import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';

export const useEnhancedParolesMusicales = (paroles: string[] = []) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('lofi-piano');
  const [musicDuration, setMusicDuration] = useState<number>(240);
  const [selectedVersion, setSelectedVersion] = useState<'A' | 'B' | 'AB'>('A');
  const { toast } = useToast();

  const {
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    generateMusicInLanguage,
    currentLanguage
  } = useMusicGenerationWithTranslation();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    seek,
    changeVolume,
    stop
  } = useGlobalAudio();

  // Génération des paroles combinées pour la version A+B
  const generateCombinedLyrics = (): string[] => {
    if (!paroles || paroles.length < 2) {
      return paroles || [];
    }

    const combinedLyrics = `${paroles[0]}\n\n--- Transition ---\n\n${paroles[1]}`;
    return [...paroles, combinedLyrics];
  };

  const enhancedParoles = generateCombinedLyrics();

  const handleGenerate = async (version: 'A' | 'B' | 'AB') => {
    console.log(`🎵 GÉNÉRATION DEMANDÉE - Version ${version}`);
    
    const parolesIndex = version === 'A' ? 0 : version === 'B' ? 1 : 2;
    
    if (!enhancedParoles[parolesIndex]) {
      console.error(`❌ AUCUNE PAROLE POUR LA VERSION ${version}`);
      toast({
        title: "Paroles manquantes",
        description: `Aucune parole disponible pour la version ${version}`,
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🚀 APPEL generateMusicInLanguage...');
      const rang = version === 'AB' ? 'A' : version; // Utiliser 'A' pour la version combinée
      const audioUrl = await generateMusicInLanguage(rang, [enhancedParoles[parolesIndex]], selectedStyle, musicDuration);
      console.log(`✅ GÉNÉRATION TERMINÉE POUR VERSION ${version}, URL:`, audioUrl);
      
      // Stocker l'URL audio dans le bon emplacement selon la version
      if (version === 'AB') {
        // Pour A+B, stocker dans rangAB (sera géré par le hook de génération)
        console.log('🎵 Audio AB généré:', audioUrl);
      }
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION VERSION ${version}:`, error);
      toast({
        title: "Erreur de génération",
        description: `Impossible de générer la version ${version}`,
        variant: "destructive"
      });
    }
  };

  const handlePlayAudio = (audioUrl: string, title: string) => {
    if (!audioUrl) {
      console.error('❌ URL AUDIO MANQUANTE');
      return;
    }

    if (currentTrack?.url === audioUrl && isPlaying) {
      pause();
    } else {
        play({
          url: audioUrl,
          title: title,
          rang: selectedVersion === 'AB' ? 'A' : selectedVersion
        });
    }
  };

  // Organiser les audios générés par version
  const organizedAudio = {
    rangA: generatedAudio.rangA,
    rangB: generatedAudio.rangB,
    rangAB: generatedAudio.rangA // Utiliser rangA pour AB, sera corrigé lors de la génération AB
  };

  return {
    selectedStyle,
    setSelectedStyle,
    musicDuration,
    setMusicDuration,
    selectedVersion,
    setSelectedVersion,
    isGenerating,
    generatedAudio: organizedAudio,
    generationProgress,
    lastError,
    currentLanguage,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    enhancedParoles,
    handleGenerate,
    handlePlayAudio,
    seek,
    changeVolume,
    stop
  };
};