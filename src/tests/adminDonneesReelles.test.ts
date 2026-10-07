import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

/**
 * MM-A20 (07.10.2026) : les écrans d'administration n'affichent plus de
 * données inventées et n'appellent plus de tables ou fonctions absentes.
 * Vérifié en base le 07.10.2026 : collaborative_study_sessions,
 * study_group_sessions, email_statistics, email_ab_tests → to_regclass null ;
 * google-sheets-webhook et transform-edn-sections absentes de supabase/functions.
 */
const racine = process.cwd();
const fichiers = (dossier: string): string[] =>
  fs.readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dossier, e.name);
    if (e.isDirectory()) return ['node_modules', '__tests__'].includes(e.name) ? [] : fichiers(p);
    return /\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) && e.name !== 'types.ts' ? [p] : [];
  });
const sources = fichiers(path.resolve(racine, 'src')).map((f) => ({
  f: path.relative(racine, f),
  code: fs.readFileSync(f, 'utf-8'),
}));
const fautifs = (motif: RegExp) => sources.filter(({ code }) => motif.test(code)).map(({ f }) => f);

describe('Administration : aucune donnée simulée', () => {
  it("n'interroge aucune table absente de la base", () => {
    expect(fautifs(/\.from\(\s*['"](collaborative_study_sessions|study_group_sessions|email_statistics|email_ab_tests)['"]/)).toEqual([]);
    expect(fautifs(/\.channel\(\s*['"]email_statistics/)).toEqual([]);
  });

  it("n'appelle aucune fonction Edge absente", () => {
    expect(fautifs(/invoke\(\s*['"](google-sheets-webhook|transform-edn-sections)['"]/)).toEqual([]);
  });

  it('ne fabrique ni migrations, ni score, ni taux de désabonnement', () => {
    expect(fautifs(/mockMigrations|Score simulé|Valeur simulée|churnRate:\s*5\b/)).toEqual([]);
    expect(fautifs(/Éditeur bientôt disponible/)).toEqual([]);
    // E-mails de repli inventés (user-xxxx@example.com, user@example.com) et compteurs dérivés de l'index.
    expect(fautifs(/['"]user-['"]\s*\+|\|\|\s*['"]user@example\.com['"]|index \* \d+ % 100/)).toEqual([]);
  });

  it('les écrans retirés redirigent', () => {
    const app = fs.readFileSync(path.resolve(racine, 'src/App.tsx'), 'utf-8');
    expect(app).toMatch(/ROUTE_PATHS\.adminAudit\} element=\{<Navigate/);
    expect(app).toMatch(/ROUTE_PATHS\.migrationDashboard\} element=\{<Navigate/);
  });
});
