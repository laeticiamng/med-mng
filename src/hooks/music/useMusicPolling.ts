/**
 * Hook de polling adaptatif pour la génération musicale
 * Avec retry automatique, backoff exponentiel et circuit breaker
 * ✅ Enrichi: Meilleure gestion des erreurs, états détaillés, persistance
 */

import { useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PollingProgress } from '@/types/music';

// Intervalles adaptatifs selon la phase de génération
const FAST_POLL_INTERVAL = 3000;   // 3s - Début (0-30s)
const NORMAL_POLL_INTERVAL = 5000; // 5s - Milieu (30s-2min)
const SLOW_POLL_INTERVAL = 8000;   // 8s - Fin (2min+)
const MAX_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes max

interface PollingConfig {
  taskId: string;
  rang: 'A' | 'B' | 'AB';
  maxPolls?: number;
  onProgress: (rang: 'A' | 'B' | 'AB', progress: PollingProgress) => void;
  onSuccess: (rang: 'A' | 'B' | 'AB', audioUrl: string) => void;
  onError: (error: Error) => void;
}

interface PollingState {
  intervalId: NodeJS.Timeout | null;
  pollCount: number;
  consecutiveErrors: number;
  startTime: number;
  stopped: boolean;
  lastPollTime: number;
  circuitBreakerOpen: boolean;
}

// ✅ Stocker les tâches actives pour persistance (survit aux re-renders)
const activePollingTasks = new Map<string, PollingState>();

export const useMusicPolling = () => {
  const pollingStateRef = useRef<Map<string, PollingState>>(activePollingTasks);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      // Ne pas stopper le polling au démontage pour permettre la persistance
      // Le composant parent peut appeler stopAllPolling si nécessaire
    };
  }, []);

  // Calculer l'intervalle adaptatif selon le temps écoulé
  const getAdaptiveInterval = (elapsedMs: number, consecutiveErrors: number): number => {
    // Circuit breaker: si trop d'erreurs, ralentir drastiquement
    if (consecutiveErrors >= 3) {
      return Math.min(SLOW_POLL_INTERVAL * Math.pow(1.5, consecutiveErrors - 2), 30000);
    }
    
    // Intervalle adaptatif selon la phase
    if (elapsedMs < 30000) {
      return FAST_POLL_INTERVAL; // Début: poll rapide
    } else if (elapsedMs < 120000) {
      return NORMAL_POLL_INTERVAL; // Milieu: poll normal
    } else {
      return SLOW_POLL_INTERVAL; // Fin: poll lent
    }
  };

  // Calculer la progression estimée basée sur le temps écoulé
  const calculateProgress = (elapsedMs: number): number => {
    if (elapsedMs < 30000) {
      return (elapsedMs / 30000) * 30; // 0-30%
    } else if (elapsedMs < 60000) {
      return 30 + ((elapsedMs - 30000) / 30000) * 20; // 30-50%
    } else if (elapsedMs < 120000) {
      return 50 + ((elapsedMs - 60000) / 60000) * 30; // 50-80%
    } else if (elapsedMs < MAX_TIMEOUT_MS) {
      return 80 + Math.min(((elapsedMs - 120000) / 180000) * 15, 15); // 80-95%
    }
    return 95; // Cap à 95% avant completion
  };

  // ✅ Vérifier d'abord en BDD (le callback peut avoir déjà mis à jour)
  const checkDatabaseFirst = async (taskId: string): Promise<{ found: boolean; audioUrl?: string; status?: string; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('generated_music_tracks')
        .select('audio_url, generation_status, metadata')
        .eq('task_id', taskId)
        .maybeSingle();

      if (error) {
        console.warn('[useMusicPolling] Erreur BDD:', error);
        return { found: false };
      }

      if (data?.generation_status === 'completed' && data?.audio_url) {
        return { found: true, audioUrl: data.audio_url, status: 'completed' };
      }

      if (data?.generation_status === 'failed') {
        const errorMsg = typeof data.metadata === 'object' && data.metadata 
          ? (data.metadata as Record<string, unknown>).error as string || 'Génération échouée'
          : 'Génération échouée';
        return { found: true, status: 'failed', error: errorMsg };
      }

      if (data?.generation_status === 'cancelled') {
        return { found: true, status: 'cancelled', error: 'Génération annulée' };
      }

      return { found: false };
    } catch (err) {
      console.warn('[useMusicPolling] Exception BDD:', err);
      return { found: false };
    }
  };

  const startPolling = useCallback(({ 
    taskId,
    rang, 
    maxPolls = 60,
    onProgress,
    onSuccess,
    onError
  }: PollingConfig) => {
    const maxConsecutiveErrors = 5;

    // ✅ Vérifier si un polling existe déjà pour ce taskId
    const existingState = pollingStateRef.current.get(taskId);
    if (existingState && !existingState.stopped) {
      console.log(`[useMusicPolling] Polling déjà actif pour ${taskId}`);
      return taskId;
    }

    // Initialiser l'état
    const state: PollingState = {
      intervalId: null,
      pollCount: 0,
      consecutiveErrors: 0,
      startTime: Date.now(),
      stopped: false,
      lastPollTime: 0,
      circuitBreakerOpen: false
    };
    
    pollingStateRef.current.set(taskId, state);

    const poll = async () => {
      const currentState = pollingStateRef.current.get(taskId);
      if (!currentState || currentState.stopped) {
        return;
      }

      currentState.pollCount++;
      currentState.lastPollTime = Date.now();
      const elapsedMs = Date.now() - currentState.startTime;
      
      // ✅ Timeout global
      if (elapsedMs > MAX_TIMEOUT_MS) {
        stopPolling(taskId);
        onProgress(rang, {
          progress: 95,
          attempts: currentState.pollCount,
          maxAttempts: maxPolls,
          estimatedTimeRemaining: 0,
          status: 'timeout',
          elapsedMs
        });
        onError(new Error('Timeout de génération (5 min). Suno est peut-être occupé, réessayez.'));
        return;
      }

      // Max polls atteint
      if (currentState.pollCount >= maxPolls) {
        stopPolling(taskId);
        onError(new Error('Nombre maximum de tentatives atteint'));
        return;
      }

      // Calculer et reporter la progression
      const progress = calculateProgress(elapsedMs);
      const estimatedTimeRemaining = Math.max(
        Math.round((MAX_TIMEOUT_MS - elapsedMs) / 60000), 
        0
      );
      
      onProgress(rang, {
        progress: Math.round(progress),
        attempts: currentState.pollCount,
        maxAttempts: maxPolls,
        estimatedTimeRemaining,
        status: 'polling',
        elapsedMs
      });

      try {
        // ✅ Vérifier d'abord en BDD (callback peut avoir déjà mis à jour)
        const dbCheck = await checkDatabaseFirst(taskId);
        
        if (dbCheck.found) {
          if (dbCheck.status === 'completed' && dbCheck.audioUrl) {
            stopPolling(taskId);
            onProgress(rang, {
              progress: 100,
              attempts: currentState.pollCount,
              maxAttempts: maxPolls,
              estimatedTimeRemaining: 0,
              status: 'success',
              elapsedMs
            });
            onSuccess(rang, dbCheck.audioUrl);
            return;
          }
          
          if (dbCheck.status === 'failed' || dbCheck.status === 'cancelled') {
            stopPolling(taskId);
            onProgress(rang, {
              progress: 0,
              attempts: currentState.pollCount,
              maxAttempts: maxPolls,
              estimatedTimeRemaining: 0,
              status: 'error',
              elapsedMs
            });
            onError(new Error(dbCheck.error || 'Génération échouée'));
            return;
          }
        }

        // Appeler l'edge function music-status
        const { data: pollData, error: pollError } = await supabase.functions.invoke('music-status', {
          body: { taskId }
        });

        if (pollError) {
          currentState.consecutiveErrors++;
          console.warn(`[useMusicPolling] Erreur polling (${currentState.consecutiveErrors}/${maxConsecutiveErrors}):`, pollError);
          
          // ✅ Circuit breaker
          if (currentState.consecutiveErrors >= maxConsecutiveErrors) {
            currentState.circuitBreakerOpen = true;
            stopPolling(taskId);
            onProgress(rang, {
              progress: Math.round(progress),
              attempts: currentState.pollCount,
              maxAttempts: maxPolls,
              estimatedTimeRemaining: 0,
              status: 'error',
              elapsedMs
            });
            onError(new Error(`Erreur réseau persistante après ${currentState.consecutiveErrors} tentatives`));
            return;
          }
          
          // Réajuster l'intervalle avec backoff
          scheduleNextPoll(taskId, elapsedMs, currentState.consecutiveErrors);
          return;
        }

        // Reset erreurs consécutives sur succès
        currentState.consecutiveErrors = 0;
        currentState.circuitBreakerOpen = false;

        // Vérifier si génération terminée avec succès
        if (pollData?.status === 'completed' && pollData?.audioUrl) {
          stopPolling(taskId);
          
          onProgress(rang, {
            progress: 100,
            attempts: currentState.pollCount,
            maxAttempts: maxPolls,
            estimatedTimeRemaining: 0,
            status: 'success',
            elapsedMs
          });
          
          onSuccess(rang, pollData.audioUrl);
          return;
        }

        // Vérifier si erreur définitive
        if (pollData?.status === 'failed') {
          stopPolling(taskId);
          onProgress(rang, {
            progress: 0,
            attempts: currentState.pollCount,
            maxAttempts: maxPolls,
            estimatedTimeRemaining: 0,
            status: 'error',
            elapsedMs
          });
          onError(new Error(pollData.error || 'Génération échouée'));
          return;
        }

        // Continuer le polling avec intervalle adaptatif
        scheduleNextPoll(taskId, elapsedMs, 0);
        
      } catch (pollError) {
        currentState.consecutiveErrors++;
        console.error(`[useMusicPolling] Erreur critique:`, pollError);
        
        if (currentState.consecutiveErrors >= maxConsecutiveErrors) {
          stopPolling(taskId);
          onError(pollError as Error);
        } else {
          scheduleNextPoll(taskId, elapsedMs, currentState.consecutiveErrors);
        }
      }
    };

    const scheduleNextPoll = (taskId: string, elapsedMs: number, consecutiveErrors: number) => {
      const currentState = pollingStateRef.current.get(taskId);
      if (!currentState || currentState.stopped) return;

      // Calculer le prochain intervalle
      const nextInterval = getAdaptiveInterval(elapsedMs, consecutiveErrors);
      
      // Programmer le prochain poll
      currentState.intervalId = setTimeout(poll, nextInterval);
    };

    // Démarrer le premier poll après un court délai
    state.intervalId = setTimeout(poll, FAST_POLL_INTERVAL);

    return taskId;
  }, []);

  const stopPolling = useCallback((taskId: string) => {
    const state = pollingStateRef.current.get(taskId);
    if (state) {
      state.stopped = true;
      if (state.intervalId) {
        clearTimeout(state.intervalId);
        state.intervalId = null;
      }
      pollingStateRef.current.delete(taskId);
    }
  }, []);

  const stopAllPolling = useCallback(() => {
    pollingStateRef.current.forEach((state, taskId) => {
      stopPolling(taskId);
    });
  }, [stopPolling]);

  // ✅ Obtenir les tâches actives
  const getActivePollingTasks = useCallback((): string[] => {
    return Array.from(pollingStateRef.current.keys()).filter(taskId => {
      const state = pollingStateRef.current.get(taskId);
      return state && !state.stopped;
    });
  }, []);

  // ✅ Vérifier si une tâche est en polling
  const isPolling = useCallback((taskId: string): boolean => {
    const state = pollingStateRef.current.get(taskId);
    return state !== undefined && !state.stopped;
  }, []);

  return {
    startPolling,
    stopPolling,
    stopAllPolling,
    getActivePollingTasks,
    isPolling
  };
};
