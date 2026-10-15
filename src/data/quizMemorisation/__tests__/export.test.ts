import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COLONNES_FEUILLE_RELECTURE, genererCsvRelecture, genererSqlSemis } from '../export';
import { QUESTIONS_MEMORISATION_PAR_ITEM } from '../index';
import type { QuestionMemo } from '../types';

const toutes: QuestionMemo[] = Object.values(QUESTIONS_MEMORISATION_PAR_ITEM).flat();
const CSV_COMMITE = join(__dirname, '../../../../docs/quiz-memorisation/FEUILLE-RELECTURE.csv');

describe('exports du pilote : semis SQL et feuille de relecture', () => {
  it('le semis couvre les 28 questions sans jamais attribuer valide_expert', () => {
    const sql = genererSqlSemis(toutes);
    expect(sql.match(/^ {2}\('M\d+-[AB]\d+'/gm)).toHaveLength(28);
    expect(sql).not.toMatch(/'valide_expert', '\{/);
    expect(sql).toContain("'bloque'");
    expect(sql).toContain("statut IN ('valide_expert', 'bloque')");
    expect(sql).toContain("'motifBlocage', public.mm_quiz_memorisation_questions.tracabilite -> 'motifBlocage'");
  });

  it('refuse d’exporter une question marquée valide_expert', () => {
    const q = structuredClone(toutes[0]);
    q.verification.statut = 'valide_expert';
    expect(() => genererSqlSemis([q])).toThrow(/valide_expert/);
  });

  it('échappe les apostrophes et conserve la traçabilité interne dans le JSON', () => {
    const sql = genererSqlSemis(toutes);
    expect(sql).toContain("l’autre");
    expect(sql).not.toMatch(/'[^']*[^'\\]'[a-z][^']*'::jsonb/); // pas d'apostrophe non doublée dans un littéral jsonb
    expect(sql).toContain('"extraitReferentiel"');
  });

  it('la feuille de relecture : une ligne par question, colonnes de décision VIDES', () => {
    const csv = genererCsvRelecture(toutes);
    const lignes = csv.replace(/^\uFEFF/, '').trim().split('\r\n');
    expect(lignes).toHaveLength(29);
    const nbDecision = 6;
    for (const ligne of lignes.slice(1)) {
      const cellules = ligne.slice(1, -1).split('","');
      expect(cellules).toHaveLength(COLONNES_FEUILLE_RELECTURE.length);
      expect(cellules.slice(-nbDecision).every((c) => c === '')).toBe(true);
    }
    for (const q of toutes.filter((x) => x.verification.statut === 'bloque')) {
      expect(csv).toContain(`"${q.id}"`);
    }
  });

  it('le fichier de relecture versionné est à jour (régénérer : QMEMO_EXPORT_DIR=docs/quiz-memorisation)', () => {
    if (process.env.QMEMO_EXPORT_DIR) {
      mkdirSync(process.env.QMEMO_EXPORT_DIR, { recursive: true });
      writeFileSync(join(process.env.QMEMO_EXPORT_DIR, 'FEUILLE-RELECTURE.csv'), genererCsvRelecture(toutes));
      writeFileSync(join(process.env.QMEMO_EXPORT_DIR, 'semis-questions.sql'), genererSqlSemis(toutes));
    }
    expect(readFileSync(CSV_COMMITE, 'utf8')).toBe(genererCsvRelecture(toutes));
  });
});
