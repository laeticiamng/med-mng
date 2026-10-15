/**
 * Questions de mémorisation d'un item EDN — modèle de données du pilote.
 *
 * Chaque question porte sa traçabilité interne (jamais affichée telle quelle) :
 * extrait du référentiel dont elle dérive, réponse correcte, justification
 * (pourquoi la bonne réponse est exacte et pourquoi les autres sont fausses),
 * sources externes éventuelles et statut de vérification.
 *
 * Une compétence officielle ne prouve pas à elle seule qu'une réponse clinique
 * est exacte : le statut dit jusqu'où la vérification est allée.
 */

/**
 * - `brouillon` : jamais affichée ;
 * - `conforme_referentiel` : fidèle au texte officiel (extrait vérifié mot pour
 *   mot dans `oic_competences`), pas encore recoupée par une source externe ;
 * - `verifie_source_externe` : en plus, recoupée par au moins une source externe
 *   citée dans `sourcesExternes` ;
 * - `valide_expert` : relue et validée par un médecin. SEUL statut affichable en
 *   production ; aucune question n'a ce statut à ce jour.
 * - `bloque` : un point scientifique n'est pas tranché (conflit de sources,
 *   formulation à reprendre). Jamais affichée, même en pilote ; la raison est
 *   dans `motifBlocage`.
 */
export type StatutVerification =
  | 'brouillon'
  | 'conforme_referentiel'
  | 'verifie_source_externe'
  | 'valide_expert'
  | 'bloque';

export interface SourceExterne {
  reference: string;
  lien?: string;
}

export interface VerificationQuestion {
  statut: StatutVerification;
  /**
   * Passage du référentiel (OIC) dont la question dérive, recopié mot pour mot
   * (espaces normalisés). Plusieurs passages sont séparés par « … ».
   */
  extraitReferentiel: string;
  sourcesExternes: SourceExterne[];
  /** Bonne réponse sous forme de texte (identique à l'option correcte pour un QCM). */
  reponseCorrecte: string;
  /** Pourquoi la bonne réponse est exacte et pourquoi chaque distracteur est faux. */
  justification: string;
  /** Limites connues, divergences entre sources, points à faire relire. */
  notes?: string;
  /** Obligatoire si `statut === 'bloque'` : ce qui empêche l'affichage. */
  motifBlocage?: string;
  verifiePar: string;
  dateVerification: string;
}

interface QuestionMemoBase {
  /** Identifiant stable (sert à mémoriser les notions à revoir) : M<item>-<A|B><n>. */
  id: string;
  itemCode: string;
  rang: 'A' | 'B';
  /** Compétence officielle dont la question dérive (ex. OIC-160-03-A). */
  objectifId: string;
  question: string;
  /** Explication courte affichée après la réponse (2 phrases au plus). */
  explication: string;
  verification: VerificationQuestion;
}

/** QCM à une seule bonne réponse, quatre options. */
export interface QuestionQcm extends QuestionMemoBase {
  type: 'qcm';
  options: readonly [string, string, string, string];
  indexCorrect: 0 | 1 | 2 | 3;
}

/** Rappel actif : l'étudiant formule la réponse, la découvre, puis s'auto-évalue. */
export interface QuestionRappel extends QuestionMemoBase {
  type: 'rappel';
  reponse: string;
}

export type QuestionMemo = QuestionQcm | QuestionRappel;

export const VERIFICATEUR_PILOTE =
  'Claude (IA) — contrôle automatisé de l’extrait et recoupement documentaire ; aucune relecture médicale humaine';
export const DATE_VERIFICATION_PILOTE = '2026-10-15';
