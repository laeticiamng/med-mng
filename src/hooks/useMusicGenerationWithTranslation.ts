
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
        maxAttempts: 12,
        estimatedTimeRemaining: 2
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

      // Sinon, commencer le polling
      const pollForProgress = async () => {
        const maxPolls = 24; // 2 minutes max (24 * 5s = 120s)
        let pollCount = 0;
        
        const pollInterval = setInterval(async () => {
          try {
            pollCount++;
            console.log(`🔄 Polling ${pollCount}/${maxPolls} pour Rang ${rang}`);
            
            // Mettre à jour la progression basée sur le nombre de tentatives
            const progressPercentage = Math.min(Math.round((pollCount / maxPolls) * 90), 90); // Max 90% pendant le polling
            const estimatedTimeRemaining = Math.max(Math.round(((maxPolls - pollCount) * 5) / 60), 0);
            
            updateGenerationProgress(rang, {
              progress: progressPercentage,
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
              return; // Continue le polling
            }

            console.log(`📥 Données du polling ${pollCount}:`, pollData);

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

            if (pollData?.status === 'error') {
              clearInterval(pollInterval);
              throw new Error(pollData.message || 'Erreur lors de la génération');
            }

            // Si on a atteint le maximum de polls
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              throw new Error('La génération prend plus de temps que prévu. Veuillez réessayer.');
            }
            
          } catch (pollError) {
            console.error(`❌ Erreur lors du polling ${pollCount}:`, pollError);
            if (pollCount >= maxPolls - 1) {
              clearInterval(pollInterval);
              throw pollError;
            }
          }
        }, 5000); // Poll toutes les 5 secondes

        // Cleanup en cas d'erreur
        return () => clearInterval(pollInterval);
      };

      await pollForProgress();
      
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
