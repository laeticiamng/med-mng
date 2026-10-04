import { expect, test } from '@playwright/test';
import { fermerCookies, sansDebordementHorizontal, surveillerErreurs, texte } from './helpers';

/**
 * Parcours publics (visiteur non connecté) : accueil, tarifs, pages légales, SEO, mobile 390 px,
 * absence d'erreurs console / 4xx / 5xx, et allégations corrigées (non-régression).
 */

test.describe('Public — pages et allégations', () => {
  test('accueil : promesse exacte, CTA, aucune erreur', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/');
    await expect(page).toHaveTitle(/Med MNG/i);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Apprenez la médecine\s*en musique/);
    await expect(page.getByRole('link', { name: 'Créer un compte gratuit' }).first()).toBeVisible();
    const t = await texte(page, 'Génération audio avec Premium', 'body');
    // Vague 1 (D31) : un compte gratuit ne génère pas de chanson.
    expect(t).not.toMatch(/Créez un compte gratuit pour générer/i);
    expect(t).toContain("Gratuit : paroles, récit, planches et quiz de 10 items d'essai. Génération audio avec Premium.");
    await page.waitForLoadState('networkidle').catch(() => {});
    expect(erreurs).toEqual([]);
  });

  test('tarifs : offre unique, prix, ECOS « d’entraînement »', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/med-mng/pricing');
    const t = await texte(page, '69 €/an', 'body');
    expect(t).toContain('0 €');
    expect(t).toContain('69 €/an');
    expect(t).toContain('9,90 €/mois');
    expect(t).toContain('Fiches officielles des 367 items');
    expect(t).toContain('30 générations audio de chansons par mois');
    // Vague 1 (D06) : les situations ECOS ne sont pas « issues du référentiel ».
    expect(t).toContain("12 situations ECOS d'entraînement");
    expect(t).not.toMatch(/ECOS (issues|du référentiel)/i);
    // Visiteur : le choix d'une formule passe par l'inscription, puis revient au paiement.
    await page.getByRole('button', { name: /Choisir l'annuel/ }).click();
    await expect(page).toHaveURL(/\/med-mng\/signup\?next=%2Fmed-mng%2Fsubscribe%2Fannuel|\/med-mng\/signup\?next=\/med-mng\/subscribe\/annuel/);
    expect(erreurs).toEqual([]);
  });

  test('pages légales : CGV (rétractation), mentions sans fausse promesse ECOS', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/legal/cgv');
    await expect(page.locator('main')).toContainText(/rétractation/i);
    await page.goto('/mentions-legales');
    const mentions = await texte(page, /situations cliniques/);
    // Vague 1 (D32) : aucune « chanson MNG dédiée par SD ».
    expect(mentions).not.toMatch(/chanson MNG dédiée/i);
    expect(mentions).toContain("12 situations cliniques d'entraînement");
    await page.goto('/politique-confidentialite');
    await expect(page.locator('main')).toContainText(/SOUS-TRAITANTS/i);
    await page.goto('/cgu');
    await expect(page.locator('main')).toContainText(/Conditions/i);
    expect(erreurs).toEqual([]);
  });

  test('SEO : robots.txt, sitemap.xml, llms.txt', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toMatch(/Sitemap:\s*https:\/\/medmng\.com\/sitemap\.xml/i);
    const sitemap = await (await request.get('/sitemap.xml')).text();
    for (const page of ['/edn-complete', '/med-mng/pricing', '/fiches-ecos-interactives', '/mentions-legales']) {
      expect(sitemap).toContain(`https://medmng.com${page}<`);
    }
    // Pages de fonctions retirées : jamais dans le sitemap.
    for (const retiree of ['/chat', '/exam-mode', '/clinical-cases', '/smart-study-planner', '/examen-blanc-national']) {
      expect(sitemap).not.toContain(`https://medmng.com${retiree}<`);
    }
    expect((await request.get('/llms.txt')).status()).toBe(200);
  });

  test('mobile 390 px : aucun débordement horizontal, titre de l’item visible', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'fr-FR' });
    const page = await ctx.newPage();
    const erreurs = surveillerErreurs(page);
    for (const chemin of ['/', '/med-mng/pricing', '/edn-complete', '/edn-complete/ic-1/apercu', '/ecos/1', '/med-mng/login']) {
      await page.goto(chemin);
      await fermerCookies(page);
      await page.waitForTimeout(1500);
      expect(await sansDebordementHorizontal(page), `débordement horizontal sur ${chemin}`).toBe(true);
    }
    // Vague 1 (D08) : le titre de l'item figure dans l'en-tête de la fiche sur mobile.
    await page.goto('/edn-complete/ic-1/apercu');
    await expect(page.getByText(/IC-1: La relation médecin-malade/).first()).toBeVisible();
    expect(erreurs).toEqual([]);
    await ctx.close();
  });
});

test.describe('Allégations corrigées en vague 2', () => {
  test('DC4 : « Compétences du référentiel LiSA 2026 (UNESS) » sur la fiche @attend-deploiement', async ({ page }) => {
    await page.goto('/edn-complete/ic-1/apercu');
    await expect(page.locator('main')).toContainText('Compétences du référentiel LiSA 2026 (UNESS)');
    await expect(page.locator('main')).not.toContainText('source publique UNESS');
    await page.goto('/faq');
    await expect(page.locator('main')).not.toContainText('référentiel public UNESS');
  });

  test('DC8 : la politique de confidentialité liste les prestataires réellement appelés @attend-deploiement', async ({ page }) => {
    await page.goto('/politique-confidentialite');
    const t = await texte(page, /SOUS-TRAITANTS/i);
    for (const prestataire of ['Supabase', 'Lovable', 'Stripe', 'sunoapi.org', 'Google Gemini', 'OpenAI', 'Resend', 'Google Fonts']) {
      expect(t, prestataire).toContain(prestataire);
    }
    // Sentry n'est pas actif en production (aucun DSN) : ne doit plus être annoncé.
    expect(t).not.toContain('Sentry');
  });

  test('DC7 : anciennes adresses des fonctions IA → équivalent de l’offre @attend-deploiement', async ({ page }) => {
    const attendu: Array<[string, RegExp]> = [
      ['/chat', /\/edn-complete$/],
      ['/exam-mode', /\/edn-complete$/],
      ['/examen-blanc-national', /\/edn-complete$/],
      ['/smart-study-planner', /\/edn-complete$/],
      ['/clinical-cases', /\/ecos$/],
      ['/simulation-examen-edn', /\/edn-complete$/],
      ['/cas-cliniques-edn', /\/fiches-ecos-interactives$/],
    ];
    for (const [depart, arrivee] of attendu) {
      await page.goto(depart);
      await expect(page, depart).toHaveURL(arrivee);
    }
  });
});
