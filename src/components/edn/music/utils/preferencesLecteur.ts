/**
 * Préférences du lecteur de chansons (favoris, historique, aléatoire,
 * répétition, volume), conservées LOCALEMENT, par utilisateur, dans localStorage.
 *
 * Pourquoi pas Supabase : la table `public.user_music_preferences` du projet
 * partagé appartient à EmotionsCare (colonnes preferred_emotions, favorite_genres,
 * total_plays…). Med MNG y lisait `favorites, history, shuffle_enabled,
 * repeat_mode, volume`, des colonnes inexistantes : HTTP 400 à chaque ouverture
 * du lecteur (défaut D5, QA du 14.10.2026). Med MNG ne lit ni n'écrit plus cette
 * table, qui est partagée et ne doit pas être modifiée.
 *
 * Lecture et écriture sont protégées : localStorage peut être indisponible
 * (navigation privée, stockage plein, données de site bloquées).
 */

export type ModeRepetition = 'none' | 'one' | 'all';

export interface PreferencesLecteur {
  /** Codes item (ex. « IC-150 ») ajoutés aux favoris. */
  favorites: string[];
  /** Codes item écoutés récemment, le plus récent d'abord. */
  history: string[];
  shuffle_enabled: boolean;
  repeat_mode: ModeRepetition;
  /** Entre 0 et 1. */
  volume: number;
}

export const PREFERENCES_LECTEUR_PAR_DEFAUT: PreferencesLecteur = {
  favorites: [],
  history: [],
  shuffle_enabled: false,
  repeat_mode: 'none',
  volume: 1,
};

const PREFIXE_CLE = 'med-mng:lecteur-musique:';
const CLE_FAVORIS_ANCIENNE = 'music-favorites';
const CLE_HISTORIQUE_ANCIENNE = 'music-history';

/** Clé de stockage propre à l'utilisateur (« anonyme » hors connexion). */
export const cleStockageLecteur = (userId?: string | null): string =>
  `${PREFIXE_CLE}${userId || 'anonyme'}`;

const listeDeTextes = (valeur: unknown): string[] =>
  Array.isArray(valeur) ? valeur.filter((v): v is string => typeof v === 'string') : [];

const lireJson = (cle: string): unknown => {
  try {
    const brut = window.localStorage.getItem(cle);
    return brut ? JSON.parse(brut) : null;
  } catch {
    return null;
  }
};

/** Normalise un objet lu depuis le stockage : une valeur invalide retombe sur le défaut. */
const normaliser = (brut: unknown): PreferencesLecteur => {
  const o = (brut && typeof brut === 'object' ? brut : {}) as Record<string, unknown>;
  const repeat = o.repeat_mode;
  const volume = typeof o.volume === 'number' && Number.isFinite(o.volume) ? o.volume : 1;
  return {
    favorites: listeDeTextes(o.favorites),
    history: listeDeTextes(o.history),
    shuffle_enabled: o.shuffle_enabled === true,
    repeat_mode: repeat === 'one' || repeat === 'all' ? repeat : 'none',
    volume: Math.min(1, Math.max(0, volume)),
  };
};

export const lirePreferencesLecteur = (userId?: string | null): PreferencesLecteur => {
  const stockees = lireJson(cleStockageLecteur(userId));
  if (stockees) return normaliser(stockees);

  // Hors connexion uniquement : reprise des anciennes clés (favoris / historique).
  if (!userId) {
    return normaliser({
      favorites: lireJson(CLE_FAVORIS_ANCIENNE),
      history: lireJson(CLE_HISTORIQUE_ANCIENNE),
    });
  }
  return { ...PREFERENCES_LECTEUR_PAR_DEFAUT };
};

/** Écrit les préférences ; retourne false si le stockage est indisponible. */
export const ecrirePreferencesLecteur = (
  userId: string | null | undefined,
  preferences: PreferencesLecteur,
): boolean => {
  try {
    window.localStorage.setItem(cleStockageLecteur(userId), JSON.stringify(normaliser(preferences)));
    return true;
  } catch {
    return false;
  }
};
