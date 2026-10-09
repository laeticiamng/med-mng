/**
 * Paroles CHANTÉES : version des paroles envoyée au moteur musical.
 *
 * Constat du 09.10.2026 (transcription des chansons V6 de production, IC-150) : « 80 à 90 mg »
 * a été transcrit « 80 à 86 mg » dans 2 versions sur 3. Un moteur musical lit mal les chiffres,
 * les unités abrégées et les intervalles (« 48-72 h »). On lui envoie donc les nombres, unités
 * et ordinaux EN TOUTES LETTRES, sans rien changer au sens. Les paroles affichées à
 * l'étudiant gardent l'écriture médicale usuelle (chiffres, unités).
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

const ORDINAUX: Record<string, string> = {
  '1er': 'premier', '1re': 'première', '1ère': 'première', '2e': 'deuxième', '2nd': 'second', '2nde': 'seconde',
  '3e': 'troisième', '4e': 'quatrième', '5e': 'cinquième', '6e': 'sixième', '7e': 'septième', '8e': 'huitième',
  '9e': 'neuvième', '10e': 'dixième',
};

const NOMBRE = String.raw`\d{1,3}(?:[  ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?`;
const echapper = (t: string) => t.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const ALTERNATIVE_UNITES = UNITES_MESURE.map(([abr]) => echapper(abr)).join('|');
const PAR_ABREVIATION = new Map(UNITES_MESURE.map(([abr, sing, plur]) => [abr, [sing, plur] as const]));
const MOTIF_NOMBRE = new RegExp(
  String.raw`(?<![\p{L}\d-])(${NOMBRE})(?:\s?(${ALTERNATIVE_UNITES})(?![\p{L}\d]))?`,
  'gu',
);
const MOTIF_INTERVALLE = new RegExp(String.raw`(?<![\p{L}\d-])(${NOMBRE})\s*[-–]\s*(${NOMBRE})(?!\d)`, 'gu');

/**
 * Paroles chantées : nombres, intervalles, unités et ordinaux en toutes lettres.
 * Les codes (OMA, HTA, IC-12, OIC-001…) et les balises de structure ([Refrain]) sont conservés.
 */
export const parolesChantees = (texte: string): string =>
  texte
    .split('\n')
    .map((ligne) => {
      if (/^\s*\[[^\]]+\]\s*$/.test(ligne)) return ligne;
      return ligne
        .replace(/(?<![\p{L}\d])(1er|1re|1ère|2nde|2nd|[2-9]e|10e)(?![\p{L}\d])/gu, (m) => ORDINAUX[m] ?? m)
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
