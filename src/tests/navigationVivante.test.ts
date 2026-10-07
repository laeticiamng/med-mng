import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

/**
 * Navigation « vivante » (audit du 07.10.2026) : les routes dont la page est
 * vide, factice ou en double redirigent vers la page vivante la plus proche,
 * et plus aucun lien du site ne pointe vers elles.
 */
const lire = (relatif: string) => fs.readFileSync(path.resolve(process.cwd(), relatif), 'utf-8');
const APP = lire('src/App.tsx');

const sansCommentaires = (source: string) =>
  source.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const fichiersSource = (dossier: string): string[] =>
  fs.readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dossier, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : fichiersSource(p);
    return /\.(ts|tsx)$/.test(e.name) && !/\.test\.|\.spec\./.test(e.name) ? [p] : [];
  });
const SOURCES = fichiersSource(path.resolve(process.cwd(), 'src'));

/** Fichiers (hors App.tsx et config/routes.ts) qui citent encore une route. */
const liensVers = (cleRoute: string, chemin: string) =>
  SOURCES.filter((f) => !/src\/App\.tsx$|src\/config\/routes\.ts$|src\/config\/seoConfig\.ts$/.test(f)).filter((f) => {
    const code = sansCommentaires(fs.readFileSync(f, 'utf-8'));
    return code.includes(`ROUTE_PATHS.${cleRoute})`) || code.includes(`ROUTE_PATHS.${cleRoute},`) ||
      code.includes(`ROUTE_PATHS.${cleRoute} `) || new RegExp(`['"\`]${chemin.replace(/[/-]/g, '\\$&')}['"\`]`).test(code);
  }).map((f) => path.relative(process.cwd(), f));

const redirige = (cleRoute: string, cible: string) =>
  new RegExp(`path=\\{ROUTE_PATHS\\.${cleRoute}\\} element=\\{<Navigate to=\\{ROUTE_PATHS\\.${cible}\\} replace />\\}`).test(APP);

describe('Navigation vivante', () => {
  it('MM-A09 : une seule page de progression (/med-mng/progress → /progress-dashboard)', () => {
    expect(redirige('medMngProgress', 'progressDashboard')).toBe(true);
    expect(liensVers('medMngProgress', '/med-mng/progress')).toEqual([]);
  });

  it('MM-A09 : la page de progression ne mentionne plus le mode Examen retiré', () => {
    const page = sansCommentaires(lire('src/pages/ProgressDashboard.tsx'));
    expect(page).not.toMatch(/Examens|Mode Examen|Probabilité de succès|Rétention globale/);
    expect(page).not.toMatch(/useExamMode|useFlashcards|useClinicalCases/);
  });

  it('MM-A04 : /settings (page factice) redirige vers l’onglet Paramètres du profil', () => {
    expect(APP).toMatch(/path=\{ROUTE_PATHS\.settings\} element=\{<Navigate to=\{LIEN_PARAMETRES_COMPTE\} replace \/>\}/);
    expect(liensVers('settings', '/settings')).toEqual([]);
    expect(fs.existsSync(path.resolve(process.cwd(), 'src/pages/UserSettings.tsx'))).toBe(false);
    const profil = lire('src/pages/MedMngProfile.tsx');
    expect(profil).toContain('<Tabs defaultValue={ongletInitial}');
    expect(profil).toMatch(/<TabsTrigger value="settings"/);
  });

  it('MM-A10 : /achievements sans classement ni récompenses fictives', () => {
    const page = sansCommentaires(lire('src/pages/Achievements.tsx'));
    const panneau = sansCommentaires(lire('src/components/gamification/GamificationPanel.tsx'));
    expect(page).not.toMatch(/Classement|Leaderboard|ROUTE_PATHS\.generator/);
    expect(panneau).not.toMatch(/Classement|Marie D\.|Défis Quotidiens|Titre Spécial/);
    // Les badges items_* comptent les activités réellement écrites (« srs_review »).
    const hook = sansCommentaires(lire('src/hooks/useGamification.ts'));
    expect(hook).toContain(".eq('activity_type', 'srs_review')");
    expect(hook).not.toContain(".eq('activity_type', 'review')");
  });
});
