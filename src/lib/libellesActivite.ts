/**
 * Libellés français des types d'activité enregistrés (user_activity_log.activity_type),
 * pour la « Répartition par type » du tableau de progression.
 *
 * CONSTAT (contre-vérification de la vague 3, 04.10.2026) : la répartition affichait les
 * identifiants bruts avec des zéros (« srs_review: 0 », « ai_question: 0 », « clinical_case: 0 »,
 * « review: 0 »…), en anglais et pour des fonctions retirées de l'offre (DC7).
 */
const LIBELLES: Record<string, string> = {
  study: 'Étude des items',
  review: 'Révisions',
  srs_review: 'Révisions espacées',
  flashcard: 'Cartes mémoire',
  quiz: 'Quiz',
  ecos: 'Situations ECOS',
  exam: 'Examens',
  clinical_case: 'Cas cliniques',
  clinical: 'Cas cliniques',
  music_generation: 'Chansons',
  ai_question: 'Questions',
};

/** Libellé affiché d'un type d'activité ; « Autres activités » pour un type inconnu. */
export const libelleTypeActivite = (type: string): string => LIBELLES[type] ?? 'Autres activités';

/**
 * Répartition lisible : types regroupés par libellé, sans les zéros, du plus fréquent au moins
 * fréquent (à égalité, ordre alphabétique).
 */
export function repartitionParLibelle(parType: Record<string, number>): Array<[string, number]> {
  const cumul = new Map<string, number>();
  for (const [type, nombre] of Object.entries(parType)) {
    const n = Number(nombre) || 0;
    if (n <= 0) continue;
    const libelle = libelleTypeActivite(type);
    cumul.set(libelle, (cumul.get(libelle) ?? 0) + n);
  }
  return [...cumul.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr'));
}
