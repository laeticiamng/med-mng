/**
 * Hook pour retry avec backoff exponentiel
 * Utilisé pour les appels API qui peuvent échouer temporairement
 */

import { useState, useCallback, useRef } from 'react';

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
  nextRetryIn: number | null;
}

export const useRetryWithBackoff = (config: RetryConfig = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    onRetry,
    shouldRetry = () => true
  } = config;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
    nextRetryIn: null
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef(false);

  // Calculer le délai pour un retry donné
  const calculateDelay = useCallback((attempt: number): number => {
    const delay = initialDelay * Math.pow(backoffFactor, attempt);
    // Ajouter un jitter aléatoire (±20%)
    const jitter = delay * 0.2 * (Math.random() - 0.5);
    return Math.min(delay + jitter, maxDelay);
  }, [initialDelay, backoffFactor, maxDelay]);

  // Exécuter une fonction avec retry
  const executeWithRetry = useCallback(async <T>(
    fn: () => Promise<T>,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> => {
    const effectiveMaxRetries = customConfig?.maxRetries ?? maxRetries;
    const effectiveShouldRetry = customConfig?.shouldRetry ?? shouldRetry;
    const effectiveOnRetry = customConfig?.onRetry ?? onRetry;

    abortRef.current = false;
    let attempt = 0;
    let lastError: Error | null = null;

    setState(prev => ({ ...prev, isRetrying: false, retryCount: 0, lastError: null }));

    while (attempt <= effectiveMaxRetries && !abortRef.current) {
      try {
        const result = await fn();
        setState(prev => ({ ...prev, isRetrying: false, retryCount: 0, lastError: null, nextRetryIn: null }));
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt >= effectiveMaxRetries || !effectiveShouldRetry(lastError)) {
          setState(prev => ({ ...prev, isRetrying: false, lastError, nextRetryIn: null }));
          throw lastError;
        }

        const delay = calculateDelay(attempt);
        
        setState(prev => ({ 
          ...prev, 
          isRetrying: true, 
          retryCount: attempt + 1, 
          lastError,
          nextRetryIn: delay
        }));

        effectiveOnRetry?.(attempt + 1, lastError);

        // Attendre avant le prochain retry
        await new Promise<void>((resolve) => {
          timeoutRef.current = setTimeout(() => {
            setState(prev => ({ ...prev, nextRetryIn: null }));
            resolve();
          }, delay);
        });

        attempt++;
      }
    }

    // Si on arrive ici, tous les retries ont échoué
    setState(prev => ({ ...prev, isRetrying: false }));
    throw lastError || new Error('Max retries exceeded');
  }, [maxRetries, shouldRetry, onRetry, calculateDelay]);

  // Annuler les retries en cours
  const abort = useCallback(() => {
    abortRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState(prev => ({ ...prev, isRetrying: false, nextRetryIn: null }));
  }, []);

  // Reset l'état
  const reset = useCallback(() => {
    abort();
    setState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
      nextRetryIn: null
    });
  }, [abort]);

  return {
    ...state,
    executeWithRetry,
    abort,
    reset,
    maxRetries
  };
};

// Hook utilitaire pour déterminer si une erreur est retryable
export const isRetryableError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  
  // Erreurs réseau
  if (message.includes('network') || message.includes('fetch')) return true;
  
  // Timeouts
  if (message.includes('timeout') || message.includes('408')) return true;
  
  // Rate limiting (429) ou service unavailable (503)
  if (message.includes('429') || message.includes('503')) return true;
  
  // Erreurs temporaires Suno
  if (message.includes('455') || message.includes('430') || message.includes('405')) return true;
  
  // Erreurs de connexion
  if (message.includes('connection') || message.includes('econnreset')) return true;
  
  // Ne pas retry les erreurs d'authentification ou de crédits
  if (message.includes('401') || message.includes('402') || message.includes('credits')) return false;
  if (message.includes('authorization') || message.includes('unauthorized')) return false;
  
  // Par défaut, retry les erreurs 5xx
  if (message.includes('500') || message.includes('502') || message.includes('504')) return true;
  
  return false;
};
