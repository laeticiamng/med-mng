import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedMusicGeneration } from '@/hooks/music/useOptimizedMusicGeneration';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';

export const useParolesMusicales = (
  paroles: string[] = [], 
  itemData?: { 
    paroles_rang_a?: string[], 
    paroles_rang_b?: string[], 
    paroles_rang_ab?: string[],
    item_code?: string 
  }
) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('clinical-hip-hop');
  const [musicDuration, setMusicDuration] = useState<number>(240);
  const { toast } = useToast();

  const {
    generateOptimizedMusic,
    generateBatch,
    isGenerating,
    progress,
    error: generationError,
    itemTracks,
    getTrackByRang,
    playTrackSmart,
    stats
  } = useOptimizedMusicGeneration({
    itemCode: itemData?.item_code
  });

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    seek,
    changeVolume,
    stop
  } = useGlobalAudio();

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
      await generateOptimizedMusic(rang, selectedStyle, musicDuration);
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION ${rang}:`, error);
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
      await generateOptimizedMusic('AB', selectedStyle, Math.max(musicDuration, 300));
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION MIX:`, error);
    }
  };

  const handlePlayAudio = (audioUrl: string, title: string) => {
    if (!audioUrl || audioUrl.includes('soundjay.com')) {
      toast({
        title: "Mode simulation",
        description: "Aucun audio généré disponible. Veuillez d'abord générer de la musique.",
        variant: "default"
      });
      return;
    }

    const track = itemTracks.find(t => t.audio_url === audioUrl);
    if (track) {
      playTrackSmart(track);
    }
  };

  return {
    selectedStyle,
    setSelectedStyle,
    musicDuration,
    setMusicDuration,
    isGenerating,
    generatedAudio: {
      rangA: getTrackByRang('A')?.audio_url,
      rangB: getTrackByRang('B')?.audio_url,
      rangAB: getTrackByRang('AB')?.audio_url
    },
    pollingTracks: itemTracks,
    generationProgress: progress,
    lastError: generationError,
    currentLanguage: 'fr',
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