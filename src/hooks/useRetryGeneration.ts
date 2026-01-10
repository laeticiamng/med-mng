import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryOn?: (error: Error) => boolean;
}

interface RetryState {
  attempts: number;
  lastError: Error | null;
  isRetrying: boolean;
  nextRetryIn: number | null;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 2000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryOn: (error) => {
    // Retry sur les erreurs réseau et timeout
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('réessay') ||
      message.includes('quota')
    );
  }
};

export const useRetryGeneration = <T>(
  generationFn: () => Promise<T>,
  config: RetryConfig = {}
) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<RetryState>({
    attempts: 0,
    lastError: null,
    isRetrying: false,
    nextRetryIn: null
  });
  
  const abortRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calcul du délai avec backoff exponentiel
  const calculateDelay = useCallback((attempt: number) => {
    const delay = mergedConfig.baseDelay * Math.pow(mergedConfig.backoffFactor, attempt);
    return Math.min(delay, mergedConfig.maxDelay);
  }, [mergedConfig]);

  // Fonction de retry principale
  const executeWithRetry = useCallback(async (): Promise<T> => {
    abortRef.current = false;
    
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= mergedConfig.maxRetries) {
      if (abortRef.current) {
        throw new Error('Génération annulée');
      }

      try {
        setState(prev => ({ 
          ...prev, 
          attempts: attempt, 
          isRetrying: attempt > 0,
          nextRetryIn: null
        }));

        const result = await generationFn();
        
        // Succès - réinitialiser l'état
        setState({
          attempts: 0,
          lastError: null,
          isRetrying: false,
          nextRetryIn: null
        });
        
        if (attempt > 0) {
          toast.success(`✅ Réussi après ${attempt} tentative${attempt > 1 ? 's' : ''}`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        setState(prev => ({ ...prev, lastError }));

        // Vérifier si on doit retry
        if (attempt < mergedConfig.maxRetries && mergedConfig.retryOn(lastError)) {
          const delay = calculateDelay(attempt);
          
          toast.warning(`⚠️ Tentative ${attempt + 1}/${mergedConfig.maxRetries + 1} échouée`, {
            description: `Nouvelle tentative dans ${Math.round(delay / 1000)}s...`
          });

          // Countdown
          let remaining = delay;
          const countdownInterval = setInterval(() => {
            remaining -= 1000;
            if (remaining > 0) {
              setState(prev => ({ ...prev, nextRetryIn: Math.ceil(remaining / 1000) }));
            }
          }, 1000);

          await new Promise<void>((resolve) => {
            timerRef.current = setTimeout(() => {
              clearInterval(countdownInterval);
              resolve();
            }, delay);
          });

          attempt++;
        } else {
          // Plus de retries ou erreur non-retryable
          break;
        }
      }
    }

    // Toutes les tentatives ont échoué
    setState(prev => ({
      ...prev,
      isRetrying: false,
      nextRetryIn: null
    }));

    throw lastError || new Error('Génération échouée après plusieurs tentatives');
  }, [generationFn, mergedConfig, calculateDelay]);

  // Annuler le retry en cours
  const cancelRetry = useCallback(() => {
    abortRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setState({
      attempts: 0,
      lastError: null,
      isRetrying: false,
      nextRetryIn: null
    });
  }, []);

  // Réinitialiser l'état
  const reset = useCallback(() => {
    cancelRetry();
  }, [cancelRetry]);

  return {
    executeWithRetry,
    cancelRetry,
    reset,
    ...state
  };
};
