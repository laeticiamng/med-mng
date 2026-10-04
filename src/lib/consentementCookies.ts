/**
 * Consentement du bandeau cookies (mesure d'audience Med MNG).
 *
 * CONSTAT (vague 3, 04.10.2026, vérifié en production) :
 * - l'hébergeur (Lovable) charge /~flock.js sur toutes les pages, sans attendre
 *   le bandeau : un cookie « session-id » de 30 minutes et, à chaque page vue,
 *   un envoi à /~api/analytics (page visitée, site d'origine, navigateur,
 *   langue, pays déduit du fuseau horaire). Ces statistiques ne dépendent pas
 *   de Med MNG et restent actives ;
 * - Med MNG enregistrait aussi, pour les visiteurs NON connectés, la visite de
 *   la page Tarifs dans sa propre base (analytics_events, identifiant aléatoire
 *   d'onglet), quel que soit le choix fait dans le bandeau ;
 * - le bandeau annonçait des « cookies analytiques » Plausible (jamais chargé)
 *   et des « cookies fonctionnels » que rien ne lisait.
 *
 * Désormais : la mesure d'audience de Med MNG avant connexion n'a lieu qu'avec
 * l'accord donné dans le bandeau (version 2 du consentement : les choix faits
 * sur l'ancien texte ne valent pas accord).
 */

export const CLE_CONSENTEMENT = 'medmng_cookie_consent';
export const CLE_PREFERENCES = 'medmng_cookie_preferences';
/** Version du texte du bandeau ; un choix enregistré sur une version antérieure est redemandé. */
export const VERSION_CONSENTEMENT = 2;

export interface PreferencesCookies {
  /** Toujours vrai : connexion, préférences, sécurité. */
  essential: true;
  /** Mesure d'audience Med MNG avant connexion (identifiant aléatoire d'onglet). */
  analytics: boolean;
  version: number;
}

const lire = (cle: string): string | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(cle);
  } catch {
    return null;
  }
};

/** Choix enregistré pour la version actuelle du bandeau, ou null (bandeau à afficher). */
export function lirePreferencesCookies(): PreferencesCookies | null {
  if (!lire(CLE_CONSENTEMENT)) return null;
  try {
    const p = JSON.parse(lire(CLE_PREFERENCES) ?? 'null') as Partial<PreferencesCookies> | null;
    if (!p || p.version !== VERSION_CONSENTEMENT) return null;
    return { essential: true, analytics: p.analytics === true, version: VERSION_CONSENTEMENT };
  } catch {
    return null;
  }
}

/** Identifiant aléatoire de la visite (stockage de session) utilisé par la mesure d'audience Med MNG. */
export const CLE_IDENTIFIANT_VISITE = 'conversion_session';

/**
 * Oublie l'identifiant de visite (refus ou retrait de l'accord) : sans cela, l'identifiant créé
 * pendant l'accord restait dans l'onglet jusqu'à sa fermeture (contre-vérification vague 3).
 */
function oublierIdentifiantVisite(): void {
  try {
    window.sessionStorage.removeItem(CLE_IDENTIFIANT_VISITE);
  } catch {
    // stockage indisponible : rien n'est conservé
  }
}

export function enregistrerPreferencesCookies(analytics: boolean): PreferencesCookies {
  const preferences: PreferencesCookies = { essential: true, analytics, version: VERSION_CONSENTEMENT };
  try {
    window.localStorage.setItem(CLE_PREFERENCES, JSON.stringify(preferences));
    window.localStorage.setItem(CLE_CONSENTEMENT, 'true');
  } catch {
    // stockage indisponible : le bandeau sera simplement reproposé
  }
  if (!analytics) oublierIdentifiantVisite();
  return preferences;
}

/** Vrai seulement si la personne a accepté la mesure d'audience dans le bandeau actuel. */
export const mesureAudienceAcceptee = (): boolean => lirePreferencesCookies()?.analytics === true;

/** Retire le choix enregistré : le bandeau est reproposé au prochain chargement (retrait du consentement). */
export function effacerChoixCookies(): void {
  try {
    window.localStorage.removeItem(CLE_CONSENTEMENT);
    window.localStorage.removeItem(CLE_PREFERENCES);
  } catch {
    // stockage indisponible : rien n'est enregistré
  }
  oublierIdentifiantVisite();
}
