import { expect, test } from '@playwright/test';
import { rest, surveillerErreurs, texte } from './helpers';

/**
 * Parcours gratuit phare (visiteur) : fiches officielles rang A / rang B, quiz d'un item d'essai,
 * recherche par compétence, situation ECOS. Non-régression des correctifs de la vague 1.
 * Aucun écrit : le quiz n'est pas terminé (aucun résultat enregistré).
 */

// Vague 1 : un item sans rang B au référentiel était présenté comme incomplet.
const ANOMALIES_RANG_B = /rang B manquant|en cours de d[ée]veloppement|finalisation|\b(?!100)\d{1,2}\s?%\s*Compl[ée]tude/i;

test.describe('Fiches officielles', () => {
  test('IC-1 : rang A seul, mention neutre « pas de rang B »', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/edn-complete/ic-1/apercu');
    // Attendre la description définitive : pendant le chargement du rang B, la fiche affiche
    // brièvement « rang A : 15 · rang B : 0 » (lu trop tôt sur un serveur lent, 05.10.2026).
    const t = await texte(page, /\d+ compétences officielles de rang A \(pas de rang B pour cet item\)/);
    expect(t).toContain('OIC-001-01-A');
    expect(t).toMatch(/\d+ compétences officielles de rang A \(pas de rang B pour cet item\)/);
    expect(t).toContain('Pas de compétence de rang B pour cet item au référentiel EDN.');
    expect(t).not.toMatch(ANOMALIES_RANG_B);
    // Pas de page « Rang B » pour un item sans compétence de rang B : retour à l'aperçu.
    await page.goto('/edn-complete/ic-1/rang-b');
    await expect(page).toHaveURL(/\/edn-complete\/ic-1\/apercu$/);
    expect(erreurs).toEqual([]);
  });

  test('IC-150 : rang A et rang B officiels (identifiants OIC-150-xx-A/B)', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/edn-complete/ic-150/rang-a');
    await expect(page.locator('main')).toContainText(/OIC-150-\d{2}-A/);
    await page.goto('/edn-complete/ic-150/rang-b');
    const t = await texte(page, /OIC-150-\d{2}-B/);
    expect(t).toMatch(/\d+ compétences officielles/);
    expect(t).not.toMatch(ANOMALIES_RANG_B);
    expect(erreurs).toEqual([]);
  });

  test('liste des items : 367 items et compteurs du référentiel', async ({ page }) => {
    await page.goto('/edn-complete');
    await expect(page.locator('main')).toContainText(/367 items · \d+ compétences du référentiel/);
  });

  test('compteurs « du référentiel » recalculés : 4872 compétences, rang B 2156 @attend-deploiement', async ({ page }) => {
    // Migration 20260925140000_mm_recalcul_compteurs_rangs.sql (IC-269 : 10 compétences B non officielles).
    await page.goto('/edn-complete');
    await expect(page.locator('main')).toContainText('4872 compétences du référentiel (rang A 2716 · rang B 2156)');
  });
});

test.describe('Recherche', () => {
  test('⌘K « otoscopie » → IC-150 (par l’intitulé d’une compétence)', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/');
    await page.getByRole('button', { name: /Rechercher/ }).first().click();
    const dialogue = page.getByRole('dialog');
    // Vague 1 (D10) : le dialogue a un titre accessible.
    await expect(dialogue.getByText('Rechercher un item ou une compétence')).toBeVisible();
    await page.keyboard.type('otoscopie');
    await expect(dialogue).toContainText('IC-150 - Otites infectieuses de l\'adulte et de l\'enfant');
    await expect(dialogue).toContainText(/Compétence : .*otoscopie/);
    expect(erreurs.filter((e) => /DialogTitle/.test(e))).toEqual([]);
    expect(erreurs).toEqual([]);
  });

  test('liste des items : « otoscopie » → IC-150', async ({ page }) => {
    await page.goto('/edn-complete');
    await page.getByPlaceholder(/otoscopie/).fill('otoscopie');
    await expect(page.locator('main')).toContainText('IC-150');
  });
});

test.describe('Quiz d’un item d’essai', () => {
  test('IC-1 rang A : « Suivant » après un choix, bonnes réponses à des positions non cycliques', async ({ page, request }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/edn-complete/ic-1/quiz');
    await page.getByText('Choisissez le rang à réviser').waitFor();
    await page.locator('main button', { hasText: 'Rang A' }).first().click();
    const badge = page.locator('main').getByText(/^Question \d+\/\d+$/).first();
    await expect(badge).toBeVisible();
    const total = Number((await badge.innerText()).split('/')[1]);
    expect(total).toBeGreaterThanOrEqual(4);

    const normaliser = (s: string) => s.replace(/[’']/g, "'").replace(/\s+/g, ' ').replace(/…$/, '').trim().slice(0, 50);
    const positions: number[] = [];
    for (let i = 1; i <= total; i++) {
      await expect(badge).toHaveText(`Question ${i}/${total}`);
      const oic = (await texte(page, /OIC-\d{3}-\d{2}-A/)).match(/OIC-\d{3}-\d{2}-A/)?.[0];
      expect(oic, `identifiant OIC de la question ${i}`).toBeTruthy();
      const radios = page.locator('main [role=radio]');
      await expect(radios).toHaveCount(4);
      const options = (await page.locator('main [role=radiogroup] label').allInnerTexts()).map(normaliser);
      // Bonne réponse = description officielle de la compétence (lecture publique de oic_competences).
      const { json } = await rest(request, `oic_competences?objectif_id=eq.${oic}&select=description`);
      const description = normaliser(String((json as Array<{ description: string }>)?.[0]?.description ?? ''));
      positions.push(options.findIndex((o) => o.length > 10 && (description.startsWith(o.slice(0, 40)) || o.startsWith(description.slice(0, 40)))));

      if (i === total) break; // « Terminer » : test dédié ci-dessous
      const suivant = page.locator('main button', { hasText: /^Suivant$/ }).first();
      await expect(suivant, `« Suivant » avant tout choix, question ${i}`).toBeDisabled();
      await radios.first().click();
      await expect(suivant).toBeEnabled();
      await suivant.click();
    }
    // Le quiz n'est pas terminé : aucun résultat enregistré.
    expect(positions.filter((p) => p < 0), `bonnes réponses introuvables : ${positions.join(',')}`).toEqual([]);
    // Vague 1 : les bonnes réponses tournaient A, B, C, D, A, B…
    const cyclique = positions.every((p, k) => p === (positions[0] + k) % 4);
    expect(new Set(positions).size, `positions ${positions.join(',')}`).toBeGreaterThan(1);
    expect(cyclique, `positions cycliques : ${positions.join(',')}`).toBe(false);
    expect(erreurs).toEqual([]);
  });
});

test('quiz IC-1 : « Terminer » inactif sans réponse à la dernière question @attend-deploiement', async ({ page }) => {
  // Correctif 549cb023 (trouvé par cette suite) : « Terminer » était actif sans choix.
  await page.goto('/edn-complete/ic-1/quiz');
  await page.getByText('Choisissez le rang à réviser').waitFor();
  await page.locator('main button', { hasText: 'Rang A' }).first().click();
  const suivant = page.locator('main button', { hasText: /^Suivant$/ }).first();
  while (await suivant.isVisible().catch(() => false)) {
    await page.locator('main [role=radio]').first().click();
    await suivant.click();
  }
  const terminer = page.locator('main button', { hasText: /^Terminer$/ }).first();
  await expect(terminer).toBeVisible();
  await expect(terminer).toBeDisabled();
  // Le quiz n'est pas terminé : aucun résultat enregistré.
});

test.describe('ECOS', () => {
  test('/ecos/1 : dossier du patient visible, « Je fais » complet (5 gestes)', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/ecos/1');
    // Vague 1 (D04) : la vignette (âge, antécédents, constantes) est affichée.
    await expect(page.locator('main')).toContainText('Monsieur Martin, 58 ans');
    await expect(page.locator('main')).toContainText('Antécédents');
    await expect(page.locator('main')).toContainText(/PA: 145\/85 mmHg/);
    await page.getByRole('button', { name: 'Étape suivante' }).click();
    await expect(page.locator('main')).toContainText('Je fais');
    for (const geste of ['Prise des constantes vitales', 'Inspection générale', 'Auscultation', 'Palpation', 'Examens complémentaires ciblés']) {
      await expect(page.locator('main').getByText(geste, { exact: true })).toBeVisible();
    }
    expect(erreurs).toEqual([]);
  });

  test('DC6 : chronomètre de 8 minutes (arrêté du 13.11.2025), « 8 min par station » @attend-deploiement', async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto('/ecos');
    const index = await texte(page, 'Situation 12');
    expect(index).toContain('8 min par station');
    expect(index).not.toContain('7 min par station');
    await page.goto('/ecos/1');
    await expect(page.locator('main')).toContainText('08:00', { timeout: 30_000 });
    await expect(page.locator('main').getByText('8 min', { exact: true })).toBeVisible();
    await expect(page.locator('main')).not.toContainText('07:00');
    expect(erreurs).toEqual([]);
  });

  test('DC9 : titres des stations par motif de consultation, sans diagnostic @attend-deploiement', async ({ page }) => {
    // Migration 20261004140000_mm_ecos_titres_motif.sql.
    await page.goto('/ecos');
    const t = await texte(page, 'Situation 12');
    for (const diagnostic of ['Syndrome coronarien aigu', 'AVC ischémique', 'Colique néphrétique', 'Dépression du post-partum', 'Allergie alimentaire', 'polytraumatisé', 'pied infecté']) {
      expect(t, diagnostic).not.toContain(diagnostic);
    }
    expect(t).toContain('Douleur thoracique depuis 1 h 30 chez une femme de 65 ans');
  });
});
