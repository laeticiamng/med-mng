import { expect, test } from '@playwright/test';
import { BASE, GRATUIT, dispo, seConnecter } from './helpers';

/**
 * Exécuté EN DERNIER (projet « deconnexion », teardown du projet « connexion ») : la déconnexion
 * Supabase ferme toutes les sessions du compte, y compris celles des autres tests.
 * Inscription : aucun compte n'est créé (le formulaire est arrêté par la validation).
 */
test.describe('Authentification', () => {
  test('inscription : CGU obligatoires, aucune requête d’inscription sans elles', async ({ page }) => {
    const inscriptions: string[] = [];
    page.on('request', (r) => {
      if (/\/auth\/v1\/signup/.test(r.url())) inscriptions.push(r.url());
    });
    await page.goto('/med-mng/signup');
    await page.locator('#name').fill('Sonde E2E');
    await page.locator('#email').fill('sonde-e2e@example.invalid');
    await page.locator('#password').fill('Sonde-E2E-pas-de-compte-1');
    await page.locator('#confirmPassword').fill('Sonde-E2E-pas-de-compte-1');
    await page.getByRole('button', { name: /Créer/ }).last().click();
    await expect(page.locator('main')).toContainText("Veuillez accepter les conditions générales d'utilisation");
    await expect(page).toHaveURL(/\/med-mng\/signup/);
    expect(inscriptions).toEqual([]);
  });

  test('connexion : mauvais mot de passe refusé', async ({ page }) => {
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    await page.goto('/med-mng/login');
    await page.locator('#email').fill(GRATUIT.email);
    await page.locator('#password').fill('mauvais-mot-de-passe-E2E');
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await expect(page).toHaveURL(/\/med-mng\/login/);
    await expect(page.locator('main')).toContainText(/incorrect|invalide|Identifiants/i);
  });

  test('connexion vers la page demandée (next interne), puis déconnexion', async ({ page }) => {
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    await seConnecter(page, GRATUIT, '/med-mng/progress');
    await expect(page).toHaveURL(/\/med-mng\/progress$/);
    // Déconnexion par le menu du compte.
    await page.locator('#main-navigation').getByRole('button', { name: GRATUIT.email.split('@')[0] }).click();
    await page.getByRole('menuitem', { name: 'Déconnexion' }).click();
    await expect(page.locator('#main-navigation').getByRole('link', { name: 'Connexion' }).or(page.locator('#main-navigation').getByRole('button', { name: 'Connexion' })).first()).toBeVisible();
    // Page protégée : renvoi vers la connexion.
    await page.goto('/med-mng/progress');
    await expect(page).toHaveURL(/\/med-mng\/login/);
  });

  test('connexion : un « next » externe est ignoré (pas de redirection ouverte)', async ({ page }) => {
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    await page.goto('/med-mng/login?next=%2F%2Fexample.com%2Fpiege');
    await page.locator('#email').fill(GRATUIT.email);
    await page.locator('#password').fill(GRATUIT.password);
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await page.waitForURL((u) => !u.pathname.startsWith('/med-mng/login'), { timeout: 30_000 });
    expect(new URL(page.url()).host).toBe(new URL(BASE).host);
    expect(page.url()).not.toContain('example.com');
  });
});
