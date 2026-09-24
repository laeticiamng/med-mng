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
