import { ROUTE_PATHS } from '@/config/routes';

/**
 * Paramètre `?next=` des pages de connexion / inscription.
 *
 * Seuls les chemins INTERNES sont acceptés (« /med-mng/subscribe/annuel »),
 * jamais une URL absolue ni « //domaine » (redirection ouverte).
 */
export const cheminInterneSur = (valeur: string | null | undefined): string | null => {
  if (!valeur) return null;
  let chemin = valeur.trim();
  try {
    chemin = decodeURIComponent(chemin);
  } catch {
    return null;
  }
  if (!chemin.startsWith('/') || chemin.startsWith('//') || chemin.startsWith('/\\')) return null;
  if (/[\u0000-\u001f]/.test(chemin) || /^\/+[a-z][a-z0-9+.-]*:/i.test(chemin)) return null;
  if (chemin.length > 300) return null;
  return chemin;
};

/** Ajoute `?next=` à une route si le chemin suivant est sûr. */
export const avecSuivant = (route: string, suivant: string | null | undefined): string => {
  const sur = cheminInterneSur(suivant);
  return sur ? `${route}?next=${encodeURIComponent(sur)}` : route;
};

const CHEMIN_CREATE = ROUTE_PATHS.medMngCreate;
const CHEMIN_INSCRIPTION = ROUTE_PATHS.medMngSignup;

/**
 * Lien de l'entrée « Mettre en chanson » (accueil, navigation).
 *  - connecté : Med MNG Create directement ;
 *  - visiteur : inscription gratuite qui ramène sur Create après
 *    l'inscription (e-mail ou Google) ou la connexion (lien « Se connecter »
 *    de la page d'inscription, qui conserve `next`).
 */
export const lienCreerMusique = (connecte: boolean): string =>
  connecte ? CHEMIN_CREATE : avecSuivant(CHEMIN_INSCRIPTION, CHEMIN_CREATE);

/**
 * Phrase d'explication affichée sur les pages de connexion / inscription quand
 * le visiteur arrive depuis « Mettre en chanson » : il sait pourquoi on lui
 * demande un compte et où il reviendra.
 */
export const contexteSuivant = (
  suivant: string | null | undefined,
  page: 'connexion' | 'inscription',
): string | null => {
  const sur = cheminInterneSur(suivant);
  if (!sur || !(sur === CHEMIN_CREATE || sur.startsWith(`${CHEMIN_CREATE}?`) || sur.startsWith(`${CHEMIN_CREATE}/`))) {
    return null;
  }
  return page === 'inscription'
    ? 'Med MNG Create : créez votre compte gratuit, vous arriverez ensuite directement sur la page de création.'
    : 'Med MNG Create : connectez-vous, vous reviendrez ensuite directement sur la page de création.';
};
