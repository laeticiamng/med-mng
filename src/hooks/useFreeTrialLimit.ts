import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const MAX_FREE_GENERATIONS = 3;

interface FreeTrialError {
  code: string;
  message: string;
}

export const useFreeTrialLimit = () => {
  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState(0);
  const [canGenerateMore, setCanGenerateMore] = useState(true);
  const [error, setError] = useState<FreeTrialError | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data } = await (supabase as any)
            .from('free_trial_usage')
            .select('generations_used')
            .eq('user_id', user.id)
            .single();
          
          const count = data?.generations_used || 0;
          setFreeGenerationsUsed(count);
          setCanGenerateMore(count < MAX_FREE_GENERATIONS);
        } else {
          // Non-authenticated: use localStorage fallback
          const stored = localStorage.getItem('med-mng-free-trial-count');
          const count = stored ? Math.min(parseInt(stored, 10) || 0, MAX_FREE_GENERATIONS) : 0;
          setFreeGenerationsUsed(count);
          setCanGenerateMore(count < MAX_FREE_GENERATIONS);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading free trial usage:', err);
        setError({ code: 'LOAD_ERROR', message: 'Erreur de chargement' });
      }
    };
    loadUsage();
  }, []);

  const incrementFreeGeneration = useCallback(async () => {
    try {
      const newCount = Math.min(freeGenerationsUsed + 1, MAX_FREE_GENERATIONS);
      setFreeGenerationsUsed(newCount);
      setCanGenerateMore(newCount < MAX_FREE_GENERATIONS);

      if (userId) {
        await (supabase as any).from('free_trial_usage').upsert({
          user_id: userId,
          generations_used: newCount,
          last_generation_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      } else {
        localStorage.setItem('med-mng-free-trial-count', newCount.toString());
      }

      if (newCount >= MAX_FREE_GENERATIONS) {
        toast.error(`🎵 Limite atteinte ! Vous avez utilisé vos ${MAX_FREE_GENERATIONS} générations gratuites.`);
      } else {
        toast.success(`🎵 Il vous reste ${MAX_FREE_GENERATIONS - newCount} génération(s) gratuite(s).`);
      }
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error incrementing:', err);
      setError({ code: 'INCREMENT_ERROR', message: 'Erreur de mise à jour' });
      return false;
    }
  }, [freeGenerationsUsed, userId]);

  const checkCanGenerate = useCallback((isAuthenticated: boolean): boolean => {
    if (isAuthenticated) return true;
    if (!canGenerateMore) {
      toast.error(`🚫 Limite atteinte ! Connectez-vous pour continuer.`);
      return false;
    }
    return true;
  }, [canGenerateMore]);

  const getRemainingGenerations = useCallback((): number => {
    return Math.max(0, MAX_FREE_GENERATIONS - freeGenerationsUsed);
  }, [freeGenerationsUsed]);

  const resetFreeTrialCount = useCallback(async () => {
    try {
      if (userId) {
        await (supabase as any).from('free_trial_usage').delete().eq('user_id', userId);
      } else {
        localStorage.removeItem('med-mng-free-trial-count');
      }
      setFreeGenerationsUsed(0);
      setCanGenerateMore(true);
      setError(null);
      toast.success('Compteur réinitialisé');
      return true;
    } catch (err) {
      console.error('Error resetting:', err);
      return false;
    }
  }, [userId]);

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
