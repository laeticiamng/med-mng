import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SUPABASE_URL, getSupabaseHeaders } from '@/lib/supabaseConstants';
import { normalizeTableauData, transformTableauToSections } from '@/utils/tableauTransformations';
import { verifierSelectionPublique } from '@/lib/colonnesEdnPubliques';
import { CHAMPS_CONTENU_IMMERSIF, useContenuImmersifItem, type EtatContenuImmersif } from '@/hooks/useContenuImmersifItem';

/**
 * Chargement d'UN item EDN, une seule fois, pour toutes les surfaces qui en ont
 * besoin (fiche `/edn-complete/:slug/*` et générateur `/generator`).
 *
 * Avant : la modale `EdnItemModal` refaisait ses deux requêtes à chaque rendu
 * (le tableau de dépendances contenait `finalItem`, un objet recréé à chaque
 * passage), et le générateur, lui, ne chargeait que les paroles. Les deux
 * surfaces n'affichaient donc pas les mêmes informations pour le même item.
 *
 * Lecture en REST direct, comme `useOicCompetences` et `useEdnItemsOptimized` :
 * c'est le chemin qui fonctionne en production (cf. commentaire d'en-tête de
 * `useOicCompetences` sur le verrou supabase-js).
 *
 * Sources :
 *  - `edn_items_complete` : table canonique (367 lignes) — titre, tableaux de
 *    rang, scène. COLONNES PUBLIQUES UNIQUEMENT (src/lib/colonnesEdnPubliques.ts).
 *  - RPC `mm_contenu_immersif_item` : paroles, quiz, payload_v2, planches et
 *    récit — le serveur ne les renvoie que pour un item d'essai ou un abonné
 *    Premium (`contenuVerrouille` sinon). L'ancienne table `edn_items_immersive`
 *    n'est plus interrogée ici : ses `audio_ambiance` / `visual_ambiance`
 *    n'étaient affichés par aucune sous-page.
 */

export interface EdnItemBrut {
  id?: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug?: string;
  pitch_intro?: string;
  specialite?: string;
  mots_cles?: string[];
  competences_count_rang_a?: number;
  competences_count_rang_b?: number;
  // Colonnes JSONB sans schéma stable d'un item à l'autre : chaque composant
  // consommateur y lit les champs qu'il connaît. On ne prétend pas les typer.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  paroles_musicales?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  scene_immersive?: any;
  quiz_questions?: any;
  audio_ambiance?: any;
  visual_ambiance?: any;
  payload_v2?: any;
  bd_panels?: any;
  roman_story?: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/**
 * Équivalent du `completeItemData` de l'ancienne modale : les valeurs issues de
 * la table canonique, tableaux de rang déjà normalisés en sections.
 */
export interface EdnItemContenu {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  quiz_questions?: any;
  scene_immersive?: any;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  paroles_musicales: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  bd_panels?: any;
  roman_story?: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

// Colonnes publiques seulement : les paroles, le quiz, payload_v2 (et les
// planches / le récit de l'ancienne table) arrivent par la RPC.
const COLONNES_COMPLETE = [
  'id', 'item_code', 'title', 'subtitle', 'slug', 'pitch_intro', 'specialite', 'mots_cles',
  'competences_count_rang_a', 'competences_count_rang_b',
  'tableau_rang_a', 'tableau_rang_b',
  'scene_immersive', 'audio_ambiance', 'visual_ambiance',
].join(',');
verifierSelectionPublique(COLONNES_COMPLETE);

/** Normalise `paroles_musicales`, stockée tantôt en tableau, tantôt en texte. */
const normaliserParoles = (valeur: unknown): string[] => {
  if (Array.isArray(valeur)) return valeur as string[];
  if (typeof valeur === 'string' && valeur.trim() !== '') {
    return valeur
      .split(/\n\n|\[.*?\]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [];
};

interface OptionsEdnItemComplet {
  /**
   * Charge le contenu immersif (paroles, quiz, planches, récit) par la RPC.
   * `false` pour une surface qui n'affiche que les fiches officielles.
   */
  avecContenuImmersif?: boolean;
  /** @deprecated alias historique de `avecContenuImmersif`. */
  avecRecits?: boolean;
}

export function useEdnItemComplet(
  identifiant: string | null | undefined,
  options: OptionsEdnItemComplet = {}
) {
  const avecContenuImmersif = options.avecContenuImmersif ?? options.avecRecits ?? true;
  const [item, setItem] = useState<EdnItemBrut | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(identifiant));
  const [error, setError] = useState<string | null>(null);
  const [introuvable, setIntrouvable] = useState(false);
  const numeroRequeteRef = useRef(0);

  const charger = useCallback(async () => {
    if (!identifiant || identifiant.trim() === '') {
      setItem(null);
      setLoading(false);
      setError(null);
      setIntrouvable(false);
      return;
    }

    const requete = ++numeroRequeteRef.current;
    setLoading(true);
    setError(null);
    setIntrouvable(false);

    try {
      // L'URL peut porter le slug (« ic-1-… ») ou le code (« IC-1 ») : on
      // accepte les deux, sans distinction de casse, comme le faisait la liste.
      const valeur = encodeURIComponent(identifiant.trim());
      const urlComplete =
        `${SUPABASE_URL}/rest/v1/edn_items_complete` +
        `?or=(slug.ilike.${valeur},item_code.ilike.${valeur})` +
        `&select=${COLONNES_COMPLETE}&limit=1`;

      const reponse = await fetch(urlComplete, { headers: getSupabaseHeaders(true), cache: 'no-store' });
      if (requete !== numeroRequeteRef.current) return;

      if (!reponse.ok) {
        setError(`Erreur ${reponse.status}`);
        setItem(null);
        setLoading(false);
        return;
      }

      const lignes = (await reponse.json()) as Array<Record<string, unknown>>;
      if (requete !== numeroRequeteRef.current) return;

      if (!Array.isArray(lignes) || lignes.length === 0) {
        setIntrouvable(true);
        setItem(null);
        setLoading(false);
        return;
      }

      const ligne = lignes[0];
      const base: EdnItemBrut = {
        id: ligne.id as string,
        item_code: ligne.item_code as string,
        title: ligne.title as string,
        subtitle: (ligne.subtitle as string) || undefined,
        slug: (ligne.slug as string) || undefined,
        pitch_intro: (ligne.pitch_intro as string) || undefined,
        specialite: (ligne.specialite as string) || undefined,
        mots_cles: (ligne.mots_cles as string[]) || undefined,
        competences_count_rang_a: (ligne.competences_count_rang_a as number) ?? undefined,
        competences_count_rang_b: (ligne.competences_count_rang_b as number) ?? undefined,
        tableau_rang_a: ligne.tableau_rang_a,
        tableau_rang_b: ligne.tableau_rang_b,
        scene_immersive: ligne.scene_immersive,
        audio_ambiance: ligne.audio_ambiance || undefined,
        visual_ambiance: ligne.visual_ambiance || undefined,
      };

      // On affiche déjà les fiches officielles : le contenu immersif arrive
      // dans un second temps, par la RPC, sans bloquer l'écran.
      setItem(base);
      setLoading(false);
    } catch (err) {
      if (requete !== numeroRequeteRef.current) return;
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }, [identifiant]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Contenu immersif : le serveur décide (item d'essai, abonné, admin).
  const {
    contenu: contenuImmersif,
    etat: etatContenu,
    verrouille: contenuVerrouille,
    chargement: chargementContenu,
    erreur: erreurContenu,
    recharger: rechargerContenu,
  } = useContenuImmersifItem(item?.item_code, { actif: avecContenuImmersif && Boolean(item) });

  const itemEnrichi = useMemo<EdnItemBrut | null>(() => {
    if (!item) return null;
    if (!contenuImmersif) return item;
    const enrichi: EdnItemBrut = { ...item };
    for (const champ of CHAMPS_CONTENU_IMMERSIF) {
      const valeur = contenuImmersif[champ];
      if (valeur !== undefined && valeur !== null) {
        (enrichi as unknown as Record<string, unknown>)[champ] = valeur;
      }
    }
    return enrichi;
  }, [item, contenuImmersif]);

  // Traitement du format V2 (payload_v2 -> tableaux + paroles), à l'identique
  // de ce que faisait la modale via useEdnItemV2Process.
  const itemFinal = useMemo<EdnItemBrut | null>(() => {
    if (!itemEnrichi) return null;
    const payload = itemEnrichi.payload_v2 as {
      content?: {
        rang_a?: { theme?: string; competences?: Array<{ paroles_chantables?: string[] }> };
        rang_b?: { theme?: string; competences?: Array<{ paroles_chantables?: string[] }> };
      };
    } | undefined;

    const rangA = payload?.content?.rang_a;
    const rangB = payload?.content?.rang_b;
    if (!rangA || !rangB) return itemEnrichi;

    const aDesCompetencesA = (rangA.competences?.length ?? 0) > 0;
    const aDesCompetencesB = (rangB.competences?.length ?? 0) > 0;
    if (!aDesCompetencesA && !aDesCompetencesB) return itemEnrichi;

    return {
      ...itemEnrichi,
      tableau_rang_a: aDesCompetencesA
        ? { theme: rangA.theme, sections: [{ concepts: rangA.competences }] }
        : itemEnrichi.tableau_rang_a,
      tableau_rang_b: aDesCompetencesB
        ? { theme: rangB.theme, sections: [{ concepts: rangB.competences }] }
        : itemEnrichi.tableau_rang_b,
      paroles_musicales: [
        ...(rangA.competences ?? []).flatMap((c) => c.paroles_chantables || []),
        ...(rangB.competences ?? []).flatMap((c) => c.paroles_chantables || []),
      ].filter(Boolean),
    };
  }, [itemEnrichi]);

  // Tableaux de rang normalisés en sections, comme le faisait loadCompleteData().
  const contenu = useMemo<EdnItemContenu | null>(() => {
    if (!itemEnrichi) return null;
    return {
      quiz_questions: itemEnrichi.quiz_questions,
      scene_immersive: itemEnrichi.scene_immersive,
      tableau_rang_a:
        transformTableauToSections(itemEnrichi.tableau_rang_a, itemEnrichi.item_code, itemEnrichi.title, 'A')
        || normalizeTableauData(itemEnrichi.tableau_rang_a),
      tableau_rang_b:
        transformTableauToSections(itemEnrichi.tableau_rang_b, itemEnrichi.item_code, itemEnrichi.title, 'B')
        || normalizeTableauData(itemEnrichi.tableau_rang_b),
      paroles_musicales: normaliserParoles(itemEnrichi.paroles_musicales),
      paroles_rang_a: itemEnrichi.paroles_rang_a,
      paroles_rang_b: itemEnrichi.paroles_rang_b,
      paroles_rang_ab: itemEnrichi.paroles_rang_ab,
      bd_panels: itemEnrichi.bd_panels,
      roman_story: itemEnrichi.roman_story,
    };
  }, [itemEnrichi]);

  const recharger = useCallback(() => {
    charger();
    rechargerContenu();
  }, [charger, rechargerContenu]);

  return {
    item: itemFinal,
    contenu,
    loading,
    error,
    introuvable,
    recharger,
    /** `true` : l'appelant n'a pas droit au contenu immersif de cet item (réponse du serveur). */
    contenuVerrouille,
    /** `true` tant que le serveur n'a pas répondu pour le contenu immersif. */
    chargementContenu,
    etatContenu: etatContenu as EtatContenuImmersif,
    erreurContenu,
  };
}
