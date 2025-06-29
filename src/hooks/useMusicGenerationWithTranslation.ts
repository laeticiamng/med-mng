
import { useMusicGenerationState } from './useMusicGenerationState';
import { useMusicTranslation } from './music/useMusicTranslation';
import { useMusicValidation } from './music/useMusicValidation';
import { useMusicGenerationOrchestrator } from './music/useMusicGenerationOrchestrator';

export const useMusicGenerationWithTranslation = () => {
  console.log('🎵 HOOK - useMusicGenerationWithTranslation initialisé');

  const {
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    setLastError,
    setGeneratingState,
    setAudioUrl,
    updateGenerationProgress,
    isAlreadyGenerating,
    markAsGenerating,
    unmarkAsGenerating
  } = useMusicGenerationState();
  
  const { currentLanguage, translateLyricsIfNeeded } = useMusicTranslation();
  const { validateAndNormalizeAudioUrl } = useMusicValidation();
  const { startGeneration } = useMusicGenerationOrchestrator();

  const generateMusicInLanguage = async (
    rang: 'A' | 'B', 
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240
  ) => {
    console.log('🎵 HOOK - generateMusicInLanguage appelé:', { rang, paroles, selectedStyle, duration });
    
    if (isAlreadyGenerating(rang)) {
      console.log(`⚠️ Génération déjà en cours pour le Rang ${rang}, ignoré`);
      return;
    }

    try {
      if (!paroles || paroles.length === 0) {
        throw new Error('Aucune parole disponible pour la génération');
      }

      const parolesIndex = rang === 'A' ? 0 : 1;
      if (!paroles[parolesIndex]) {
        throw new Error(`Aucune parole disponible pour le Rang ${rang}`);
      }

      const parolesText = paroles[parolesIndex];
      
      markAsGenerating(rang);
      setGeneratingState(rang, true);
      setLastError('');
      
      // Initialiser le progress à 0
      updateGenerationProgress(rang, {
        progress: 0,
        attempts: 1,
        maxAttempts: 24,
        estimatedTimeRemaining: 4
      });

      const translatedLyrics = await translateLyricsIfNeeded(parolesText);

      // Démarrer la génération orchestrée
      await startGeneration({
        rang,
        translatedLyrics,
        selectedStyle,
        duration,
        currentLanguage,
        onProgress: updateGenerationProgress,
        onSuccess: setAudioUrl,
        onError: (error) => {
          setLastError(error.message);
          throw error;
        },
        validateAndNormalizeAudioUrl
      });
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION SUNO Rang ${rang}:`, error);
      throw error;
    } finally {
      unmarkAsGenerating(rang);
      setGeneratingState(rang, false);
    }
  };

  return {
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    generateMusicInLanguage,
    currentLanguage
  };
};
