import { expect, test, type Page } from '@playwright/test';
import { GRATUIT, PREMIUM, dispo, fermerCookies, session, surveillerErreurs } from './helpers';

/**
 * Parcours connectés : compte gratuit (espace personnel, verrou, paiement Stripe atteint sans payer)
 * et compte Premium (contenu ouvert, bibliothèque, portail d'abonnement). Rien n'est payé ni modifié :
 * les pages Stripe sont interceptées dès que leur adresse est demandée.
 */

/** Intercepte la navigation vers Stripe (aucune page Stripe chargée, rien n'est payé). */
async function intercepterStripe(page: Page, hote: 'checkout.stripe.com' | 'billing.stripe.com') {
  const demandee = new Promise<URL>((resolve) => {
    page.route(`https://${hote}/**`, async (route) => {
      resolve(new URL(route.request().url()));
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Stripe (intercepté)</title>' });
    });
  });
  return demandee;
}

test.describe('Compte gratuit', () => {
  test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
  test.use({ storageState: session('gratuit') });

  test('espace personnel : progression, objectifs, tableau de progression sans erreur', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    // Vague 1 (D27) : « Progression » finissait en erreur 400 pour tous.
    await page.goto('/med-mng/progress');
    await expect(page.locator('main')).toContainText('Ma progression');
    await expect(page.locator('main')).toContainText(/\d+\/\d+\s*objectif semaine/);
    await expect(page.locator('main')).not.toContainText(/Quelque chose n'a pas fonctionné/);
    // Vague 1 (D29) : aucun objectif d'EmotionsCare (« Premier scan émotionnel »…).
    await page.goto('/my-goals');
    await expect(page.locator('main')).toContainText('Objectifs actifs');
    await expect(page.locator('main')).not.toContainText(/scan émotionnel|EmotionsCare|méditation/i);
    // Vague 1 (D28, D30) : plus de « NaN », plus de HEAD /flashcards en 400.
    await page.goto('/progress-dashboard');
    await expect(page.locator('main')).toContainText('Ma progression');
    await page.waitForTimeout(3000);
    await expect(page.locator('main')).not.toContainText('NaN');
    expect(erreurs).toEqual([]);
  });

  test('profil : offre gratuite affichée, onglet Abonnement', async ({ page }) => {
    await page.goto('/med-mng/profile');
    await expect(page.locator('main')).toContainText('Gratuit');
    await expect(page.getByRole('tab', { name: 'Abonnement' })).toBeVisible();
  });

  test('paiement : case de renonciation obligatoire puis Stripe Checkout atteint (sans payer)', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    const stripe = intercepterStripe(page, 'checkout.stripe.com');
    await page.goto('/med-mng/subscribe/annuel');
    await fermerCookies(page);
    const caseRenonciation = page.locator('#renonciation-retractation');
    await expect(caseRenonciation).toBeVisible();
    await expect(page.locator('main')).toContainText("Je demande l'accès immédiat au contenu et reconnais perdre mon droit de rétractation");
    await expect(caseRenonciation).not.toBeChecked();
    const payer = page.getByRole('button', { name: 'Payer 69 €/an par carte (Stripe)' });
    await expect(payer).toBeVisible();
    // Sans la case : message, et aucune session Stripe demandée.
    const sessionsStripe: string[] = [];
    page.on('request', (r) => {
      if (/functions\/v1\/mm-create-checkout/.test(r.url())) sessionsStripe.push(r.url());
    });
    await payer.click();
    await expect(page.getByRole('alert').filter({ hasText: 'Veuillez cocher cette case pour poursuivre.' })).toBeVisible();
    expect(sessionsStripe).toEqual([]);
    await caseRenonciation.click();
    await payer.click();
    const url = await stripe;
    expect(url.host).toBe('checkout.stripe.com');
    expect(url.pathname).toMatch(/^\/c\/pay\/cs_(live|test)_/);
    expect(erreurs).toEqual([]);
  });

  test('profil › Paramètres : aucun réglage factice, export réel @attend-deploiement', async ({ page }) => {
    // Correctif 24495530 : réglages jamais enregistrés et export factice retirés.
    await page.goto('/med-mng/profile');
    await page.getByRole('tab', { name: 'Paramètres' }).click();
    await expect(page.getByRole('link', { name: /Exporter mes données/ })).toHaveAttribute('href', '/mes-donnees-rgpd');
    await expect(page.locator('main [role=switch]')).toHaveCount(0);
  });

  test('« Mes succès » : pas d’onglet Certificats, aucune erreur 4xx @attend-deploiement', async ({ page }) => {
    // Correctif de la contre-vérification : l'onglet « Certificats » échouait en 400 (user_badges)
    // et aurait délivré des certificats « Vérifié » à partir de badges auto-attribuables.
    const erreurs = surveillerErreurs(page);
    await page.goto('/achievements');
    await expect(page.locator('main')).toContainText('Succès & Progression');
    await expect(page.getByRole('tab', { name: 'Certificats' })).toHaveCount(0);
    for (const onglet of ['Classement', 'Défis', 'Progression']) {
      await page.getByRole('tab', { name: onglet }).click();
      await page.waitForTimeout(1500);
    }
    expect(erreurs).toEqual([]);
  });

  test('D42 : profil en français, sans sélecteur de langue ni mention de celui-ci @attend-deploiement', async ({ page }) => {
    // Vague 3 : le sélecteur de langue (drapeau flottant) est retiré ; Profil › Paramètres l'indiquait.
    await page.goto('/med-mng/profile');
    await expect(page.locator('main')).toContainText('Gratuit');
    await expect(page.getByRole('button', { name: /Changer de langue/i })).toHaveCount(0);
    await page.getByRole('tab', { name: 'Paramètres' }).click();
    await expect(page.locator('main')).toContainText('Med MNG est entièrement en français.');
    await expect(page.locator('main')).not.toContainText(/sélecteur de langue/i);
  });

  test('D42 (contre-vérification) : aucun « streak » ni type d’activité brut sur le profil, la progression et « Mes succès » @attend-deploiement', async ({ page }) => {
    // Contre-vérification de la vague 3 : « Record streak » (profil), « Streak » (progression),
    // « Jours de Streak » (Mes succès) et la répartition « srs_review: 0, ai_question: 0… » restaient.
    await page.goto('/med-mng/profile');
    await expect(page.locator('main')).toContainText('Meilleure série');
    await expect(page.locator('main')).not.toContainText(/streak/i);
    await page.goto('/med-mng/progress');
    await expect(page.locator('main')).toContainText('Ma progression');
    await expect(page.locator('main')).not.toContainText(/streak/i);
    await page.goto('/achievements');
    await expect(page.locator('main')).toContainText('Jours de suite');
    await expect(page.locator('main')).not.toContainText(/streak/i);
    await page.goto('/progress-dashboard');
    await expect(page.locator('main')).toContainText('Ma progression');
    await page.waitForTimeout(3000);
    await expect(page.locator('main')).not.toContainText(/streak|srs_review|ai_question|clinical_case|music_generation|\breview:/i);
  });

  test('DC7 : plus de tuteur IA flottant pour un compte connecté @attend-deploiement', async ({ page }) => {
    await page.goto('/edn-complete');
    await expect(page.locator('main')).toContainText('367 items');
    await expect(page.getByRole('button', { name: 'Ouvrir le tuteur IA' })).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('Planning IA');
    await page.goto('/chat');
    await expect(page).toHaveURL(/\/edn-complete$/);
  });
});

test.describe('Compte Premium', () => {
  test.skip(!dispo(PREMIUM), 'E2E_PREMIUM_* absents');
  test.use({ storageState: session('premium') });

  test('IC-150 : paroles visibles et « Mes chansons de cet item »', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/edn-complete/ic-150/musique');
    await expect(page.locator('main')).toContainText('[Couplet 1]');
    await expect(page.locator('main')).not.toContainText('font partie de Med MNG Premium');
    await expect(page.locator('main')).toContainText(/Générations audio ce mois-ci : \d+ \/ 30/);
    // Vague 1 (D12) : une chanson déjà générée reste visible sur l'onglet Musique après rechargement.
    await expect(page.locator('main')).toContainText('Mes chansons de cet item');
    expect(erreurs).toEqual([]);
  });

  test('bibliothèque : aucun bouton sans nom, durées en minutes', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/med-mng/music-library');
    await expect(page.locator('main')).toContainText('Ma bibliothèque');
    await expect(page.locator('main')).toContainText(/Générations restantes ce mois-ci\s*\d+ \/ 30/);
    // Vague 1 (D22) : 6 boutons icônes n'avaient pas de nom accessible.
    const sansNom = await page.locator('main button').evaluateAll((bs) =>
      bs.filter((b) => !(b.getAttribute('aria-label') || (b as HTMLElement).innerText.trim() || b.getAttribute('title'))).length,
    );
    expect(sansNom).toBe(0);
    // Vague 1 (D09) : « 119.6 » → « 2:00 ».
    const t = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
    expect(t).toMatch(/\b\d{1,2}:\d{2}\b/);
    expect(t).not.toMatch(/\b\d{2,3}\.\d\b/);
    expect(erreurs).toEqual([]);
  });

  test('mobile 390 px : menu « … » d’une chanson visible, sans débordement', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: session('premium'), viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'fr-FR' });
    const page = await ctx.newPage();
    await page.goto('/med-mng/music-library');
    await fermerCookies(page);
    await expect(page.locator('main')).toContainText('Ma bibliothèque');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    await ctx.close();
  });

  test('portail d’abonnement Stripe atteint (rien n’est modifié)', async ({ page }) => {
    const stripe = intercepterStripe(page, 'billing.stripe.com');
    await page.goto('/med-mng/profile');
    await page.getByRole('tab', { name: 'Abonnement' }).click();
    await page.getByRole('button', { name: 'Gérer / résilier mon abonnement' }).click();
    const url = await stripe;
    expect(url.host).toBe('billing.stripe.com');
    expect(url.pathname).toMatch(/^\/p\/session/);
  });
});
