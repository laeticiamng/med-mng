/**
 * Motif de recherche (expression régulière POSIX, compatible avec `imatch` de PostgREST et
 * avec RegExp côté navigateur) qui ignore la casse, les accents, les séparateurs ET le
 * singulier/pluriel.
 *
 * CONSTAT (critique finale, 05.10.2026, production) : « accident vasculaire cérébral » ne
 * trouvait pas l'IC-340 « Accidents vasculaires cérébraux » (ni dans la liste, ni dans ⌘K) :
 * la recherche était une simple inclusion de texte, et le « s » de « Accidents » se trouve
 * entre deux mots. Dans ⌘K, « diabete » (sans accent) ne trouvait pas non plus l'IC-247
 * « Diabète sucré… » par son titre.
 *
 * Chaque mot de 4 lettres ou plus accepte un « s » ou un « x » final, et « -al » / « -aux »
 * s'équivalent (cérébral / cérébraux). Les mots courts et les nombres sont pris tels quels.
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

/** « séro muqueuse », « séro-muqueuse », « l'otite » / « l’otite » */
const SEPARATEUR = "[- '’]";

const normaliser = (texte: string): string =>
  texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

const lettres = (mot: string): string => {
  let motif = '';
  for (let i = 0; i < mot.length; i++) {
    const ch = mot[i];
    if (ch === 'o' && mot[i + 1] === 'e') {
      motif += '([oôö][eéèêë]|œ)';
      i++;
    } else {
      motif += VARIANTES[ch] ?? ch;
    }
  }
  return motif;
};

/** Un mot de la recherche, singulier ou pluriel. */
const motifMot = (mot: string): string => {
  if (mot.length < 4 || !/[a-z]$/.test(mot)) return lettres(mot);
  if (/aux$/.test(mot)) return `${lettres(mot.slice(0, -3))}(al|aux)`;
  if (/al$/.test(mot)) return `${lettres(mot.slice(0, -2))}(al|aux)`;
  // « sepsis », « virus », « abcès » (abces) : le « s » final fait partie du mot singulier ;
  // on l'enlève quand même (sauf -is, -us, -ss) et on l'accepte ensuite : les deux formes passent.
  if (/[sx]$/.test(mot) && !/(is|us|ss)$/.test(mot)) return `${lettres(mot.slice(0, -1))}[sx]?`;
  return `${lettres(mot)}[sx]?`;
};

/** Motif d'expression régulière (POSIX, insensible aux accents et au pluriel) ; null si trop court. */
export const motifRecherche = (recherche: string): string | null => {
  const q = normaliser(recherche.replace(/œ/gi, 'oe').replace(/æ/gi, 'ae'))
    .replace(/[^a-z0-9 '’-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (q.length < LONGUEUR_MIN_RECHERCHE_COMPETENCE) return null;
  const mots = q.split(/[- '’]/);
  return mots.map(motifMot).join(SEPARATEUR);
};

/** Le texte contient-il la recherche (casse, accents, séparateurs et pluriel ignorés) ? */
export const contientRecherche = (texte: string | null | undefined, recherche: string): boolean => {
  if (!texte) return false;
  const motif = motifRecherche(recherche);
  return motif !== null && new RegExp(motif, 'i').test(texte);
};
