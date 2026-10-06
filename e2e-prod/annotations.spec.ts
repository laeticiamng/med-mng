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

test.describe('CF-10 — contenu rédigé par IA : mention renforcée et signalement', () => {
  const MENTION =
    'Contenu rédigé par IA à partir des compétences officielles LiSA 2026, non relu individuellement par un médecin. La compétence officielle fait foi.';

  test('paroles d’IC-161 (item d’essai) : mention renforcée et lien « se connecter pour signaler » @attend-deploiement', async ({
    page,
  }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/edn-complete/ic-161/musique');
    const t = await texte(page, MENTION);
    expect(t).toContain('[Couplet 1]');
    const lien = page.getByRole('link', {
      name: 'Se connecter pour signaler une erreur',
    });
    await expect(lien).toBeVisible();
    await expect(lien).toHaveAttribute(
      'href',
      /\/med-mng\/login\?next=%2Fedn-complete%2Fic-161%2Fmusique/
    );
    expect(erreurs).toEqual([]);
  });
});

test.describe('CF-10 bis — errata de fond affichés en clair', () => {
  test('IC-332 : erratum sous OIC-332-11-B (Rang B), coquille d’OIC-332-09-A non affichée (Rang A) @attend-deploiement', async ({
    page,
  }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/edn-complete/ic-332/rang-b');
    const t = await texte(page, 'erratum Med MNG');
    expect(t).toContain(
      'Texte LiSA : « médicament β2 mimétique » — erratum Med MNG : « médicament β1 mimétique » (la dobutamine est un agoniste β1 (cf. OIC-234-23-B))'
    );
    await expect(page.getByTestId('erratum-med-mng')).toHaveCount(1);
    await expect(page.getByTestId('erratum-med-mng')).toHaveAttribute(
      'aria-label',
      /OIC-332-11-B/
    );

    // Coquille (« urgence virale » → « urgence vitale ») : corrigée, sans affichage.
    await page.goto('/edn-complete/ic-332/rang-a');
    await texte(page, /OIC-332-\d{2}-A/);
    await expect(page.getByTestId('erratum-med-mng')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('urgence virale');
    expect(erreurs).toEqual([]);
  });
});
