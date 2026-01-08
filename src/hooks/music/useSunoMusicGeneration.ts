
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

const MAX_POLL_ATTEMPTS = 40; // ~3 minutes max (40 * 5s)
const POLL_INTERVAL = 5000; // 5 secondes
const FAST_POLL_INTERVAL = 3000; // 3 secondes pour les premières tentatives
const RETRY_POLL_ATTEMPTS = 3; // Nombre de retries en cas d'erreur réseau
const ABSOLUTE_TIMEOUT = 180000; // 3 minutes en ms - timeout absolu

export const useSunoMusicGeneration = () => {
  const { toast } = useToast();
  const [pollingProgress, setPollingProgress] = useState<number>(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<boolean>(false); // Flag pour arrêter le polling
  
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

  // Fonction de polling pour récupérer l'audio URL avec retry réseau
  const pollForAudioUrl = useCallback(async (
    taskId: string, 
    rang: 'A' | 'B' | 'AB'
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      let networkRetries = 0;
      abortRef.current = false; // Reset le flag d'arrêt
      
      // Timeout absolu de sécurité (3 minutes max)
      const absoluteTimeout = setTimeout(() => {
        abortRef.current = true;
        if (pollingRef.current) clearTimeout(pollingRef.current);
        reject(new Error('Timeout: génération trop longue (3 min max). Réessayez.'));
      }, ABSOLUTE_TIMEOUT);

      const checkStatus = async () => {
        // Vérifier si annulé
        if (abortRef.current) {
          clearTimeout(absoluteTimeout);
          return;
        }
        
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
            clearTimeout(absoluteTimeout);
            if (pollingRef.current) clearTimeout(pollingRef.current);
            setAudioUrl(rang, dbTrack.audio_url);
            resolve(dbTrack.audio_url);
            return;
          }
          
          // Si le statut est 'failed' en BDD, arrêter immédiatement
          if (dbTrack?.generation_status === 'failed') {
            clearTimeout(absoluteTimeout);
            if (pollingRef.current) clearTimeout(pollingRef.current);
            const errorMsg = (dbTrack.metadata as any)?.error || 'Génération échouée';
            reject(new Error(errorMsg));
            return;
          }

          // 2. Sinon appeler l'edge function music-status
          const { data, error } = await supabase.functions.invoke('music-status', {
            body: { taskId }
          });

          if (error) {
            console.error('Erreur polling:', error);
            networkRetries++;
            
            if (networkRetries >= RETRY_POLL_ATTEMPTS) {
              console.warn('⚠️ Trop d\'erreurs réseau, continue le polling');
              networkRetries = 0;
            }
            
            if (attempts >= MAX_POLL_ATTEMPTS) {
              clearTimeout(absoluteTimeout);
              if (pollingRef.current) clearTimeout(pollingRef.current);
              reject(new Error('Timeout: génération trop longue'));
              return;
            }
          } else {
            networkRetries = 0;

            if (data?.status === 'completed' && data.audioUrl) {
              console.log('✅ Audio récupéré via polling:', data.audioUrl);
              setPollingProgress(100);
              clearTimeout(absoluteTimeout);
              if (pollingRef.current) clearTimeout(pollingRef.current);
              setAudioUrl(rang, data.audioUrl);
              resolve(data.audioUrl);
              return;
            }

            if (data?.status === 'failed') {
              clearTimeout(absoluteTimeout);
              if (pollingRef.current) clearTimeout(pollingRef.current);
              reject(new Error(data.error || 'Génération échouée'));
              return;
            }
          }

          // Vérifier si on a dépassé le max d'attempts
          if (attempts >= MAX_POLL_ATTEMPTS) {
            clearTimeout(absoluteTimeout);
            if (pollingRef.current) clearTimeout(pollingRef.current);
            reject(new Error('Timeout: génération trop longue (3 min max). Réessayez.'));
            return;
          }
          
          // Continuer le polling seulement si pas annulé
          if (!abortRef.current) {
            const interval = attempts < 10 ? FAST_POLL_INTERVAL : POLL_INTERVAL;
            pollingRef.current = setTimeout(checkStatus, interval) as unknown as NodeJS.Timeout;
          }
        } catch (err) {
          console.error('Erreur pendant le polling:', err);
          networkRetries++;
          
          if (attempts >= MAX_POLL_ATTEMPTS || abortRef.current) {
            clearTimeout(absoluteTimeout);
            if (pollingRef.current) clearTimeout(pollingRef.current);
            reject(err);
            return;
          }
          
          // Réessayer si pas annulé
          if (!abortRef.current) {
            const interval = attempts < 10 ? FAST_POLL_INTERVAL : POLL_INTERVAL;
            pollingRef.current = setTimeout(checkStatus, interval) as unknown as NodeJS.Timeout;
          }
        }
      };
      
      // Premier check après 2 secondes
      pollingRef.current = setTimeout(checkStatus, 2000) as unknown as NodeJS.Timeout;
    });
  }, [setAudioUrl]);

  const generateMusicInLanguage = async (
    rang: 'A' | 'B' | 'AB', 
    paroles: string[], 
    selectedStyle: string, 
    duration: number = 240,
    model: "V4" | "V4_5" | "V4_5ALL" | "V4_5PLUS" | "V5" = "V4_5ALL"
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
      // Nettoyage - utiliser clearTimeout car on utilise setTimeout dans le polling
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
      unmarkAsGenerating(rang);
      setGeneratingState(rang, false);
      setPollingProgress(0);
    }
  };

  // Arrêter le polling en cours et réinitialiser tous les états
  const cancelGeneration = useCallback((rang?: 'A' | 'B' | 'AB') => {
    console.log('[cancelGeneration] Annulation demandée pour rang:', rang || 'tous');
    
    // Forcer l'arrêt du polling via le flag
    abortRef.current = true;
    
    // Arrêter le polling
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    setPollingProgress(0);
    
    // Réinitialiser l'état de génération pour le rang spécifié ou tous les rangs
    if (rang) {
      unmarkAsGenerating(rang);
      setGeneratingState(rang, false);
    } else {
      // Annuler tous les rangs
      (['A', 'B', 'AB'] as const).forEach((r) => {
        unmarkAsGenerating(r);
        setGeneratingState(r, false);
      });
    }
    
    setLastError('Génération annulée');
  }, [unmarkAsGenerating, setGeneratingState, setLastError]);

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
