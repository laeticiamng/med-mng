import { expect, test } from '@playwright/test';
import { GRATUIT, PREMIUM, dispo, fermerCookies, session, surveillerErreurs, texte } from './helpers';

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

test.describe('Critique finale — musique d’un item sans rang A', () => {
  test.skip(!dispo(PREMIUM), 'E2E_PREMIUM_* absents');
  test.use({ storageState: session('premium') });

  // IC-30 et IC-142 n'ont aucune compétence de rang A au référentiel (onglet « Rang A » déjà masqué).
  // L'onglet Musique affichait pourtant « Musique Rang A — Pas encore de paroles rédigées », les
  // mots-clés bruts et « Générer la chanson Rang A », refusé ensuite par le serveur.
  test('IC-30 : pas de chanson « Rang A » ; IC-150 garde ses deux rangs @attend-deploiement', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/edn-complete/ic-30/musique');
    await fermerCookies(page);
    const t = await texte(page, 'Musique Rang B');
    expect(t).not.toContain('Musique Rang A');
    expect(t).not.toContain('Pas encore de paroles rédigées pour ce rang');
    await expect(page.getByRole('button', { name: /^Générer la chanson du rang A$/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Générer la chanson du rang B$/ }).first()).toBeVisible();

    await page.goto('/edn-complete/ic-150/musique');
    const t150 = await texte(page, 'Musique Rang B');
    expect(t150).toContain('Musique Rang A');
    expect(erreurs).toEqual([]);
  });
});

test.describe('Critique finale — note personnelle et coupure de réseau', () => {
  // Production (05.10.2026) : note tapée hors connexion → badge « Sauvegardé », rien d'envoyé ;
  // au retour du réseau, rien n'était renvoyé ; après rechargement, la note était perdue.
  // Visiteur : éditeur affiché avec « Sauvegardé », alors que rien ne peut être enregistré.
  test('visiteur : pas d’éditeur trompeur, invitation à se connecter @attend-deploiement', async ({ page }) => {
    await page.goto('/edn-complete/ic-1/apercu');
    await fermerCookies(page);
    await expect(page.locator('main')).toContainText('pour écrire vos notes sur cet item', { timeout: 30_000 });
    await expect(page.getByPlaceholder(/Ajoutez vos notes personnelles/)).toHaveCount(0);
  });

  test.describe('compte gratuit', () => {
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    test.use({ storageState: session('gratuit') });

    test('saisie hors ligne gardée, envoyée au retour du réseau, même après fermeture de l’onglet @attend-deploiement', async ({ page, context }) => {
      const zone = () => page.getByPlaceholder(/Ajoutez vos notes personnelles/);
      await page.goto('/edn-complete/ic-1/apercu');
      await fermerCookies(page);
      await expect(zone()).toBeVisible({ timeout: 30_000 });
      const origine = await zone().inputValue();
      const marque = `Note E2E hors ligne ${Date.now()}`;

      await context.setOffline(true);
      await zone().fill(marque);
      // Plus de faux « Sauvegardé » : l'état dit la vérité.
      await expect(page.getByText('Non enregistrée — gardée sur cet appareil')).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/^(Enregistrée|Sauvegardé)$/)).toHaveCount(0);

      // L'onglet est fermé AVANT le retour du réseau : la saisie ne doit pas être perdue.
      await page.close();
      await context.setOffline(false);
      const page2 = await context.newPage();
      await page2.goto('/edn-complete/ic-1/apercu');
      const zone2 = page2.getByPlaceholder(/Ajoutez vos notes personnelles/);
      await expect(zone2).toHaveValue(marque, { timeout: 30_000 });
      await expect(page2.getByText('Enregistrée', { exact: true })).toBeVisible({ timeout: 20_000 });

      // Vraiment enregistrée dans le compte : un autre onglet sans brouillon la relit.
      await page2.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('medmng_note_brouillon')).forEach((k) => localStorage.removeItem(k)));
      await page2.reload();
      await expect(page2.getByPlaceholder(/Ajoutez vos notes personnelles/)).toHaveValue(marque, { timeout: 30_000 });

      // Remise en état : la note d'origine du compte de test.
      await page2.getByPlaceholder(/Ajoutez vos notes personnelles/).fill(origine);
      await page2.waitForTimeout(3_000);
      await page2.reload();
      await expect(page2.getByPlaceholder(/Ajoutez vos notes personnelles/)).toHaveValue(origine, { timeout: 30_000 });
    });

    // Production (05.10.2026) : à l'ouverture d'un item, la valeur retardée (vide pendant 1 s) faisait
    // SUPPRIMER la note enregistrée (DELETE), recréée 1 s plus tard ; quitter la page entre-temps la
    // perdait (prouvé : note d'IC-2 effacée en ouvrant l'item puis « Quiz » 300 ms après).
    test('ouvrir un item puis le quitter tout de suite ne supprime pas sa note @attend-deploiement', async ({ page }) => {
      const zone = () => page.getByPlaceholder(/Ajoutez vos notes personnelles/);
      const ecritures: string[] = [];
      page.on('request', (r) => {
        if (/rest\/v1\/user_edn_notes/.test(r.url()) && r.method() !== 'GET') ecritures.push(r.method());
      });
      await page.goto('/edn-complete/ic-2/apercu');
      await fermerCookies(page);
      await expect(zone()).toBeVisible({ timeout: 30_000 });
      const origine = await zone().inputValue();
      const marque = `Note E2E départ rapide ${Date.now()}`;
      await zone().fill(marque);
      await expect(page.getByText('Enregistrée', { exact: true })).toBeVisible({ timeout: 20_000 });

      ecritures.length = 0;
      await page.reload();
      await expect(zone()).toHaveValue(marque, { timeout: 30_000 });
      await page.getByRole('link', { name: /^Quiz$/ }).first().click();
      await page.waitForTimeout(3_000);
      expect(ecritures, 'aucune écriture à la simple ouverture').toEqual([]);

      await page.goto('/edn-complete/ic-2/apercu');
      await expect(zone()).toHaveValue(marque, { timeout: 30_000 });

      // Remise en état.
      await zone().fill(origine);
      await page.waitForTimeout(3_000);
      await page.reload();
      await expect(zone()).toHaveValue(origine, { timeout: 30_000 });
    });
  });
});

test.describe('Critique finale — coupure de réseau pendant le chargement d’une page', () => {
  // Sans service worker installé (première visite) : la page est téléchargée à la demande.
  test.use({ serviceWorkers: 'block' });

  // Production (05.10.2026) : hors connexion, l'onglet « Quiz » d'un item remplaçait toute
  // l'application par « Oops ! Une erreur est survenue — Ne t'inquiète pas, ça arrive ».
  test('onglet ouvert hors connexion : message dédié, en-tête gardé, rechargement au retour du réseau @attend-deploiement', async ({ page, context }) => {
    await page.goto('/edn-complete/ic-2/apercu');
    await fermerCookies(page);
    const onglets = page.getByRole('navigation', { name: "Sections de l'item" });
    await expect(onglets).toBeVisible({ timeout: 30_000 });

    await context.setOffline(true);
    await onglets.getByRole('link', { name: /^Quiz$/ }).click();
    await expect(page.getByText('Connexion interrompue')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Oops ! Une erreur est survenue/)).toHaveCount(0);
    await expect(onglets).toBeVisible();

    await context.setOffline(false);
    await expect(page.locator('main')).toContainText("Quiz de l'item IC-2", { timeout: 30_000 });
    await expect(page.getByText('Connexion interrompue')).toHaveCount(0);
  });
});
