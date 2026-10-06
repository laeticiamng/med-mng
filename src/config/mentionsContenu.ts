/**
 * Mention affichée sur tout contenu rédigé par IA (récit, planches, paroles).
 *
 * CF-10 — décision de la CEO (médecin) du 06.10.2026, option A : mention
 * renforcée, identique sur les trois contenus, et bouton « Signaler une erreur ».
 * Aucun contenu n'a de relecture médicale individuelle (validation_status =
 * draft pour 367/367) : le drapeau is_validated, vrai partout, ne doit JAMAIS
 * être présenté comme une validation.
 */
export const MENTION_CONTENU_IA =
  'Contenu rédigé par IA à partir des compétences officielles LiSA 2026, non relu individuellement par un médecin. La compétence officielle fait foi.';

/** Types de contenu acceptés par la table public.mm_signalements_contenu. */
export const TYPES_CONTENU_SIGNALE = [
  'recit',
  'planche',
  'paroles',
  'competence',
] as const;
export type TypeContenuSignale = (typeof TYPES_CONTENU_SIGNALE)[number];

export const LIBELLES_CONTENU_SIGNALE: Readonly<
  Record<TypeContenuSignale, string>
> = {
  recit: 'récit',
  planche: 'planches',
  paroles: 'paroles',
  competence: 'compétence',
};

/** Bornes du message (contrainte CHECK de la table). */
export const MESSAGE_SIGNALEMENT_MIN = 5;
export const MESSAGE_SIGNALEMENT_MAX = 2000;
/** Limite serveur (déclencheur) : signalements par compte sur 24 heures glissantes. */
export const SIGNALEMENTS_PAR_JOUR_MAX = 20;
/** Longueur maximale de la référence (chapitre, planche…) acceptée par la table. */
export const REFERENCE_SIGNALEMENT_MAX = 300;
