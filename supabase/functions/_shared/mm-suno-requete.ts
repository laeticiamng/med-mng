/**
 * MED MNG — construction de la requête Suno (module pur, sans dépendance).
 *
 * Utilisé par les Edge Functions `mm-generate-music`, `mm-suno-callback` et
 * `mm-music-status` (Deno) ET par le front (Vite / vitest) via
 * `src/config/stylesMusicaux.ts` : aucun import, aucune API Deno ou navigateur.
 *
 * Référence : https://docs.sunoapi.org/suno-api/generate-music (lue le 25/09/2026).
 *  - Modèles : V6 (défaut), V6_WILD, V6_MINI ; V4_5ALL encore accepté (déprécié).
 *  - Mode custom : les paroles vont dans `lyrics` (≤ 5 000 caractères en V6),
 *    `prompt` n'est qu'un repli → jamais envoyé ici.
 *  - `style` ≤ 1 000, `title` ≤ 80, `negativeTags` ≤ 1 000, `vocalGender` m/f,
 *    `styleWeight` / `weirdnessConstraint` 0–1 (2 décimales), `variety` 0–4,
 *    `duration` 10–360 s (défaut 20 s si absent → toujours envoyée).
 */

// ---------------------------------------------------------------------------
// Modèles
// ---------------------------------------------------------------------------

export const MODELES_SUNO_AUTORISES = ['V6', 'V6_WILD', 'V6_MINI', 'V4_5ALL'] as const;
export type ModeleSuno = (typeof MODELES_SUNO_AUTORISES)[number];
export const MODELE_SUNO_DEFAUT: ModeleSuno = 'V6';

/** Modèle imposé côté serveur : `SUNO_MODEL` (env) si autorisé, sinon V6. */
export function choisirModeleSuno(valeurEnv: string | null | undefined): ModeleSuno {
  const v = (valeurEnv || '').trim().toUpperCase();
  return (MODELES_SUNO_AUTORISES as readonly string[]).includes(v) ? (v as ModeleSuno) : MODELE_SUNO_DEFAUT;
}

// ---------------------------------------------------------------------------
// Limites V6 (mode custom)
// ---------------------------------------------------------------------------

export const LIMITES_SUNO = {
  paroles: 5000,
  style: 1000,
  titre: 80,
  negativeTags: 1000,
  dureeMin: 10,
  dureeMax: 360,
} as const;

/** Bornes MED MNG de la durée calculée (secondes). */
export const DUREE_CHANSON = {
  min: 90,
  max: 300,
  /** Secondes chantées par ligne de paroles (estimation). */
  parLigne: 4.5,
  /** Intro + outro. */
  marge: 15,
} as const;

// ---------------------------------------------------------------------------
// Styles musicaux (source de vérité unique front + serveur)
// ---------------------------------------------------------------------------

export interface StyleMusical {
  /** Identifiant stable envoyé par le front (`style`). */
  slug: string;
  /** Libellé français affiché. */
  libelle: string;
  /** Description française courte. */
  description: string;
  /** Tags anglais courts pour Suno, séparés par des virgules (sans les voix). */
  prompt: string;
  /** Tags à éviter, cohérents avec le style (jamais contradictoires). */
  negativeTags: string;
  /** Énergie indicative (affichage). */
  energie: 'calme' | 'moyenne' | 'haute';
}

const VOIX_PAR_DEFAUT = 'clear vocals';
const EXCLUSIONS_COMMUNES = 'screaming, distorted vocals, mumbled vocals, off-key vocals, harsh noise';

export const STYLES_MUSICAUX: readonly StyleMusical[] = [
  {
    slug: 'rap-francais',
    libelle: 'Rap français',
    description: 'Flow net et percutant, idéal pour retenir des listes',
    prompt: 'french rap, boom bap beat, punchy flow, 92 bpm, educational, catchy hook',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, opera`,
    energie: 'haute',
  },
  {
    slug: 'pop',
    libelle: 'Pop',
    description: 'Mélodie accrocheuse et refrain facile à retenir',
    prompt: 'french pop, upbeat, bright synths, catchy chorus, 112 bpm, radio friendly',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, screamo`,
    energie: 'moyenne',
  },
  {
    slug: 'lofi',
    libelle: 'Lo-fi chill',
    description: 'Doux et posé, pour réviser sans fatigue',
    prompt: 'lo-fi hip hop, mellow piano, soft drums, warm vinyl texture, relaxed, 80 bpm, chill study beat',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, aggressive drums, fast tempo`,
    energie: 'calme',
  },
  {
    slug: 'chanson-francaise',
    libelle: 'Chanson française',
    description: 'Le texte mis en avant, piano et guitare',
    prompt: 'french chanson, acoustic piano and guitar, intimate expressive singing, storytelling, 100 bpm, warm and melodic',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, edm, autotune`,
    energie: 'moyenne',
  },
  {
    slug: 'afrobeat',
    libelle: 'Afrobeat',
    description: 'Rythme chaud et dansant',
    prompt: 'afrobeats, groovy percussion, sunny guitar riffs, smooth, 104 bpm, danceable, uplifting',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, slow ballad`,
    energie: 'haute',
  },
  {
    slug: 'rock',
    libelle: 'Rock',
    description: 'Guitares énergiques, refrain scandé',
    prompt: 'pop rock, driving electric guitars, energetic drums, powerful, 128 bpm, anthemic chorus',
    negativeTags: `${EXCLUSIONS_COMMUNES}, death metal, growling, screamo`,
    energie: 'haute',
  },
  {
    slug: 'jazz',
    libelle: 'Jazz',
    description: 'Swing feutré, voix chaleureuse',
    prompt: 'vocal jazz, swing rhythm, upright bass, brushed drums, warm piano, smooth, 110 bpm',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, edm, autotune`,
    energie: 'moyenne',
  },
  {
    slug: 'reggae',
    libelle: 'Reggae',
    description: 'Tempo tranquille, groove chaloupé',
    prompt: 'roots reggae, offbeat guitar skank, deep bass, laid-back, 76 bpm, sunny and relaxed',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, fast tempo`,
    energie: 'calme',
  },
  {
    slug: 'electro',
    libelle: 'Électro pop',
    description: 'Synthés et beat entraînant',
    prompt: 'electropop, pulsing synths, punchy electronic drums, bright, 120 bpm, energetic, catchy hook',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, acoustic folk`,
    energie: 'haute',
  },
  {
    slug: 'rnb',
    libelle: 'R&B',
    description: 'Groove doux, voix soul',
    prompt: 'contemporary r&b, smooth groove, soulful, warm keys, 90 bpm, melodic and polished',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, screamo`,
    energie: 'moyenne',
  },
  {
    slug: 'acoustique',
    libelle: 'Acoustique folk',
    description: 'Guitare sèche, voix naturelle',
    prompt: 'acoustic folk, fingerpicked guitar, gentle percussion, natural, 96 bpm, warm and heartfelt',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, edm, electronic drums, autotune`,
    energie: 'calme',
  },
  {
    slug: 'comptine',
    libelle: 'Comptine mnémotechnique',
    description: 'Mélodie simple et répétitive, faite pour retenir',
    prompt: 'simple nursery rhyme style, playful melody, repetitive singalong chorus, ukulele and hand claps, 100 bpm, mnemonic, memorable',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, edm, dark, aggressive`,
    energie: 'moyenne',
  },
  {
    slug: 'slam',
    libelle: 'Slam / spoken word',
    description: 'Texte parlé-chanté, chaque mot bien audible',
    prompt: 'french spoken word slam, minimal piano, spoken verses with sung chorus, 84 bpm, poetic, intimate',
    negativeTags: `${EXCLUSIONS_COMMUNES}, heavy metal, edm, autotune`,
    energie: 'calme',
  },
];

/** Anciens identifiants (préférences sauvegardées, liens) → style actuel. */
const ALIAS_STYLES: Record<string, string> = {
  'rap-pedagogique': 'rap-francais', 'rap-conscient': 'rap-francais', 'trap-francais': 'rap-francais',
  'pop-francaise': 'pop', 'pop-melodique': 'pop', 'indie-pop': 'pop', 'ballad-pop': 'pop',
  'lofi-piano': 'lofi', 'lofi-hip-hop': 'lofi', 'chillhop': 'lofi', 'chill-out': 'lofi', 'downtempo': 'lofi',
  'chanson-moderne': 'chanson-francaise', 'variete-francaise': 'chanson-francaise', 'ballade-francaise': 'chanson-francaise', 'slow': 'chanson-francaise',
  'rock-francais': 'rock', 'rock-alternatif': 'rock', 'indie-rock': 'rock', 'soft-rock': 'rock',
  'jazz-moderne': 'jazz', 'jazz-manouche': 'jazz', 'smooth-jazz': 'jazz', 'nu-jazz': 'jazz', 'bossa-nova': 'jazz', 'jazz-fusion': 'jazz',
  'electropop': 'electro', 'synthpop': 'electro', 'house-francaise': 'electro', 'electro-francaise': 'electro', 'techno': 'electro',
  'deep-house': 'electro', 'synthwave': 'electro', 'dance-commerciale': 'electro', 'euro-dance': 'electro', 'progressive-house': 'electro',
  'rnb-francais': 'rnb', 'neo-soul': 'rnb', 'soul-funk': 'rnb', 'funk': 'rnb',
  'folk-moderne': 'acoustique', 'indie-folk': 'acoustique', 'country-moderne': 'acoustique', 'singer-songwriter': 'acoustique',
  'dancehall': 'reggae',
  'educatif-medical': 'comptine',
};

export function trouverStyle(slug: string | null | undefined): StyleMusical | null {
  const s = (slug || '').trim().toLowerCase();
  if (!s) return null;
  const direct = STYLES_MUSICAUX.find((st) => st.slug === s);
  if (direct) return direct;
  const alias = ALIAS_STYLES[s];
  return alias ? STYLES_MUSICAUX.find((st) => st.slug === alias) ?? null : null;
}

export const STYLE_PAR_DEFAUT = 'pop';

/** Style effectif : le slug demandé, un alias connu, sinon le style par défaut. */
export function resoudreStyle(slug: string | null | undefined): StyleMusical {
  return trouverStyle(slug) ?? (STYLES_MUSICAUX.find((st) => st.slug === STYLE_PAR_DEFAUT) as StyleMusical);
}

// ---------------------------------------------------------------------------
// Paroles, durée, titre
// ---------------------------------------------------------------------------

/** Une ligne est « chantée » si elle n'est ni vide ni une balise de section ([Refrain], [Couplet 1]…). */
export function estLigneChantee(ligne: string): boolean {
  const l = ligne.trim();
  return l !== '' && !/^\[.*\]$/.test(l);
}

export function compterLignesChantees(paroles: string): number {
  return paroles.split(/\r?\n/).filter(estLigneChantee).length;
}

/**
 * Durée demandée à Suno (secondes entières).
 *  - `dureeDemandee` valide (10–360 s) : respectée, bornée à 90–300 s ;
 *  - sinon : lignes chantées × 4,5 s + 15 s, bornée à 90–300 s.
 * Sans durée explicite Suno rendrait 20 secondes.
 */
export function calculerDureeSecondes(paroles: string, dureeDemandee?: number | null): number {
  const borner = (d: number) => Math.min(DUREE_CHANSON.max, Math.max(DUREE_CHANSON.min, Math.round(d)));
  if (typeof dureeDemandee === 'number' && Number.isFinite(dureeDemandee)
    && dureeDemandee >= LIMITES_SUNO.dureeMin && dureeDemandee <= LIMITES_SUNO.dureeMax) {
    return borner(dureeDemandee);
  }
  const lignes = compterLignesChantees(paroles);
  return borner(lignes * DUREE_CHANSON.parLigne + DUREE_CHANSON.marge);
}

export interface ParolesTronquees {
  texte: string;
  tronque: boolean;
  /** Lignes chantées retirées (0 si rien n'a été coupé). */
  lignesRetirees: number;
}

/** Normalise (CRLF → LF, espaces de fin, lignes vides multiples) sans rien couper. */
export function normaliserParoles(paroles: string | string[]): string {
  const texte = Array.isArray(paroles) ? paroles.join('\n') : String(paroles ?? '');
  return texte
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Coupe les paroles à `max` caractères, à la fin d'une ligne complète (jamais
 * au milieu d'un vers). Une balise de section orpheline en fin de texte est
 * retirée.
 */
export function tronquerParoles(paroles: string | string[], max: number = LIMITES_SUNO.paroles): ParolesTronquees {
  const texte = normaliserParoles(paroles);
  if (texte.length <= max) return { texte, tronque: false, lignesRetirees: 0 };

  const lignes = texte.split('\n');
  const gardees: string[] = [];
  let longueur = 0;
  for (const ligne of lignes) {
    const ajout = (gardees.length ? 1 : 0) + ligne.length;
    if (longueur + ajout > max) break;
    gardees.push(ligne);
    longueur += ajout;
  }
  while (gardees.length && !estLigneChantee(gardees[gardees.length - 1])) gardees.pop();

  const garde = gardees.join('\n').trim();
  const avant = compterLignesChantees(texte);
  const apres = compterLignesChantees(garde);
  return { texte: garde, tronque: true, lignesRetirees: Math.max(0, avant - apres) };
}

export type RangChanson = 'A' | 'B' | 'AB';

export function normaliserRang(rang: string | null | undefined): RangChanson {
  const r = (rang || '').toUpperCase().replace(/[^AB]/g, '');
  if (r === 'B') return 'B';
  if (r === 'AB' || r === 'BA') return 'AB';
  return 'A';
}

export function libelleRang(rang: RangChanson): string {
  return rang === 'AB' ? 'Rang A+B' : `Rang ${rang}`;
}

/** Coupe `texte` à `max` caractères sur un espace, avec « … ». */
function couperMots(texte: string, max: number): string {
  if (texte.length <= max) return texte;
  const coupe = texte.slice(0, max - 1);
  const dernierEspace = coupe.lastIndexOf(' ');
  return (dernierEspace > max / 2 ? coupe.slice(0, dernierEspace) : coupe).replace(/[\s,;:.–—-]+$/g, '') + '…';
}

/** Intitulé court d'un item : première phrase de son titre officiel (souvent très long). */
export function intituleCourtItem(titre: string | null | undefined): string {
  const t = (titre || '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  const premierePhrase = t.split(/\.\s+|\s+:\s+|\s+;\s+/)[0].replace(/\.$/, '').trim();
  return premierePhrase || t;
}

/**
 * Titre de la chanson (≤ 80 caractères) : « IC-3 · Le raisonnement et la décision en médecine — Rang A ».
 * Sans titre d'item : « IC-3 — Rang A ».
 */
export function construireTitre(codeItem: string | null | undefined, titreItem: string | null | undefined, rang: RangChanson): string {
  const code = (codeItem || '').trim().toUpperCase();
  const suffixe = ` — ${libelleRang(rang)}`;
  const court = intituleCourtItem(titreItem);
  const prefixe = code ? `${code} · ` : '';
  const place = LIMITES_SUNO.titre - suffixe.length - prefixe.length;
  if (court && place >= 12) return `${prefixe}${couperMots(court, place)}${suffixe}`;
  const base = code || court || 'Chanson MED MNG';
  return couperMots(`${base}${suffixe}`, LIMITES_SUNO.titre);
}

// ---------------------------------------------------------------------------
// Style, negativeTags, requête finale
// ---------------------------------------------------------------------------

export type GenreVocal = 'm' | 'f';

/** Accepte m/f, male/female, homme/femme ; « mixed »/inconnu → undefined (Suno décide). */
export function normaliserGenreVocal(valeur: string | null | undefined): GenreVocal | undefined {
  const v = (valeur || '').trim().toLowerCase();
  if (v === 'm' || v === 'male' || v === 'homme' || v === 'masculin') return 'm';
  if (v === 'f' || v === 'female' || v === 'femme' || v === 'feminin' || v === 'féminin') return 'f';
  return undefined;
}

/** Découpe une liste de tags « a, b ,c », dédoublonne (insensible à la casse), retire le vide. */
export function normaliserTags(liste: string | null | undefined): string[] {
  const vus = new Set<string>();
  const tags: string[] = [];
  for (const brut of (liste || '').split(',')) {
    const tag = brut.replace(/\s+/g, ' ').trim();
    const cle = tag.toLowerCase();
    if (tag && !vus.has(cle)) { vus.add(cle); tags.push(tag); }
  }
  return tags;
}

/** Tronque une liste de tags à `max` caractères sans couper un tag. */
function joindreTags(tags: string[], max: number): string {
  let resultat = '';
  for (const tag of tags) {
    const suivant = resultat ? `${resultat}, ${tag}` : tag;
    if (suivant.length > max) break;
    resultat = suivant;
  }
  return resultat;
}

/** Tags interdits dans `negativeTags` car présents dans le style (aucune exclusion contradictoire). */
function tagsContradictoires(prompt: string, negatifs: string[]): string[] {
  const motsStyle = new Set(prompt.toLowerCase().split(/[^a-z0-9&]+/).filter((m) => m.length > 2));
  return negatifs.filter((tag) => {
    const mots = tag.toLowerCase().split(/[^a-z0-9&]+/).filter((m) => m.length > 2);
    return mots.length > 0 && mots.every((m) => motsStyle.has(m));
  });
}

export interface OptionsStyle {
  genreVocal?: GenreVocal;
  langue?: string;
}

/** Style final propre : tags anglais courts séparés par des virgules (≤ 1 000). */
export function construireStyle(style: StyleMusical, options: OptionsStyle = {}): string {
  const voix = options.genreVocal === 'm' ? 'clear male vocals'
    : options.genreVocal === 'f' ? 'clear female vocals'
    : VOIX_PAR_DEFAUT;
  const langue = (options.langue || 'fr').toLowerCase();
  const tags = normaliserTags(`${style.prompt}, ${voix}${langue === 'fr' ? ', french lyrics' : ''}`);
  return joindreTags(tags, LIMITES_SUNO.style);
}

/** Exclusions du style + celles de l'utilisateur, sans contradiction avec le style (≤ 1 000). */
export function construireNegativeTags(style: StyleMusical, supplementaires?: string | null): string {
  const tags = normaliserTags(`${style.negativeTags}, ${supplementaires || ''}`);
  const contradictoires = new Set(tagsContradictoires(style.prompt, tags).map((t) => t.toLowerCase()));
  return joindreTags(tags.filter((t) => !contradictoires.has(t.toLowerCase())), LIMITES_SUNO.negativeTags);
}

/** Poids 0–1 arrondi à 2 décimales ; accepte aussi 0–100 (curseurs) ; hors bornes → défaut. */
export function normaliserPoids(valeur: unknown, defaut: number): number {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return defaut;
  const v = valeur > 1 && valeur <= 100 ? valeur / 100 : valeur;
  if (v < 0 || v > 1) return defaut;
  return Math.round(v * 100) / 100;
}

export const POIDS_PAR_DEFAUT = { styleWeight: 0.7, weirdnessConstraint: 0.3, variety: 1 } as const;

export interface EntreeRequeteSuno {
  paroles: string | string[];
  style?: string | null;
  rang?: string | null;
  codeItem?: string | null;
  titreItem?: string | null;
  /** Titre déjà prêt (repli si aucun titre d'item). */
  titre?: string | null;
  langue?: string | null;
  genreVocal?: string | null;
  negativeTags?: string | null;
  styleWeight?: unknown;
  weirdnessConstraint?: unknown;
  variety?: unknown;
  dureeDemandee?: number | null;
  modele: ModeleSuno;
  callBackUrl: string;
}

/** Charge utile exacte envoyée à POST /api/v1/generate (mode custom, avec voix). */
export interface ChargeUtileSuno {
  customMode: true;
  instrumental: false;
  model: ModeleSuno;
  callBackUrl: string;
  lyrics: string;
  style: string;
  title: string;
  negativeTags: string;
  vocalGender?: GenreVocal;
  styleWeight: number;
  weirdnessConstraint: number;
  variety: number;
  duration: number;
}

export interface RequeteSunoConstruite {
  chargeUtile: ChargeUtileSuno;
  style: StyleMusical;
  rang: RangChanson;
  paroles: ParolesTronquees;
  /** Style demandé remplacé (inconnu → alias ou défaut). */
  styleRemplace: boolean;
}

export function construireRequeteSuno(entree: EntreeRequeteSuno): RequeteSunoConstruite {
  const style = resoudreStyle(entree.style);
  const styleRemplace = !!entree.style && style.slug !== (entree.style || '').trim().toLowerCase();
  const rang = normaliserRang(entree.rang);
  const paroles = tronquerParoles(entree.paroles);
  if (!paroles.texte || compterLignesChantees(paroles.texte) === 0) throw new Error('PAROLES_VIDES');
  const genreVocal = normaliserGenreVocal(entree.genreVocal);

  const titre = entree.titreItem || entree.codeItem
    ? construireTitre(entree.codeItem, entree.titreItem, rang)
    : couperMots((entree.titre || '').trim() || `Chanson MED MNG — ${libelleRang(rang)}`, LIMITES_SUNO.titre);

  const variety = typeof entree.variety === 'number' && Number.isInteger(entree.variety)
    && entree.variety >= 0 && entree.variety <= 4 ? entree.variety : POIDS_PAR_DEFAUT.variety;

  const chargeUtile: ChargeUtileSuno = {
    customMode: true,
    instrumental: false,
    model: entree.modele,
    callBackUrl: entree.callBackUrl,
    lyrics: paroles.texte,
    style: construireStyle(style, { genreVocal, langue: entree.langue || 'fr' }),
    title: titre,
    negativeTags: construireNegativeTags(style, entree.negativeTags),
    ...(genreVocal ? { vocalGender: genreVocal } : {}),
    styleWeight: normaliserPoids(entree.styleWeight, POIDS_PAR_DEFAUT.styleWeight),
    weirdnessConstraint: normaliserPoids(entree.weirdnessConstraint, POIDS_PAR_DEFAUT.weirdnessConstraint),
    variety,
    duration: calculerDureeSecondes(paroles.texte, entree.dureeDemandee),
  };
  return { chargeUtile, style, rang, paroles, styleRemplace };
}

// ---------------------------------------------------------------------------
// Réponses et erreurs Suno → messages utilisateur (français, jamais bruts)
// ---------------------------------------------------------------------------

export const MESSAGE_INDISPONIBLE = 'Service momentanément indisponible, réessayez plus tard.';

export interface ErreurSunoInterpretee {
  /** Statut HTTP renvoyé à notre client. */
  statut: number;
  code: string;
  message: string;
}

/**
 * Interprète une réponse de POST /generate (statut HTTP + `code` du corps).
 * Renvoie null si la génération est acceptée (code 200 avec taskId).
 */
export function interpreterReponseGenerate(statutHttp: number, corps: unknown): ErreurSunoInterpretee | null {
  const c = (corps && typeof corps === 'object' ? corps : {}) as { code?: unknown; data?: { taskId?: unknown } };
  const code = typeof c.code === 'number' ? c.code : statutHttp;
  if (statutHttp >= 200 && statutHttp < 300 && code === 200 && typeof c.data?.taskId === 'string' && c.data.taskId) {
    return null;
  }
  switch (code) {
    case 400:
    case 413:
      return { statut: 422, code: 'CONTENU_REFUSE', message: 'Le service de génération a refusé la demande (paroles ou style non acceptés). Changez de style ou de rang, puis réessayez.' };
    case 401:
      return { statut: 503, code: 'CONFIGURATION', message: 'Le service de génération est mal configuré. Contactez le support.' };
    case 402:
    case 429:
      return { statut: 503, code: 'SERVICE_SATURE', message: 'Le service de génération est saturé pour le moment. Réessayez dans quelques minutes.' };
    case 405:
    case 430:
      return { statut: 429, code: 'TROP_DE_DEMANDES', message: 'Trop de demandes en même temps. Patientez une minute avant de relancer.' };
    case 455:
      return { statut: 503, code: 'MAINTENANCE', message: 'Le service de génération est en maintenance. Réessayez plus tard.' };
    default:
      return { statut: 502, code: 'SERVICE_INDISPONIBLE', message: MESSAGE_INDISPONIBLE };
  }
}

/** Message utilisateur pour un callback / statut en échec (codes des callbacks Suno). */
export function messageEchecGeneration(code: number | null | undefined, statutSuno?: string | null): string {
  const s = (statutSuno || '').toUpperCase();
  if (s === 'SENSITIVE_WORD_ERROR' || code === 400) {
    return 'Génération refusée par le service (paroles ou style non acceptés). Elle ne vous est pas décomptée : changez de style ou de rang et réessayez.';
  }
  if (code === 451) {
    return "Le fichier audio n'a pas pu être récupéré. Cette génération ne vous est pas décomptée : réessayez.";
  }
  return 'La génération a échoué du côté du service. Elle ne vous est pas décomptée : réessayez dans quelques minutes.';
}

// ---------------------------------------------------------------------------
// Callback et record-info → pistes normalisées
// ---------------------------------------------------------------------------

export interface PisteSuno {
  id: string;
  audioUrl: string | null;
  streamUrl: string | null;
  imageUrl: string | null;
  title: string | null;
  tags: string | null;
  modelName: string | null;
  duration: number | null;
  createTime: string | null;
  prompt: string | null;
}

const texteOuNull = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null);

/** Accepte la forme du callback (snake_case) et celle de record-info (camelCase). */
export function normaliserPisteSuno(brut: unknown): PisteSuno | null {
  if (!brut || typeof brut !== 'object') return null;
  const p = brut as Record<string, unknown>;
  const id = texteOuNull(p.id) ?? texteOuNull(p.audioId);
  if (!id) return null;
  const duree = typeof p.duration === 'number' ? p.duration : Number(p.duration);
  return {
    id,
    audioUrl: texteOuNull(p.audio_url) ?? texteOuNull(p.audioUrl) ?? texteOuNull(p.source_audio_url) ?? texteOuNull(p.sourceAudioUrl),
    streamUrl: texteOuNull(p.stream_audio_url) ?? texteOuNull(p.streamAudioUrl) ?? texteOuNull(p.source_stream_audio_url) ?? texteOuNull(p.sourceStreamAudioUrl),
    imageUrl: texteOuNull(p.image_url) ?? texteOuNull(p.imageUrl) ?? texteOuNull(p.source_image_url) ?? texteOuNull(p.sourceImageUrl),
    title: texteOuNull(p.title),
    tags: texteOuNull(p.tags),
    modelName: texteOuNull(p.model_name) ?? texteOuNull(p.modelName),
    duration: Number.isFinite(duree) && duree > 0 ? duree : null,
    createTime: texteOuNull(p.createTime) ?? texteOuNull(p.create_time),
    prompt: texteOuNull(p.prompt),
  };
}

export type TypeCallbackSuno = 'text' | 'first' | 'complete' | 'error' | 'inconnu';

export interface CallbackSunoInterprete {
  taskId: string | null;
  type: TypeCallbackSuno;
  code: number | null;
  /** Génération à marquer en échec (code ≠ 200 ou callbackType « error »). */
  echec: boolean;
  /** Message utilisateur en cas d'échec. */
  message: string | null;
  pistes: PisteSuno[];
}

/** Lit un callback Suno ({code, msg, data:{callbackType, task_id, data:[…]}}), quelle que soit sa variante. */
export function interpreterCallbackSuno(corps: unknown): CallbackSunoInterprete {
  const c = (corps && typeof corps === 'object' ? corps : {}) as Record<string, unknown>;
  const data = (c.data && typeof c.data === 'object' ? c.data : {}) as Record<string, unknown>;
  const code = typeof c.code === 'number' ? c.code : null;
  const typeBrut = typeof data.callbackType === 'string' ? data.callbackType.toLowerCase() : '';
  const type: TypeCallbackSuno = ['text', 'first', 'complete', 'error'].includes(typeBrut) ? (typeBrut as TypeCallbackSuno) : 'inconnu';
  const taskId = texteOuNull(data.task_id) ?? texteOuNull(data.taskId) ?? texteOuNull(c.task_id) ?? texteOuNull(c.taskId);
  const brutes = Array.isArray(data.data) ? data.data : [];
  const pistes = brutes.map(normaliserPisteSuno).filter((p): p is PisteSuno => p !== null);
  const echec = type === 'error' || (code !== null && code !== 200);
  return {
    taskId,
    type,
    code,
    echec,
    message: echec ? messageEchecGeneration(code) : null,
    pistes,
  };
}

export type StatutGenerationSuno = 'generating' | 'completed' | 'failed';

export interface RecordInfoInterprete {
  statut: StatutGenerationSuno;
  statutSuno: string;
  pistes: PisteSuno[];
  message: string | null;
}

/** Lit GET /generate/record-info : {code, data:{status, response:{sunoData:[…]}, errorCode, errorMessage}}. */
export function interpreterRecordInfoSuno(corps: unknown): RecordInfoInterprete {
  const c = (corps && typeof corps === 'object' ? corps : {}) as Record<string, unknown>;
  const data = (c.data && typeof c.data === 'object' ? c.data : {}) as Record<string, unknown>;
  const statutSuno = typeof data.status === 'string' ? data.status.toUpperCase() : '';
  const reponse = (data.response && typeof data.response === 'object' ? data.response : {}) as Record<string, unknown>;
  const brutes = Array.isArray(reponse.sunoData) ? reponse.sunoData : Array.isArray(reponse.data) ? reponse.data : [];
  const pistes = brutes.map(normaliserPisteSuno).filter((p): p is PisteSuno => p !== null);
  const avecAudio = pistes.some((p) => p.audioUrl);

  if (['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'].includes(statutSuno)) {
    const codeErreur = typeof data.errorCode === 'number' ? data.errorCode : null;
    return { statut: 'failed', statutSuno, pistes, message: messageEchecGeneration(codeErreur, statutSuno) };
  }
  if ((statutSuno === 'SUCCESS' || statutSuno === 'FIRST_SUCCESS') && avecAudio) {
    return { statut: 'completed', statutSuno, pistes, message: null };
  }
  return { statut: 'generating', statutSuno, pistes, message: null };
}
