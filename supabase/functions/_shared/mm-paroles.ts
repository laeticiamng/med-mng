/**
 * Paroles « réellement rédigées » ou simple assemblage de mots-clés ?
 *
 * MÊME règle que le front (src/components/edn/music/utils/parolesFormatter.ts,
 * `parolesSontRedigees`), qui n'appelle `generer-paroles-item` que si les
 * paroles enregistrées de l'item ne sont pas rédigées. La parité des deux
 * règles est vérifiée par un test (parolesFormatter.parite.test.ts).
 *
 * Rédigées = au moins une ligne de structure ([Couplet], [Refrain]…) ou plus
 * de la moitié des lignes ponctuées.
 */
const MARQUEURS_STRUCTURE = /\[(couplet|refrain|pont|intro|outro|bridge|verse|chorus)/i;
const PONCTUATION = /[.,;:!?…—]/;

/** Lignes non vides d'une colonne `paroles_rang_*` (tableau de texte ou null). */
export const lignesNonVides = (valeur: unknown): string[] =>
  (Array.isArray(valeur) ? valeur : []).filter((l): l is string => typeof l === 'string' && l.trim().length > 0);

export const parolesRedigees = (lignes: string[]): boolean => {
  const utiles = lignes.filter((l) => l.trim().length > 0);
  if (utiles.length === 0) return false;
  if (utiles.some((l) => MARQUEURS_STRUCTURE.test(l))) return true;
  const ponctuees = utiles.filter((l) => PONCTUATION.test(l)).length;
  return ponctuees / utiles.length > 0.5;
};
