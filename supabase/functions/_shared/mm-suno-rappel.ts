/**
 * Signature des URL de rappel Suno (vague sécurité F66-MM, 05.10.2026).
 *
 * CONSTAT : sunoapi.org ne signe pas ses rappels. mm-suno-callback (verify_jwt = false,
 * appelée sans en-tête Authorization par Suno) acceptait donc n'importe quel corps : connaissant
 * un task_id, on pouvait marquer une génération échouée (elle sortait du quota mensuel), ou lui
 * attribuer un fichier audio arbitraire que la fonction téléchargeait puis copiait dans le
 * compartiment public mm-chansons.
 *
 * PARADE : mm-generate-music donne à Suno une URL de rappel signée, propre à l'utilisateur :
 *   …/functions/v1/mm-suno-callback/<utilisateur>/<expiration>/<signature>
 * signature = HMAC-SHA-256(clé de service, « mm-suno-rappel-v1|<utilisateur>|<expiration> »).
 * mm-suno-callback vérifie la signature AVANT de lire le corps, puis que la génération visée
 * (task_id du corps) appartient bien à cet utilisateur, avant toute écriture. Rien n'est stocké :
 * l'URL n'est connue que du serveur et de Suno (jamais renvoyée au navigateur).
 *
 * Générations lancées AVANT ce changement (URL sans signature) : leur rappel est refusé (401) ;
 * mm-music-status les rattrape auprès de Suno (record-info) dès que l'application interroge leur
 * état (45 s après le lancement), sans perte.
 */

export const SEGMENT_FONCTION_RAPPEL = 'mm-suno-callback';
/** Durée de validité d'une URL de rappel : Suno rappelle en quelques minutes, réessais compris. */
export const DUREE_VALIDITE_RAPPEL_MS = 24 * 60 * 60 * 1000;
const PREFIXE = 'mm-suno-rappel-v1';
/** Utilisateur absent (génération lancée avec la clé de service). */
const SANS_UTILISATEUR = '-';
const FORMAT_UTILISATEUR = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|-)$/;
const FORMAT_EXPIRATION = /^\d{13}$/;
const FORMAT_SIGNATURE = /^[0-9a-f]{64}$/;
const TAILLE_MIN_CLE = 20;

async function signer(cle: string, utilisateur: string, expiration: string): Promise<string> {
  const cleHmac = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(cle), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const octets = await crypto.subtle.sign('HMAC', cleHmac, new TextEncoder().encode(`${PREFIXE}|${utilisateur}|${expiration}`));
  return [...new Uint8Array(octets)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Comparaison en temps constant de deux chaînes de même longueur attendue. */
function egales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

/**
 * URL de rappel signée pour une génération de `userId` (null : clé de service).
 * Lève une erreur si la clé est absente : mieux vaut refuser la génération que de
 * donner à Suno une URL que mm-suno-callback refusera.
 */
export async function signerUrlRappel(
  urlSupabase: string,
  userId: string | null,
  cle: string,
  maintenant: number = Date.now(),
): Promise<string> {
  if (!cle || cle.length < TAILLE_MIN_CLE) throw new Error('Clé de signature des rappels Suno absente.');
  const utilisateur = userId ?? SANS_UTILISATEUR;
  if (!FORMAT_UTILISATEUR.test(utilisateur)) throw new Error('Identifiant utilisateur invalide pour le rappel Suno.');
  const expiration = String(maintenant + DUREE_VALIDITE_RAPPEL_MS);
  const signature = await signer(cle, utilisateur, expiration);
  const base = urlSupabase.replace(/\/+$/, '');
  return `${base}/functions/v1/${SEGMENT_FONCTION_RAPPEL}/${utilisateur}/${expiration}/${signature}`;
}

/**
 * Vérifie l'URL d'un rappel reçu. Renvoie l'utilisateur auquel le rappel est lié
 * (null : génération de la clé de service), ou `false` si l'URL n'est pas signée,
 * mal formée, expirée ou falsifiée.
 */
export async function verifierUrlRappel(
  url: string,
  cle: string,
  maintenant: number = Date.now(),
): Promise<{ userId: string | null } | false> {
  if (!cle || cle.length < TAILLE_MIN_CLE) return false;
  let chemin: string;
  try {
    chemin = new URL(url).pathname;
  } catch {
    return false;
  }
  const segments = chemin.split('/').filter(Boolean);
  const position = segments.lastIndexOf(SEGMENT_FONCTION_RAPPEL);
  if (position < 0 || segments.length !== position + 4) return false;
  const [utilisateur, expiration, signature] = segments.slice(position + 1);
  if (!FORMAT_UTILISATEUR.test(utilisateur) || !FORMAT_EXPIRATION.test(expiration) || !FORMAT_SIGNATURE.test(signature)) {
    return false;
  }
  const echeance = Number(expiration);
  // Expirée, ou échéance plus lointaine que ce que signerUrlRappel produit (horloge comprise).
  if (echeance < maintenant || echeance > maintenant + DUREE_VALIDITE_RAPPEL_MS + 5 * 60 * 1000) return false;
  const attendue = await signer(cle, utilisateur, expiration);
  if (!egales(signature, attendue)) return false;
  return { userId: utilisateur === SANS_UTILISATEUR ? null : utilisateur };
}
