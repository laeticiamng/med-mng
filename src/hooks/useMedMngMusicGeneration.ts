
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { useMusicGenerationState } from './useMusicGenerationState';
import { 
  validateGenerationInput, 
  prepareStyleConfiguration, 
  createRequestBody, 
  getSuccessMessage 
} from './musicGenerationUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { callSunoApi } from './musicGenerationApi';

export const useMedMngMusicGeneration = () => {
  console.log('🎵 HOOK - useMedMngMusicGeneration initialisé');

  const { toast } = useToast();
  const medMngApi = useMedMngApi();
  const {
    isGenerating,
    generatedAudio,
    lastError,
    setLastError,
    setGeneratingState,
    setAudioUrl,
    isAlreadyGenerating,
    markAsGenerating,
    unmarkAsGenerating
  } = useMusicGenerationState();
  
  let currentLanguage, translate;
  try {
    console.log('🎵 HOOK - Tentative d\'utilisation de useLanguage');
    const languageContext = useLanguage();
    currentLanguage = languageContext.currentLanguage;
    translate = languageContext.translate;
    console.log('🎵 HOOK - useLanguage réussi, langue:', currentLanguage);
  } catch (error) {
    console.error('❌ HOOK - Erreur avec useLanguage:', error);
    currentLanguage = 'fr';
    translate = async (text: string) => text;
  }

  const generateMusicInLanguage = async (
    rang: 'A' | 'B', 
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240,
    itemCode?: string
  ) => {
    console.log('🎵 HOOK - generateMusicInLanguage appelé:', { rang, paroles, selectedStyle, duration, itemCode });
    
    if (isAlreadyGenerating(rang)) {
      console.log(`⚠️ Génération déjà en cours pour le Rang ${rang}, ignoré`);
      return;
    }

    try {
      const parolesText = validateGenerationInput(paroles, selectedStyle, rang);
      
      markAsGenerating(rang);
      setGeneratingState(rang, true);
      setLastError('');
      
      // Traduire les paroles si nécessaire
      let translatedLyrics = parolesText;
      if (currentLanguage !== 'fr') {
        console.log(`🌍 Traduction des paroles du français vers ${currentLanguage}...`);
        translatedLyrics = await translate(parolesText, currentLanguage);
        console.log(`✅ Paroles traduites pour Rang ${rang}`);
      }

      const { isComposition, styleDescription, adjustedDuration, durationText } = prepareStyleConfiguration(selectedStyle, duration);
      
      console.log(`🎵 DÉMARRAGE GÉNÉRATION SUNO ${isComposition ? 'COMPOSITION PREMIUM' : 'STANDARD'} Rang ${rang} en ${currentLanguage}`);
      
      const requestBody = createRequestBody(translatedLyrics, selectedStyle, rang, adjustedDuration, currentLanguage, isComposition);

      // 1. Générer avec Suno API
      const { audioUrl: sunoAudioId, callDuration } = await callSunoApi(requestBody);
      console.log('🎵 SUNO_AUDIO_ID reçu:', sunoAudioId);

      // 2. Créer la chanson dans med-mng
      const title = `${itemCode || 'EDN'} Rang ${rang} - ${styleDescription} (${durationText})`;
      const songData = await medMngApi.createSong(title, sunoAudioId, {
        style: selectedStyle,
        duration: adjustedDuration,
        rang,
        itemCode,
        language: currentLanguage,
        isComposition
      });

      console.log('🎵 Chanson créée dans med-mng:', songData);

      // 3. Générer l'URL de streaming sécurisée
      const streamUrl = medMngApi.getSongStreamUrl(songData.id);
      console.log(`🎵 URL STREAMING SÉCURISÉE pour Rang ${rang}:`, streamUrl);

      // 4. Stocker l'URL de streaming
      setAudioUrl(rang, streamUrl);

      // 5. Ajouter automatiquement à la bibliothèque
      try {
        await medMngApi.addToLibrary(songData.id);
        console.log('✅ Chanson ajoutée automatiquement à la bibliothèque');
      } catch (error) {
        console.warn('⚠️ Erreur ajout bibliothèque (non critique):', error);
      }

      const successMessage = getSuccessMessage(rang, durationText, currentLanguage, isComposition);
      toast({
        ...successMessage,
        description: `${successMessage.description} Ajoutée à votre bibliothèque.`
      });

      console.log(`✅ GÉNÉRATION COMPLÈTE pour Rang ${rang} (${callDuration}s)`);
      
      return {
        songId: songData.id,
        streamUrl,
        title
      };
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION RANG ${rang}:`, error);
      
      const errorMessage = error.message || "Impossible de générer la musique. Veuillez réessayer.";
      setLastError(errorMessage);
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      unmarkAsGenerating(rang);
      setGeneratingState(rang, false);
    }
  };

  return {
    isGenerating,
    generatedAudio,
    lastError,
    generateMusicInLanguage,
    currentLanguage
  };
};
