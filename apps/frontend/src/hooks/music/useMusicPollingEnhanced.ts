/**
 * 🎵 Polling Amélioré avec Backoff Exponentiel
 *
 * Améliore la fiabilité du polling avec:
 * - Backoff exponentiel (intervalles croissants)
 * - Retry avec jitter (évite la synchronisation)
 * - Timeout progressif (plus tolérant)
 * - Gestion d'erreurs robuste
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MusicGenerationRequest, PollingProgress } from '@shared/types/music';
import { useToast } from '@/hooks/use-toast';

interface PollingConfig {
  rang: 'A' | 'B';
  requestBody: MusicGenerationRequest;
  onProgress: (rang: 'A' | 'B', progress: PollingProgress) => void;
  onSuccess: (rang: 'A' | 'B', audioUrl: string) => void;
  onError: (error: Error) => void;
}

interface PollingState {
  isPolling: boolean;
  attempts: number;
  lastError: Error | null;
}

export const useMusicPollingEnhanced = () => {
  const [pollingState, setPollingState] = useState<PollingState>({
    isPolling: false,
    attempts: 0,
    lastError: null
  });
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Calculer l'intervalle avec backoff exponentiel + jitter
   */
  const calculateBackoffInterval = (attempt: number): number => {
    // Base: 2 secondes
    // Backoff: 2^attempt secondes
    // Max: 30 secondes
    const baseInterval = 2000; // 2s
    const exponentialBackoff = Math.min(baseInterval * Math.pow(1.5, attempt), 30000);

    // Jitter: +/- 20% pour éviter synchronisation
    const jitter = exponentialBackoff * 0.2 * (Math.random() - 0.5);

    return Math.round(exponentialBackoff + jitter);
  };

  /**
   * Calculer le timeout total en fonction des tentatives
   */
  const calculateTimeout = (maxAttempts: number): number => {
    // Somme géométrique des intervalles
    let totalTime = 0;
    for (let i = 0; i < maxAttempts; i++) {
      totalTime += calculateBackoffInterval(i);
    }
    return totalTime;
  };

  /**
   * Démarrer le polling avec backoff exponentiel
   */
  const startPolling = useCallback(({
    rang,
    requestBody,
    onProgress,
    onSuccess,
    onError
  }: PollingConfig) => {
    console.log('🚀 Démarrage polling amélioré avec backoff exponentiel');

    // Configuration
    const maxAttempts = 40; // Augmenté pour supporter le backoff
    const maxConsecutiveErrors = 5;
    let pollCount = 0;
    let consecutiveErrors = 0;

    const startTime = Date.now();
    const timeout = calculateTimeout(maxAttempts); // ~10 minutes

    // Reset state
    setPollingState({
      isPolling: true,
      attempts: 0,
      lastError: null
    });

    // Créer un AbortController pour pouvoir annuler
    abortControllerRef.current = new AbortController();

    const pollOnce = async () => {
      try {
        pollCount++;

        // Vérifier timeout global
        const elapsed = Date.now() - startTime;
        if (elapsed > timeout) {
          console.log('⏰ Timeout global atteint');
          stopPolling();
          onError(new Error(`Timeout: La génération prend trop de temps (${Math.round(timeout / 1000)}s)`));
          return;
        }

        // Calculer progression basée sur le temps écoulé
        const progressPercentage = Math.min(Math.round((elapsed / timeout) * 95), 98);
        const remainingTime = Math.max(Math.round((timeout - elapsed) / 60000), 0);

        console.log(`🔄 Polling ${pollCount}/${maxAttempts} - Progress: ${progressPercentage}% - Remaining: ${remainingTime}min`);

        onProgress(rang, {
          progress: progressPercentage,
          attempts: pollCount,
          maxAttempts,
          estimatedTimeRemaining: remainingTime
        });

        // Appel API
        const { data: pollData, error: pollError } = await supabase.functions.invoke('generate-music', {
          body: requestBody
        });

        if (pollError) {
          consecutiveErrors++;
          console.warn(`⚠️ Erreur polling ${pollCount} (${consecutiveErrors}/${maxConsecutiveErrors}):`, pollError);

          setPollingState(prev => ({
            ...prev,
            attempts: pollCount,
            lastError: pollError
          }));

          // Trop d'erreurs consécutives
          if (consecutiveErrors >= maxConsecutiveErrors) {
            stopPolling();
            onError(new Error(`Trop d'erreurs consécutives (${consecutiveErrors})`));
            return;
          }

          // Continuer avec backoff plus long
          scheduleNextPoll(pollCount);
          return;
        }

        // Reset erreurs si succès
        consecutiveErrors = 0;
        console.log(`📥 Réponse polling ${pollCount}:`, pollData);

        // Vérifier si terminé avec succès
        if (pollData?.status === 'success' && pollData?.audioUrl) {
          console.log('✅ GÉNÉRATION TERMINÉE:', pollData.audioUrl);
          stopPolling();

          // Progress à 100%
          onProgress(rang, {
            progress: 100,
            attempts: pollCount,
            maxAttempts,
            estimatedTimeRemaining: 0
          });

          toast({
            title: "🎵 Musique générée !",
            description: `Rang ${rang} - Génération terminée en ${Math.round(elapsed / 1000)}s`,
          });

          onSuccess(rang, pollData.audioUrl);
          return;
        }

        // Vérifier erreur définitive
        if (pollData?.status === 'error' || pollData?.status === 'failed') {
          stopPolling();
          onError(new Error(pollData.message || 'Erreur lors de la génération'));
          return;
        }

        // Continuer polling
        if (pollCount >= maxAttempts) {
          stopPolling();
          onError(new Error(`Timeout: Nombre maximum de tentatives atteint (${maxAttempts})`));
          return;
        }

        scheduleNextPoll(pollCount);

      } catch (error) {
        consecutiveErrors++;
        console.error(`❌ Erreur critique polling ${pollCount}:`, error);

        if (consecutiveErrors >= maxConsecutiveErrors || pollCount >= maxAttempts) {
          stopPolling();
          onError(error as Error);
        } else {
          scheduleNextPoll(pollCount);
        }
      }
    };

    const scheduleNextPoll = (currentAttempt: number) => {
      const nextInterval = calculateBackoffInterval(currentAttempt);
      console.log(`⏳ Prochain polling dans ${Math.round(nextInterval / 1000)}s`);

      pollingIntervalRef.current = setTimeout(pollOnce, nextInterval);
    };

    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      setPollingState({
        isPolling: false,
        attempts: pollCount,
        lastError: null
      });
    };

    // Démarrer le premier poll immédiatement
    pollOnce();

    // Retourner fonction de nettoyage
    return stopPolling;
  }, [toast]);

  /**
   * Annuler le polling en cours
   */
  const cancelPolling = useCallback(() => {
    console.log('🛑 Annulation polling');

    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setPollingState({
      isPolling: false,
      attempts: 0,
      lastError: null
    });

    toast({
      title: "Polling annulé",
      description: "La vérification de génération a été arrêtée",
    });
  }, [toast]);

  return {
    startPolling,
    cancelPolling,
    pollingState
  };
};
