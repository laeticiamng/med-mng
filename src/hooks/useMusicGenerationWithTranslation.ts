
import { useToast } from '@/hooks/use-toast';
import { useMusicGenerationState } from './useMusicGenerationState';
import { callSunoApi } from './musicGenerationApi';
import { 
  validateGenerationInput, 
  prepareStyleConfiguration, 
  createRequestBody, 
  getSuccessMessage 
} from './musicGenerationUtils';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';

export const useMusicGenerationWithTranslation = () => {
  console.log('🎵 HOOK - useMusicGenerationWithTranslation initialisé');

  const { toast } = useToast();
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
    translate = async (text: string) => text; // fallback
  }

  const generateMusicInLanguage = async (
    rang: 'A' | 'B', 
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240
  ) => {
    console.log('🎵 HOOK - generateMusicInLanguage appelé:', { rang, paroles, selectedStyle, duration });
    
    // Protection contre les appels multiples
    if (isAlreadyGenerating(rang)) {
      console.log(`⚠️ Génération déjà en cours pour le Rang ${rang}, ignoré`);
      return;
    }

    try {
      // Validation des entrées
      const parolesText = validateGenerationInput(paroles, selectedStyle, rang);
      
      // Marquer comme en cours de génération
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

      // Préparer la configuration du style
      const { isComposition, styleDescription, adjustedDuration, durationText } = prepareStyleConfiguration(selectedStyle, duration);
      
      console.log(`🎵 DÉMARRAGE GÉNÉRATION SUNO ${isComposition ? 'COMPOSITION PREMIUM' : 'STANDARD'} Rang ${rang} en ${currentLanguage}`);
      console.log(`🎨 Style: ${styleDescription} - Durée: ${durationText}`);
      console.log(`📝 Paroles traduites (${translatedLyrics.length} caractères):`, translatedLyrics.substring(0, 100) + '...');
      
      // Créer le body de la requête
      const requestBody = createRequestBody(translatedLyrics, selectedStyle, rang, adjustedDuration, currentLanguage, isComposition);

      // Appeler l'API Suno
      const { audioUrl, callDuration } = await callSunoApi(requestBody);

      console.log('🎵 RÉPONSE API SUNO REÇUE:', {
        audioUrl,
        callDuration,
        rang,
        urlValid: audioUrl && audioUrl.startsWith('http')
      });

      // Vérification critique de l'URL
      if (!audioUrl) {
        throw new Error('Aucune URL audio reçue de l\'API Suno');
      }

      if (!audioUrl.startsWith('http')) {
        throw new Error(`URL audio invalide reçue: ${audioUrl}`);
      }

      // Stocker l'URL audio - CRITIQUE !
      console.log(`🎵 STOCKAGE URL AUDIO pour Rang ${rang}:`, audioUrl);
      setAudioUrl(rang, audioUrl);

      // Vérification immédiate du stockage
      console.log('🎵 VÉRIFICATION ÉTAT APRÈS STOCKAGE:', {
        rangA: rang === 'A' ? audioUrl : generatedAudio.rangA,
        rangB: rang === 'B' ? audioUrl : generatedAudio.rangB
      });

      // Afficher le message de succès
      const successMessage = getSuccessMessage(rang, durationText, currentLanguage, isComposition);
      toast(successMessage);

      console.log(`✅ GÉNÉRATION SUNO RÉUSSIE pour Rang ${rang} en ${currentLanguage} (${callDuration}s):`, audioUrl);
      
      // Retourner l'URL pour vérification
      return audioUrl;
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION SUNO Rang ${rang}:`, error);
      console.error(`❌ Stack trace:`, error.stack);
      
      const errorMessage = error.message || "Impossible de générer la musique avec Suno. Veuillez réessayer.";
      setLastError(errorMessage);
      toast({
        title: "Erreur de génération Suno",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      // Nettoyer l'état dans tous les cas
      unmarkAsGenerating(rang);
      setGeneratingState(rang, false);
    }
  };

  // Fonction pour transposer une musique existante dans une autre langue
  const transposeMusicToLanguage = async (
    originalLyrics: string,
    targetLanguage: SupportedLanguage,
    selectedStyle: string,
    duration: number = 240
  ) => {
    try {
      setLastError('');
      
      // Traduire les paroles originales vers la langue cible
      console.log(`🌍 Transposition vers ${targetLanguage}...`);
      const translatedLyrics = await translate(originalLyrics, targetLanguage);
      
      const requestBody = createRequestBody(translatedLyrics, selectedStyle, 'TRANSPOSE', duration, targetLanguage, false);

      const { audioUrl } = await callSunoApi(requestBody);

      toast({
        title: "🎉 Transposition réussie !",
        description: `Musique transposée en ${targetLanguage} avec succès !`,
      });

      return audioUrl;
    } catch (error) {
      const errorMessage = error.message || "Erreur lors de la transposition";
      setLastError(errorMessage);
      toast({
        title: "Erreur de transposition",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  console.log('🎵 HOOK - Retour des données du hook:', {
    isGenerating,
    generatedAudio,
    lastError,
    currentLanguage
  });

  return {
    isGenerating,
    generatedAudio,
    lastError,
    generateMusicInLanguage,
    transposeMusicToLanguage,
    currentLanguage
  };
};
