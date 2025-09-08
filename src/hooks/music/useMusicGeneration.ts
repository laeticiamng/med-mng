// ==========================================
// MED-MNG MUSIC GENERATION HOOK - Architecture optimisée
// ==========================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { 
  GenerationRequest, 
  GenerationStatus, 
  MusicTrack, 
  MusicGenerationProgress 
} from '@/types';

interface UseMusicGenerationProps {
  onProgress?: (progress: MusicGenerationProgress) => void;
  onSuccess?: (track: MusicTrack) => void;
  onError?: (error: Error) => void;
}

interface GenerationState {
  isGenerating: boolean;
  currentRequest: GenerationRequest | null;
  progress: MusicGenerationProgress | null;
  generatedTracks: Record<string, MusicTrack>;
  error: string | null;
}

export const useMusicGeneration = (props: UseMusicGenerationProps = {}) => {
  const { onProgress, onSuccess, onError } = props;
  const { toast } = useToast();

  // State consolidé
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    currentRequest: null,
    progress: null,
    generatedTracks: {},
    error: null
  });

  // Refs pour éviter les re-renders
  const activePollingRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // Constants
  const MAX_RETRIES = 3;
  const POLLING_INTERVAL = 5000;
  const TIMEOUT_DURATION = 300000; // 5 minutes

  // Nettoyage automatique
  useEffect(() => {
    return () => {
      if (activePollingRef.current) {
        clearInterval(activePollingRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Mise à jour du state de façon immutable
  const updateState = useCallback((updates: Partial<GenerationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Validation des paramètres de génération
  const validateGenerationRequest = useCallback((request: GenerationRequest): string | null => {
    if (!request.item_code?.trim()) {
      return 'Code item requis';
    }
    if (!request.rang || !['A', 'B', 'AB'].includes(request.rang)) {
      return 'Rang invalide (A, B ou AB requis)';
    }
    if (!request.lyrics || request.lyrics.length === 0) {
      return 'Paroles requises';
    }
    if (!request.style?.trim()) {
      return 'Style musical requis';
    }
    if (request.duration < 60 || request.duration > 600) {
      return 'Durée doit être entre 60 et 600 secondes';
    }
    return null;
  }, []);

  // Génération optimisée avec gestion d'erreurs
  const generateMusic = useCallback(async (request: GenerationRequest): Promise<string> => {
    console.log('🎵 [useMusicGeneration] Démarrage génération:', request);

    // Validation
    const validationError = validateGenerationRequest(request);
    if (validationError) {
      throw new Error(validationError);
    }

    // Arrêt génération précédente si active
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Nouveau contrôleur d'annulation
    abortControllerRef.current = new AbortController();
    retryCountRef.current = 0;

    // Reset state
    updateState({
      isGenerating: true,
      currentRequest: request,
      error: null,
      progress: {
        rang: request.rang,
        status: 'pending',
        progress: 0,
        stage: 'initializing'
      }
    });

    try {
      // Appel API Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-music-v2', {
        body: {
          ...request,
          fast_mode: request.fast_mode ?? true,
          priority: request.priority ?? 'normal'
        },
        // signal: abortControllerRef.current.signal // À implémenter si supporté par Supabase
      });

      if (error) {
        throw new Error(`API Error: ${error.message}`);
      }

      if (!data?.task_id) {
        throw new Error('Aucun ID de tâche reçu');
      }

      console.log('✅ [useMusicGeneration] Tâche créée:', data.task_id);

      // Démarrer le polling
      startPolling(data.task_id, request);

      // Notification de démarrage
      toast({
        title: `🎵 Génération ${request.rang} lancée`,
        description: `${request.item_code} - Style: ${request.style}`,
      });

      return data.task_id;

    } catch (error) {
      console.error('❌ [useMusicGeneration] Erreur génération:', error);
      
      updateState({
        isGenerating: false,
        error: error.message,
        progress: {
          rang: request.rang,
          status: 'failed',
          progress: 0,
          stage: 'initializing'
        }
      });

      onError?.(error as Error);
      
      throw error;
    }
  }, [updateState, validateGenerationRequest, onError, toast]);

  // Polling optimisé avec exponential backoff
  const startPolling = useCallback((taskId: string, request: GenerationRequest) => {
    console.log('🔄 [useMusicGeneration] Démarrage polling:', taskId);

    let pollCount = 0;
    const maxPolls = Math.floor(TIMEOUT_DURATION / POLLING_INTERVAL);

    const poll = async () => {
      try {
        pollCount++;
        
        // Timeout check
        if (pollCount > maxPolls) {
          throw new Error('Délai d\'attente de génération dépassé');
        }

        const { data, error } = await supabase.functions.invoke('get-generation-status', {
          method: 'POST',
          body: { task_id: taskId }
        });

        if (error) {
          throw new Error(`Status Error: ${error.message}`);
        }

        const status = data as GenerationStatus;
        console.log(`🔍 [Poll ${pollCount}] Status:`, status.status, `(${status.progress}%)`);

        // Mise à jour progress
        const progressUpdate: MusicGenerationProgress = {
          rang: request.rang,
          status: status.status,
          progress: status.progress,
          stage: status.stage,
          currentTask: getStageDescription(status.stage),
          estimatedTimeRemaining: calculateEstimatedTime(status.progress)
        };

        updateState({ progress: progressUpdate });
        onProgress?.(progressUpdate);

        // Génération terminée avec succès
        if (status.status === 'completed' && data.track) {
          console.log('✅ [useMusicGeneration] Génération terminée:', data.track);
          
          const track = data.track as MusicTrack;
          
          updateState({
            isGenerating: false,
            generatedTracks: {
              ...state.generatedTracks,
              [`${request.item_code}_${request.rang}`]: track
            },
            progress: {
              ...progressUpdate,
              status: 'completed',
              progress: 100
            }
          });

          // Stop polling
          if (activePollingRef.current) {
            clearInterval(activePollingRef.current);
            activePollingRef.current = null;
          }

          // Notifications et callbacks
          toast({
            title: `🎉 ${request.item_code} Rang ${request.rang} généré !`,
            description: `Musique prête - ${Math.floor(request.duration/60)}min${request.duration%60}s`,
          });

          onSuccess?.(track);
          return;
        }

        // Génération échouée
        if (status.status === 'failed') {
          throw new Error(status.error_message || 'Génération échouée');
        }

        // Continue polling pour status pending/processing
        
      } catch (error) {
        console.error(`❌ [Poll ${pollCount}] Erreur:`, error);
        
        // Retry logic avec exponential backoff
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          console.log(`🔄 Retry ${retryCountRef.current}/${MAX_RETRIES} dans ${retryCountRef.current * 2}s`);
          
          setTimeout(() => {
            if (activePollingRef.current) {
              poll();
            }
          }, retryCountRef.current * 2000); // 2s, 4s, 6s delays
          return;
        }

        // Max retries atteint
        if (activePollingRef.current) {
          clearInterval(activePollingRef.current);
          activePollingRef.current = null;
        }

        updateState({
          isGenerating: false,
          error: error.message,
          progress: {
            rang: request.rang,
            status: 'failed',
            progress: 0,
            stage: 'initializing'
          }
        });

        onError?.(error as Error);

        toast({
          title: "❌ Génération échouée",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    // Démarrer polling
    activePollingRef.current = setInterval(poll, POLLING_INTERVAL);
    poll(); // Premier appel immédiat
    
  }, [updateState, onProgress, onSuccess, onError, toast]);

  // Annulation de génération
  const cancelGeneration = useCallback(() => {
    console.log('🛑 [useMusicGeneration] Annulation génération');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (activePollingRef.current) {
      clearInterval(activePollingRef.current);
      activePollingRef.current = null;
    }

    updateState({
      isGenerating: false,
      currentRequest: null,
      error: null,
      progress: null
    });

    toast({
      title: "Génération annulée",
      description: "La génération musicale a été interrompue",
      variant: "default"
    });
  }, [updateState, toast]);

  // Reset complet
  const resetGeneration = useCallback(() => {
    cancelGeneration();
    updateState({
      generatedTracks: {},
      error: null,
      progress: null,
      currentRequest: null
    });
  }, [cancelGeneration, updateState]);

  // Utilitaires
  const getStageDescription = (stage: string): string => {
    const descriptions = {
      initializing: 'Initialisation...',
      generating_lyrics: 'Génération des paroles...',
      creating_music: 'Création musicale...',
      processing_audio: 'Traitement audio...',
      finalizing: 'Finalisation...',
      uploading: 'Téléversement...'
    };
    return descriptions[stage] || stage;
  };

  const calculateEstimatedTime = (progress: number): number => {
    if (progress <= 0) return TIMEOUT_DURATION / 1000;
    const elapsed = Date.now() - (state.progress?.estimatedTimeRemaining || Date.now());
    return Math.max(0, Math.floor((elapsed / progress) * (100 - progress) / 1000));
  };

  return {
    // State
    isGenerating: state.isGenerating,
    currentRequest: state.currentRequest,
    progress: state.progress,
    generatedTracks: state.generatedTracks,
    error: state.error,

    // Actions
    generateMusic,
    cancelGeneration,
    resetGeneration,

    // Helpers
    getTrackByRang: (itemCode: string, rang: string) => 
      state.generatedTracks[`${itemCode}_${rang}`] || null,
    
    hasTrackForRang: (itemCode: string, rang: string) => 
      Boolean(state.generatedTracks[`${itemCode}_${rang}`])
  };
};