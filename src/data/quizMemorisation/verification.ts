import type { QuestionMemo, StatutVerification } from './types';

/** Statuts qu’une question doit avoir au minimum pour être affichée. */
const RANG_STATUT: Record<StatutVerification, number> = {
  brouillon: 0,
  conforme_referentiel: 1,
  verifie_source_externe: 2,
  valide_expert: 3,
};

/**
 * Statuts affichables selon l’environnement.
 *  - production : uniquement `valide_expert` (relecture médicale humaine) ;
 *  - pilote : `conforme_referentiel` et au-dessus, avec la mention « pilote ».
 * `brouillon` n’est jamais affichable.
 */
export function statutAffichable(statut: StatutVerification, pilote: boolean): boolean {
  return RANG_STATUT[statut] >= (pilote ? RANG_STATUT.conforme_referentiel : RANG_STATUT.valide_expert);
}

export const estValideParExpert = (q: Pick<QuestionMemo, 'verification'>): boolean =>
  q.verification.statut === 'valide_expert';

const echapperSql = (texte: string) => texte.replace(/'/g, "''");
const normaliserEspaces = (texte: string) => texte.replace(/\s+/g, ' ').trim();

/**
 * Requête SQL qui vérifie, dans `oic_competences`, que chaque extrait du
 * référentiel est recopié mot pour mot (espaces normalisés) dans la
 * compétence citée. Plusieurs passages d’un même extrait sont séparés par « … ».
 * Résultat : une ligne par passage, `trouve = true` si l’extrait y figure.
 */
export function genererSqlVerificationExtraits(questions: readonly QuestionMemo[]): string {
  const lignes: string[] = [];
  for (const q of questions) {
    for (const passage of q.verification.extraitReferentiel.split('…')) {
      const extrait = normaliserEspaces(passage);
      if (extrait) lignes.push(`  ('${q.id}', '${q.objectifId}', '${echapperSql(extrait)}')`);
    }
  }
  return [
    'with q(id, objectif_id, extrait) as (values',
    lignes.join(',\n'),
    ')',
    "select q.id, q.objectif_id, left(q.extrait, 60) as debut_extrait,",
    "       coalesce(strpos(regexp_replace(c.description, '\\s+', ' ', 'g'), q.extrait) > 0, false) as trouve",
    'from q left join oic_competences c on c.objectif_id = q.objectif_id',
    'order by trouve, q.id;',
  ].join('\n');
}
