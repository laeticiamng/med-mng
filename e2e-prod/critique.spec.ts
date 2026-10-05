import { expect, test } from '@playwright/test';
import { fermerCookies, surveillerErreurs, texte } from './helpers';

/**
 * Critique finale (05.10.2026) : non-régression des défauts trouvés par la revue indépendante.
 * Chaque test vérifie une correction locale pas encore publiée (@attend-deploiement).
 * Aucun écrit en base, aucun crédit d'IA consommé.
 */

test.describe('Critique finale — contenu immersif décrit tel qu’il est', () => {
  // En base (05.10.2026) : 367 récits écrits pour chaque item (2641 chapitres, 2512 titres distincts) et
  // 4521 cases de planches, chacune dessinée d'après sa description (bd-illustrations/<item>/…).
  // L'interface les présentait encore comme des « formules types, communes à tous les items » et des
  // « photos d'illustration génériques, non spécifiques à l'item ».
  test('récit et planches d’IC-1 : mention exacte (rédigés et illustrés par IA pour l’item) @attend-deploiement', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/edn-complete/ic-1/recit');
    await fermerCookies(page);
    const recit = await texte(page, 'Parcours narré des compétences');
    expect(recit).not.toMatch(/formules types/i);
    expect(recit).toContain('Récit rédigé par IA pour cet item');
    expect(recit).toMatch(/personnages, les lieux et les données des patients sont fictifs/);

    await page.goto('/edn-complete/ic-1/planches');
    const planches = await texte(page, 'Planches de compétences');
    expect(planches).not.toMatch(/photos d'illustration génériques|non spécifiques à l'item/i);
    expect(planches).toContain('Planches rédigées et illustrées par IA pour cet item');
    // Réalité : l'image affichée est celle dessinée pour une case de CET item.
    await expect(page.locator('main img[src*="/bd-illustrations/IC-1/"]').first()).toBeVisible({ timeout: 30_000 });
    expect(erreurs).toEqual([]);
  });

  test('FAQ, CGU et méthode : récits et planches plus annoncés « en cours de génération » @attend-deploiement', async ({ page }) => {
    for (const [chemin, attendu] of [
      ['/faq', 'Questions fréquentes'],
      ['/cgu', 'Services proposés'],
      ['/mng-method', 'Récit et planches'],
    ] as const) {
      await page.goto(chemin);
      await fermerCookies(page);
      const t = await texte(page, attendu, 'body');
      expect(t, chemin).not.toMatch(/(récits?|planches)[^.]{0,80}en cours de génération/i);
    }
    // FAQ : l'avertissement sur l'IA couvre aussi les récits et les planches.
    await page.goto('/faq');
    await page.getByRole('button', { name: 'Les chansons sont-elles fiables médicalement ?' }).click();
    await expect(page.locator('body')).toContainText('Les paroles, comme les récits et les planches, sont rédigées par IA');
  });
});
