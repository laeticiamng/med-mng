import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import type { EntreeHistorique, ProgressionSrs } from '@/lib/recommandation';

/**
 * Données de progression RÉELLES de l'utilisateur connecté pour la page
 * /edn-complete : cartes de répétition espacée (`user_item_progress`) et
 * quiz d'items terminés (`revision_history`). Rien n'est estimé ni inventé :
 * sans compte, ou tant que rien n'est chargé, les listes restent vides et
 * `pret` vaut false.
 */
export function useProgressionEdn() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [progressions, setProgressions] = useState<ProgressionSrs[]>([]);
  const [historique, setHistorique] = useState<EntreeHistorique[]>([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [pret, setPret] = useState(false);

  const charger = useCallback(async () => {
    if (!userId) {
      setProgressions([]);
      setHistorique([]);
      setPret(false);
      setErreur(null);
      return;
    }
    setChargement(true);
    setErreur(null);
    try {
      const [srs, hist] = await Promise.all([
        supabase
          .from('user_item_progress')
          .select('item_code, next_review_date, last_review_date, interval_days, created_at')
          .eq('user_id', userId),
        supabase
          .from('revision_history')
          .select('item_code, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1000),
      ]);
      if (srs.error) throw srs.error;
      if (hist.error) throw hist.error;
      setProgressions((srs.data ?? []) as ProgressionSrs[]);
      setHistorique((hist.data ?? []) as EntreeHistorique[]);
      setPret(true);
    } catch (e) {
      console.error('Chargement de la progression EDN impossible :', e);
      setErreur('Votre progression n’a pas pu être chargée.');
      setPret(false);
    } finally {
      setChargement(false);
    }
  }, [userId]);

  useEffect(() => {
    void charger();
  }, [charger]);

  return { connecte: Boolean(userId), progressions, historique, chargement, erreur, pret, recharger: charger };
}
