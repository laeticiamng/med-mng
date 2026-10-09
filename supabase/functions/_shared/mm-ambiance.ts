/**
 * Ambiance musicale LIBRE de Med MNG Create (09.10.2026).
 *
 * L'utilisateur décrit l'ambiance en français (« piano doux, pluie, tempo lent, nostalgique »).
 * Le texte est réellement transmis au moteur : traduit en tags anglais et ajouté au style du
 * catalogue (champ `style`, ≤ 1 000 caractères chez le fournisseur).
 *
 * Restrictions (conditions des fournisseurs : pas d'imitation de personnes, pas de noms
 * d'artistes, de titres ou de labels) :
 *  1. contrôle LOCAL (site + serveur) : longueur, liens, formulations d'imitation ;
 *  2. contrôle par IA côté serveur : refus de tout nom d'artiste, de groupe, de chanson,
 *     d'album, de label ou de personne réelle ; sinon traduction en tags anglais neutres.
 * Un refus n'appelle jamais le fournisseur (aucun coût, rien de décompté).
 */

export const AMBIANCE_MAX = 200;

export const AIDE_AMBIANCE =
  "Instruments, tempo, émotion, décor sonore… Pas de nom d'artiste, de groupe ni de titre : décrivez le son, pas une personne.";

const MOTIFS_INTERDITS: [RegExp, string][] = [
  [/https?:\/\/|www\.|@/i, 'Pas de lien ni d’adresse.'],
  [
    /(à la manière|a la maniere|à la façon|a la facon|\bfaçon\b|\bfacon\b|style de\b|style d['’]|dans le style|voix de\b|voix d['’]|\bimit\w*|\bsosie|\bfeat\b|\bft\.|featuring|\breprise\b|\bcover\b|remix de\b|sound ?alike|in the style of)/i,
    'Décrivez l’ambiance sans référence à un artiste, une voix ou un titre existant.',
  ],
];

export interface VerdictAmbiance {
  ok: boolean;
  /** Texte nettoyé (espaces) si ok. */
  texte?: string;
  raison?: string;
}

/** Contrôle local (sans réseau), identique sur le site et le serveur. Vide = pas d'ambiance. */
export function verifierAmbianceLocale(brut: unknown): VerdictAmbiance {
  if (brut === undefined || brut === null) return { ok: true, texte: '' };
  if (typeof brut !== 'string') return { ok: false, raison: 'Ambiance illisible.' };
  const texte = brut.replace(/\s+/g, ' ').trim();
  if (!texte) return { ok: true, texte: '' };
  if (texte.length > AMBIANCE_MAX) return { ok: false, raison: `${AMBIANCE_MAX} caractères au maximum.` };
  for (const [motif, raison] of MOTIFS_INTERDITS) if (motif.test(texte)) return { ok: false, raison };
  return { ok: true, texte };
}

/** Consigne du contrôle par IA (réponse JSON stricte). */
export const CONSIGNE_IA_AMBIANCE = `Tu contrôles une description d'ambiance musicale saisie par un utilisateur, avant de l'envoyer à un générateur de musique.
Réponds UNIQUEMENT en JSON : {"autorise": boolean, "raison": string, "tags": string}.
- "autorise" = false si le texte contient un nom (ou surnom) d'artiste, de chanteur, de groupe, de compositeur, de chanson, d'album, de film, de label, de marque ou de toute personne réelle, ou demande d'imiter une voix ou une œuvre existante, ou contient des propos haineux, sexuels, violents ou sans rapport avec la musique.
- "raison" : si refus, une phrase courte en français pour l'utilisateur, sans répéter le nom en cause ; sinon "".
- "tags" : si autorisé, la description traduite en 3 à 12 tags musicaux ANGLAIS courts, séparés par des virgules (genre, instruments, tempo, émotion, texture), sans aucun nom propre ; sinon "".`;

/** Lecture tolérante de la réponse de l'IA ; toute réponse inexploitable = refus prudent. */
export function interpreterVerdictIA(contenu: string): { autorise: boolean; raison: string; tags: string } {
  try {
    const j = JSON.parse(contenu.replace(/^```(?:json)?\s*|\s*```$/g, ''));
    const tags = typeof j.tags === 'string' ? j.tags : '';
    const propres = tags
      .split(',')
      .map((t: string) => t.trim().toLowerCase())
      .filter((t: string) => t && t.length <= 40 && /^[a-z0-9 &'+/-]+$/.test(t))
      .slice(0, 12)
      .join(', ');
    if (j.autorise === true && propres) return { autorise: true, raison: '', tags: propres };
    return { autorise: false, raison: typeof j.raison === 'string' && j.raison ? j.raison : 'Ambiance refusée.', tags: '' };
  } catch {
    return { autorise: false, raison: 'Ambiance impossible à vérifier, réessayez sans elle.', tags: '' };
  }
}
