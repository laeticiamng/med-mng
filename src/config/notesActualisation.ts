/**
 * Notes d'actualisation affichées SOUS une compétence officielle, sans en
 * modifier le texte (indexées par `objectif_id`).
 *
 * Le texte de la compétence reste celui du référentiel LiSA 2026 ; la note
 * signale une recommandation officielle plus récente. Aucune donnée en base
 * n'est modifiée : la note est affichée par le front, sous la compétence (fiche,
 * onglets Rang A / Rang B) et sous les chapitres du récit qui la citent.
 *
 * DC2 — décision de la CEO (médecin) du 06.10.2026, option B : garder le texte
 * LiSA d'OIC-150-06-A intact et afficher dessous la note HAS datée, mot pour mot
 * telle que rédigée dans le dossier DECISIONS_MEDICALES (section DC2). Sources
 * lues le 06.10.2026 sur has-sante.fr.
 */

export interface SegmentNote {
  texte: string;
  /** Titre de recommandation, en italique dans le dossier. */
  italique?: boolean;
  /** Intitulé de la note, en gras. */
  gras?: boolean;
}

export interface SourceNote {
  libelle: string;
  url: string;
}

export interface NoteActualisation {
  /** Texte de la note, découpé pour la mise en forme (gras, italique). */
  segments: SegmentNote[];
  sources: SourceNote[];
  /** Décision qui a introduit la note (traçabilité). */
  decision: string;
}

export const NOTES_ACTUALISATION: Readonly<Record<string, NoteActualisation>> =
  {
    'OIC-150-06-A': {
      segments: [
        { texte: "Note d'actualisation — HAS.", gras: true },
        { texte: ' ' },
        {
          texte:
            "Choix et durées d'antibiothérapies : OMA purulente de l'enfant",
          italique: true,
        },
        {
          texte:
            ' (validée le 15.07.2021, mise à jour le 14.05.2025) : amoxicilline 80 mg/kg/j en 2 prises, sans dépasser 3 g/j, ' +
            'pendant 10 jours avant 2 ans et 5 jours après 2 ans (10 jours si otorrhée ou otite récidivante). ',
        },
        { texte: "OMA purulente de l'adulte", italique: true },
        {
          texte:
            ' (mise à jour le 13.05.2025) : amoxicilline 3 g/j en 3 prises pendant 5 jours. ' +
            'Le texte ci-dessus reproduit la compétence du référentiel LiSA 2026.',
        },
      ],
      sources: [
        {
          libelle:
            "HAS — Choix et durées d'antibiothérapies : OMA purulente de l'enfant (validée le 15.07.2021, mise à jour le 14.05.2025)",
          url: 'https://www.has-sante.fr/jcms/c_2722749/fr/choix-et-durees-d-antibiotherapies-otite-moyenne-aigue-purulente-de-l-enfant',
        },
        {
          libelle:
            "HAS — OMA purulente de l'adulte (validée le 15.07.2021, mise à jour le 13.05.2025)",
          url: 'https://www.has-sante.fr/jcms/c_2722670/fr/otite-moyenne-aigue-purulente-de-l-adulte',
        },
      ],
      decision: 'DC2, décision CEO du 06.10.2026 (option B)',
    },
  };

/** Note d'actualisation d'une compétence, ou `null`. */
export function noteActualisation(
  objectifId: string | null | undefined
): NoteActualisation | null {
  if (!objectifId) return null;
  return NOTES_ACTUALISATION[objectifId.trim().toUpperCase()] ?? null;
}

/** Texte brut de la note (segments mis bout à bout). */
export function texteNoteActualisation(note: NoteActualisation): string {
  return note.segments.map((s) => s.texte).join('');
}

/** Identifiants OIC cités par un chapitre de récit stocké (chaînes ou objets `{ objectif_id }`). */
export function objectifsCitesDuChapitre(brut: unknown): string[] {
  if (!Array.isArray(brut)) return [];
  return brut
    .map((c) =>
      typeof c === 'string'
        ? c
        : (c as { objectif_id?: unknown } | null)?.objectif_id
    )
    .filter((c): c is string => typeof c === 'string' && c.trim() !== '')
    .map((c) => c.trim().toUpperCase());
}
