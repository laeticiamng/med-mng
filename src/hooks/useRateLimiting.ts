import { useState, useCallback, useEffect } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitState {
  attempts: number;
  firstAttemptTime: number | null;
  blockedUntil: number | null;
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000 // 30 minutes de blocage
};

const STORAGE_KEY = 'auth_rate_limit';

/**
 * Hook pour le rate limiting des tentatives d'authentification
 * Protège contre les attaques par force brute
 */
export const useRateLimiting = (key: string = 'default', config: Partial<RateLimitConfig> = {}) => {
  const mergedConfig = { ...defaultConfig, ...config };
  const storageKey = `${STORAGE_KEY}_${key}`;

  const [state, setState] = useState<RateLimitState>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore localStorage errors
    }
    return {
      attempts: 0,
      firstAttemptTime: null,
      blockedUntil: null
    };
  });

  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Ignore localStorage errors
    }
  }, [state, storageKey]);

  // Vérifier si l'utilisateur est actuellement bloqué
  const isBlocked = useCallback((): boolean => {
    if (state.blockedUntil && Date.now() < state.blockedUntil) {
      return true;
    }
    return false;
  }, [state.blockedUntil]);

  // Obtenir le temps restant de blocage en secondes
  const getRemainingBlockTime = useCallback((): number => {
    if (!state.blockedUntil) return 0;
    const remaining = state.blockedUntil - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }, [state.blockedUntil]);

  // Obtenir le nombre de tentatives restantes
  const getRemainingAttempts = useCallback((): number => {
    // Si la fenêtre de temps est expirée, réinitialiser
    if (state.firstAttemptTime && Date.now() - state.firstAttemptTime > mergedConfig.windowMs) {
      return mergedConfig.maxAttempts;
    }
    return Math.max(0, mergedConfig.maxAttempts - state.attempts);
  }, [state, mergedConfig]);

  // Enregistrer une tentative
  const recordAttempt = useCallback((): {
    allowed: boolean;
    remainingAttempts: number;
    blockedUntil?: number;
    message: string;
  } => {
    const now = Date.now();

    // Vérifier si bloqué
    if (state.blockedUntil && now < state.blockedUntil) {
      const remainingSeconds = Math.ceil((state.blockedUntil - now) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil: state.blockedUntil,
        message: `Trop de tentatives. Réessayez dans ${remainingMinutes} minute(s).`
      };
    }

    // Réinitialiser si la fenêtre de temps est expirée ou si le blocage est terminé
    if (
      (state.firstAttemptTime && now - state.firstAttemptTime > mergedConfig.windowMs) ||
      (state.blockedUntil && now >= state.blockedUntil)
    ) {
      setState({
        attempts: 1,
        firstAttemptTime: now,
        blockedUntil: null
      });
      return {
        allowed: true,
        remainingAttempts: mergedConfig.maxAttempts - 1,
        message: ''
      };
    }

    const newAttempts = state.attempts + 1;

    // Vérifier si on dépasse la limite
    if (newAttempts >= mergedConfig.maxAttempts) {
      const blockedUntil = now + mergedConfig.blockDurationMs;
      setState({
        attempts: newAttempts,
        firstAttemptTime: state.firstAttemptTime || now,
        blockedUntil
      });
      const blockMinutes = Math.ceil(mergedConfig.blockDurationMs / 60000);
      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil,
        message: `Trop de tentatives. Compte bloqué pour ${blockMinutes} minutes.`
      };
    }

    // Enregistrer la tentative
    setState(prev => ({
      attempts: newAttempts,
      firstAttemptTime: prev.firstAttemptTime || now,
      blockedUntil: null
    }));

    const remaining = mergedConfig.maxAttempts - newAttempts;
    return {
      allowed: true,
      remainingAttempts: remaining,
      message: remaining <= 2 ? `Attention: ${remaining} tentative(s) restante(s)` : ''
    };
  }, [state, mergedConfig]);

  // Enregistrer un succès (réinitialise le compteur)
  const recordSuccess = useCallback(() => {
    setState({
      attempts: 0,
      firstAttemptTime: null,
      blockedUntil: null
    });
  }, []);

  // Réinitialiser manuellement
  const reset = useCallback(() => {
    setState({
      attempts: 0,
      firstAttemptTime: null,
      blockedUntil: null
    });
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  }, [storageKey]);

  // Formater le temps de blocage restant
  const formatBlockTime = useCallback((): string => {
    const seconds = getRemainingBlockTime();
    if (seconds <= 0) return '';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  }, [getRemainingBlockTime]);

  return {
    isBlocked,
    getRemainingBlockTime,
    getRemainingAttempts,
    recordAttempt,
    recordSuccess,
    reset,
    formatBlockTime,
    state: {
      attempts: state.attempts,
      maxAttempts: mergedConfig.maxAttempts,
      isCurrentlyBlocked: isBlocked()
    }
  };
};

/**
 * Configuration recommandée pour différents cas d'usage
 */
export const RateLimitPresets = {
  // Pour les tentatives de connexion
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  // Pour les demandes de réinitialisation de mot de passe
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 heure
    blockDurationMs: 60 * 60 * 1000 // 1 heure
  },
  // Pour les inscriptions
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 heure
    blockDurationMs: 24 * 60 * 60 * 1000 // 24 heures
  },
  // Pour les appels API sensibles
  apiCalls: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes
  }
};
