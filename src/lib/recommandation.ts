/**
 * « Que dois-je réviser maintenant, et pourquoi ? »
 *
 * Module PUR (aucun appel réseau, aucune IA) : il reçoit les données de
 * progression RÉELLES de l'utilisateur et applique des règles fixes.
 *
 * Sources de données (Supabase) :
 *  - `user_item_progress` : répétition espacée SM-2 (écrite par la page
 *    Répétition espacée et par la fin d'un quiz d'item, cf. useSRS.recordReview).
 *    Champs utilisés : item_code, next_review_date, last_review_date,
 *    interval_days, created_at.
 *  - `revision_history` : une ligne par quiz d'item terminé
 *    (cf. useQuizErrorTracker). Champs utilisés : item_code, created_at.
 *
 * Règle de recommandation, dans l'ordre :
 *  1. une révision de répétition espacée est échue → la plus en retard ;
 *  2. sinon, le dernier item commencé et pas encore maîtrisé ;
 *  3. sinon, le premier item jamais travaillé : parmi les items d'essai
 *     gratuits pour un compte sans Premium, dans l'ordre du programme sinon.
 */
import { estItemGratuit, normaliserCodeItem } from '@/config/offre';

/**
 * Seuil de maîtrise : intervalle de répétition espacée ≥ 21 jours.
 * Même critère que `useSRS.getMasteryLevel` et `useSRS.getStats`
 * (« 21+ days interval = mastered ») : on ne l'invente pas ici.
 */
export const SEUIL_MAITRISE_JOURS = 21;

export type StatutItem = 'non_commence' | 'en_cours' | 'a_revoir' | 'maitrise';

export interface ProgressionSrs {
  item_code: string;
  next_review_date: string;
  last_review_date: string | null;
  interval_days: number;
  created_at?: string | null;
}

export interface EntreeHistorique {
  item_code: string;
  created_at: string;
}

export interface EtatItem {
  code: string;
  statut: Exclude<StatutItem, 'non_commence'>;
  /** Première activité connue (création de la carte SRS ou premier quiz). */
  debut: Date | null;
  /** Dernière activité connue (dernière révision SRS ou dernier quiz). */
  derniereActivite: Date | null;
  /** Échéance de répétition espacée, si l'item est suivi en SRS. */
  prochaineRevision: Date | null;
}

export type MotifRecommandation = 'revision_echue' | 'item_en_cours' | 'item_essai' | 'prochain_item';

export interface Recommandation {
  code: string;
  motif: MotifRecommandation;
  /** Phrase factuelle affichée sous l'item recommandé. */
  raison: string;
}

const MS_JOUR = 24 * 60 * 60 * 1000;

const dateOuNull = (valeur: string | null | undefined): Date | null => {
  if (!valeur) return null;
  const d = new Date(valeur);
  return Number.isNaN(d.getTime()) ? null : d;
};

const plusRecente = (a: Date | null, b: Date | null) => (!a ? b : !b ? a : a > b ? a : b);
const plusAncienne = (a: Date | null, b: Date | null) => (!a ? b : !b ? a : a < b ? a : b);

/** Nombre de jours calendaires (heure locale) écoulés de `depuis` à `jusqua`. */
export function joursEcoules(depuis: Date, jusqua: Date): number {
  const debut = new Date(depuis.getFullYear(), depuis.getMonth(), depuis.getDate()).getTime();
  const fin = new Date(jusqua.getFullYear(), jusqua.getMonth(), jusqua.getDate()).getTime();
  return Math.round((fin - debut) / MS_JOUR);
}

/** « aujourd'hui », « hier », « il y a 3 jours ». */
export function libelleIlYa(jours: number): string {
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return 'hier';
  return `il y a ${jours} jours`;
}

/** « 12 septembre » (année ajoutée si différente de l'année courante). */
export function formaterDateCourte(date: Date, maintenant: Date): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  if (date.getFullYear() !== maintenant.getFullYear()) options.year = 'numeric';
  return date.toLocaleDateString('fr-FR', options);
}

/**
 * Construit l'état de chaque item que l'utilisateur a réellement travaillé.
 * Un item absent de la carte n'a jamais été travaillé (« non commencé »).
 */
export function construireEtats(
  progressions: readonly ProgressionSrs[],
  historique: readonly EntreeHistorique[],
  maintenant: Date,
): Map<string, EtatItem> {
  const etats = new Map<string, EtatItem>();

  for (const p of progressions) {
    const code = normaliserCodeItem(p.item_code);
    if (!code) continue;
    const prochaine = dateOuNull(p.next_review_date);
    const derniere = dateOuNull(p.last_review_date);
    const creation = dateOuNull(p.created_at ?? null);
    const statut: EtatItem['statut'] =
      prochaine && prochaine.getTime() <= maintenant.getTime()
        ? 'a_revoir'
        : (p.interval_days ?? 0) >= SEUIL_MAITRISE_JOURS
          ? 'maitrise'
          : 'en_cours';
    etats.set(code, {
      code,
      statut,
      debut: plusAncienne(creation, derniere),
      derniereActivite: derniere,
      prochaineRevision: prochaine,
    });
  }

  for (const h of historique) {
    const code = normaliserCodeItem(h.item_code);
    const date = dateOuNull(h.created_at);
    if (!code) continue;
    const existant = etats.get(code);
    if (existant) {
      existant.debut = plusAncienne(existant.debut, date);
      existant.derniereActivite = plusRecente(existant.derniereActivite, date);
    } else {
      // Quiz terminé mais pas (encore) de carte de répétition espacée.
      etats.set(code, { code, statut: 'en_cours', debut: date, derniereActivite: date, prochaineRevision: null });
    }
  }

  return etats;
}

export function statutDe(etats: ReadonlyMap<string, EtatItem>, code: string): StatutItem {
  return etats.get(normaliserCodeItem(code))?.statut ?? 'non_commence';
}

/** Révisions échues, de la plus en retard à la moins en retard. */
export function revisionsEchues(etats: ReadonlyMap<string, EtatItem>): EtatItem[] {
  return [...etats.values()]
    .filter((e) => e.statut === 'a_revoir' && e.prochaineRevision)
    .sort((a, b) => a.prochaineRevision!.getTime() - b.prochaineRevision!.getTime());
}

export function raisonRevisionEchue(prochaine: Date, maintenant: Date): string {
  const jours = joursEcoules(prochaine, maintenant);
  if (jours <= 0) return "Révision prévue aujourd'hui";
  if (jours === 1) return 'Révision prévue hier';
  return `Révision prévue il y a ${jours} jours`;
}

interface ParametresRecommandation {
  etats: ReadonlyMap<string, EtatItem>;
  /** Codes des items dans l'ordre du programme (IC-1, IC-2…). */
  codesOrdonnes: readonly string[];
  premium: boolean;
  maintenant: Date;
}

export function recommander({ etats, codesOrdonnes, premium, maintenant }: ParametresRecommandation): Recommandation | null {
  // 1. Répétition espacée échue : la plus en retard.
  const [plusEnRetard] = revisionsEchues(etats);
  if (plusEnRetard) {
    return {
      code: plusEnRetard.code,
      motif: 'revision_echue',
      raison: raisonRevisionEchue(plusEnRetard.prochaineRevision!, maintenant),
    };
  }

  // 2. Dernier item commencé, pas encore maîtrisé.
  const enCours = [...etats.values()]
    .filter((e) => e.statut === 'en_cours')
    .sort((a, b) => (b.derniereActivite?.getTime() ?? 0) - (a.derniereActivite?.getTime() ?? 0));
  if (enCours[0]) {
    const e = enCours[0];
    return {
      code: e.code,
      motif: 'item_en_cours',
      raison: e.debut
        ? `Vous l'avez commencé le ${formaterDateCourte(e.debut, maintenant)}`
        : 'Vous avez commencé cet item',
    };
  }

  // 3. Premier item jamais travaillé.
  const codes = codesOrdonnes.map(normaliserCodeItem).filter(Boolean);
  const nonCommence = (code: string) => !etats.has(code);
  if (!premium) {
    const essai = codes.find((c) => estItemGratuit(c) && nonCommence(c));
    if (essai) return { code: essai, motif: 'item_essai', raison: "Item d'essai gratuit" };
  }
  const suivant = codes.find(nonCommence);
  if (suivant) {
    return {
      code: suivant,
      motif: 'prochain_item',
      raison: premium
        ? 'Prochain item non commencé du programme'
        : 'Prochain item non commencé (fiche officielle gratuite)',
    };
  }
  return null;
}
