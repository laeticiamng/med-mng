/**
 * Fidélité des paroles générées au contenu officiel fourni (generer-paroles-item).
 *
 * Module pur (sans Deno ni réseau) : testé par vitest
 * (src/tests/mmParolesFideles.test.ts).
 *
 * Décision CEO du 08.10.2026 (Med MNG Create) : une chanson ne doit ajouter
 * AUCUN fait médical absent de la source, et doit reprendre à l'identique les
 * notions clés (chiffres, seuils, unités, délais, posologies, noms de
 * molécules). La consigne au modèle ne suffit pas à le garantir : les nombres
 * chantés sont donc vérifiés mécaniquement contre le texte source, et la
 * chanson est refusée (puis redemandée) si elle en contient un qui n'y figure
 * pas.
 */

/** Règle ajoutée à l'invite système de generer-paroles-item. */
export const REGLE_FIDELITE_SOURCE =
  "- Reprends À L'IDENTIQUE les chiffres, seuils, unités, délais, posologies, scores et noms de molécules de la liste : ni arrondi, ni conversion, ni approximation, ni synonyme approximatif. Un nombre ou une molécule absents de la liste ne doivent jamais apparaître dans les paroles.";

/** Ligne de structure ([Couplet 1], [Refrain]…) : pas chantée, ses chiffres ne comptent pas. */
const LIGNE_STRUCTURE = /^\s*\[[^\]]*\]\s*$/;

/** Nombre écrit en chiffres, décimale à virgule ou à point (« 38,5 », « 0.5 », « 120 »). */
const NOMBRE = /\d+(?:[.,]\d+)?/g;

/** Ordinal (« 1er », « 1re », « 2e », « 3ème », « 2nd ») : marque d'ordre, pas une donnée. */
const SUFFIXE_ORDINAL = /^(?:er|re|ère|e|è|ème|eme|nd|nde)\b/i;

const normaliser = (n: string): string => {
  const point = n.replace(',', '.');
  // « 05 » et « 5 », « 2.50 » et « 2.5 » désignent la même valeur.
  const [entier, decimale] = point.split('.');
  const e = entier.replace(/^0+(?=\d)/, '');
  const d = decimale?.replace(/0+$/, '');
  return d ? `${e}.${d}` : e;
};

/** Nombres présents dans un texte (forme normalisée), ordinaux exclus. */
export function nombresDuTexte(texte: string): Set<string> {
  const trouves = new Set<string>();
  for (const m of texte.matchAll(NOMBRE)) {
    const fin = (m.index ?? 0) + m[0].length;
    if (SUFFIXE_ORDINAL.test(texte.slice(fin, fin + 4))) continue;
    trouves.add(normaliser(m[0]));
  }
  return trouves;
}

/**
 * Nombres chantés absents du texte source (forme d'origine, sans doublon).
 * Tableau vide = aucun chiffre inventé.
 */
export function nombresAbsentsDeLaSource(
  paroles: string,
  source: string
): string[] {
  const dansSource = nombresDuTexte(source);
  const absents: string[] = [];
  const vus = new Set<string>();
  for (const ligne of paroles.split('\n')) {
    if (LIGNE_STRUCTURE.test(ligne)) continue;
    for (const m of ligne.matchAll(NOMBRE)) {
      const fin = (m.index ?? 0) + m[0].length;
      if (SUFFIXE_ORDINAL.test(ligne.slice(fin, fin + 4))) continue;
      const n = normaliser(m[0]);
      if (!dansSource.has(n) && !vus.has(n)) {
        vus.add(n);
        absents.push(m[0]);
      }
    }
  }
  return absents;
}

/** Motif de refus lisible (renvoyé au modèle pour la tentative suivante), ou null. */
export function motifNombresInventes(
  paroles: string,
  source: string
): string | null {
  const absents = nombresAbsentsDeLaSource(paroles, source);
  if (absents.length === 0) return null;
  return `chiffres absents des compétences fournies (inventés ?) : ${absents.slice(0, 8).join(', ')} — n'utilise que les chiffres de la liste, à l'identique`;
}
