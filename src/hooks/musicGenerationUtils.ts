import { LIMITES_SUNO, calculerDureeSecondes, tronquerParoles } from '@/config/stylesMusicaux';

export type RangGeneration = 'A' | 'B' | 'AB';

export interface ParametresAvances {
  vocalGender?: 'm' | 'f';
  negativeTags?: string;
  /** 0–100 (%) côté interface. */
  styleWeight?: number;
  /** 0–100 (%) côté interface. */
  weirdnessConstraint?: number;
}

export interface ParolesPreparees {
  /** Texte envoyé (coupé à la fin d'une ligne si > 5 000 caractères). */
  texte: string;
  tronque: boolean;
  lignesRetirees: number;
  /** Durée que le serveur demandera à Suno (secondes). */
  dureeEstimee: number;
}

/**
 * Valide et prépare les paroles d'un rang : tableau de lignes (format de la
 * RPC mm_contenu_immersif_item : « [Couplet 1] », vers, « [Refrain] »…) joint
 * en texte, coupé proprement à la limite Suno V6 (5 000 caractères) — jamais
 * plus tôt, pour ne pas perdre un tiers de la chanson comme avant.
 */
export const validateGenerationInput = (
  paroles: string[] | string,
  selectedStyle: string,
  rang: RangGeneration
): ParolesPreparees => {
  if (!selectedStyle) {
    throw new Error('Choisissez un style musical.');
  }

  const lignes = Array.isArray(paroles) ? paroles : [String(paroles ?? '')];
  const preparees = tronquerParoles(lignes.filter((l) => typeof l === 'string'), LIMITES_SUNO.paroles);

  if (!preparees.texte.trim()) {
    throw new Error(`Aucune parole disponible pour le ${rang === 'AB' ? 'rang A+B' : `rang ${rang}`}.`);
  }

  return {
    texte: preparees.texte,
    tronque: preparees.tronque,
    lignesRetirees: preparees.lignesRetirees,
    dureeEstimee: calculerDureeSecondes(preparees.texte),
  };
};

export const formaterDuree = (secondes: number): string => {
  const minutes = Math.floor(secondes / 60);
  return `${minutes}:${String(secondes % 60).padStart(2, '0')}`;
};

export interface CorpsRequeteGeneration {
  lyrics: string;
  style: string;
  rang: RangGeneration;
  itemCode: string;
  itemTitle?: string;
  language: string;
  vocalGender?: 'm' | 'f';
  negativeTags?: string;
  /** 0–1 */
  styleWeight?: number;
  /** 0–1 */
  weirdnessConstraint?: number;
}

/**
 * Corps envoyé à mm-generate-music. Le serveur impose le modèle, calcule la
 * durée d'après les paroles, construit le style Suno et le titre
 * (intitulé court de l'item + rang) : on n'envoie que l'utile.
 */
export const createRequestBody = (
  parolesText: string,
  selectedStyle: string,
  rang: RangGeneration,
  currentLanguage: string,
  itemCode: string,
  itemTitle?: string,
  advancedParams?: Partial<ParametresAvances>
): CorpsRequeteGeneration => {
  const corps: CorpsRequeteGeneration = {
    lyrics: parolesText,
    style: selectedStyle,
    rang,
    itemCode,
    itemTitle: itemTitle?.trim() || undefined,
    language: currentLanguage || 'fr',
  };

  if (advancedParams) {
    if (advancedParams.vocalGender === 'm' || advancedParams.vocalGender === 'f') {
      corps.vocalGender = advancedParams.vocalGender;
    }
    if (advancedParams.negativeTags?.trim()) {
      corps.negativeTags = advancedParams.negativeTags.trim();
    }
    if (typeof advancedParams.styleWeight === 'number') {
      corps.styleWeight = Math.round(Math.min(100, Math.max(0, advancedParams.styleWeight))) / 100;
    }
    if (typeof advancedParams.weirdnessConstraint === 'number') {
      corps.weirdnessConstraint = Math.round(Math.min(100, Math.max(0, advancedParams.weirdnessConstraint))) / 100;
    }
  }

  return corps;
};

export const getSuccessMessage = (
  rang: RangGeneration,
  durationText: string,
  currentLanguage: string
) => {
  const languageName = currentLanguage === 'fr' ? 'français' : currentLanguage;
  return {
    title: `Chanson ${rang === 'AB' ? 'rang A+B' : `rang ${rang}`} prête`,
    description: `Environ ${durationText}, chantée en ${languageName}. Elle est enregistrée dans votre bibliothèque.`
  };
};
