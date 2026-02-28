import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CompetenceProgress {
  competence_id: string;
  mastered: boolean;
  mastered_at: string | null;
}

export const useUserCompetenceProgress = (itemCode: string, rang: 'A' | 'B') => {
  const [progress, setProgress] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      if (!user) {
        // Fallback localStorage pour non-connectés
        try {
          const key = `tableau_progress_${itemCode}_${rang}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            const ids = JSON.parse(saved) as string[];
            const map = new Map<string, boolean>();
            ids.forEach(id => map.set(id, true));
            setProgress(map);
          }
        } catch (e) {
          console.error('Error loading from localStorage:', e);
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_competence_progress')
        .select('competence_id, mastered')
        .eq('user_id', user.id)
        .eq('item_code', itemCode)
        .eq('rang', rang);

      if (!error && data) {
        const map = new Map<string, boolean>();
        data.forEach((row: any) => {
          map.set(row.competence_id, row.mastered);
        });
        setProgress(map);
      }
      setLoading(false);
    };

    loadProgress();
  }, [itemCode, rang]);

  const toggleMastered = useCallback(async (competenceId: string) => {
    const currentValue = progress.get(competenceId) || false;
    const newValue = !currentValue;
    
    // Update local state immediately
    const newProgress = new Map(progress);
    if (newValue) {
      newProgress.set(competenceId, true);
    } else {
      newProgress.delete(competenceId);
    }
    setProgress(newProgress);

    // Persist
    if (userId) {
      try {
        if (newValue) {
          await supabase
            .from('user_competence_progress')
            .upsert({
              user_id: userId,
              item_code: itemCode,
              rang,
              competence_id: competenceId,
              mastered: true,
              mastered_at: new Date().toISOString()
            }, { onConflict: 'user_id,item_code,rang,competence_id' });
        } else {
          await supabase
            .from('user_competence_progress')
            .delete()
            .eq('user_id', userId)
            .eq('item_code', itemCode)
            .eq('rang', rang)
            .eq('competence_id', competenceId);
        }
      } catch (e) {
        console.error('Error saving to Supabase:', e);
      }
    } else {
      // localStorage fallback
      try {
        const key = `tableau_progress_${itemCode}_${rang}`;
        const ids = Array.from(newProgress.keys());
        localStorage.setItem(key, JSON.stringify(ids));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  }, [progress, userId, itemCode, rang]);

  const resetProgress = useCallback(async () => {
    setProgress(new Map());
    
    if (userId) {
      await supabase
        .from('user_competence_progress')
        .delete()
        .eq('user_id', userId)
        .eq('item_code', itemCode)
        .eq('rang', rang);
    } else {
      const key = `tableau_progress_${itemCode}_${rang}`;
      localStorage.removeItem(key);
    }
  }, [userId, itemCode, rang]);

  const masteredCount = Array.from(progress.values()).filter(Boolean).length;
  const isMastered = useCallback((competenceId: string) => progress.get(competenceId) || false, [progress]);

  return {
    progress,
    loading,
    toggleMastered,
    resetProgress,
    masteredCount,
    isMastered,
    isAuthenticated: !!userId
  };
};
