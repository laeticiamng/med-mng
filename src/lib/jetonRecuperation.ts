/**
 * Jeton de récupération du mot de passe (lien de l'e-mail de mm-password-reset).
 *
 * Le lien porte le jeton dans le FRAGMENT : /med-mng/reset-password#token_hash=…&type=recovery. Un
 * fragment n'est jamais envoyé au serveur (ni journaux du CDN ni du serveur web). Restait le suivi
 * côté navigateur : Sentry (initialisé au démarrage) enregistre l'URL de la page et de ses requêtes.
 * Le jeton est donc lu et RETIRÉ de l'adresse (history.replaceState) tout au début de src/main.tsx,
 * avant l'initialisation de Sentry, puis gardé en mémoire dans ce module. Pas de sessionStorage.
 *
 * Transition : les e-mails déjà envoyés portent ?token_hash=…&type=recovery (query string) ; ils sont
 * lus et nettoyés de la même façon (le jeton a pu atteindre un journal serveur pour ceux-là).
 */

export interface JetonRecuperation {
  tokenHash: string;
  /** Valeur du paramètre « type » du lien (« recovery » attendu), null s'il manque. */
  type: string | null;
}

let capture: JetonRecuperation | null = null;
let memoPage: JetonRecuperation | null | undefined;

/**
 * Lit `token_hash` (et `type`) dans le fragment, à défaut dans la query string, les garde en mémoire
 * et les retire de l'adresse ; le reste de l'adresse (chemin, autres paramètres) est conservé.
 * À appeler UNE fois, au tout début de src/main.tsx, avant Sentry.init.
 */
export function capturerJetonRecuperation(
  emplacement: Pick<Location, 'pathname' | 'search' | 'hash'> = window.location,
  historique: Pick<History, 'replaceState' | 'state'> = window.history,
): void {
  const fragment = new URLSearchParams(emplacement.hash.replace(/^#/, ''));
  const requete = new URLSearchParams(emplacement.search);
  const source = fragment.has('token_hash') ? fragment : requete.has('token_hash') ? requete : null;
  if (!source) return;

  const tokenHash = source.get('token_hash');
  if (tokenHash) capture = { tokenHash, type: source.get('type') };

  // Retire le jeton (et son type) de l'adresse, là où il se trouvait.
  source.delete('token_hash');
  source.delete('type');
  const reste = source.toString();
  const search = source === requete ? (reste ? `?${reste}` : '') : emplacement.search;
  const hash = source === fragment ? (reste ? `#${reste}` : '') : emplacement.hash;
  try {
    historique.replaceState(historique.state, '', `${emplacement.pathname}${search}${hash}`);
  } catch {
    // sans importance : le jeton est de toute façon gardé en mémoire
  }
}

/** Rend le jeton capturé, UNE seule fois (les appels suivants rendent null). */
export function prendreJetonRecuperation(): JetonRecuperation | null {
  const jeton = capture;
  capture = null;
  return jeton;
}

/**
 * Jeton de la page de réinitialisation : pris une fois puis gardé en mémoire (module), pour survivre
 * aux rendus multiples (React.StrictMode) et à « Réessayer ». Jamais remis dans l'adresse.
 */
export function jetonPourLaPage(): JetonRecuperation | null {
  if (memoPage === undefined) memoPage = prendreJetonRecuperation();
  return memoPage;
}

/** Remet le module à zéro (tests). */
export function reinitialiserJetonRecuperation(): void {
  capture = null;
  memoPage = undefined;
}
