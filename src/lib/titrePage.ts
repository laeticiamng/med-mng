/** Titre d'onglet de l'accueil (et titre par défaut de index.html). */
export const TITRE_ACCUEIL = "Med MNG · Réviser l'EDN en musique";

/**
 * Titre d'onglet au format « <Page> · Med MNG ».
 *
 * Accepte les anciens formats (« X - Med MNG », « X | Med MNG », « X — Med MNG »)
 * et les ramène au format unique ; un titre vide ou « Med MNG » seul donne le
 * titre de l'accueil. Jamais « par EmotionsCare » dans un titre d'onglet.
 */
export const titrePage = (titre?: string | null): string => {
  const base = (titre ?? '')
    .replace(/\s+par EmotionsCare\b/gi, '')
    .replace(/\s*[-|—–·]\s*Med MNG\s*$/i, '')
    .trim();
  if (!base || /^med mng$/i.test(base)) return TITRE_ACCUEIL;
  if (/^med mng\b/i.test(base)) return base;
  return `${base} · Med MNG`;
};
