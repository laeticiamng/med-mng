import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { normaliserCodeItem } from '@/config/offre';

/**
 * Contenu immersif d'un item EDN (paroles, quiz, payload_v2, planches, récit),
 * obtenu UNIQUEMENT par la RPC `mm_contenu_immersif_item`
 * (supabase/migrations/20260924121000_mm_contenu_premium.sql).
 *
 * La RPC applique côté serveur la règle de l'offre : item d'essai
 * (ITEMS_GRATUITS) ou abonné MED MNG Premium / administrateur, d'après le JWT
 * de l'appelant. Sinon elle renvoie `{ verrouille: true }` — jamais d'erreur.
 * L'appel passe par le client supabase normal, qui joint le JWT de la session.
 *
 * Ces colonnes ne sont plus lues directement dans les tables (voir
 * src/lib/colonnesEdnPubliques.ts) : le front se comporte de la même façon
 * avant et après la migration phase 2 qui en retire le droit de lecture.
 */

export interface ContenuImmersifItem {
  item_code: string;
  paroles_musicales?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  quiz_questions?: any;
  payload_v2?: any;
  bd_panels?: any;
  roman_story?: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export type ResultatContenuImmersif =
  | { item_code: string; verrouille: true; contenu: null }
  | { item_code: string; verrouille: false; contenu: ContenuImmersifItem };

export const CHAMPS_CONTENU_IMMERSIF = [
  'paroles_musicales', 'paroles_rang_a', 'paroles_rang_b', 'paroles_rang_ab',
  'quiz_questions', 'payload_v2', 'bd_panels', 'roman_story',
] as const;

const enTableauDeTextes = (valeur: unknown): string[] | undefined => {
  if (Array.isArray(valeur)) return valeur.filter((v): v is string => typeof v === 'string');
  if (typeof valeur === 'string' && valeur.trim() !== '') return [valeur];
  return undefined;
};

/** Appel direct (hors composant) : `verrouille: true` si l'appelant n'y a pas droit. */
export async function chargerContenuImmersifItem(itemCode: string): Promise<ResultatContenuImmersif> {
  const code = normaliserCodeItem(itemCode);
  const { data, error } = await supabase.rpc('mm_contenu_immersif_item', { p_item_code: code });
  if (error) throw error;

  const brut = (data && typeof data === 'object' && !Array.isArray(data) ? data : {}) as Record<string, unknown>;
  const codeRenvoye = typeof brut.item_code === 'string' ? brut.item_code : code;

  if (brut.verrouille === true) {
    return { item_code: codeRenvoye, verrouille: true, contenu: null };
  }

  return {
    item_code: codeRenvoye,
    verrouille: false,
    contenu: {
      item_code: codeRenvoye,
      paroles_musicales: enTableauDeTextes(brut.paroles_musicales),
      paroles_rang_a: enTableauDeTextes(brut.paroles_rang_a),
      paroles_rang_b: enTableauDeTextes(brut.paroles_rang_b),
      paroles_rang_ab: enTableauDeTextes(brut.paroles_rang_ab),
      quiz_questions: brut.quiz_questions ?? undefined,
      payload_v2: brut.payload_v2 ?? undefined,
      bd_panels: brut.bd_panels ?? undefined,
      roman_story: brut.roman_story ?? undefined,
    },
  };
}

/**
 * Complète une ligne publique (lue avec les colonnes de
 * src/lib/colonnesEdnPubliques.ts) avec son contenu immersif quand l'appelant
 * y a droit. `contenu_verrouille` vaut `true` sinon ; la ligne reste
 * utilisable telle quelle (les champs premium sont simplement absents).
 */
export async function completerAvecContenuImmersif<T extends { item_code: string }>(
  ligne: T
): Promise<T & Partial<ContenuImmersifItem> & { contenu_verrouille: boolean }> {
  const resultat = await chargerContenuImmersifItem(ligne.item_code);
  if (resultat.verrouille) return { ...ligne, contenu_verrouille: true };
  const enrichi = { ...ligne, contenu_verrouille: false } as T & Partial<ContenuImmersifItem> & { contenu_verrouille: boolean };
  for (const champ of CHAMPS_CONTENU_IMMERSIF) {
    const valeur = resultat.contenu[champ];
    if (valeur !== undefined && valeur !== null) {
      (enrichi as Record<string, unknown>)[champ] = valeur;
    }
  }
  return enrichi;
}

/**
 * Même chose pour une liste (écrans d'audit administrateur) : un appel RPC par
 * item, par lots, pour ne pas ouvrir 367 requêtes d'un coup. Un item dont la
 * RPC échoue est renvoyé tel quel, marqué `contenu_verrouille: true`.
 */
export async function completerListeAvecContenuImmersif<T extends { item_code: string }>(
  lignes: readonly T[],
  tailleLot = 12
): Promise<Array<T & Partial<ContenuImmersifItem> & { contenu_verrouille: boolean }>> {
  const resultat: Array<T & Partial<ContenuImmersifItem> & { contenu_verrouille: boolean }> = [];
  for (let debut = 0; debut < lignes.length; debut += tailleLot) {
    const lot = lignes.slice(debut, debut + tailleLot);
    const complets = await Promise.all(
      lot.map((ligne) => completerAvecContenuImmersif(ligne).catch(() => ({ ...ligne, contenu_verrouille: true })))
    );
    resultat.push(...complets);
  }
  return resultat;
}

export type EtatContenuImmersif = 'inactif' | 'chargement' | 'disponible' | 'verrouille' | 'erreur';

interface OptionsContenuImmersif {
  /** `false` pour ne rien charger (ex. onglet qui n'en a pas besoin). */
  actif?: boolean;
}

/**
 * Hook : contenu immersif d'un item, rechargé quand l'utilisateur change
 * (connexion / déconnexion), puisque le droit dépend du JWT.
 *
 *  - `etat === 'verrouille'` : afficher `EncartPremium` ;
 *  - `etat === 'disponible'` : `contenu` est renseigné ;
 *  - `chargement` : tant que la réponse du serveur n'est pas arrivée.
 */
interface ReponseContenu {
  /** Code (normalisé) de l'item auquel cette réponse se rapporte. */
  code: string;
  etat: Exclude<EtatContenuImmersif, 'inactif' | 'chargement'>;
  contenu: ContenuImmersifItem | null;
  erreur: string | null;
}

export function useContenuImmersifItem(itemCode: string | null | undefined, options: OptionsContenuImmersif = {}) {
  const { actif = true } = options;
  const { user, loading: chargementAuth } = useAuth();
  const utilisateurId = user?.id ?? null;
  const code = itemCode && itemCode.trim() !== '' ? normaliserCodeItem(itemCode) : null;

  // La réponse garde le code de l'item qu'elle concerne : quand on passe d'un
  // item à l'autre, le contenu du précédent n'est jamais rendu sous le suivant.
  const [reponse, setReponse] = useState<ReponseContenu | null>(null);
  const numeroRequeteRef = useRef(0);

  const charger = useCallback(async () => {
    const requete = ++numeroRequeteRef.current;

    if (!actif || !code) return;
    // Le JWT n'est joint qu'une fois la session restaurée : on attend, pour
    // ne pas interroger le serveur en visiteur puis une seconde fois en abonné.
    if (chargementAuth) return;

    // Une réponse antérieure pour ce même item est invalidée (changement
    // d'utilisateur ou rechargement explicite).
    setReponse((precedente) => (precedente && precedente.code === code ? null : precedente));
    try {
      const resultat = await chargerContenuImmersifItem(code);
      if (requete !== numeroRequeteRef.current) return;
      setReponse(resultat.verrouille
        ? { code, etat: 'verrouille', contenu: null, erreur: null }
        : { code, etat: 'disponible', contenu: resultat.contenu, erreur: null });
    } catch (err) {
      if (requete !== numeroRequeteRef.current) return;
      setReponse({ code, etat: 'erreur', contenu: null, erreur: err instanceof Error ? err.message : String(err) });
    }
  }, [actif, code, chargementAuth, utilisateurId]); // eslint-disable-line react-hooks/exhaustive-deps -- utilisateurId : recharger à la connexion / déconnexion

  useEffect(() => {
    charger();
  }, [charger]);

  const reponseCourante = reponse && code && reponse.code === code ? reponse : null;
  const etat: EtatContenuImmersif = !actif || !code
    ? 'inactif'
    : reponseCourante?.etat ?? 'chargement';

  return {
    contenu: etat === 'disponible' ? reponseCourante?.contenu ?? null : null,
    etat,
    verrouille: etat === 'verrouille',
    chargement: etat === 'chargement',
    erreur: etat === 'erreur' ? reponseCourante?.erreur ?? null : null,
    recharger: charger,
  };
}
