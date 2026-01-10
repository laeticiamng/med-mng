/**
 * Hook de polling adaptatif pour la génération musicale
 * Avec retry automatique et backoff exponentiel
 */

import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PollingProgress } from '@/types/music';

// Intervalles adaptatifs selon la phase de génération
const FAST_POLL_INTERVAL = 3000;   // 3s - Début (0-30s)
const NORMAL_POLL_INTERVAL = 5000; // 5s - Milieu (30s-2min)
const SLOW_POLL_INTERVAL = 8000;   // 8s - Fin (2min+)

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
}

export const useMusicPolling = () => {
  const pollingStateRef = useRef<Map<string, PollingState>>(new Map());

  // Calculer l'intervalle adaptatif selon le temps écoulé
  const getAdaptiveInterval = (elapsedMs: number, consecutiveErrors: number): number => {
    // Backoff exponentiel si erreurs consécutives
    if (consecutiveErrors > 0) {
      return Math.min(SLOW_POLL_INTERVAL * Math.pow(1.5, consecutiveErrors), 30000);
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

  // Calculer la progression estimée
  const calculateProgress = (elapsedMs: number): number => {
    if (elapsedMs < 30000) {
      return (elapsedMs / 30000) * 30; // 0-30%
    } else if (elapsedMs < 60000) {
      return 30 + ((elapsedMs - 30000) / 30000) * 20; // 30-50%
    } else if (elapsedMs < 120000) {
      return 50 + ((elapsedMs - 60000) / 60000) * 30; // 50-80%
    } else if (elapsedMs < 300000) {
      return 80 + Math.min(((elapsedMs - 120000) / 180000) * 15, 15); // 80-95%
    }
    return 95; // Cap à 95% avant completion
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
    const maxTimeoutMs = 5 * 60 * 1000; // 5 minutes max

    // Initialiser l'état
    const state: PollingState = {
      intervalId: null,
      pollCount: 0,
      consecutiveErrors: 0,
      startTime: Date.now(),
      stopped: false
    };
    
    pollingStateRef.current.set(taskId, state);

    const poll = async () => {
      const currentState = pollingStateRef.current.get(taskId);
      if (!currentState || currentState.stopped) {
        return;
      }

      currentState.pollCount++;
      const elapsedMs = Date.now() - currentState.startTime;
      
      // Timeout global
      if (elapsedMs > maxTimeoutMs) {
        stopPolling(taskId);
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
        Math.round((maxTimeoutMs - elapsedMs) / 60000), 
        0
      );
      
      onProgress(rang, {
        progress: Math.round(progress),
        attempts: currentState.pollCount,
        maxAttempts: maxPolls,
        estimatedTimeRemaining
      });

      try {
        const { data: pollData, error: pollError } = await supabase.functions.invoke('music-status', {
          body: { taskId }
        });

        if (pollError) {
          currentState.consecutiveErrors++;
          console.warn(`[useMusicPolling] Erreur polling (${currentState.consecutiveErrors}/${maxConsecutiveErrors}):`, pollError);
          
          if (currentState.consecutiveErrors >= maxConsecutiveErrors) {
            stopPolling(taskId);
            onError(new Error(`Erreur réseau persistante après ${currentState.consecutiveErrors} tentatives`));
            return;
          }
          
          // Réajuster l'intervalle avec backoff
          scheduleNextPoll(taskId, elapsedMs, currentState.consecutiveErrors);
          return;
        }

        // Reset erreurs consécutives sur succès
        currentState.consecutiveErrors = 0;

        // Vérifier si génération terminée avec succès
        if (pollData?.status === 'completed' && pollData?.audioUrl) {
          stopPolling(taskId);
          
          onProgress(rang, {
            progress: 100,
            attempts: currentState.pollCount,
            maxAttempts: maxPolls,
            estimatedTimeRemaining: 0
          });
          
          onSuccess(rang, pollData.audioUrl);
          return;
        }

        // Vérifier si erreur définitive
        if (pollData?.status === 'failed') {
          stopPolling(taskId);
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

  return {
    startPolling,
    stopPolling,
    stopAllPolling
  };
};
