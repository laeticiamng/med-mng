/**
 * Jour calendaire LOCAL de l'utilisateur (fuseau de l'appareil), au format 'AAAA-MM-JJ'.
 *
 * Pourquoi : `new Date().toISOString().split('T')[0]` donne le jour UTC. En Suisse ou en
 * France (UTC+1 / UTC+2), une révision faite à 00 h 30 était donc enregistrée sur la veille
 * (série de jours cassée, défis du jour périmés jusqu'à 1 h ou 2 h du matin).
 *
 * Règles d'usage :
 *  - tout ce qui désigne « le jour de l'utilisateur » (activity_date, session_date, défis du
 *    jour, série, regroupement par jour pour un calendrier ou une heatmap) passe par ce module,
 *    à l'écriture comme à la lecture ;
 *  - les horodatages (created_at, reviewed_at…) restent des instants ISO UTC : pour les filtrer
 *    sur « aujourd'hui », utiliser `debutJourLocal().toISOString()` ;
 *  - l'arithmétique sur les jours est calendaire (jamais ± 86 400 000 ms, faux les jours de
 *    changement d'heure, qui durent 23 h ou 25 h).
 */

const FORMAT_JOUR = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PAR_JOUR_UTC = 86_400_000; // exact en UTC (pas de changement d'heure)

function deuxChiffres(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function partiesJour(jour: string): [number, number, number] {
  const m = FORMAT_JOUR.exec(jour);
  if (!m) throw new RangeError(`Jour invalide (attendu AAAA-MM-JJ) : ${jour}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** Indique si la valeur est déjà un jour 'AAAA-MM-JJ' (sans heure). */
export function estJour(valeur: unknown): valeur is string {
  return typeof valeur === 'string' && FORMAT_JOUR.test(valeur);
}

/**
 * Jour local 'AAAA-MM-JJ' d'un instant (par défaut : maintenant).
 * Accepte une Date, un nombre (ms) ou un horodatage ISO (ex. created_at renvoyé par la base).
 * Une chaîne déjà au format 'AAAA-MM-JJ' est renvoyée telle quelle (c'est déjà un jour : la
 * passer à `new Date()` la lirait comme minuit UTC, donc la veille à New York).
 */
export function jourLocal(instant: Date | string | number = new Date()): string {
  if (estJour(instant)) return instant;
  const d = instant instanceof Date ? instant : new Date(instant);
  if (Number.isNaN(d.getTime())) throw new RangeError(`Date invalide : ${String(instant)}`);
  return `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}-${deuxChiffres(d.getDate())}`;
}

/** Minuit local du jour 'AAAA-MM-JJ' (et non minuit UTC comme `new Date('AAAA-MM-JJ')`). */
export function dateDepuisJour(jour: string): Date {
  const [a, m, j] = partiesJour(jour);
  return new Date(a, m - 1, j);
}

/**
 * Date à afficher pour une valeur venant de la base : un jour 'AAAA-MM-JJ' devient minuit local
 * de ce jour, un horodatage reste l'instant qu'il désigne.
 */
export function versDateLocale(valeur: string | number | Date): Date {
  if (estJour(valeur)) return dateDepuisJour(valeur);
  return valeur instanceof Date ? valeur : new Date(valeur);
}

/** Instant du début (minuit local) du jour de `instant` : borne pour filtrer des horodatages. */
export function debutJourLocal(instant: Date | string | number = new Date()): Date {
  return dateDepuisJour(jourLocal(instant));
}

/** Jour 'AAAA-MM-JJ' décalé de `n` jours calendaires (n négatif : dans le passé). */
export function decalerJour(jour: string, n: number): string {
  const [a, m, j] = partiesJour(jour);
  const d = new Date(Date.UTC(a, m - 1, j + n));
  return `${d.getUTCFullYear()}-${deuxChiffres(d.getUTCMonth() + 1)}-${deuxChiffres(d.getUTCDate())}`;
}

/** Prochain minuit local après `maintenant` (instant où « aujourd'hui » change). */
export function prochainMinuitLocal(maintenant: Date | number = new Date()): Date {
  return dateDepuisJour(decalerJour(jourLocal(maintenant), 1));
}

/** Veille locale de `maintenant` (calendaire : juste aussi les jours de 23 h ou 25 h). */
export function hierLocal(maintenant: Date | string | number = new Date()): string {
  return decalerJour(jourLocal(maintenant), -1);
}

/** Nombre de jours calendaires de `jourB` à `jourA` (positif si A est après B). */
export function ecartJours(jourA: string, jourB: string): number {
  const [a1, m1, j1] = partiesJour(jourA);
  const [a2, m2, j2] = partiesJour(jourB);
  return Math.round((Date.UTC(a1, m1 - 1, j1) - Date.UTC(a2, m2 - 1, j2)) / MS_PAR_JOUR_UTC);
}

/** Jours distincts valides, du plus récent au plus ancien. */
function joursTriesDecroissants(jours: Iterable<string | null | undefined>): string[] {
  const uniques = new Set<string>();
  for (const j of jours) if (estJour(j)) uniques.add(j);
  return [...uniques].sort().reverse();
}

/**
 * Série en cours : nombre de jours consécutifs d'activité se terminant aujourd'hui, ou hier
 * si l'utilisateur n'a pas encore travaillé aujourd'hui (la série n'est pas encore perdue).
 */
export function serieActuelle(
  jours: Iterable<string | null | undefined>,
  aujourdhui: string = jourLocal(),
): number {
  const tries = joursTriesDecroissants(jours).filter((j) => j <= aujourdhui);
  if (tries.length === 0) return 0;
  if (ecartJours(aujourdhui, tries[0]) > 1) return 0;
  let serie = 1;
  for (let i = 1; i < tries.length; i++) {
    if (ecartJours(tries[i - 1], tries[i]) === 1) serie++;
    else break;
  }
  return serie;
}

/** Plus longue suite de jours consécutifs d'activité. */
export function plusLongueSerie(jours: Iterable<string | null | undefined>): number {
  const tries = joursTriesDecroissants(jours);
  if (tries.length === 0) return 0;
  let max = 1;
  let courante = 1;
  for (let i = 1; i < tries.length; i++) {
    courante = ecartJours(tries[i - 1], tries[i]) === 1 ? courante + 1 : 1;
    if (courante > max) max = courante;
  }
  return max;
}
