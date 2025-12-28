import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { generateComprehensiveLyrics, generateMixedLyrics } from '@/utils/generateComprehensiveLyrics';
import { useSunoPolling } from './useSunoPolling';
import { useSunoCallbackListener } from './useSunoCallbackListener';

export const useParolesMusicales = (
  paroles: string[] = [], 
  itemData?: { 
    paroles_rang_a?: string[], 
    paroles_rang_b?: string[], 
    paroles_rang_ab?: string[],
    item_code?: string 
  }
) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('lofi-piano');
  const [musicDuration, setMusicDuration] = useState<number>(240);
  const { toast } = useToast();

  const {
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    generateMusicInLanguage,
    currentLanguage
  } = useMusicGenerationWithTranslation();

  const { startPolling, completedAudio: pollingAudio, pollingTracks } = useSunoPolling();
  const { completedAudio: callbackAudio } = useSunoCallbackListener();

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

  // Fusionner l'audio des différentes sources
  const mergedGeneratedAudio = {
    ...generatedAudio,
    rangA: pollingAudio.A || callbackAudio.A || generatedAudio.rangA,
    rangB: pollingAudio.B || callbackAudio.B || generatedAudio.rangB,
    rangAB: pollingAudio.AB || callbackAudio.AB || generatedAudio.rangAB,
  };

  
  const handleGenerate = async (rang: 'A' | 'B') => {
    if (!itemData?.item_code) {
      toast({
        title: "Erreur de génération",
        description: "Code item manquant pour la génération complète",
        variant: "destructive"
      });
      return;
    }

    try {
      // Générer les paroles complètes avec assonances et toutes les compétences
      const parolesCompletes = await generateComprehensiveLyrics(itemData.item_code, rang);
      
      if (parolesCompletes.length === 0) {
        throw new Error('Aucune parole générée');
      }

      // Toast de démarrage avec détails
      toast({
        title: `🎵 Génération ${rang} lancée`,
        description: `${parolesCompletes.length} vers avec assonances - ${itemData.item_code}`,
      });

      // Appel génération musicale avec les paroles complètes
      const trackId = await generateMusicInLanguage(rang, parolesCompletes, selectedStyle, musicDuration);
      
      // Toast de succès pour le démarrage
      toast({
        title: `🎵 ${itemData.item_code} Rang ${rang} en cours...`,
        description: `La génération a été lancée, l'audio sera disponible dans quelques minutes`,
      });
      
      // Démarrer le polling pour ce trackId
      if (trackId) {
        startPolling(trackId, rang, itemData.item_code);
      }
      
    } catch {
      toast({
        title: "❌ Échec génération complète",
        description: `Impossible de générer ${itemData.item_code} Rang ${rang} avec toutes les compétences`,
        variant: "destructive"
      });
    }
  };

  const handleGenerateMix = async () => {
    if (!itemData?.item_code) {
      toast({
        title: "Erreur génération Mix",
        description: "Code item manquant pour la génération Mix complète",
        variant: "destructive"
      });
      return;
    }

    try {
      // Générer les paroles mixtes avec toutes les compétences A+B
      const parolesMix = await generateMixedLyrics(itemData.item_code);
      
      if (parolesMix.length === 0) {
        throw new Error('Aucune parole Mix générée');
      }

      // Toast de démarrage
      toast({
        title: `🎵 Génération Mix A+B lancée`,
        description: `${parolesMix.length} vers - Fusion complète ${itemData.item_code}`,
      });

      // Durée adaptée pour le mix (plus long pour inclure A+B)
      const mixDuration = Math.max(musicDuration, 300); // Minimum 5 minutes pour le mix A+B
      
      await generateMusicInLanguage('AB' as any, parolesMix, selectedStyle, mixDuration);
      
      // Toast de succès
      toast({
        title: `🎉 ${itemData.item_code} Mix A+B généré !`,
        description: `Fusion Rang A et B complète - ${Math.floor(mixDuration/60)}min${mixDuration%60}s`,
      });
      
    } catch {
      toast({
        title: "❌ Échec génération Mix",
        description: `Impossible de générer ${itemData.item_code} Mix A+B complet`,
        variant: "destructive"
      });
    }
  };

  const isValidAudioUrl = (audioUrl: string): boolean => {
    if (!audioUrl) return false;
    return audioUrl.startsWith('/') || audioUrl.startsWith('http://') || audioUrl.startsWith('https://');
  };

  const handlePlayAudio = (audioUrl: string, title: string) => {
    // Bloquer les URLs de simulation non fonctionnelles
    if (audioUrl.includes('soundjay.com') || audioUrl.includes('fail-buzzer')) {
      toast({
        title: "Mode simulation",
        description: "Aucun audio généré disponible. Veuillez d'abord générer de la musique.",
        variant: "default"
      });
      return;
    }

    if (!audioUrl || !isValidAudioUrl(audioUrl)) {
      return;
    }

    if (currentTrack?.url === audioUrl && isPlaying) {
      pause();
    } else {
      try {
        play({
          url: audioUrl,
          title: title,
          rang: audioUrl.includes('rangA') ? 'A' : audioUrl.includes('rangB') ? 'B' : 'AB'
        });
      } catch {
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire l'audio. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    }
  };

  return {
    selectedStyle,
    setSelectedStyle,
    musicDuration,
    setMusicDuration,
    isGenerating,
    generatedAudio: mergedGeneratedAudio,
    pollingTracks,
    generationProgress,
    lastError,
    currentLanguage,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    handleGenerate,
    handleGenerateMix,
    handlePlayAudio,
    seek,
    changeVolume,
    stop
  };
};
