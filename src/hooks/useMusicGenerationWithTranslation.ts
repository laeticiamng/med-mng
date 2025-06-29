
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
        attempts: 0,
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

      // Polling pour récupérer les updates de progression
      const pollProgress = async (taskId?: string) => {
        const maxPolls = 24; // 2 minutes max
        let pollCount = 0;
        
        while (pollCount < maxPolls) {
          try {
            const { data, error } = await supabase.functions.invoke('generate-music', {
              body: requestBody
            });

            if (error) throw error;

            if (data.status === 'success' && data.audioUrl) {
              console.log('🎵 GÉNÉRATION TERMINÉE:', data.audioUrl);
              const validatedAudioUrl = validateAndNormalizeAudioUrl(data.audioUrl);
              setAudioUrl(rang, validatedAudioUrl);
              
              toast({
                title: "Génération réussie",
                description: `Musique générée avec succès pour le Rang ${rang}`,
              });
              
              return validatedAudioUrl;
            }

            if (data.status === 'generating' || data.status === 'timeout') {
              // Mettre à jour le progress
              updateGenerationProgress(rang, {
                progress: data.progress || 0,
                attempts: data.attempts || 0,
                maxAttempts: data.maxAttempts || 12,
                estimatedTimeRemaining: data.estimatedTimeRemaining || 0
              });
              
              console.log(`🔄 Progression: ${data.progress}%`);
              
              if (data.status === 'timeout') {
                throw new Error('La génération prend plus de temps que prévu. Veuillez réessayer.');
              }
            }

            // Attendre 5 secondes avant le prochain poll
            await new Promise(resolve => setTimeout(resolve, 5000));
            pollCount++;
            
          } catch (pollError) {
            console.error('❌ Erreur lors du polling:', pollError);
            if (pollCount >= maxPolls - 1) {
              throw pollError;
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
            pollCount++;
          }
        }
        
        throw new Error('Timeout: La génération a pris trop de temps');
      };

      const audioUrl = await pollProgress();
      console.log(`✅ GÉNÉRATION SUNO RÉUSSIE pour Rang ${rang}:`, audioUrl);
      
      return audioUrl;
      
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
