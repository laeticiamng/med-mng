
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const FREE_TRIAL_KEY = 'med-mng-free-trial-count';
const MAX_FREE_GENERATIONS = 3;

export const useFreeTrialLimit = () => {
  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState(0);
  const [canGenerateMore, setCanGenerateMore] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem(FREE_TRIAL_KEY);
    const count = stored ? parseInt(stored, 10) : 0;
    setFreeGenerationsUsed(count);
    setCanGenerateMore(count < MAX_FREE_GENERATIONS);
  }, []);

  const incrementFreeGeneration = () => {
    const newCount = freeGenerationsUsed + 1;
    setFreeGenerationsUsed(newCount);
    localStorage.setItem(FREE_TRIAL_KEY, newCount.toString());
    setCanGenerateMore(newCount < MAX_FREE_GENERATIONS);

    if (newCount >= MAX_FREE_GENERATIONS) {
      toast({
        title: "🎵 Limite atteinte !",
        description: `Vous avez utilisé vos ${MAX_FREE_GENERATIONS} générations gratuites. Abonnez-vous pour continuer !`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "🎵 Génération gratuite utilisée",
        description: `Il vous reste ${MAX_FREE_GENERATIONS - newCount} génération(s) gratuite(s).`,
      });
    }
  };

  const checkCanGenerate = (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      return true; // Les utilisateurs connectés n'ont pas de limite (selon leur abonnement)
    }
    
    if (!canGenerateMore) {
      toast({
        title: "🚫 Limite atteinte",
        description: `Vous avez déjà utilisé vos ${MAX_FREE_GENERATIONS} générations gratuites. Connectez-vous pour continuer !`,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const getRemainingGenerations = () => {
    return Math.max(0, MAX_FREE_GENERATIONS - freeGenerationsUsed);
  };

  return {
    freeGenerationsUsed,
    canGenerateMore,
    maxFreeGenerations: MAX_FREE_GENERATIONS,
    incrementFreeGeneration,
    checkCanGenerate,
    getRemainingGenerations
  };
};
