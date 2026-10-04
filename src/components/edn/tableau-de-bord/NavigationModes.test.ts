import { describe, expect, it } from 'vitest';
import { ROUTE_PATHS } from '@/config/routes';
import { GROUPES } from './NavigationModes';

/**
 * Décision CEO DC7 (04.10.2026) : examen blanc, cas cliniques et planning
 * générés par IA sont retirés de l'offre. Le menu des modes de révision de
 * /edn-complete ne doit plus y mener.
 */
describe('NavigationModes — fonctions IA hors offre retirées (DC7)', () => {
  const entrees = GROUPES.flatMap((g) => g.entrees);
  const routes = entrees.map((e) => e.route).filter(Boolean);

  it("ne propose ni examen blanc, ni cas cliniques, ni planning IA", () => {
    for (const retiree of [
      ROUTE_PATHS.examMode,
      ROUTE_PATHS.clinicalCases,
      ROUTE_PATHS.smartStudyPlanner,
      ROUTE_PATHS.nationalExam,
      ROUTE_PATHS.chat,
    ]) {
      expect(routes).not.toContain(retiree);
    }
    expect(entrees.map((e) => e.libelle).join(' ')).not.toMatch(/examen blanc|cas cliniques|planning/i);
  });

  it("mène aux situations ECOS de l'offre", () => {
    expect(routes).toContain(ROUTE_PATHS.ecosIndex);
  });
});
