// ==========================================
// MED-MNG OPTIMIZED MUSIC GENERATION - Hook unifié et optimisé
// ==========================================

import { useCallback, useMemo } from 'react';
import { useMusicGeneration } from './useMusicGeneration';
import { useSupabaseMusicTracks } from '../useSupabaseMusicTracks';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useToast } from '@/hooks/use-toast';
import { generateOptimizedLyrics, generateRangAB } from '@/utils/lyrics/generateOptimizedLyrics';
import type { GenerationRequest, MusicTrack, MusicGenerationProgress } from '@/types';

interface UseOptimizedMusicGenerationProps {
  itemCode?: string;
  onTrackGenerated?: (track: MusicTrack, rang: string) => void;
  onGenerationComplete?: (tracks: Record<string, MusicTrack>) => void;
}

export const useOptimizedMusicGeneration = (props: UseOptimizedMusicGenerationProps = {}) => {
  const { itemCode, onTrackGenerated, onGenerationComplete } = props;
  const { toast } = useToast();

  // Hooks principaux
  const musicGeneration = useMusicGeneration({
    onProgress: handleProgress,
    onSuccess: handleSuccess,
    onError: handleError
  });

  const { tracks: supabaseTracks, loading: tracksLoading } = useSupabaseMusicTracks();
  const { play, pause, currentTrack, isPlaying } = useGlobalAudio();

  // État dérivé pour les tracks filtrés par item
  const itemTracks = useMemo(() => {
    if (!itemCode) return [];
    return supabaseTracks.filter(track => 
      track.metadata?.item_code === itemCode ||
      (track as any).item_code === itemCode
    );
  }, [supabaseTracks, itemCode]);

  // Handlers optimisés
  function handleProgress(progress: MusicGenerationProgress) {
    console.log(`🎵 Progress ${progress.rang}: ${progress.progress}% - ${progress.stage}`);
  }

  function handleSuccess(track: MusicTrack) {
    console.log('🎉 Génération réussie:', track);
    onTrackGenerated?.(track, track.rang || 'Unknown');
  }

  function handleError(error: Error) {
    console.error('❌ Erreur génération:', error);
    toast({
      title: "Erreur de génération",
      description: error.message,
      variant: "destructive"
    });
  }

  // Génération intelligente avec optimisations IA
  const generateOptimizedMusic = useCallback(async (
    rang: 'A' | 'B' | 'AB',
    style: string = 'clinical-hip-hop',
    duration: number = 240
  ) => {
    if (!itemCode) {
      throw new Error('Code item requis pour la génération');
    }

    try {
      console.log(`🎵 Génération optimisée ${itemCode} Rang ${rang}`);

      // Génération des paroles IA selon le rang
      let optimizedLyrics: string[];
      
      if (rang === 'AB') {
        optimizedLyrics = await generateRangAB(itemCode);
      } else {
        optimizedLyrics = await generateOptimizedLyrics(itemCode, rang);
      }

      if (optimizedLyrics.length === 0) {
        throw new Error('Échec génération des paroles IA');
      }

      console.log(`✅ ${optimizedLyrics.length} vers générés (IA-optimisé):`, {
        preview: optimizedLyrics.slice(0, 2),
        totalChars: optimizedLyrics.join('\n').length
      });

      // Requête de génération optimisée
      const request: GenerationRequest = {
        type: 'music',
        prompt: `Génération musicale optimisée pour ${itemCode} - Rang ${rang}`,
        parameters: {
          item_code: itemCode,
          rang,
          style,
          duration,
          lyrics: optimizedLyrics,
          language: 'fr',
          fast_mode: true,
          priority: 'normal'
        },
        user_id: 'current-user'
      };

      // Lancer la génération
      const taskId = await musicGeneration.generateMusic(request);
      
      toast({
        title: `🎵 Génération ${rang} lancée`,
        description: `${itemCode} - ${optimizedLyrics.length} vers IA (${style})`,
      });

      return taskId;

    } catch (error) {
      console.error(`❌ Erreur génération optimisée:`, error);
      throw error;
    }
  }, [itemCode, musicGeneration.generateMusic, toast]);

  // Génération batch (A + B simultanément)
  const generateBatch = useCallback(async (
    style: string = 'clinical-hip-hop',
    duration: number = 240
  ) => {
    if (!itemCode) {
      throw new Error('Code item requis');
    }

    console.log(`🎵 Génération batch ${itemCode} (A + B simultanément)`);

    try {
      const promises = [
        generateOptimizedMusic('A', style, duration),
        generateOptimizedMusic('B', style, duration)
      ];

      const taskIds = await Promise.allSettled(promises);
      
      const successful = taskIds.filter(result => result.status === 'fulfilled');
      const failed = taskIds.filter(result => result.status === 'rejected');

      if (successful.length > 0) {
        toast({
          title: `🎵 Génération batch lancée`,
          description: `${successful.length}/2 générations démarrées pour ${itemCode}`,
        });
      }

      if (failed.length > 0) {
        console.error('❌ Échecs génération batch:', failed);
      }

      return taskIds;

    } catch (error) {
      console.error('❌ Erreur génération batch:', error);
      throw error;
    }
  }, [itemCode, generateOptimizedMusic, toast]);

  // Lecture audio intelligente
  const playTrackSmart = useCallback((track: MusicTrack) => {
    if (!track?.audio_url) {
      toast({
        title: "Pas d'audio disponible",
        description: "La piste n'a pas d'URL audio valide",
        variant: "destructive"
      });
      return;
    }

    // Arrêter la lecture courante si même piste
    if ((currentTrack as any)?.id === track.id && isPlaying) {
      pause();
      return;
    }

    // Lancer la nouvelle piste
    console.log('🎵 Lecture intelligente:', track.title);
    play({
      url: track.audio_url,
      title: track.title,
      rang: (track as any).rang || 'A' as 'A' | 'B' | 'AB'
    });

  }, [currentTrack, isPlaying, play, pause, toast]);

  // Recherche de tracks par rang
  const getTrackByRang = useCallback((rang: string): MusicTrack | null => {
    return itemTracks.find(track => {
      const supabaseTrack = track as any;
      return supabaseTrack.rang === rang || 
             track.metadata?.rang === rang ||
             track.title?.includes(`Rang ${rang}`);
    }) as MusicTrack || null;
  }, [itemTracks]);

  // Stats et métriques
  const stats = useMemo(() => {
    const rangA = getTrackByRang('A');
    const rangB = getTrackByRang('B');
    const rangAB = getTrackByRang('AB');

    return {
      totalTracks: itemTracks.length,
      hasRangA: Boolean(rangA),
      hasRangB: Boolean(rangB),
      hasRangAB: Boolean(rangAB),
      completionRate: itemTracks.length > 0 ? 
        (Number(Boolean(rangA)) + Number(Boolean(rangB)) + Number(Boolean(rangAB))) / 3 * 100 : 0,
      averageDuration: itemTracks.length > 0 ?
        itemTracks.reduce((sum, track) => sum + ((track as any).duration || 240), 0) / itemTracks.length : 0,
      lastGenerated: itemTracks.length > 0 ?
        Math.max(...itemTracks.map(t => new Date(t.created_at).getTime())) : null
    };
  }, [itemTracks, getTrackByRang]);

  return {
    // Generation
    generateOptimizedMusic,
    generateBatch,
    isGenerating: musicGeneration.isGenerating,
    progress: musicGeneration.progress,
    error: musicGeneration.error,

    // Tracks
    itemTracks,
    tracksLoading,
    getTrackByRang,
    
    // Playback
    playTrackSmart,
    currentTrack,
    isPlaying,

    // Stats
    stats,

    // Actions
    cancelGeneration: musicGeneration.cancelGeneration,
    resetGeneration: musicGeneration.resetGeneration
  };
};