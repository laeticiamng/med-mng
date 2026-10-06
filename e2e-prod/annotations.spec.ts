import { expect, test } from '@playwright/test';
import { surveillerErreurs, texte } from './helpers';

/**
 * Ce que Med MNG affiche autour du contenu officiel et du contenu IA (décisions CEO du 06.10.2026).
 * Lecture seule : aucun signalement n'est envoyé.
 */

test.describe('DC2 — note d’actualisation HAS', () => {
  test('IC-150 : note HAS sous OIC-150-06-A (onglet Rang A), texte LiSA conservé @attend-deploiement', async ({
    page,
  }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/edn-complete/ic-150/rang-a');
    const t = await texte(page, "Note d'actualisation — HAS.");
    expect(t).toContain('OIC-150-06-A');
    expect(t).toContain(
      'amoxicilline 80 mg/kg/j en 2 prises, sans dépasser 3 g/j'
    );
    expect(t).toContain(
      'Le texte ci-dessus reproduit la compétence du référentiel LiSA 2026.'
    );
    // Le texte LiSA de la compétence n'est pas modifié (contenu complet, carte ouverte).
    await page
      .locator('[aria-expanded]')
      .filter({ hasText: 'OIC-150-06-A' })
      .first()
      .click();
    await expect(page.locator('main')).toContainText(/80-90\s?mg\/kg\/j/);
    const note = page.getByTestId('note-actualisation');
    await expect(note).toHaveCount(1);
    await expect(note.locator('a[href*="c_2722749"]')).toBeVisible();
    await expect(note.locator('a[href*="c_2722670"]')).toBeVisible();
    expect(erreurs).toEqual([]);
  });
});
