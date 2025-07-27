
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';

export const useParolesMusicales = (
  paroles: string[] = [], 
  itemData?: { paroles_rang_a?: string[], paroles_rang_b?: string[], paroles_rang_ab?: string[] }
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
    console.log(`🎵 BOUTON GÉNÉRER CLIQUÉ - Rang ${rang}`);
    
    // Utiliser les vraies paroles structurées si disponibles
    let parolesAUtiliser: string[] = [];
    
    if (itemData) {
      console.log('🎵 Utilisation des paroles structurées de la base de données');
      if (rang === 'A' && itemData.paroles_rang_a) {
        parolesAUtiliser = itemData.paroles_rang_a;
      } else if (rang === 'B' && itemData.paroles_rang_b) {
        parolesAUtiliser = itemData.paroles_rang_b;
      }
    }
    
    // Fallback vers les paroles originales si pas de données structurées
    if (parolesAUtiliser.length === 0) {
      console.log('🎵 Fallback vers les paroles originales');
      if (!paroles || paroles.length === 0) {
        console.error('❌ AUCUNE PAROLE DISPONIBLE');
        toast({
          title: "Erreur de génération",
          description: "Aucune parole disponible pour ce rang",
          variant: "destructive"
        });
        return;
      }
      
      const parolesIndex = rang === 'A' ? 0 : 1;
      if (!paroles[parolesIndex]) {
        console.error(`❌ AUCUNE PAROLE POUR LE RANG ${rang}`);
        toast({
          title: "Erreur de génération", 
          description: `Aucune parole disponible pour le rang ${rang}`,
          variant: "destructive"
        });
        return;
      }
      parolesAUtiliser = [paroles[parolesIndex]];
    }

    console.log(`🎵 Configuration:`, {
      selectedStyle,
      musicDuration,
      parolesLength: parolesAUtiliser.length,
      currentLanguage,
      parolesPreview: parolesAUtiliser[0]?.substring(0, 100) + '...' || 'Aucune'
    });

    try {
      console.log('🚀 APPEL generateMusicInLanguage...');
      const audioUrl = await generateMusicInLanguage(rang, parolesAUtiliser, selectedStyle, musicDuration);
      console.log(`✅ GÉNÉRATION TERMINÉE POUR RANG ${rang}, URL:`, audioUrl);
      
      setTimeout(() => {
        console.log('🎵 VÉRIFICATION ÉTAT RETARDÉE generatedAudio:', generatedAudio);
      }, 100);
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION RANG ${rang}:`, error);
      toast({
        title: "Erreur de génération",
        description: `Impossible de générer la musique pour le rang ${rang}`,
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
    handlePlayAudio,
    seek,
    changeVolume,
    stop
  };
};
