/**
 * Errata de FOND appliqués au texte LiSA 2026, affichés en clair sous la
 * compétence concernée : « Texte LiSA : … — erratum Med MNG : … (motif) ».
 *
 * CF-10 bis — décision de la CEO (médecin) du 06.10.2026, option 1 : les
 * 10 corrections de fond restent appliquées ET sont montrées à l'écran ; les
 * 42 coquilles restent corrigées sans affichage.
 *
 * Les corrections sont lues dans oic_competences.contenu_detaille.corrections
 * (tableau { avant, apres, motif } ; source scripts/lisa/errata.json, commit du
 * 24.09.2026 ; 52 corrections sur 34 compétences au 06.10.2026). Cette structure
 * ne distingue pas le fond de la coquille : d'où cette liste blanche, qui
 * reprend une à une les 10 lignes du dossier DECISIONS_MEDICALES.md (section
 * CF-10 bis), identifiées par la compétence et le texte LiSA d'origine
 * (`avant`, vérifié en base le 06.10.2026). Une correction ajoutée plus tard
 * n'est donc jamais affichée comme erratum sans décision.
 */

export interface CorrectionLisa {
  avant: string;
  apres: string;
  motif: string;
}

export interface ErratumDeFond {
  objectif_id: string;
  /** Texte LiSA d'origine, tel qu'enregistré dans `corrections[].avant`. */
  avant: string;
}

export const ERRATA_DE_FOND: ReadonlyArray<ErratumDeFond> = [
  { objectif_id: 'OIC-104-01-B', avant: '2-3% chez les hétérozygotes' },
  { objectif_id: 'OIC-104-16-A', avant: 'bandelette longitudinale supérieure' },
  { objectif_id: 'OIC-128-05-A', avant: "7,5 mg/kg d'équivalent prednisone" },
  {
    objectif_id: 'OIC-177-12-B',
    avant: 'Lincosamides (molécule : clindamycine)',
  },
  { objectif_id: 'OIC-222-06-B', avant: 'au-delà de 30 g/L' },
  { objectif_id: 'OIC-245-07-A', avant: '<5 ng/ml (138 nmol/l)' },
  { objectif_id: 'OIC-247-17-A', avant: '<70 mg/l' },
  { objectif_id: 'OIC-247-17-A', avant: '<54 mg/l' },
  { objectif_id: 'OIC-332-11-B', avant: 'médicament β2 mimétique' },
  { objectif_id: 'OIC-344-01-A', avant: 'PAS ≥140mmHg et PAD ≥90mmHg' },
];

const CLES = new Set(
  ERRATA_DE_FOND.map((e) => `${e.objectif_id}\u0000${e.avant}`)
);

/**
 * Corrections de fond (liste blanche) parmi celles d'une compétence ; les
 * coquilles et toute entrée mal formée sont écartées.
 */
export function errataDeFond(
  objectifId: string | null | undefined,
  corrections: ReadonlyArray<Partial<CorrectionLisa>> | null | undefined
): CorrectionLisa[] {
  if (!objectifId || !Array.isArray(corrections)) return [];
  const id = objectifId.trim().toUpperCase();
  return corrections.filter(
    (c): c is CorrectionLisa =>
      typeof c?.avant === 'string' &&
      typeof c?.apres === 'string' &&
      typeof c?.motif === 'string' &&
      CLES.has(`${id}\u0000${c.avant}`)
  );
}
