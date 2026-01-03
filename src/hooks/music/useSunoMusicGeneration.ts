
import { useState, useCallback, useRef } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

const MAX_POLL_ATTEMPTS = 60; // 5 minutes max (60 * 5s)
const POLL_INTERVAL = 5000; // 5 secondes

export const useSunoMusicGeneration = () => {
  const { toast } = useToast();
  const [pollingProgress, setPollingProgress] = useState<number>(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Fonction de polling pour récupérer l'audio URL
  const pollForAudioUrl = useCallback(async (
    taskId: string, 
    rang: 'A' | 'B' | 'AB'
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const checkStatus = async () => {
        attempts++;
        setPollingProgress(Math.min((attempts / MAX_POLL_ATTEMPTS) * 100, 95));

        try {
          // 1. Vérifier d'abord en BDD (le callback peut avoir déjà mis à jour)
          const { data: dbTrack } = await supabase
            .from('generated_music_tracks')
            .select('audio_url, generation_status, metadata')
            .eq('task_id', taskId)
            .maybeSingle();

          if (dbTrack?.audio_url && dbTrack.generation_status === 'completed') {
            console.log('✅ Audio trouvé en BDD:', dbTrack.audio_url);
            setPollingProgress(100);
            clearInterval(pollingRef.current!);
            setAudioUrl(rang, dbTrack.audio_url);
            resolve(dbTrack.audio_url);
            return;
          }

          // 2. Sinon appeler l'edge function music-status
          const { data, error } = await supabase.functions.invoke('music-status', {
            body: { taskId }
          });

          if (error) {
            console.error('Erreur polling:', error);
            if (attempts >= MAX_POLL_ATTEMPTS) {
              clearInterval(pollingRef.current!);
              reject(new Error('Timeout: génération trop longue'));
            }
            return;
          }

          if (data?.status === 'completed' && data.audioUrl) {
            console.log('✅ Audio récupéré via polling:', data.audioUrl);
            setPollingProgress(100);
            clearInterval(pollingRef.current!);
            setAudioUrl(rang, data.audioUrl);
            resolve(data.audioUrl);
            return;
          }

          if (data?.status === 'failed') {
            clearInterval(pollingRef.current!);
            reject(new Error(data.error || 'Génération échouée'));
            return;
          }

          // Continuer le polling
          if (attempts >= MAX_POLL_ATTEMPTS) {
            clearInterval(pollingRef.current!);
            reject(new Error('Timeout: génération trop longue (5 min max)'));
          }
        } catch (err) {
          console.error('Erreur pendant le polling:', err);
          if (attempts >= MAX_POLL_ATTEMPTS) {
            clearInterval(pollingRef.current!);
            reject(err);
          }
        }
      };

      // Lancer le polling
      pollingRef.current = setInterval(checkStatus, POLL_INTERVAL);
      
      // Premier check immédiat après 2 secondes
      setTimeout(checkStatus, 2000);
    });
  }, [setAudioUrl]);

  const generateMusicInLanguage = async (
    rang: 'A' | 'B' | 'AB', 
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240,
    model: "V3_5" | "V4" | "V4_5" | "V4_5ALL" | "V4_5PLUS" | "V5" = "V4_5ALL"
  ): Promise<string> => {
    
    if (isAlreadyGenerating(rang)) {
      throw new Error('Génération déjà en cours pour ce rang');
    }

    try {
      const parolesText = validateGenerationInput(paroles, selectedStyle, rang);
      
      markAsGenerating(rang);
      setGeneratingState(rang, true);
      setLastError('');
      setPollingProgress(0);
      
      const translatedLyrics = await translateLyricsIfNeeded(parolesText);
      const { isComposition, styleDescription, adjustedDuration, durationText } = prepareStyleConfiguration(selectedStyle, duration);
      const requestBody = createRequestBody(translatedLyrics, selectedStyle, rang, adjustedDuration, currentLanguage, isComposition, model);

      // Étape 1: Appeler l'API Suno pour démarrer la génération
      const response = await callSunoApi(requestBody);

      if (!response.trackId) {
        throw new Error('Aucun trackId reçu de l\'API Suno');
      }

      toast({
        title: "🎵 Génération en cours",
        description: `Musique Rang ${rang} - Patientez 2-3 minutes...`,
        variant: "default"
      });

      // Étape 2: Polling pour récupérer l'audio URL
      const audioUrl = await pollForAudioUrl(response.trackId, rang);

      // Étape 3: Valider l'URL
      const validatedUrl = validateAndNormalizeAudioUrl(audioUrl);
      
      if (!validatedUrl) {
        throw new Error('URL audio invalide reçue');
      }

      const successMessage = getSuccessMessage(rang, durationText, currentLanguage, isComposition);
      toast({
        title: successMessage.title,
        description: successMessage.description,
        variant: "default"
      });

      return validatedUrl;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de générer la musique. Veuillez réessayer.";
      setLastError(errorMessage);
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      // Nettoyage
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      unmarkAsGenerating(rang);
      setGeneratingState(rang, false);
      setPollingProgress(0);
    }
  };

  // Arrêter le polling en cours
  const cancelGeneration = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setPollingProgress(0);
  }, []);

  return {
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    generateMusicInLanguage,
    currentLanguage,
    pollingProgress,
    cancelGeneration
  };
};
