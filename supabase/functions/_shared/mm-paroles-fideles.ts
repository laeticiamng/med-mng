/**
 * Fidélité des paroles générées au contenu officiel fourni (generer-paroles-item).
 *
 * Module pur (sans Deno ni réseau ni dépendance) : testé par vitest
 * (src/tests/mmParolesFideles.test.ts).
 *
 * Décision CEO du 08.10.2026 (Med MNG Create) : une chanson ne doit ajouter
 * AUCUN fait médical absent de la source, et doit reprendre à l'identique les
 * notions clés (chiffres, seuils, unités, délais, posologies, noms de
 * molécules). La consigne au modèle ne suffit pas à le garantir : les paroles
 * sont donc vérifiées mécaniquement contre le texte source, et la chanson est
 * refusée (puis redemandée avec le motif précis) si elle contient :
 *  - un nombre absent de la source, ou un couple « nombre + unité » que la
 *    source n'associe pas (« 5 mg » quand la source dit « 5 jours » et
 *    « 10 mg ») ;
 *  - un ordinal absent de la source (« 2e intention » quand la source dit
 *    « 1re intention ») ;
 *  - un nom de molécule (suffixe DCI reconnu) absent de la source.
 * Le contrôle est volontairement conservateur : un faux refus coûte une
 * nouvelle génération, un faux accord diffuse une erreur médicale.
 */

/** Règle ajoutée à l'invite système de generer-paroles-item. */
export const REGLE_FIDELITE_SOURCE =
  "- Reprends À L'IDENTIQUE les chiffres, seuils, unités, délais, posologies, scores et noms de molécules de la liste : ni arrondi, ni conversion, ni approximation, ni synonyme approximatif. Un nombre ou une molécule absents de la liste ne doivent jamais apparaître dans les paroles.";

/**
 * Ligne de structure ([Couplet 1], [Refrain], « Refrain : », « (Pont) »…) :
 * pas chantée, ses chiffres et ordinaux ne comptent pas.
 */
const LIGNE_STRUCTURE =
  /^\s*(?:\[[^\]]*\]|\(?\s*(?:couplet|refrain|pont|intro|outro|pr[eé]-?refrain|bridge|chorus|verse|final)\s*\d*\s*\)?\s*:?)\s*$/i;

// ---------------------------------------------------------------------------
// Normalisation du texte
// ---------------------------------------------------------------------------

const MARQUES = /[\u0300-\u036f]/g;

/**
 * Deux versions alignées caractère par caractère :
 *  - `affiche` : NFKC (espaces insécables → espace, « ᵉʳ » → « er », « ² » → « 2 »,
 *    « ℃ » → « °C », « µ » → « μ »), pour citer le texte dans les motifs ;
 *  - `cmp` : idem sans accents, μ/µ → u, apostrophes et tirets unifiés, pour comparer.
 */
function preparer(texte: string): { affiche: string; cmp: string } {
  const affiche = texte.normalize('NFKC');
  let cmp = '';
  for (const c of affiche) {
    const d = c.normalize('NFD').replace(MARQUES, '');
    cmp += d.length === c.length ? d : c;
  }
  cmp = cmp
    .replace(/[µμ]/g, 'u')
    .replace(/[’‘ʼ`´]/g, "'")
    .replace(/[‐‑‒–—―−]/g, '-');
  return { affiche, cmp };
}

/** Lignes chantées des paroles (lignes de structure retirées). */
function lignesChantees(paroles: string): string {
  return paroles
    .split('\n')
    .filter((l) => !LIGNE_STRUCTURE.test(l))
    .join('\n');
}

const normaliserNombre = (n: string): string => {
  const point = n.replace(/ /g, '').replace(',', '.');
  // « 05 » et « 5 », « 2.50 » et « 2.5 » désignent la même valeur.
  const [entier, decimale] = point.split('.');
  const e = entier.replace(/^0+(?=\d)/, '');
  const d = decimale?.replace(/0+$/, '');
  return d ? `${e}.${d}` : e;
};

const echapper = (s: string): string => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

// ---------------------------------------------------------------------------
// Unités
// ---------------------------------------------------------------------------

/** Forme canonique → graphies reconnues (minuscules, sans accents). */
const UNITES: Record<string, string[]> = {
  mg: ['mg', 'milligramme', 'milligrammes'],
  g: ['g', 'gramme', 'grammes'],
  ug: ['ug', 'mcg', 'microgramme', 'microgrammes'],
  ng: ['ng', 'nanogramme', 'nanogrammes'],
  pg: ['pg', 'picogramme', 'picogrammes'],
  kg: ['kg', 'kilo', 'kilos', 'kilogramme', 'kilogrammes'],
  G: ['giga'], // « G/L » (giga par litre) : « G » majuscule, voir canonique()
  mol: ['mol', 'mole', 'moles'],
  mmol: ['mmol', 'millimole', 'millimoles'],
  umol: ['umol', 'micromole', 'micromoles'],
  nmol: ['nmol', 'nanomole', 'nanomoles'],
  meq: ['meq'],
  mosm: ['mosm', 'mosmol'],
  ui: ['ui', 'iu', 'u', 'unite', 'unites'],
  mui: ['mui'],
  l: ['l', 'litre', 'litres'],
  dl: ['dl', 'decilitre', 'decilitres'],
  cl: ['cl', 'centilitre', 'centilitres'],
  ml: ['ml', 'millilitre', 'millilitres', 'cc'],
  mmhg: ['mmhg'],
  cmh2o: ['cmh2o'],
  kpa: ['kpa'],
  '%': ['%', 'pour cent', 'pourcent', 'pour-cent'],
  '°': ['°c', '°', 'degre', 'degres'],
  j: ['j', 'jour', 'jours'],
  sem: ['sem', 'semaine', 'semaines'],
  SA: ['sa', "semaine d'amenorrhee", "semaines d'amenorrhee"], // « sa » seulement en majuscules
  mois: ['mois'],
  an: ['an', 'ans', 'annee', 'annees'],
  h: ['h', 'heure', 'heures'],
  min: ['min', 'mn', 'minute', 'minutes'],
  s: ['s', 'sec', 'seconde', 'secondes'],
  ms: ['ms', 'milliseconde', 'millisecondes'],
  km: ['km', 'kilometre', 'kilometres'],
  m: ['m', 'metre', 'metres'],
  cm: ['cm', 'centimetre', 'centimetres'],
  mm: ['mm', 'millimetre', 'millimetres'],
  m2: ['m2'],
  mm3: ['mm3'],
  kcal: ['kcal', 'kilocalorie', 'kilocalories'],
  bpm: ['bpm'],
  gy: ['gy', 'gray', 'grays'],
  msv: ['msv'],
  pa: ['pa', 'paquet-annee', 'paquets-annee', 'paquets-annees'],
  cp: ['cp', 'comprime', 'comprimes'],
  gelule: ['gelule', 'gelules'],
  goutte: ['goutte', 'gouttes'],
  bouffee: ['bouffee', 'bouffees'],
};

const CANONIQUE = new Map<string, string>();
for (const [canon, graphies] of Object.entries(UNITES)) {
  for (const g of graphies) CANONIQUE.set(g, canon);
}

const ALTERNATIVES = [...CANONIQUE.keys()]
  .sort((a, b) => b.length - a.length)
  .map((g) => echapper(g).replace(/ /g, '[ \\t]+'))
  .join('|');

/** Une unité simple, non suivie d'une lettre, d'un chiffre ou d'une apostrophe (« 2 l'… »). */
const COMPOSANT = `(?:${ALTERNATIVES})(?![\\p{L}\\d'])`;
/** « / » ou « par » entre deux unités (« mg/kg/j », « mmol par litre »). */
const SEP = `(?:[ \\t]*/[ \\t]*|[ \\t]+par[ \\t]+)`;
const UNITE_APRES_NOMBRE = new RegExp(
  `[ \\t]*(${COMPOSANT}(?:${SEP}${COMPOSANT})*|(?:${SEP}${COMPOSANT})+)`,
  'iuy'
);
const SEP_GLOBAL = new RegExp(SEP, 'giu');

function canonique(brut: string): string | null {
  if (brut === 'G') return 'G';
  const bas = brut.toLowerCase().replace(/[ \t]+/g, ' ');
  if (bas === 'sa' && brut !== 'SA') return null;
  return CANONIQUE.get(bas) ?? null;
}

/** Unité canonique d'une suite « mg/kg/j », « /min », « mmol par litre », ou null. */
function canoniserUnite(brut: string): string | null {
  const morceaux = brut.split(SEP_GLOBAL);
  const sortie: string[] = [];
  for (let i = 0; i < morceaux.length; i++) {
    const m = morceaux[i].trim();
    if (i === 0 && m === '') {
      sortie.push(''); // « /min » : dénominateur seul
      continue;
    }
    const c = canonique(m);
    if (c === null) break;
    sortie.push(c);
  }
  const unite = sortie.join('/');
  return unite === '' ? null : unite;
}

// ---------------------------------------------------------------------------
// Nombres (avec unité) et ordinaux
// ---------------------------------------------------------------------------

/** Nombre en chiffres : milliers groupés (« 1 000 »), décimale à virgule ou à point. */
const NOMBRE = /\d{1,3}(?: \d{3})+(?:[.,]\d+)?(?!\d)|\d+(?:[.,]\d+)?/g;

/** Suffixe ordinal (« 1er », « 1re », « 1ère », « 2e », « 3ème », « 2nd », « 1ers »). */
const SUFFIXE_ORDINAL = /^(?:ers?|res?|eres?|emes?|nds?|ndes?|es?)(?![\p{L}\d])/iu;

const MOTS_ORDINAUX: Record<string, number> = {
  premier: 1,
  premiere: 1,
  second: 2,
  seconde: 2,
  deuxieme: 2,
  troisieme: 3,
  quatrieme: 4,
  cinquieme: 5,
  sixieme: 6,
  septieme: 7,
  huitieme: 8,
  neuvieme: 9,
  dixieme: 10,
};
const ORDINAL_EN_LETTRES = new RegExp(
  `(?<![\\p{L}\\d])(${Object.keys(MOTS_ORDINAUX).join('|')})s?(?![\\p{L}\\d])`,
  'giu'
);

/**
 * Noms qui donnent son sens médical à un ordinal (« 1re intention », « 2e ligne »,
 * « 1er trimestre », « 3e âge », « 3e génération »…) : le couple ordinal + nom
 * doit alors figurer tel quel dans la source.
 */
const NOMS_ORDINAUX = new Set([
  'intention', 'ligne', 'trimestre', 'age', 'degre', 'choix', 'recours', 'stade',
  'generation', 'rang', 'cycle', 'cure', 'semaine', 'mois', 'annee', 'jour',
  'episode', 'poussee', 'dose', 'injection', 'prise', 'palier', 'niveau',
  'classe', 'phase', 'etape',
]);

/** Connecteurs d'intervalle : « 5 à 10 mg », « 5-10 mg », « 120/80 mmHg ». */
const CONNECTEUR_INTERVALLE = /^[ \t]*(?:-|a|et|ou|\/)[ \t]*$/i;

interface Nombre {
  n: string;
  unite: string | null;
  /** Nombre collé à une lettre (J7, CD4, HbA1c, COVID-19) : jamais d'unité. */
  identifiant: boolean;
  /** « 1 000 » : groupes lus séparément (« 1 » puis « 000 »), si la source les distingue. */
  morceaux: string[] | null;
  debut: number;
  fin: number;
  /** Début du texte à citer (inclut le préfixe d'un identifiant : « J7 »). */
  debutCitation: number;
  /** Fin du texte à citer (inclut l'unité d'un intervalle : « 5 à 10 mg »). */
  finCitation: number;
}

interface Ordinal {
  rang: number;
  nom: string | null;
  /** Ordinal écrit en chiffres (« 2e ») : toujours contrôlé dans les paroles. */
  enChiffres: boolean;
  debut: number;
  fin: number;
}

function nomOrdinal(cmp: string, fin: number): { nom: string | null; fin: number } {
  const m = /^[ \t-]*(\p{L}+)/u.exec(cmp.slice(fin));
  if (!m) return { nom: null, fin };
  const mot = m[1].toLowerCase();
  const singulier = mot.replace(/[sx]$/, '');
  const nom = NOMS_ORDINAUX.has(mot) ? mot : NOMS_ORDINAUX.has(singulier) ? singulier : null;
  return nom ? { nom, fin: fin + m[0].length } : { nom: null, fin };
}

function analyser(cmp: string): { nombres: Nombre[]; ordinaux: Ordinal[] } {
  const nombres: Nombre[] = [];
  const ordinaux: Ordinal[] = [];
  const re = new RegExp(NOMBRE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(cmp))) {
    const debut = m.index;
    let fin = debut + m[0].length;
    const ordinal = SUFFIXE_ORDINAL.exec(cmp.slice(fin));
    if (ordinal) {
      const finSuffixe = fin + ordinal[0].length;
      const { nom, fin: finNom } = nomOrdinal(cmp, finSuffixe);
      ordinaux.push({ rang: Number(normaliserNombre(m[0])), nom, enChiffres: true, debut, fin: finNom });
      re.lastIndex = finSuffixe;
      continue;
    }
    const identifiant = /\p{L}[-+]?$/u.test(cmp.slice(Math.max(0, debut - 2), debut));
    let unite: string | null = null;
    if (!identifiant) {
      UNITE_APRES_NOMBRE.lastIndex = fin;
      const u = UNITE_APRES_NOMBRE.exec(cmp);
      if (u) {
        unite = canoniserUnite(u[1]);
        if (unite !== null) {
          fin = UNITE_APRES_NOMBRE.lastIndex;
          re.lastIndex = fin; // les chiffres d'une unité (« cmH2O », « mm3 ») ne sont pas des nombres
        }
      }
    }
    const groupes = m[0].includes(' ') ? m[0].split(' ') : null;
    const prefixe = identifiant ? /[\p{L}\d]*[-+]?$/u.exec(cmp.slice(0, debut)) : null;
    nombres.push({
      n: normaliserNombre(m[0]),
      unite,
      identifiant,
      morceaux: groupes ? groupes.map(normaliserNombre) : null,
      debut,
      fin,
      debutCitation: debut - (prefixe ? prefixe[0].length : 0),
      finCitation: fin,
    });
  }

  // Intervalles : « 5 à 10 mg », « 5-10 mg », « 120/80 mmHg » → l'unité vaut pour les deux bornes.
  for (let i = nombres.length - 2; i >= 0; i--) {
    const a = nombres[i];
    const b = nombres[i + 1];
    if (a.unite || a.identifiant || !b.unite || b.identifiant) continue;
    if (!CONNECTEUR_INTERVALLE.test(cmp.slice(a.fin, b.debut))) continue;
    a.unite = b.unite;
    a.finCitation = b.finCitation;
  }

  for (const o of cmp.matchAll(ORDINAL_EN_LETTRES)) {
    const debut = o.index ?? 0;
    // « 30 secondes » : une durée, pas un ordinal.
    if (/\d[ \t]*$/.test(cmp.slice(Math.max(0, debut - 3), debut))) continue;
    const finMot = debut + o[0].length;
    const { nom, fin } = nomOrdinal(cmp, finMot);
    ordinaux.push({ rang: MOTS_ORDINAUX[o[1].toLowerCase()], nom, enChiffres: false, debut, fin });
  }

  return { nombres, ordinaux };
}

/** Index de la source : nombre → unités associées (« » = sans unité) et citations. */
interface IndexSource {
  unites: Map<string, Set<string>>;
  citations: Map<string, string[]>;
  ordinaux: Set<string>;
  citationsOrdinaux: Map<string, string[]>;
}

function ajouter<T>(map: Map<string, T[]>, cle: string, valeur: T) {
  const l = map.get(cle);
  if (!l) map.set(cle, [valeur]);
  else if (!l.includes(valeur)) l.push(valeur);
}

function indexer(source: string): IndexSource {
  const { affiche, cmp } = preparer(source);
  const { nombres, ordinaux } = analyser(cmp);
  const unites = new Map<string, Set<string>>();
  const citations = new Map<string, string[]>();
  const noter = (n: string, unite: string | null, citation: string) => {
    if (!unites.has(n)) unites.set(n, new Set());
    unites.get(n)!.add(unite ?? '');
    ajouter(citations, n, citation);
  };
  for (const e of nombres) {
    const citation = affiche.slice(e.debutCitation, e.finCitation).trim();
    noter(e.n, e.unite, citation);
    if (e.morceaux) {
      e.morceaux.forEach((p, i) =>
        noter(p, i === e.morceaux!.length - 1 ? e.unite : null, citation)
      );
    }
  }
  const ords = new Set<string>();
  const citationsOrdinaux = new Map<string, string[]>();
  for (const o of ordinaux) {
    const citation = affiche.slice(o.debut, o.fin).trim();
    ords.add(String(o.rang));
    if (o.nom) {
      ords.add(`${o.rang}|${o.nom}`);
      ajouter(citationsOrdinaux, o.nom, citation);
    }
  }
  return { unites, citations, ordinaux: ords, citationsOrdinaux };
}

/** Écart entre les paroles et la source : texte chanté fautif + ce que dit la source. */
export interface Ecart {
  chante: string;
  source: string[];
}

function nombreConnu(idx: IndexSource, n: string, unite: string | null): boolean {
  const u = idx.unites.get(n);
  if (!u) return false;
  return unite === null ? true : u.has(unite);
}

/**
 * Nombres chantés absents de la source, ou associés à une unité que la source
 * ne leur donne pas. Un nombre sans unité doit figurer dans la source ; un
 * « nombre + unité » doit y figurer avec la même unité.
 */
export function ecartsNombres(paroles: string, source: string): Ecart[] {
  const idx = indexer(source);
  const { affiche, cmp } = preparer(lignesChantees(paroles));
  const ecarts: Ecart[] = [];
  const vus = new Set<string>();
  for (const e of analyser(cmp).nombres) {
    const unite = e.identifiant ? null : e.unite;
    let ok = nombreConnu(idx, e.n, unite);
    if (!ok && e.morceaux) {
      ok = e.morceaux.every((p, i) =>
        nombreConnu(idx, p, i === e.morceaux!.length - 1 ? unite : null)
      );
    }
    const cle = `${e.n}|${unite ?? ''}`;
    if (ok || vus.has(cle)) continue;
    vus.add(cle);
    ecarts.push({
      chante: affiche.slice(e.debutCitation, e.finCitation).trim(),
      source: (idx.citations.get(e.n) ?? []).slice(0, 3),
    });
  }
  return ecarts;
}

/** Forme chantée des nombres fautifs (sans doublon). Tableau vide = aucun chiffre inventé. */
export function nombresAbsentsDeLaSource(paroles: string, source: string): string[] {
  return ecartsNombres(paroles, source).map((e) => e.chante);
}

/** Nombres présents dans un texte (forme normalisée), ordinaux exclus. */
export function nombresDuTexte(texte: string): Set<string> {
  return new Set(indexer(texte).unites.keys());
}

/**
 * Ordinaux chantés absents de la source. Un ordinal en chiffres (« 1re », « 2e »,
 * « 3ème ») est toujours contrôlé ; un ordinal en lettres (« première ») l'est
 * quand il porte un nom médical (« première intention », « deuxième ligne »).
 * Si un tel nom suit, le couple doit figurer dans la source (« 1re intention »
 * ≠ « 1re ligne »).
 */
export function ecartsOrdinaux(paroles: string, source: string): Ecart[] {
  const idx = indexer(source);
  const { affiche, cmp } = preparer(lignesChantees(paroles));
  const ecarts: Ecart[] = [];
  const vus = new Set<string>();
  for (const o of analyser(cmp).ordinaux) {
    if (!o.enChiffres && !o.nom) continue; // « la première fois » : pas une donnée
    const cle = o.nom ? `${o.rang}|${o.nom}` : String(o.rang);
    if (idx.ordinaux.has(cle) || vus.has(cle)) continue;
    vus.add(cle);
    ecarts.push({
      chante: affiche.slice(o.debut, o.fin).trim(),
      source: o.nom ? (idx.citationsOrdinaux.get(o.nom) ?? []).slice(0, 3) : [],
    });
  }
  return ecarts;
}

export function ordinauxAbsentsDeLaSource(paroles: string, source: string): string[] {
  return ecartsOrdinaux(paroles, source).map((e) => e.chante);
}

// ---------------------------------------------------------------------------
// Molécules
// ---------------------------------------------------------------------------

/**
 * Terminaisons de DCI (forme française, sans accents). Un mot chanté qui se
 * termine ainsi est traité comme un nom de molécule et doit figurer dans la source.
 */
export const SUFFIXES_MOLECULES = [
  'cilline', 'mycine', 'micine', 'kacine', 'cycline', 'floxacine', 'azole', 'prazole',
  'olol', 'alol', 'dilol', 'pril', 'sartan', 'statine', 'parine', 'xaban', 'gatran',
  'mab', 'nib', 'tide', 'semide', 'thiazide', 'dipine', 'azepam', 'zolam', 'cetamol',
  'profene', 'isone', 'asone', 'olone', 'oxetine', 'pramine', 'triptyline', 'zepine',
  'peridol', 'apine', 'pidem', 'codone', 'fentanil', 'fentanyl', 'curium', 'curonium',
  'platine', 'rubicine', 'taxel', 'trexate', 'setron', 'triptan', 'lukast', 'gliptine',
  'gliflozine', 'formine', 'ocaine', 'vacaine', 'peneme', 'bactam', 'tidine', 'dronate',
  'navir', 'ciclovir', 'tegravir', 'buvir', 'mivir',
];

/** Préfixes de DCI (céphalosporines : ceftriaxone, céfotaxime…), mot d'au moins 8 lettres. */
const PREFIXES_MOLECULES = ['cef'];

/** Mots courants (ou classes) qui ont une terminaison de DCI sans être une molécule. */
export const MOTS_NON_MOLECULES = new Set([
  'peptide', 'polypeptide', 'nucleotide', 'oligonucleotide', 'dinucleotide',
  'platine', 'rapine', 'sapine',
]);

/** Mot normalisé (sans accents, minuscules, sans s/x final) pour la comparaison. */
function motCompare(mot: string): string {
  const bas = mot.toLowerCase();
  return bas.length > 4 ? bas.replace(/[sx]$/, '') : bas;
}

export function ressembleAMolecule(mot: string): boolean {
  const m = motCompare(preparer(mot).cmp);
  if (MOTS_NON_MOLECULES.has(m)) return false;
  if (SUFFIXES_MOLECULES.some((s) => m.length >= s.length + 2 && m.endsWith(s))) return true;
  return PREFIXES_MOLECULES.some((p) => m.length >= 8 && m.startsWith(p));
}

const MOT = /\p{L}+/gu;

/** Molécules chantées (mots à terminaison de DCI) absentes de la source. */
export function moleculesAbsentesDeLaSource(paroles: string, source: string): string[] {
  const dansSource = new Set<string>();
  for (const m of preparer(source).cmp.matchAll(MOT)) dansSource.add(motCompare(m[0]));
  const { affiche, cmp } = preparer(lignesChantees(paroles));
  const absentes: string[] = [];
  const vues = new Set<string>();
  for (const m of cmp.matchAll(MOT)) {
    if (!ressembleAMolecule(m[0])) continue;
    const cle = motCompare(m[0]);
    if (dansSource.has(cle) || vues.has(cle)) continue;
    vues.add(cle);
    const debut = m.index ?? 0;
    absentes.push(affiche.slice(debut, debut + m[0].length));
  }
  return absentes;
}

// ---------------------------------------------------------------------------
// Motifs renvoyés au modèle
// ---------------------------------------------------------------------------

const citer = (e: Ecart): string =>
  `« ${e.chante} »` + (e.source.length ? ` (la source dit : ${e.source.join(' / ')})` : '');

/** Motif de refus des nombres (renvoyé au modèle pour la tentative suivante), ou null. */
export function motifNombresInventes(paroles: string, source: string): string | null {
  const ecarts = ecartsNombres(paroles, source);
  if (ecarts.length === 0) return null;
  return `chiffres ou couples chiffre + unité absents des compétences fournies (inventés ?) : ${ecarts.slice(0, 8).map(citer).join(' ; ')} — n'utilise que les chiffres de la liste, avec leur unité, à l'identique`;
}

/**
 * Tous les motifs d'infidélité à la source (vide = paroles fidèles) :
 * nombres / nombre + unité, ordinaux, molécules. Chaque motif nomme le texte
 * fautif pour que la tentative suivante le corrige précisément.
 */
export function motifsInfideliteSource(paroles: string, source: string): string[] {
  const motifs: string[] = [];
  const nombres = motifNombresInventes(paroles, source);
  if (nombres) motifs.push(nombres);
  const ordinaux = ecartsOrdinaux(paroles, source);
  if (ordinaux.length) {
    motifs.push(
      `ordinaux absents des compétences fournies : ${ordinaux.slice(0, 8).map(citer).join(' ; ')} — reprends l'ordinal (1re, 2e intention, 1er trimestre…) exactement comme dans la liste`
    );
  }
  const molecules = moleculesAbsentesDeLaSource(paroles, source);
  if (molecules.length) {
    motifs.push(
      `molécules absentes des compétences fournies : ${molecules.slice(0, 8).map((m) => `« ${m} »`).join(', ')} — ne cite aucune molécule hors de la liste`
    );
  }
  return motifs;
}
