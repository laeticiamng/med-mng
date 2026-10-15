import type { QuestionMemo } from './types';

/**
 * Exports du pilote : semis SQL pour la table serveur et feuille de relecture médicale (CSV).
 * Fonctions pures, testées ; l'écriture des fichiers est faite par le test d'export
 * (voir scripts/quiz-memorisation/README.md).
 */

const sqlTexte = (v: string) => `'${v.replace(/'/g, "''")}'`;

/**
 * Semis idempotent de `mm_quiz_memorisation_questions`. N'attribue JAMAIS `valide_expert`
 * (refusé ici et par le trigger) ; ne touche jamais au statut d'une question `valide_expert` ou
 * `bloque` déjà en base (le trigger annule une validation si le contenu change ; un blocage ne se
 * lève que par mm_quiz_memorisation_lever_blocage).
 */
export function genererSqlSemis(questions: readonly QuestionMemo[]): string {
  const lignes: string[] = [];
  const ordre = new Map<string, number>();
  for (const q of questions) {
    if (q.verification.statut === 'valide_expert') {
      throw new Error(`${q.id} : le semis n'attribue pas valide_expert (passer par le registre de validation)`);
    }
    const n = (ordre.get(q.itemCode) ?? 0) + 1;
    ordre.set(q.itemCode, n);
    const v = q.verification;
    const tracabilite = {
      extraitReferentiel: v.extraitReferentiel,
      sourcesExternes: v.sourcesExternes,
      reponseCorrecte: v.reponseCorrecte,
      justification: v.justification,
      notes: v.notes ?? null,
      motifBlocage: v.motifBlocage ?? null,
      verifiePar: v.verifiePar,
      dateVerification: v.dateVerification,
    };
    const options = q.type === 'qcm' ? `${sqlTexte(JSON.stringify(q.options))}::jsonb` : 'NULL';
    const index = q.type === 'qcm' ? String(q.indexCorrect) : 'NULL';
    const reponse = q.type === 'rappel' ? sqlTexte(q.reponse) : 'NULL';
    lignes.push(
      `  (${sqlTexte(q.id)}, ${sqlTexte(q.itemCode)}, ${sqlTexte(q.rang)}, ${sqlTexte(q.objectifId)}, ${sqlTexte(q.type)}, ` +
        `${sqlTexte(q.question)}, ${options}, ${index}, ${reponse}, ${sqlTexte(q.explication)}, ${sqlTexte(v.statut)}, ` +
        `${sqlTexte(JSON.stringify(tracabilite))}::jsonb, ${n})`
    );
  }
  return [
    '-- Semis du quiz de mémorisation (généré ; ne pas modifier à la main).',
    '-- À exécuter par un administrateur de la base APRÈS application de la migration 20261015120000.',
    'INSERT INTO public.mm_quiz_memorisation_questions',
    '  (id, item_code, rang, objectif_id, type, question, options, index_correct, reponse, explication, statut, tracabilite, ordre)',
    'VALUES',
    lignes.join(',\n'),
    'ON CONFLICT (id) DO UPDATE SET',
    '  item_code = EXCLUDED.item_code, rang = EXCLUDED.rang, objectif_id = EXCLUDED.objectif_id, type = EXCLUDED.type,',
    '  question = EXCLUDED.question, options = EXCLUDED.options, index_correct = EXCLUDED.index_correct,',
    '  reponse = EXCLUDED.reponse, explication = EXCLUDED.explication,',
    '  ordre = EXCLUDED.ordre,',
    // Le semis ne lève jamais un blocage ni ne rétrograde une validation : une décision humaine
    // (valide, a_corriger, refuse) ou un blocage s'efface seulement par mm_quiz_memorisation_lever_blocage().
    "  statut = CASE WHEN public.mm_quiz_memorisation_questions.statut IN ('valide_expert', 'bloque')",
    '               THEN public.mm_quiz_memorisation_questions.statut ELSE EXCLUDED.statut END,',
    // Le motif de blocage en base (par ex. « À corriger selon le relecteur ») n'est pas écrasé.
    "  tracabilite = CASE WHEN public.mm_quiz_memorisation_questions.statut = 'bloque'",
    "                THEN EXCLUDED.tracabilite || jsonb_build_object('motifBlocage', public.mm_quiz_memorisation_questions.tracabilite -> 'motifBlocage')",
    '                ELSE EXCLUDED.tracabilite END;',
    '',
  ].join('\n');
}

const csvCellule = (v: string) => `"${v.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;

export const COLONNES_FEUILLE_RELECTURE = [
  'id', 'item', 'rang', 'competence', 'type', 'question', 'options (A à D)', 'reponse_attendue',
  'explication_affichee', 'extrait_referentiel', 'sources_externes', 'statut_actuel', 'motif_blocage',
  'notes_de_verification',
  // À remplir par le médecin relecteur (jamais pré-rempli) :
  'DECISION (valide / a_corriger / refuse)', 'COMMENTAIRE', 'RELECTEUR (nom)', 'QUALITE (diplôme, spécialité)',
  'SOURCES VERIFIEES', 'DATE',
] as const;

/** Feuille de relecture : une ligne par question, colonnes de décision vides pour le relecteur. */
export function genererCsvRelecture(questions: readonly QuestionMemo[]): string {
  const lignes = [COLONNES_FEUILLE_RELECTURE.map(csvCellule).join(',')];
  for (const q of questions) {
    const v = q.verification;
    const options = q.type === 'qcm' ? q.options.map((o, i) => `${'ABCD'[i]}. ${o}`).join(' | ') : '(rappel libre)';
    const reponse = q.type === 'qcm' ? `${'ABCD'[q.indexCorrect]}. ${q.options[q.indexCorrect]}` : q.reponse;
    lignes.push(
      [
        q.id, q.itemCode, q.rang, q.objectifId, q.type === 'qcm' ? 'QCM' : 'Rappel', q.question, options, reponse,
        q.explication, v.extraitReferentiel,
        v.sourcesExternes.map((s) => `${s.reference}${s.lien ? ` <${s.lien}>` : ''}`).join(' ; ') || '—',
        v.statut, v.motifBlocage ?? '', v.notes ?? '', '', '', '', '', '', '',
      ].map(csvCellule).join(',')
    );
  }
  return `\uFEFF${lignes.join('\r\n')}\r\n`;
}
