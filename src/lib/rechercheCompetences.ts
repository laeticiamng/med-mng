import { supabase } from '@/integrations/supabase/client';
import { normaliserCodeItem } from '@/config/offre';
import { motifRecherche } from '@/lib/motifRecherche';

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

// Motif partagé avec la liste des items et ⌘K (accents, séparateurs, singulier/pluriel) :
// src/lib/motifRecherche.ts.
export { LONGUEUR_MIN_RECHERCHE_COMPETENCE } from './motifRecherche';
export const motifRechercheCompetence = motifRecherche;

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
