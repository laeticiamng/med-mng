
import { useToast } from '@/hooks/use-toast';
import { useMusicGenerationState } from '../useMusicGenerationState';
import { callSunoApi } from '../musicGenerationApi';
import { 
  validateGenerationInput, 
  prepareStyleConfiguration, 
  createRequestBody, 
  getSuccessMessage 
} from '../musicGenerationUtils';
import { useMusicTranslation } from './useMusicTranslation';
import { useMusicValidation } from './useMusicValidation';

export const useSunoMusicGeneration = () => {
  console.log('🎵 HOOK - useSunoMusicGeneration initialisé');

  const { toast } = useToast();
  const {
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    setLastError,
    setGeneratingState,
    setAudioUrl,
    isAlreadyGenerating,
    markAsGenerating,
    unmarkAsGenerating
  } = useMusicGenerationState();
  
  const { currentLanguage, translateLyricsIfNeeded } = useMusicTranslation();
  const { validateAndNormalizeAudioUrl } = useMusicValidation();

  const generateMusicInLanguage = async (
    rang: 'A' | 'B' | 'AB', 
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240,
    model: "V3_5" | "V4" | "V4_5" = "V3_5"
  ) => {
    console.log('🎵 HOOK - generateMusicInLanguage appelé:', { rang, paroles, selectedStyle, duration });
    
    if (isAlreadyGenerating(rang)) {
      console.log(`⚠️ Génération déjà en cours pour le Rang ${rang}, ignoré`);
      return;
    }

    try {
      const parolesText = validateGenerationInput(paroles, selectedStyle, rang);
      
      markAsGenerating(rang);
      setGeneratingState(rang, true);
      setLastError('');
      
      const translatedLyrics = await translateLyricsIfNeeded(parolesText);

      const { isComposition, styleDescription, adjustedDuration, durationText } = prepareStyleConfiguration(selectedStyle, duration);
      
      console.log(`🎵 DÉMARRAGE GÉNÉRATION SUNO ${isComposition ? 'COMPOSITION PREMIUM' : 'STANDARD'} Rang ${rang} en ${currentLanguage}`);
      
      const requestBody = createRequestBody(translatedLyrics, selectedStyle, rang, adjustedDuration, currentLanguage, isComposition, model);

      const response = await callSunoApi(requestBody);

      console.log('🎵 RÉPONSE API SUNO REÇUE:', {
        response,
        callDuration: response.callDuration,
        rang,
        trackId: response.trackId
      });

      // La génération Suno est maintenant asynchrone - on attend le callback
      if (response.trackId) {
        console.log(`🎵 GÉNÉRATION DÉMARRÉE pour Rang ${rang}, trackId: ${response.trackId}`);
        
        const successMessage = getSuccessMessage(rang, durationText, currentLanguage, isComposition);
        toast({
          title: "Génération démarrée",
          description: `Musique Rang ${rang} en cours de génération...`,
          variant: "default"
        });

        console.log(`✅ GÉNÉRATION SUNO DÉMARRÉE pour Rang ${rang} en ${currentLanguage}`);
        
        return response.trackId;
      } else {
        throw new Error('Aucun trackId reçu de l\'API Suno');
      }

      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION SUNO Rang ${rang}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : "Impossible de générer la musique avec Suno. Veuillez réessayer.";
      setLastError(errorMessage);
      toast({
        title: "Erreur de génération Suno",
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
    generationProgress,
    lastError,
    generateMusicInLanguage,
    currentLanguage
  };
};
