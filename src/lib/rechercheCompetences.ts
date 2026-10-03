import { supabase } from '@/integrations/supabase/client';
import { normaliserCodeItem } from '@/config/offre';
import { normaliserTexte } from '@/lib/bibliothequeEdn';

/**
 * Recherche d'items par l'intitulé de leurs compétences officielles.
 *
 * CONSTAT (03/10/2026) : « otoscopie », « otalgie » ou « séro-muqueuse »
 * (intitulés de compétences de rang A de l'IC-150) donnaient « Aucun item
 * trouvé » dans la bibliothèque comme dans ⌘K : la liste ne charge que
 * numéro, titre, discipline et mots-clés (charger les 4 872 compétences pour
 * 367 items serait trop lourd).
 *
 * La table `oic_competences` (référentiel officiel, lecture publique : ce sont
 * les fiches gratuites) est interrogée côté serveur. Seuls les identifiants
 * officiels `OIC-xxx-yy-R` sont retenus (les lignes génériques « IC-150-A —
 * Compétence médicale spécialisée » sont écartées). La correspondance ignore
 * casse, accents et séparateurs grâce à une expression régulière (`imatch`) :
 * « sero muqueuse » ou « Séro-muqueuse » trouvent « séro-muqueuse ».
 */

export const LONGUEUR_MIN_RECHERCHE_COMPETENCE = 3;

const VARIANTES: Record<string, string> = {
  a: '[aàâä]',
  e: '[eéèêë]',
  i: '[iîï]',
  o: '[oôö]',
  u: '[uùûü]',
  c: '[cç]',
  y: '[yÿ]',
};

/** Motif d'expression régulière (POSIX, insensible aux accents) ; null si trop court. */
export const motifRechercheCompetence = (recherche: string): string | null => {
  const q = normaliserTexte(recherche.replace(/œ/gi, 'oe').replace(/æ/gi, 'ae'))
    .replace(/[^a-z0-9 '’-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (q.length < LONGUEUR_MIN_RECHERCHE_COMPETENCE) return null;

  let motif = '';
  for (let i = 0; i < q.length; i++) {
    const ch = q[i];
    if (ch === 'o' && q[i + 1] === 'e') {
      motif += '([oôö][eéèêë]|œ)';
      i++;
    } else if (ch === ' ' || ch === '-' || ch === "'" || ch === '’') {
      // « séro muqueuse », « séro-muqueuse », « l'otite » / « l’otite »
      motif += "[- '’]";
    } else {
      motif += VARIANTES[ch] ?? ch;
    }
  }
  return motif;
};

export interface CompetenceTrouvee {
  /** Code d'item normalisé, ex. « IC-150 ». */
  itemCode: string;
  objectifId: string;
  intitule: string;
}

/** Regroupe les compétences trouvées par item (ordre conservé). */
export const regrouperParItem = (liste: readonly CompetenceTrouvee[]): Map<string, CompetenceTrouvee[]> => {
  const parItem = new Map<string, CompetenceTrouvee[]>();
  for (const c of liste) {
    const existantes = parItem.get(c.itemCode);
    if (existantes) existantes.push(c);
    else parItem.set(c.itemCode, [c]);
  }
  return parItem;
};

/** Compétences officielles dont l'intitulé contient la recherche (casse et accents ignorés). */
export async function rechercherCompetences(recherche: string, limite = 300): Promise<CompetenceTrouvee[]> {
  const motif = motifRechercheCompetence(recherche);
  if (!motif) return [];
  const { data, error } = await supabase
    .from('oic_competences')
    .select('objectif_id, intitule, item_parent')
    .like('objectif_id', 'OIC-___-__-_')
    .filter('intitule', 'imatch', motif)
    .order('objectif_id')
    .limit(limite);
  if (error || !data) return [];
  return data
    .filter((c) => c.item_parent && c.intitule)
    .map((c) => ({
      itemCode: normaliserCodeItem(`IC-${c.item_parent}`),
      objectifId: c.objectif_id,
      intitule: c.intitule.replace(/\s+/g, ' ').trim(),
    }));
}
