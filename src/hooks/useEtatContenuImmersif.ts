import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * État « renseigné / non renseigné » du contenu immersif de chaque item,
 * par la RPC `mm_etat_contenu_immersif`
 * (supabase/migrations/20260925120000_mm_etat_contenu_immersif.sql).
 *
 * Elle ne renvoie que des booléens : aucune parole, aucun quiz ne sort du
 * serveur. Elle remplace les lectures de `paroles_*` / `quiz_questions` pour
 * les 367 items d'un coup (onglet « Statut des paroles », gestionnaire de
 * contenu administrateur), impossibles après la phase 2 du verrouillage.
 *
 * Tant que la migration n'est pas appliquée, la RPC n'existe pas : le
 * chargement renvoie `null` (« statut indisponible »), sans erreur.
 */

export interface EtatContenuItem {
  item_code: string;
  title: string;
  updated_at: string;
  paroles_musicales: boolean;
  paroles_rang_a: boolean;
  paroles_rang_b: boolean;
  paroles_rang_ab: boolean;
  quiz: boolean;
  planches: boolean;
  recit: boolean;
}

/** `null` si la RPC est absente ou en erreur. */
export async function chargerEtatContenuImmersif(): Promise<EtatContenuItem[] | null> {
  try {
    const { data, error } = await supabase.rpc('mm_etat_contenu_immersif');
    if (error) {
      if (import.meta.env.DEV) console.warn('[mm_etat_contenu_immersif] indisponible :', error.message);
      return null;
    }
    return Array.isArray(data) ? (data as EtatContenuItem[]) : null;
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[mm_etat_contenu_immersif] indisponible :', err);
    return null;
  }
}

export function useEtatContenuImmersif(actif = true) {
  const [etats, setEtats] = useState<EtatContenuItem[] | null>(null);
  const [chargement, setChargement] = useState(actif);
  const [indisponible, setIndisponible] = useState(false);

  const charger = useCallback(async () => {
    if (!actif) return;
    setChargement(true);
    const resultat = await chargerEtatContenuImmersif();
    setEtats(resultat);
    setIndisponible(resultat === null);
    setChargement(false);
  }, [actif]);

  useEffect(() => {
    charger();
  }, [charger]);

  return { etats, chargement, indisponible, recharger: charger };
}
