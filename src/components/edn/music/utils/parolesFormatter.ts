
export const formatParoles = (text: string) => {
  if (!text || text === 'Aucune parole disponible pour le Rang A' || text === 'Aucune parole disponible pour le Rang B') {
    return ['Aucune parole disponible pour ce rang.'];
  }
  
  return text
    .replace(/\\n/g, '\n')
    .replace(/\n\n+/g, '\n\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

export const hasValidParoles = (parolesArray: string[]) => {
  return parolesArray.length > 0 && parolesArray[0] !== 'Aucune parole disponible pour ce rang.';
};

/**
 * Distingue des paroles réellement rédigées d'un simple assemblage de mots-clés.
 *
 * Constat mesuré sur les 367 items d'`edn_items_complete` : seuls 22 items ont
 * un `paroles_rang_a` rédigé (structure [Couplet]/[Refrain] ou ponctuation).
 * Les 345 autres sont des suites de 2 à 4 mots sans verbe conjugué ni
 * ponctuation (« nbsp nbsp migraine évaluer », « algie vasculaire face
 * analyser »), entrecoupées de refrains génériques identiques d'un item à
 * l'autre (« Diagnostic préciser », « Excellence viser »). Ce n'est pas du
 * français chantable : on ne l'affiche pas comme si c'était une chanson.
 */
const MARQUEURS_STRUCTURE = /\[(couplet|refrain|pont|intro|outro|bridge|verse|chorus)/i;
const PONCTUATION = /[.,;:!?…—]/;

export const parolesSontRedigees = (parolesArray: string[]): boolean => {
  const lignes = parolesArray.filter((l) => l.trim().length > 0);
  if (lignes.length === 0) return false;
  if (lignes.some((l) => MARQUEURS_STRUCTURE.test(l))) return true;
  const avecPonctuation = lignes.filter((l) => PONCTUATION.test(l)).length;
  return avecPonctuation / lignes.length > 0.5;
};

/** Résidus de balisage HTML laissés par l'import UNESS (« nbsp », « &lt;u&gt; »…). */
export const contientResidusDeBalisage = (parolesArray: string[]): boolean =>
  parolesArray.some((l) => /\bnbsp\b|&[a-z]+;|&#\d+|<\s*\/?\s*(br|p|div|span|li|ul|td|tr)\b/i.test(l));
