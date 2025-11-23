
import logger from '@/lib/logger';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const FREE_TRIAL_KEY = 'med-mng-free-trial-count';
const MAX_FREE_GENERATIONS = 3;

// Type pour les erreurs du free trial
interface FreeTrialError {
  code: string;
  message: string;
}

// Validation des données stockées
const validateStoredCount = (value: string | null): number => {
  if (!value) return 0;
  const count = parseInt(value, 10);
  return isNaN(count) || count < 0 ? 0 : Math.min(count, MAX_FREE_GENERATIONS);
};

export const useFreeTrialLimit = () => {
  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState(0);
  const [canGenerateMore, setCanGenerateMore] = useState(true);
  const [error, setError] = useState<FreeTrialError | null>(null);

  // Initialisation sécurisée des données
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FREE_TRIAL_KEY);
      const count = validateStoredCount(stored);
      setFreeGenerationsUsed(count);
      setCanGenerateMore(count < MAX_FREE_GENERATIONS);
      setError(null);
    } catch (err) {
      logger.error('Erreur lors de la récupération du compteur gratuit:', err);
      setError({
        code: 'STORAGE_ERROR',
        message: 'Erreur d\'accès au stockage local'
      });
      // Fallback: utiliser les valeurs par défaut
      setFreeGenerationsUsed(0);
      setCanGenerateMore(true);
    }
  }, []);

  const incrementFreeGeneration = useCallback(() => {
    try {
      const newCount = Math.min(freeGenerationsUsed + 1, MAX_FREE_GENERATIONS);
      setFreeGenerationsUsed(newCount);
      localStorage.setItem(FREE_TRIAL_KEY, newCount.toString());
      
      const canGenerate = newCount < MAX_FREE_GENERATIONS;
      setCanGenerateMore(canGenerate);

      if (newCount >= MAX_FREE_GENERATIONS) {
        toast.error(`🎵 Limite atteinte ! Vous avez utilisé vos ${MAX_FREE_GENERATIONS} générations gratuites. Abonnez-vous pour continuer !`);
      } else {
        toast.success(`🎵 Génération gratuite utilisée. Il vous reste ${MAX_FREE_GENERATIONS - newCount} génération(s) gratuite(s).`);
      }
      
      setError(null);
      return true;
    } catch (err) {
      logger.error('Erreur lors de l\'incrément du compteur:', err);
      setError({
        code: 'INCREMENT_ERROR',
        message: 'Erreur lors de la mise à jour du compteur'
      });
      toast.error('Erreur lors de la mise à jour du compteur de générations');
      return false;
    }
  }, [freeGenerationsUsed]);

  const checkCanGenerate = useCallback((isAuthenticated: boolean): boolean => {
    if (isAuthenticated) {
      return true; // Les utilisateurs connectés n'ont pas de limite (selon leur abonnement)
    }
    
    if (!canGenerateMore) {
      toast.error(`🚫 Limite atteinte ! Vous avez déjà utilisé vos ${MAX_FREE_GENERATIONS} générations gratuites. Connectez-vous pour continuer !`);
      return false;
    }
    
    return true;
  }, [canGenerateMore]);

  const getRemainingGenerations = useCallback((): number => {
    return Math.max(0, MAX_FREE_GENERATIONS - freeGenerationsUsed);
  }, [freeGenerationsUsed]);

  const resetFreeTrialCount = useCallback(() => {
    try {
      localStorage.removeItem(FREE_TRIAL_KEY);
      setFreeGenerationsUsed(0);
      setCanGenerateMore(true);
      setError(null);
      toast.success('Compteur de générations gratuites réinitialisé');
      return true;
    } catch (err) {
      logger.error('Erreur lors de la réinitialisation:', err);
      setError({
        code: 'RESET_ERROR',
        message: 'Erreur lors de la réinitialisation'
      });
      toast.error('Erreur lors de la réinitialisation du compteur');
      return false;
    }
  }, []);

  return {
    freeGenerationsUsed,
    canGenerateMore,
    maxFreeGenerations: MAX_FREE_GENERATIONS,
    error,
    incrementFreeGeneration,
    checkCanGenerate,
    getRemainingGenerations,
    resetFreeTrialCount
  };
};
