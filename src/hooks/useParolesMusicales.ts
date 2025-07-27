
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { generateComprehensiveLyrics, generateMixedLyrics } from '@/utils/generateComprehensiveLyrics';

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

  const handleGenerate = async (rang: 'A' | 'B') => {
    console.log(`🎵 GÉNÉRATION COMPLÈTE - Rang ${rang}`);
    
    if (!itemData?.item_code) {
      console.error('❌ CODE ITEM MANQUANT');
      toast({
        title: "Erreur de génération",
        description: "Code item manquant pour la génération complète",
        variant: "destructive"
      });
      return;
    }

    try {
      // 🚀 GÉNÉRATION COMPLÈTE AVEC TOUTES LES COMPÉTENCES
      console.log(`🎯 Génération complète pour ${itemData.item_code} Rang ${rang}`);
      
      // Générer les paroles complètes avec assonances et toutes les compétences
      const parolesCompletes = await generateComprehensiveLyrics(itemData.item_code, rang);
      
      console.log(`✅ ${parolesCompletes.length} lignes générées avec assonances:`, {
        preview: parolesCompletes.slice(0, 3),
        total: parolesCompletes.length,
        itemCode: itemData.item_code,
        rang
      });
      
      if (parolesCompletes.length === 0) {
        throw new Error('Aucune parole générée');
      }

      // Toast de démarrage avec détails
      toast({
        title: `🎵 Génération ${rang} lancée`,
        description: `${parolesCompletes.length} vers avec assonances - ${itemData.item_code}`,
      });

      console.log(`🎵 Configuration génération:`, {
        selectedStyle,
        musicDuration,
        parolesCount: parolesCompletes.length,
        currentLanguage,
        itemCode: itemData.item_code,
        rang
      });

      // Appel génération musicale avec les paroles complètes
      const audioUrl = await generateMusicInLanguage(rang, parolesCompletes, selectedStyle, musicDuration);
      
      console.log(`✅ GÉNÉRATION TERMINÉE - ${itemData.item_code} Rang ${rang}, URL:`, audioUrl);
      
      // Toast de succès
      toast({
        title: `🎉 ${itemData.item_code} Rang ${rang} généré !`,
        description: `Toutes les compétences intégrées avec assonances`,
      });
      
      setTimeout(() => {
        console.log('🎵 VÉRIFICATION ÉTAT RETARDÉE generatedAudio:', generatedAudio);
      }, 100);
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION COMPLÈTE ${rang}:`, error);
      toast({
        title: "❌ Échec génération complète",
        description: `Impossible de générer ${itemData.item_code} Rang ${rang} avec toutes les compétences`,
        variant: "destructive"
      });
    }
  };

  // Fonction pour générer Mix A+B avec toutes les compétences
  const handleGenerateMix = async () => {
    console.log('🎵 GÉNÉRATION MIX A+B COMPLÈTE');
    
    if (!itemData?.item_code) {
      console.error('❌ CODE ITEM MANQUANT POUR MIX');
      toast({
        title: "Erreur génération Mix",
        description: "Code item manquant pour la génération Mix complète",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`🎯 Génération Mix complète pour ${itemData.item_code}`);
      
      // Générer les paroles mixtes avec toutes les compétences A+B
      const parolesMix = await generateMixedLyrics(itemData.item_code);
      
      console.log(`✅ ${parolesMix.length} lignes Mix générées:`, {
        preview: parolesMix.slice(0, 3),
        total: parolesMix.length,
        itemCode: itemData.item_code
      });
      
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
      
      // ✅ CORRECTION 1: Utiliser rang 'AB' spécial pour le Mix au lieu de 'A'
      const audioUrl = await generateMusicInLanguage('AB' as any, parolesMix, selectedStyle, mixDuration);
      
      console.log(`✅ GÉNÉRATION MIX TERMINÉE - ${itemData.item_code}, URL:`, audioUrl);
      
      // Toast de succès
      toast({
        title: `🎉 ${itemData.item_code} Mix A+B généré !`,
        description: `Fusion Rang A et B complète - ${Math.floor(mixDuration/60)}min${mixDuration%60}s`,
      });
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION MIX:`, error);
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
    console.log('🎵 BOUTON PLAY CLIQUÉ:', {
      audioUrl: audioUrl?.substring(0, 100) + '...',
      title,
      currentTrack: currentTrack?.url?.substring(0, 100) + '...',
      isPlaying,
      audioUrlValid: isValidAudioUrl(audioUrl)
    });

    if (!audioUrl) {
      console.error('❌ URL AUDIO MANQUANTE');
      return;
    }

    if (!isValidAudioUrl(audioUrl)) {
      console.error('❌ URL AUDIO INVALIDE:', audioUrl);
      return;
    }

    console.log('🔍 TEST DE CONNECTIVITÉ AUDIO...');
    const testAudio = new Audio();
    
    testAudio.addEventListener('canplay', () => {
      console.log('✅ AUDIO PEUT ÊTRE LU, URL VALIDE');
    });
    
    testAudio.addEventListener('error', (e) => {
      console.error('❌ ERREUR DE TEST AUDIO:', e);
      console.error('❌ PROBLÈME AVEC L\'URL:', audioUrl);
    });
    
    testAudio.addEventListener('loadstart', () => {
      console.log('🔄 DÉBUT DE CHARGEMENT AUDIO');
    });
    
    testAudio.addEventListener('loadeddata', () => {
      console.log('✅ DONNÉES AUDIO CHARGÉES');
    });
    
    testAudio.src = audioUrl;

    if (currentTrack?.url === audioUrl && isPlaying) {
      console.log('⏸️ PAUSE DE L\'AUDIO EN COURS');
      pause();
    } else {
      console.log('▶️ LECTURE DU NOUVEL AUDIO');
      console.log('🎵 Données transmises au contexte audio:', {
        url: audioUrl,
        title: title,
        rang: audioUrl.includes('rangA') ? 'A' : 'B'
      });
      
      play({
        url: audioUrl,
        title: title,
        rang: audioUrl.includes('rangA') ? 'A' : 'B'
      });
    }
  };

  return {
    selectedStyle,
    setSelectedStyle,
    musicDuration,
    setMusicDuration,
    isGenerating,
    generatedAudio,
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
