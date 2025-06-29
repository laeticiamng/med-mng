
import { useToast } from '@/hooks/use-toast';
import { useMusicGenerationState } from './useMusicGenerationState';
import { useMusicTranslation } from './music/useMusicTranslation';
import { useMusicValidation } from './music/useMusicValidation';
import { supabase } from '@/integrations/supabase/client';

export const useMusicGenerationWithTranslation = () => {
  console.log('🎵 HOOK - useMusicGenerationWithTranslation initialisé');

  const { toast } = useToast();
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

      console.log(`🎵 DÉMARRAGE GÉNÉRATION SUNO Rang ${rang} en ${currentLanguage}`);
      
      const requestBody = {
        lyrics: translatedLyrics,
        style: selectedStyle,
        rang,
        duration,
        language: currentLanguage,
        fastMode: true
      };

      // Démarrer la génération initiale
      console.log('🎵 Appel initial pour démarrer la génération...');
      const { data: initialData, error: initialError } = await supabase.functions.invoke('generate-music', {
        body: requestBody
      });

      if (initialError) {
        console.error('❌ Erreur lors du démarrage:', initialError);
        throw new Error(initialError.message || 'Erreur lors du démarrage de la génération');
      }

      console.log('🎵 Réponse initiale:', initialData);

      // Si c'est déjà un succès (peu probable), on termine
      if (initialData?.status === 'success' && initialData?.audioUrl) {
        console.log('🎵 GÉNÉRATION TERMINÉE IMMÉDIATEMENT:', initialData.audioUrl);
        const validatedAudioUrl = validateAndNormalizeAudioUrl(initialData.audioUrl);
        setAudioUrl(rang, validatedAudioUrl);
        
        toast({
          title: "Génération réussie",
          description: `Musique générée avec succès pour le Rang ${rang}`,
        });
        
        return validatedAudioUrl;
      }

      // Commencer le polling avec progression visuelle
      const startPolling = () => {
        const maxPolls = 48; // 4 minutes max (48 * 5s = 240s)
        let pollCount = 0;
        
        const pollInterval = setInterval(async () => {
          try {
            pollCount++;
            
            // Progression visuelle basée sur le temps écoulé
            const baseProgress = Math.min(Math.round((pollCount / maxPolls) * 85), 85);
            const estimatedTimeRemaining = Math.max(Math.round(((maxPolls - pollCount) * 5) / 60), 0);
            
            console.log(`🔄 Polling ${pollCount}/${maxPolls} pour Rang ${rang} - Progress: ${baseProgress}%`);
            
            updateGenerationProgress(rang, {
              progress: baseProgress,
              attempts: pollCount,
              maxAttempts: maxPolls,
              estimatedTimeRemaining
            });

            // Faire un nouvel appel pour vérifier le statut
            const { data: pollData, error: pollError } = await supabase.functions.invoke('generate-music', {
              body: requestBody
            });

            if (pollError) {
              console.warn(`⚠️ Erreur lors du polling ${pollCount}:`, pollError);
              // Continue le polling même en cas d'erreur
              if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                throw new Error('Délai d\'attente dépassé pour la génération musicale');
              }
              return;
            }

            console.log(`📥 Données du polling ${pollCount}:`, pollData);

            // Vérifier si la génération est terminée avec succès
            if (pollData?.status === 'success' && pollData?.audioUrl) {
              console.log('✅ GÉNÉRATION TERMINÉE:', pollData.audioUrl);
              clearInterval(pollInterval);
              
              // Progression à 100%
              updateGenerationProgress(rang, {
                progress: 100,
                attempts: pollCount,
                maxAttempts: maxPolls,
                estimatedTimeRemaining: 0
              });
              
              const validatedAudioUrl = validateAndNormalizeAudioUrl(pollData.audioUrl);
              setAudioUrl(rang, validatedAudioUrl);
              
              toast({
                title: "Génération réussie",
                description: `Musique générée avec succès pour le Rang ${rang}`,
              });
              
              return validatedAudioUrl;
            }

            // Vérifier si il y a une erreur
            if (pollData?.status === 'error') {
              clearInterval(pollInterval);
              throw new Error(pollData.message || 'Erreur lors de la génération');
            }

            // Timeout atteint
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              throw new Error('La génération prend plus de temps que prévu. Veuillez réessayer.');
            }
            
          } catch (pollError) {
            console.error(`❌ Erreur lors du polling ${pollCount}:`, pollError);
            clearInterval(pollInterval);
            throw pollError;
          }
        }, 5000); // Poll toutes les 5 secondes

        return pollInterval;
      };

      // Démarrer le polling
      startPolling();
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION SUNO Rang ${rang}:`, error);
      
      const errorMessage = error.message || "Impossible de générer la musique avec Suno. Veuillez réessayer.";
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
