/**
 * Paroles CHANTÉES : version des paroles envoyée au moteur musical.
 *
 * Constat du 09.10.2026 (transcription des chansons V6 de production, IC-150) : « 80 à 90 mg »
 * a été transcrit « 80 à 86 mg » dans 2 versions sur 3. Un moteur musical lit mal les chiffres,
 * les unités abrégées et les intervalles (« 48-72 h »). On lui envoie donc les nombres, unités
 * et ordinaux EN TOUTES LETTRES, sans rien changer au sens. Les paroles affichées à
 * l'étudiant gardent l'écriture médicale usuelle (chiffres, unités).
 *
 * Même logique pour les sigles non prononçables (« HTA », « AVC », « IRM »…) : une voix chantée
 * en fait un mot inventé ou une syllabe bancale. Ils sont épelés lettre par lettre (« H-T-A »)
 * dans la seule version chantée (voir « Sigles » plus bas).
 *
 * Module pur, partagé site/serveur (aucune importation).
 */

const UNITES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const DIZAINES: Record<number, string> = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante', 8: 'quatre-vingt' };

const moinsDeCent = (n: number): string => {
  if (n <= 16) return UNITES[n];
  if (n < 20) return `dix-${UNITES[n - 10]}`;
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (d === 7 || d === 9) {
    const base = d === 7 ? 'soixante' : 'quatre-vingt';
    const reste = 10 + u;
    if (d === 7 && u === 1) return 'soixante et onze';
    return `${base}-${moinsDeCent(reste)}`;
  }
  if (d === 8) return u === 0 ? 'quatre-vingts' : `quatre-vingt-${UNITES[u]}`;
  if (u === 0) return DIZAINES[d];
  if (u === 1) return `${DIZAINES[d]} et un`;
  return `${DIZAINES[d]}-${UNITES[u]}`;
};

const moinsDeMille = (n: number): string => {
  const c = Math.floor(n / 100);
  const r = n % 100;
  if (c === 0) return moinsDeCent(r);
  const cents = c === 1 ? 'cent' : `${UNITES[c]} cent${r === 0 ? 's' : ''}`;
  return r === 0 ? cents : `${cents} ${moinsDeCent(r)}`;
};

/** Entier (0 à 999 999 999) en toutes lettres, orthographe traditionnelle. */
export const entierEnLettres = (n: number): string => {
  if (!Number.isInteger(n) || n < 0 || n > 999_999_999) return String(n);
  if (n < 1000) return moinsDeMille(n);
  if (n < 1_000_000) {
    const m = Math.floor(n / 1000);
    const r = n % 1000;
    const milliers = m === 1 ? 'mille' : `${moinsDeMille(m).replace(/s$/, '')} mille`;
    return r === 0 ? milliers : `${milliers} ${moinsDeMille(r)}`;
  }
  const mi = Math.floor(n / 1_000_000);
  const r = n % 1_000_000;
  const millions = `${mi === 1 ? 'un' : moinsDeMille(mi)} million${mi > 1 ? 's' : ''}`;
  return r === 0 ? millions : `${millions} ${entierEnLettres(r)}`;
};

/** « 2,5 » / « 0.8 » → « deux virgule cinq » / « zéro virgule huit » (décimales lues chiffre par chiffre au-delà de deux). */
export const nombreEnLettres = (brut: string): string => {
  const t = brut.replace(/\s/g, '').replace('.', ',');
  const [ent, dec] = t.split(',');
  const e = entierEnLettres(parseInt(ent, 10));
  if (dec === undefined || dec === '') return e;
  const partieDec = dec.length <= 2 && !dec.startsWith('0')
    ? entierEnLettres(parseInt(dec, 10))
    : dec.split('').map((c) => UNITES[Number(c)]).join(' ');
  return `${e} virgule ${partieDec}`;
};

/** Unités usuelles après un nombre (forme chantée), les plus longues d'abord : [abréviation, singulier, pluriel]. */
const UNITES_MESURE: [string, string, string][] = [
  ['mmHg', 'millimètre de mercure', 'millimètres de mercure'],
  ['mmol/L', 'millimole par litre', 'millimoles par litre'],
  ['mmol/l', 'millimole par litre', 'millimoles par litre'],
  ['µmol/L', 'micromole par litre', 'micromoles par litre'],
  ['µmol/l', 'micromole par litre', 'micromoles par litre'],
  ['mg/kg/jour', 'milligramme par kilo et par jour', 'milligrammes par kilo et par jour'],
  ['mg/kg/j', 'milligramme par kilo et par jour', 'milligrammes par kilo et par jour'],
  ['mg/kg', 'milligramme par kilo', 'milligrammes par kilo'],
  ['mg/dL', 'milligramme par décilitre', 'milligrammes par décilitre'],
  ['mg/dl', 'milligramme par décilitre', 'milligrammes par décilitre'],
  ['mg/L', 'milligramme par litre', 'milligrammes par litre'],
  ['mg/l', 'milligramme par litre', 'milligrammes par litre'],
  ['g/dL', 'gramme par décilitre', 'grammes par décilitre'],
  ['g/dl', 'gramme par décilitre', 'grammes par décilitre'],
  ['g/L', 'gramme par litre', 'grammes par litre'],
  ['g/l', 'gramme par litre', 'grammes par litre'],
  ['mL/min', 'millilitre par minute', 'millilitres par minute'],
  ['ml/min', 'millilitre par minute', 'millilitres par minute'],
  ['mSv', 'millisievert', 'millisieverts'],
  ['µg', 'microgramme', 'microgrammes'],
  ['μg', 'microgramme', 'microgrammes'],
  ['mcg', 'microgramme', 'microgrammes'],
  ['mg', 'milligramme', 'milligrammes'],
  ['kg', 'kilo', 'kilos'],
  ['mL', 'millilitre', 'millilitres'],
  ['ml', 'millilitre', 'millilitres'],
  ['cm', 'centimètre', 'centimètres'],
  ['mm', 'millimètre', 'millimètres'],
  ['UI', 'unité internationale', 'unités internationales'],
  ['°C', 'degré', 'degrés'],
  ['dB', 'décibel', 'décibels'],
  ['Gy', 'gray', 'grays'],
  ['Sv', 'sievert', 'sieverts'],
  ['min', 'minute', 'minutes'],
  ['g', 'gramme', 'grammes'],
  ['L', 'litre', 'litres'],
  ['h', 'heure', 'heures'],
  ['j', 'jour', 'jours'],
  ['%', 'pour cent', 'pour cent'],
];

/**
 * Ordinal en toutes lettres : 1er → premier, 1re/1ère → première, 2nd(e) → second(e),
 * sinon n-ième (2e, 3ème, 11e, 21e, 80e…). Pluriel (« 1ers », « 2es ») conservé.
 */
export const ordinalEnLettres = (n: number, suffixe: string): string => {
  const suf = suffixe.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const pluriel = /s$/.test(suf) && suf !== 's' ? 's' : '';
  const base = suf.replace(/s$/, '');
  if (n === 1 && (base === 'er')) return `premier${pluriel}`;
  if (n === 1 && (base === 're' || base === 'ere')) return `première${pluriel}`;
  if (n === 2 && base === 'nd') return `second${pluriel}`;
  if (n === 2 && base === 'nde') return `seconde${pluriel}`;
  let mot = entierEnLettres(n);
  if (/(vingts|cents)$/.test(mot)) mot = mot.slice(0, -1);
  if (mot.endsWith('cinq')) mot += 'u';
  else if (mot.endsWith('neuf')) mot = `${mot.slice(0, -1)}v`;
  else if (mot.endsWith('e')) mot = mot.slice(0, -1);
  return `${mot}ième${pluriel}`;
};

/** « 1er », « 1re », « 1ère », « 2e », « 3ème », « 3eme », « 11e », « 2nd », « 2nde », « 1ers », « 2es »… */
const MOTIF_ORDINAL =
  /(?<![\p{L}\d])(\d{1,3})(ers?|res?|ères?|eres?|èmes?|emes?|ndes?|nds?|es?)(?![\p{L}\d])/giu;


const NOMBRE = String.raw`\d{1,3}(?:[  ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?`;
const echapper = (t: string) => t.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const ALTERNATIVE_UNITES = UNITES_MESURE.map(([abr]) => echapper(abr)).join('|');
const PAR_ABREVIATION = new Map(UNITES_MESURE.map(([abr, sing, plur]) => [abr, [sing, plur] as const]));
const MOTIF_NOMBRE = new RegExp(
  String.raw`(?<![\p{L}\d-])(${NOMBRE})(?:\s?(${ALTERNATIVE_UNITES})(?![\p{L}\d])|(?![\p{L}\d]))`,
  'gu',
);
const MOTIF_INTERVALLE = new RegExp(String.raw`(?<![\p{L}\d-])(${NOMBRE})\s*[-–]\s*(${NOMBRE})(?!\d)`, 'gu');

/** Nombres, intervalles, unités et ordinaux en toutes lettres (les balises de structure sont conservées). */
const chiffresEnLettres = (texte: string): string =>
  texte
    .split('\n')
    .map((ligne) => {
      if (/^\s*\[[^\]]+\]\s*$/.test(ligne)) return ligne;
      return ligne
        .replace(MOTIF_ORDINAL, (m, n: string, suf: string) => {
          const v = parseInt(n, 10);
          // « 1nd », « 3er », « 1e »… (genre ou forme ambigus) : laissés tels quels.
          if (v === 0 || (/^nd/i.test(suf) && v !== 2) || (/^(?:er|re|ère|ere)/i.test(suf) !== (v === 1))) return m;
          return ordinalEnLettres(v, suf);
        })
        .replace(MOTIF_INTERVALLE, '$1 à $2')
        .replace(MOTIF_NOMBRE, (_m, n: string, unite?: string) => {
          const lettres = nombreEnLettres(n);
          if (!unite) return lettres;
          const [sing, plur] = PAR_ABREVIATION.get(unite)!;
          const valeur = parseFloat(n.replace(/\s/g, '').replace(',', '.'));
          return `${lettres} ${valeur >= 2 ? plur : sing}`;
        });
    })
    .join('\n');

// ---------------------------------------------------------------------------
// Sigles : épellation lettre par lettre (« HTA » → « H-T-A »)
// ---------------------------------------------------------------------------
//
// Une voix chantée lit mal un sigle d'un seul tenant : « HTA » devient une syllabe bancale,
// « AVC » un mot inventé. Épelé « H-T-A », il est dit « ache-té-a ». Seule la version CHANTÉE est
// épelée : les paroles affichées à l'étudiant gardent « HTA ».
//
// Origine : logique de `supabase/functions/_shared/phonetiqueChantee.ts` de Memo MNG (dépôt
// learn-jams, dernier commit du fichier : df5dfd7, 07.10.2026), dont seule la partie « sigles » est
// reprise (le reste de ce module — nombres, unités, ordinaux — existe déjà ici avec ses propres
// conventions, calibrées sur le constat du 09.10.2026). Écarts voulus avec Memo MNG :
//  - listes de mots à ne pas épeler recentrées sur le français médical : « PAS » (pression artérielle
//    systolique), « TV » (tachycardie ventriculaire), « ENA » (anticorps anti-ENA) sont épelés ;
//  - seuls les chiffres romains écrits avec I, V, X sont épargnés : « CV », « MM », « DM », « CI »
//    sont des sigles médicaux avant d'être des nombres ; « IV » est épelé après « voie » ou « en »
//    (intraveineux), laissé tel quel ailleurs (« stade IV ») ;
//  - une ligne de sigles (« ECG, RP, NFS, CRP ») n'est pas prise pour un cri ;
//  - « HbA1c » (casse mixte) est épelé « H-B-A-un-C ».
// Non repris : chiffres romains, formules chimiques, « B12 » → « B douze » (hors périmètre).

/** Sigle candidat : 2 à 6 capitales isolées. Un trait d'union voisin l'exclut (IC-66, OIC-001-01-A, COVID-19). */
const MOTIF_SIGLE = /(?<![\p{L}\p{N}-])[A-Z]{2,6}(?![\p{L}\p{N}-])/gu;

/** Sigles qui se disent comme un mot : jamais épelés (« sida » ne devient pas « S-I-D-A »). Liste non exhaustive. */
const SIGLES_LUS_COMME_UN_MOT = new Set([
  // santé
  'SIDA', 'SAMU', 'SMUR', 'SRAS', 'MERS', 'COVID', 'EHPAD', 'APGAR', 'AINS', 'GEU', 'CHU', 'TAVI',
  'ASAT', 'ALAT', 'HELLP', 'SOFA', 'FAST', 'ECOS',
  // institutions et noms communs
  'ONU', 'OTAN', 'UNESCO', 'UNICEF', 'INSERM', 'PACS', 'LASER', 'RADAR', 'SONAR',
]);

/**
 * Mots courants qu'un parolier écrit en capitales pour insister : les épeler transformerait un cri
 * en dictée. Aucune règle sur les voyelles ne sépare « FORT » de « CRP » : la liste est la seule
 * barrière. Mots français seulement (les paroles sont chantées en français) ; les mots qui sont aussi
 * des sigles médicaux (PAS, TA, SA, TV…) n'y figurent volontairement pas.
 */
const MOTS_EN_MAJUSCULES = new Set([
  // grammaire et liaisons
  'JE', 'TU', 'IL', 'ON', 'MOI', 'TOI', 'LUI', 'ELLE', 'ELLES', 'NOUS', 'VOUS', 'EUX', 'SOI', 'ILS',
  'LE', 'LA', 'LES', 'UN', 'UNE', 'DES', 'DU', 'AU', 'AUX', 'EN', 'DE', 'CE', 'CES', 'CET', 'CETTE',
  'SE', 'ME', 'TE', 'MON', 'TON', 'SON', 'MES', 'TES', 'SES', 'NOS', 'VOS',
  'ET', 'OU', 'NI', 'SI', 'QUE', 'QUI', 'DONC', 'MAIS', 'CAR', 'OR', 'PAR', 'COMME', 'QUAND', 'PUIS',
  'DANS', 'SOUS', 'SUR', 'AVEC', 'SANS', 'POUR', 'VERS', 'CHEZ', 'ENTRE', 'AVANT', 'APRES',
  'SONT', 'FAUT', 'PEUT', 'FAIT', 'SOIT', 'TEL', 'TANT',
  // adverbes et quantités
  'OUI', 'NON', 'PLUS', 'MOINS', 'TOUT', 'TOUS', 'TOUTE', 'RIEN', 'JAMAIS', 'ENCORE', 'DEJA', 'BIEN',
  'MAL', 'MIEUX', 'PIRE', 'FORT', 'LOIN', 'PRES', 'HAUT', 'BAS', 'VITE', 'LENT', 'TROP', 'ASSEZ',
  'AUSSI', 'ALORS',
  // noms fréquents des paroles
  'VIE', 'MORT', 'SANG', 'COEUR', 'AME', 'CORPS', 'PEAU', 'MAIN', 'YEUX', 'TETE', 'DOS', 'PIED', 'BRAS',
  'JOUR', 'NUIT', 'SOIR', 'MATIN', 'TEMPS', 'HEURE', 'AN', 'ANS', 'MOIS', 'ETE', 'HIVER', 'CIEL', 'MER',
  'EAU', 'FEU', 'AIR', 'TERRE', 'SOL', 'VENT', 'NEIGE', 'PLUIE', 'LUNE', 'NORD', 'SUD', 'EST', 'OUEST',
  'AMOUR', 'PEUR', 'JOIE', 'HAINE', 'ESPOIR', 'REVE', 'CRI', 'RIRE', 'LARME', 'ROI', 'LOI', 'DIEU',
  'FOI', 'PAIX', 'BUT', 'JEU', 'FIN', 'DEBUT', 'PONT', 'LONG', 'PART', 'MURS', 'DENT', 'BORD', 'FROID',
  'CHAUD', 'SEUL', 'VRAI', 'FAUX', 'NEUF', 'VIEUX', 'DEHORS', 'TOUJOURS',
  // insistance propre au registre médical
  'STOP', 'OK', 'DANGER', 'ALERTE', 'URGENT', 'VITAL', 'RISQUE', 'GRAVE', 'CHOC', 'COMA', 'ERREUR',
  'OUBLI', 'PIEGE', 'DIX', 'MIX',
]);

/** Chiffre romain écrit avec I, V, X seulement (I… XXXIX) : laissé tel quel, il n'est pas un sigle. */
const NUMERAL_ROMAIN = /^X{0,3}(?:IX|IV|V?I{0,3})$/;

/** « voie IV », « en IV » : intraveineux, à épeler (« stade IV » reste un chiffre romain). */
const VOIE_INTRAVEINEUSE = /(?:^|[^\p{L}])(?:voie|en)\s+$/iu;

/** Le jeton (2 à 6 capitales) doit-il être épelé ? `avant` est le texte qui le précède sur la ligne. */
export function sigleAEpeler(jeton: string, avant = ''): boolean {
  if (!/^[A-Z]{2,6}$/.test(jeton)) return false;
  if (SIGLES_LUS_COMME_UN_MOT.has(jeton) || MOTS_EN_MAJUSCULES.has(jeton)) return false;
  if (NUMERAL_ROMAIN.test(jeton)) return jeton === 'IV' && VOIE_INTRAVEINEUSE.test(avant);
  return true;
}

/**
 * Une ligne ENTIÈREMENT en capitales dont la moitié des mots, ou moins, sont des sigles à épeler est
 * un cri (« CRIE FORT AU VENT ») : elle reste telle quelle (dans le doute, l'état d'avant). Une
 * liste de sigles (« ECG, RP, NFS, CRP ») n'en est pas un : elle est épelée.
 * Trois mots au moins : « L'ADN et l'ARN » ne doit pas passer pour un cri.
 */
function ligneCriee(ligne: string): boolean {
  const mots = ligne.replace(/\[[^\]]*\]/g, ' ').match(/\p{L}{2,}/gu) ?? [];
  if (mots.length < 3 || !mots.every((m) => m === m.toUpperCase())) return false;
  const aEpeler = mots.filter((m) => sigleAEpeler(m)).length;
  return aEpeler * 2 <= mots.length;
}

/** Codes de casse mixte épelés d'office (le motif des sigles ne voit que des capitales). */
const CODES_CASSE_MIXTE: Array<[RegExp, string]> = [
  [/(?<![\p{L}\p{N}-])HbA1c(?![\p{L}\p{N}-])/giu, 'H-B-A-un-C'],
];

export interface RapportSigles {
  texte: string;
  /** Sigles épelés. */
  epeles: string[];
  /** Sigles laissés tels quels (se lisent comme un mot, mot crié, chiffre romain). */
  laisses: string[];
}

/**
 * Épelle les sigles non prononçables d'un texte (« L'HTA et l'AVC » → « L'H-T-A et l'A-V-C »).
 * Intacts : codes d'item (un trait d'union voisin suffit : IC-66, OIC-001-01-A), sigles lus comme un
 * mot (SAMU, SIDA…), mots en capitales d'insistance, lignes criées, balises de structure
 * ([Refrain], [Couplet 1], y compris dans une ligne). Idempotent : « H-T-A » n'est plus un sigle.
 */
export function epelerSigles(texte: string): RapportSigles {
  const epeles = new Set<string>();
  const laisses = new Set<string>();
  const sortie = texte
    .split('\n')
    .map((ligne) => {
      if (/^\s*\[[^\]]+\]\s*$/.test(ligne)) return ligne;
      const criee = ligneCriee(ligne);
      // Les segments impairs sont des balises ([Refrain]…) : jamais touchées.
      return ligne
        .split(/(\[[^\]]*\])/)
        .map((segment, i) => {
          if (i % 2 === 1) return segment;
          let t = segment;
          for (const [motif, epele] of CODES_CASSE_MIXTE) {
            t = t.replace(motif, (code) => {
              epeles.add(code);
              return epele;
            });
          }
          if (criee) return t;
          return t.replace(MOTIF_SIGLE, (jeton: string, offset: number, chaine: string) => {
            if (!sigleAEpeler(jeton, chaine.slice(0, offset))) {
              laisses.add(jeton);
              return jeton;
            }
            epeles.add(jeton);
            return jeton.split('').join('-');
          });
        })
        .join('');
    })
    .join('\n');
  return { texte: sortie, epeles: [...epeles], laisses: [...laisses] };
}

/**
 * Paroles chantées : nombres, intervalles, unités et ordinaux en toutes lettres, puis sigles non
 * prononçables épelés (« HTA » → « H-T-A »).
 * Les codes d'item (IC-12, OIC-001-01-A), les sigles qui se disent comme un mot (SAMU, SIDA…),
 * les lignes entièrement criées en capitales et les balises de structure ([Refrain]) sont conservés.
 */
export const parolesChantees = (texte: string): string => epelerSigles(chiffresEnLettres(texte)).texte;
