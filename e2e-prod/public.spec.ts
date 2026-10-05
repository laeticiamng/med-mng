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

test.describe('Pages retirées à la contre-vérification de la vague 2', () => {
  test('/demo et /parcours → fiches officielles ; absentes du sitemap @attend-deploiement', async ({ page, request }) => {
    // Correctif 2a4ffcf2 : démo aux anciens numéros d'items, parcours par spécialité vides.
    for (const depart of ['/demo', '/parcours', '/parcours/cardiologie']) {
      await page.goto(depart);
      await expect(page, depart).toHaveURL(/\/edn-complete$/);
    }
    const sitemap = await (await request.get('/sitemap.xml')).text();
    for (const retiree of ['/demo', '/parcours']) {
      expect(sitemap).not.toContain(`https://medmng.com${retiree}<`);
    }
  });
});

/**
 * Vague 3 (04.10.2026) : français uniquement (D42) ; pages retirées « Exemple de cas clinique » (D44)
 * et /duel (D53).
 */
test.describe('Vague 3 — français uniquement, pages retirées', () => {
  /** Libellés que produisait l'ancien sélecteur réglé sur « English » (relevés en production le 04.10). */
  const LIBELLES_ANGLAIS = ['Home', 'Pricing', 'Login', 'Sign up', 'English', 'Learn medicine', 'Create a free account', 'Discover', 'Why it works', 'Close'];

  test('D42 : aucun sélecteur de langue ; navigateur anglais et ancien choix « English » → tout en français @attend-deploiement', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'en-US' });
    // Simule une personne qui avait choisi « English » avec l'ancien drapeau (choix gardé dans le navigateur).
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem('medmng-language', 'en');
      } catch {
        // stockage indisponible
      }
    });
    const page = await ctx.newPage();
    const erreurs = surveillerErreurs(page);
    const pages: Array<[string, string | RegExp]> = [
      ['/', 'Créer un compte gratuit'],
      ['/edn-complete', '367 items'],
      ['/edn-complete/ic-1/apercu', 'Compétences du référentiel'],
      ['/ecos/1', 'Situation de départ'],
      ['/med-mng/pricing', '69 €/an'],
    ];
    for (const [chemin, attendu] of pages) {
      await page.goto(chemin);
      const t = await texte(page, attendu, 'body');
      await expect(page.getByRole('button', { name: /Changer de langue/i }), chemin).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.lang), chemin).toBe('fr');
      const lignes = (await page.locator('body').innerText()).split('\n').map((l) => l.trim());
      expect(lignes.filter((l) => LIBELLES_ANGLAIS.includes(l)), `libellés anglais sur ${chemin}`).toEqual([]);
      expect(t, chemin).not.toContain('🇺🇸');
    }
    await page.goto('/');
    await expect(page.locator('#main-navigation')).toContainText('Accueil');
    await expect(page.locator('#main-navigation')).toContainText('Tarifs');
    // L'ancien choix est effacé du navigateur.
    expect(await page.evaluate(() => localStorage.getItem('medmng-language'))).toBeNull();
    expect(erreurs).toEqual([]);
    await ctx.close();
  });

  test('D44 : « Exemple de cas clinique » → situations ECOS ; absent du sitemap et des liens @attend-deploiement', async ({ page, request }) => {
    await page.goto('/exemple-cas-clinique');
    await expect(page).toHaveURL(/\/ecos$/);
    await expect(page.locator('main')).not.toContainText('SCA ST+');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).not.toContain('https://medmng.com/exemple-cas-clinique<');
    expect(await (await request.get('/llms.txt')).text()).not.toContain('exemple-cas-clinique');
    // « Voir aussi » (pages publiques) : plus de lien vers la page retirée.
    await page.goto('/rang-a-vs-rang-b');
    await expect(page.getByRole('navigation', { name: 'Articles connexes' })).toBeVisible();
    await expect(page.locator('a[href="/exemple-cas-clinique"]')).toHaveCount(0);
  });

  test('D53 : /duel → fiches officielles ; absent du sitemap @attend-deploiement', async ({ page, request }) => {
    await page.goto('/duel');
    await expect(page).toHaveURL(/\/edn-complete$/);
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).not.toContain('https://medmng.com/duel<');
  });

  // Note finale vérifiée (05.10.2026) : « 1 item · 3 QCM » posait des questions inventées (rang « A »
  // d'un item, « Rang C – Expertise », distracteurs « Analyse financière »), bonne réponse toujours en 1re.
  test('« Révision rapide » → fiches officielles ; absente du sitemap, quiz inventé introuvable @attend-deploiement', async ({ page, request }) => {
    await page.goto('/revision-rapide');
    await expect(page).toHaveURL(/\/edn-complete$/);
    await expect(page.locator('main')).not.toContainText('Rang C');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).not.toContain('https://medmng.com/revision-rapide<');
  });
});

/**
 * Mesure d'audience (vague 3, 04.10.2026) : l'hébergeur (Lovable) charge /~flock.js sur toutes les
 * pages, sans attendre le bandeau. Le premier test vérifie que la description publiée correspond
 * toujours à la réalité (il échouera si Lovable change ce comportement : mettre alors les textes à jour).
 */
test.describe('Mesure d’audience — description exacte', () => {
  test('réalité : statistiques de l’hébergeur sans consentement (pages vues, cookie « session-id » de 30 min)', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'fr-FR', timezoneId: 'Europe/Paris' });
    // flock.js ne mesure pas les navigateurs pilotés (navigator.webdriver) : on se présente comme un navigateur ordinaire.
    await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }));
    const page = await ctx.newPage();
    const envois: Array<Record<string, unknown>> = [];
    page.on('request', (r) => {
      if (new URL(r.url()).pathname === '/~api/analytics' && r.method() === 'POST') {
        try {
          envois.push(JSON.parse(r.postData() ?? '{}') as Record<string, unknown>);
        } catch {
          envois.push({});
        }
      }
    });
    await page.goto('/');
    // Bandeau affiché : aucun choix n'a été fait.
    await expect(page.locator('div.fixed').filter({ hasText: /cookies essentiels/i }).first()).toBeVisible();
    await expect.poll(() => envois.length, { timeout: 15_000 }).toBeGreaterThan(0);
    const envoi = envois[0];
    expect(envoi.action).toBe('page_hit');
    const contenu = JSON.parse(String(envoi.payload ?? '{}')) as Record<string, unknown>;
    // Exactement ce que décrivent le bandeau, la politique cookies et la politique de confidentialité.
    expect(Object.keys(contenu).sort()).toEqual(['href', 'locale', 'location', 'pathname', 'referrer', 'user-agent']);
    expect(envois.some((e) => e.action === 'web_vital')).toBe(false);
    const cookie = (await ctx.cookies()).find((c) => c.name === 'session-id');
    expect(cookie, 'cookie session-id').toBeTruthy();
    const minutes = ((cookie?.expires ?? 0) * 1000 - Date.now()) / 60_000;
    expect(minutes).toBeGreaterThan(25);
    expect(minutes).toBeLessThanOrEqual(30.5);
    await ctx.close();
  });

  test('bandeau, politique cookies et confidentialité décrivent ces statistiques ; plus de « Plausible » @attend-deploiement', async ({ page }) => {
    await page.goto('/');
    const bandeau = page.locator('div.fixed').filter({ hasText: 'Cookies essentiels' });
    await expect(bandeau).toContainText("L'hébergeur du site (Lovable) compte aussi les pages vues, avec un cookie de session de 30 minutes, sans publicité.");
    await expect(bandeau.getByRole('button', { name: 'Refuser la mesure' })).toBeVisible();
    await expect(bandeau.getByRole('button', { name: 'Accepter la mesure' })).toBeVisible();
    await page.getByRole('button', { name: 'Paramètres des cookies' }).click();
    await expect(page.getByRole('dialog')).toContainText("Statistiques de l'hébergeur");
    await expect(page.getByRole('dialog')).not.toContainText('Plausible');
    await page.keyboard.press('Escape');

    await page.goto('/legal/cookies');
    const cookies = await texte(page, "Statistiques de l'hébergeur (toujours actives)");
    for (const nom of ['session-id', '__cf_bm', '__dpl', 'sb-…-auth-token', 'medmng_cookie_consent']) expect(cookies, nom).toContain(nom);
    for (const faux of ['Plausible', 'pwa-metrics', 'med-mng-lang', 'audio-preferences', 'pendant 13 mois']) expect(cookies, faux).not.toContain(faux);

    await page.goto('/politique-confidentialite');
    const confidentialite = await texte(page, /SOUS-TRAITANTS/i);
    expect(confidentialite).toContain("Statistiques de l'hébergeur");
    expect(confidentialite).toContain('cookie de session de 30 minutes');
    expect(confidentialite).not.toContain('Seuls des cookies strictement nécessaires');
    expect(confidentialite).not.toContain('Données de navigation anonymisées');
  });

  test('visiteur sans accord : la page Tarifs n’enregistre rien dans la base Med MNG @attend-deploiement', async ({ page }) => {
    const enregistrements: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && /\/rest\/v1\/analytics_events/.test(r.url())) enregistrements.push(r.url());
    });
    await page.goto('/med-mng/pricing');
    await expect(page.locator('main')).toContainText('69 €/an');
    await page.waitForTimeout(3000);
    expect(enregistrements, 'avant tout choix').toEqual([]);
    await fermerCookies(page); // « Refuser la mesure »
    await page.reload();
    await expect(page.locator('main')).toContainText('69 €/an');
    await page.waitForTimeout(3000);
    expect(enregistrements, 'après refus').toEqual([]);
    expect(await page.evaluate(() => sessionStorage.getItem('conversion_session'))).toBeNull();
  });
});

/**
 * Contre-vérification de la vague 3 (04.10.2026) : liens internes vers des adresses retirées
 * (redirigées) et retrait de l'accord à la mesure d'audience.
 */
test.describe('Contre-vérification de la vague 3', () => {
  /** Adresses retirées et redirigées dans App.tsx (DC7, D44, D49, D53, révision rapide). */
  const RETIREES = [
    '/demo', '/parcours', '/chat', '/exam-mode', '/clinical-cases', '/smart-study-planner', '/study-planner',
    '/examen-blanc-national', '/simulation-examen-edn', '/cas-cliniques-edn', '/exemple-cas-clinique', '/duel',
    '/revision-rapide',
  ];

  test('pages du sitemap : aucun lien interne vers une adresse retirée @attend-deploiement', async ({ page, request }) => {
    // « Articles liés » de deux pages proposaient « Cas cliniques EDN » (redirigé vers « Fiches ECOS
    // interactives », déjà listé) ; « Voir aussi » de 8 pages, « Exemple de cas clinique » (D44).
    test.setTimeout(300_000);
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const chemins = [...sitemap.matchAll(/<loc>https:\/\/medmng\.com([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
    expect(chemins.length).toBeGreaterThan(10);
    const fautifs: string[] = [];
    for (const chemin of chemins) {
      await page.goto(chemin);
      await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
      const liens = await page.locator('a[href]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
      for (const lien of liens) {
        const u = new URL(lien);
        if (u.origin !== new URL(page.url()).origin) continue;
        const p = u.pathname.replace(/\/$/, '') || '/';
        if (RETIREES.includes(p) || p.startsWith('/parcours/')) fautifs.push(`${chemin} → ${p}`);
      }
    }
    expect([...new Set(fautifs)]).toEqual([]);
  });

  test('visiteur : accord puis « Modifier mon choix » et refus → identifiant de visite oublié, plus rien d’envoyé @attend-deploiement', async ({ page }) => {
    // L'enregistrement est intercepté : rien n'est écrit dans la base de production.
    const envois: string[] = [];
    await page.route('**/rest/v1/analytics_events**', async (route) => {
      envois.push(route.request().method());
      await route.fulfill({ status: 201, body: '' });
    });
    await page.goto('/med-mng/pricing');
    await page.getByRole('button', { name: 'Accepter la mesure' }).click();
    await page.reload();
    await expect(page.locator('main')).toContainText('69 €/an');
    await expect.poll(() => envois.length, { timeout: 10_000 }).toBeGreaterThan(0);
    expect(await page.evaluate(() => sessionStorage.getItem('conversion_session'))).not.toBeNull();

    await page.goto('/legal/cookies');
    await page.getByRole('button', { name: 'Modifier mon choix' }).click();
    await page.getByRole('button', { name: 'Refuser la mesure' }).click();
    expect(await page.evaluate(() => sessionStorage.getItem('conversion_session'))).toBeNull();
    const avant = envois.length;
    await page.goto('/med-mng/pricing');
    await expect(page.locator('main')).toContainText('69 €/an');
    await page.waitForTimeout(3000);
    expect(envois.length, 'envois après le refus').toBe(avant);
    expect(await page.evaluate(() => sessionStorage.getItem('conversion_session'))).toBeNull();
  });
});

/**
 * Note finale vérifiée (05.10.2026) : balayage des pages en production (1440 et 390) — connexion,
 * inscription et nouveau mot de passe n'avaient aucun titre de page (h1) : lecteurs d'écran sans repère.
 */
test.describe('Note finale — titres de page', () => {
  for (const [chemin, titre] of [
    ['/med-mng/login', 'Connectez-vous à votre compte'],
    ['/med-mng/signup', 'Créez votre compte'],
    ['/med-mng/reset-password', 'Nouveau mot de passe'],
  ] as const) {
    test(`${chemin} : un h1 « ${titre} » @attend-deploiement`, async ({ page }) => {
      await page.goto(chemin);
      await expect(page.getByRole('heading', { level: 1, name: titre })).toBeVisible();
    });
  }
});
