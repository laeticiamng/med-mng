import { expect, test } from '@playwright/test';
import {
  GRATUIT,
  dispo,
  fermerCookies,
  sansDebordementHorizontal,
} from './helpers';

/**
 * Med MNG Create, porte d'entrée de l'accueil (décision CEO du 08.10.2026) — scénario A :
 * visiteur → accueil → « Créer une musique » → inscription / connexion → retour sur Create.
 *
 * Non destructif : aucun compte n'est créé (le formulaire d'inscription n'est pas envoyé),
 * aucune génération n'est lancée (aucun clic sur « Générer ma chanson »).
 * Tout est `@attend-deploiement` tant que la branche mm-create-accueil n'est pas publiée.
 */
test.describe('Med MNG Create — entrée depuis l’accueil', () => {
  test('visiteur : « Créer une musique » visible (accueil, en-tête), ECOS dans « Plus » @attend-deploiement', async ({
    page,
  }) => {
    await page.goto('/');
    await fermerCookies(page);
    const hero = page.getByTestId('hero-creer-musique');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveAttribute(
      'href',
      '/med-mng/signup?next=%2Fmed-mng%2Fcreate'
    );
    // Les deux autres actions du héros restent là.
    await expect(
      page.getByRole('link', { name: 'Créer un compte gratuit' }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Voir les 367 items' }).first()
    ).toBeVisible();
    // En-tête : entrée Create mise en avant ; ECOS n'est plus dans la barre principale.
    const nav = page.locator('#main-navigation');
    await expect(nav.getByTestId('nav-creer-musique')).toBeVisible();
    await expect(nav.locator('a[href="/ecos"]')).toHaveCount(0);
    await nav.getByRole('button', { name: /Plus/ }).click();
    await page.getByRole('menuitem', { name: /Réviser/ }).hover();
    await expect(page.getByRole('menuitem', { name: /ECOS/ })).toBeVisible();
  });

  test('visiteur : « Créer une musique » → inscription expliquée → lien de connexion qui garde le retour @attend-deploiement', async ({
    page,
  }) => {
    await page.goto('/');
    await fermerCookies(page);
    await page.getByTestId('hero-creer-musique').click();
    await expect(page).toHaveURL(
      /\/med-mng\/signup\?next=%2Fmed-mng%2Fcreate$/
    );
    await expect(page.getByTestId('contexte-suivant')).toContainText(
      'Med MNG Create'
    );
    await page
      .getByRole('link', { name: /Se connecter/ })
      .last()
      .click();
    await expect(page).toHaveURL(/\/med-mng\/login\?next=%2Fmed-mng%2Fcreate$/);
    await expect(page.getByTestId('contexte-suivant')).toContainText(
      'Med MNG Create'
    );
  });

  test('visiteur : /med-mng/create et /create mènent à la connexion avec retour sur Create @attend-deploiement', async ({
    page,
  }) => {
    await page.goto('/create');
    await expect(page).toHaveURL(/\/med-mng\/login\?next=%2Fmed-mng%2Fcreate$/);
  });

  test('compte gratuit : connexion depuis Create → retour sur Create, offre gratuite affichée, pas de bouton de génération @attend-deploiement', async ({
    page,
  }) => {
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    await page.goto('/med-mng/create');
    await expect(page).toHaveURL(/\/med-mng\/login\?next=%2Fmed-mng%2Fcreate$/);
    await page.locator('#email').fill(GRATUIT.email);
    await page.locator('#password').fill(GRATUIT.password);
    await page
      .getByRole('button', { name: 'Se connecter', exact: true })
      .click();
    await page.waitForURL(/\/med-mng\/create$/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Créer une chanson'
    );
    await expect(page.locator('main')).toContainText('Votre offre : Gratuit');
    await expect(
      page.getByRole('button', { name: /Générer ma chanson/ })
    ).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: /Mes chansons/ })
    ).toBeVisible();
  });

  test('mobile 360 px : boutons du héros pleine largeur, aucun débordement @attend-deploiement', async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      viewport: { width: 360, height: 740 },
      locale: 'fr-FR',
    });
    const page = await ctx.newPage();
    await page.goto('/');
    await fermerCookies(page);
    const hero = page.getByTestId('hero-creer-musique');
    await expect(hero).toBeVisible();
    const boite = await hero.boundingBox();
    expect(boite?.width ?? 0).toBeGreaterThan(300);
    expect(await sansDebordementHorizontal(page)).toBe(true);
    await ctx.close();
  });
});
