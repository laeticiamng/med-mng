import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { generateOptimizedLyrics, generateRangAB } from '@/utils/generateOptimizedLyrics';
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
      
      // 🎫 Générer les paroles ultra-optimisées IA selon nouvelles spécifications
      const parolesCompletes = await generateOptimizedLyrics(itemData.item_code, rang);
      
      console.log(`✅ ${parolesCompletes.length} lignes générées (style Nekfeu IA-optimisé):`, {
        preview: parolesCompletes.slice(0, 3),
        total: parolesCompletes.length,
        caracteres: parolesCompletes.join('\n').length + '/5000',
        itemCode: itemData.item_code,
        rang
      });
      
      if (parolesCompletes.length === 0) {
        throw new Error('Aucune parole générée');
      }

      // Toast de démarrage avec détails optimisés
      toast({
        title: `🎫 Génération ${rang} Ultra-Optimisée`,
        description: `${parolesCompletes.length} vers Nekfeu IA - ${itemData.item_code} (${parolesCompletes.join('\n').length}/5000 car.)`,
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
      const trackId = await generateMusicInLanguage(rang, parolesCompletes, selectedStyle, musicDuration);
      
      console.log(`✅ GÉNÉRATION DÉMARRÉE - ${itemData.item_code} Rang ${rang}, trackId:`, trackId);
      
      // Toast de succès pour le démarrage
      toast({
        title: `🎵 ${itemData.item_code} Rang ${rang} en cours...`,
        description: `La génération a été lancée, l'audio sera disponible dans quelques minutes`,
      });
      
      console.log('🎵 POLLING POUR RÉCUPÉRER L\'URL AUDIO...');
      // Démarrer le polling pour ce trackId
      if (trackId) {
        startPolling(trackId, rang, itemData.item_code);
      }
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION COMPLÈTE ${rang}:`, error);
      toast({
        title: "❌ Échec génération complète",
        description: `Impossible de générer ${itemData.item_code} Rang ${rang} avec toutes les compétences`,
        variant: "destructive"
      });
    }
  };

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
      
      // 🎫 Générer les paroles Mix ultra-optimisées IA (A+B fusion)
      const parolesMix = await generateRangAB(itemData.item_code);
      
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
    console.log('🔴 === DEBUT handlePlayAudio ===');
    console.log('🎵 URL reçue:', audioUrl);
    console.log('🎵 generatedAudio actuel:', generatedAudio);
    
    // ✅ Bloquer les URLs de simulation non fonctionnelles
    if (audioUrl.includes('soundjay.com') || audioUrl.includes('fail-buzzer')) {
      console.log('⚠️ URL de simulation détectée, pas de lecture possible');
      toast({
        title: "Mode simulation",
        description: "Aucun audio généré disponible. Veuillez d'abord générer de la musique.",
        variant: "default"
      });
      return;
    }
    
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
      // ✅ CORRECTION: Continuer malgré l'erreur de test, le player principal peut fonctionner
      console.log('⚠️ Tentative de lecture directe malgré l\'erreur de test...');
    });
    
    testAudio.addEventListener('loadstart', () => {
      console.log('🔄 DÉBUT DE CHARGEMENT AUDIO');
    });
    
    testAudio.addEventListener('loadeddata', () => {
      console.log('✅ DONNÉES AUDIO CHARGÉES');
    });
    
    // ✅ CORRECTION: Ne pas bloquer si l'URL est une simulation
    try {
      testAudio.src = audioUrl;
    } catch (error) {
      console.warn('⚠️ Erreur lors du test de l\'URL, mais on continue:', error);
    }

    if (currentTrack?.url === audioUrl && isPlaying) {
      console.log('⏸️ PAUSE DE L\'AUDIO EN COURS');
      pause();
    } else {
      // ✅ CORRECTION: Lecture forcée même si test de connectivité échoue
      console.log('▶️ LECTURE DU NOUVEL AUDIO (forcée)');
      console.log('🎵 Données transmises au contexte audio:', {
        url: audioUrl,
        title: title,
        rang: audioUrl.includes('rangA') ? 'A' : 'B'
      });
      
      try {
        play({
          url: audioUrl,
          title: title,
          rang: audioUrl.includes('rangA') ? 'A' : audioUrl.includes('rangB') ? 'B' : 'AB'
        });
      } catch (playError) {
        console.error('❌ Erreur lors de la lecture audio:', playError);
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
