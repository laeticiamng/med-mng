/**
 * Masquage des jetons d'authentification dans ce qu'envoie Sentry (défense en profondeur).
 *
 * Un lien de réinitialisation, de confirmation ou de connexion peut porter un secret dans l'adresse :
 * token_hash (réinitialisation Med MNG), access_token et refresh_token (retour OAuth, ancien lien de
 * récupération), code (retour OAuth PKCE). Sentry enregistre l'URL de la page (request.url, Referer),
 * les fils d'Ariane de navigation et de requêtes (from, to, url) et le nom des transactions : tout
 * texte qui contient « clé=valeur » avec l'une de ces clés est masqué, où qu'il soit dans
 * l'évènement. Le jeton de récupération est en plus retiré de l'adresse avant l'initialisation de
 * Sentry (src/lib/jetonRecuperation.ts) : ceci couvre le reste.
 */

export const CLES_SECRETES = ['token_hash', 'access_token', 'refresh_token', 'code'] as const;
export const MASQUE = '[masque]';

const MOTIF = new RegExp(`([?#&;]|^)(${CLES_SECRETES.join('|')})=[^&#\\s"']*`, 'gi');
const PROFONDEUR_MAX = 8;

/** Masque la valeur des paramètres secrets dans un texte (URL, fragment, message). */
export function masquerTexte(texte: string): string {
  return texte.replace(MOTIF, `$1$2=${MASQUE}`);
}

function masquerValeur(valeur: unknown, profondeur: number): unknown {
  if (typeof valeur === 'string') return masquerTexte(valeur);
  if (profondeur >= PROFONDEUR_MAX || valeur === null || typeof valeur !== 'object') return valeur;
  if (Array.isArray(valeur)) {
    for (let i = 0; i < valeur.length; i++) valeur[i] = masquerValeur(valeur[i], profondeur + 1);
    return valeur;
  }
  const objet = valeur as Record<string, unknown>;
  for (const cle of Object.keys(objet)) {
    // Forme {token_hash: '…'} (ex. query_string d'une requête sous forme d'objet).
    objet[cle] = (CLES_SECRETES as readonly string[]).includes(cle.toLowerCase()) && typeof objet[cle] === 'string'
      ? MASQUE
      : masquerValeur(objet[cle], profondeur + 1);
  }
  return objet;
}

/**
 * Évènement ou fil d'Ariane Sentry avec les jetons masqués (modifié sur place et rendu).
 * Utilisable tel quel pour beforeSend, beforeSendTransaction et beforeBreadcrumb.
 */
export function masquerJetons<T>(evenement: T): T {
  try {
    return masquerValeur(evenement, 0) as T;
  } catch {
    // Si le masquage échoue, l'évènement est abandonné (null : Sentry ne l'envoie pas) plutôt
    // qu'envoyé avec un jeton en clair.
    return null as unknown as T;
  }
}
