import { expect, test } from '@playwright/test';
import { GRATUIT, PREMIUM, dispo, jeton, rest, session } from './helpers';

/**
 * Verrou Premium côté SERVEUR (pas seulement l'interface) : lecture directe des colonnes
 * Premium refusée (42501), RPC du contenu immersif verrouillée hors items d'essai, RPC
 * d'abonnement fermées aux anonymes. Lecture seule : aucune écriture.
 */

const COLONNES_PREMIUM = ['paroles_rang_a', 'paroles_musicales', 'quiz_questions'];

test.describe('Verrou Premium — API', () => {
  test('anonyme : colonnes Premium illisibles (42501), RPC verrouillée pour IC-150, ouverte pour IC-1', async ({ request }) => {
    for (const table of ['edn_items_complete', 'edn_items_immersive']) {
      for (const colonne of COLONNES_PREMIUM) {
        const r = await rest(request, `${table}?select=item_code,${colonne}&item_code=eq.IC-150`);
        expect([401, 403], `${table}.${colonne}`).toContain(r.status);
        expect(JSON.stringify(r.json), `${table}.${colonne}`).toContain('42501');
      }
    }
    const verrouille = await rest(request, 'rpc/mm_contenu_immersif_item', { methode: 'POST', corps: { p_item_code: 'IC-150' } });
    expect(verrouille.status).toBe(200);
    expect(verrouille.json).toMatchObject({ verrouille: true });
    expect(JSON.stringify(verrouille.json)).not.toMatch(/paroles_rang_a"\s*:\s*\[\s*"/);

    const essai = await rest(request, 'rpc/mm_contenu_immersif_item', { methode: 'POST', corps: { p_item_code: 'IC-1' } });
    expect(essai.status).toBe(200);
    expect((essai.json as { verrouille?: boolean }).verrouille ?? false).toBe(false);
  });

  test('compte gratuit : IC-150 verrouillé par la RPC, colonnes Premium illisibles', async ({ request }) => {
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    const { token, userId } = await jeton(request, GRATUIT);
    const verrouille = await rest(request, 'rpc/mm_contenu_immersif_item', { methode: 'POST', corps: { p_item_code: 'IC-150' }, token });
    expect(verrouille.json).toMatchObject({ verrouille: true });
    const direct = await rest(request, 'edn_items_complete?select=item_code,paroles_rang_a&item_code=eq.IC-150', { token });
    expect(JSON.stringify(direct.json)).toContain('42501');
    // Accès Premium refusé pour soi-même.
    const acces = await rest(request, 'rpc/mm_a_acces_premium', { methode: 'POST', corps: { p_user_id: userId }, token });
    expect(acces.status).toBe(200);
    expect(acces.json).toBe(false);
  });

  test('compte Premium : IC-150 ouvert par la RPC', async ({ request }) => {
    test.skip(!dispo(PREMIUM), 'E2E_PREMIUM_* absents');
    const { token } = await jeton(request, PREMIUM);
    const ouvert = await rest(request, 'rpc/mm_contenu_immersif_item', { methode: 'POST', corps: { p_item_code: 'IC-150' }, token });
    expect(ouvert.status).toBe(200);
    expect((ouvert.json as { verrouille?: boolean }).verrouille ?? false).toBe(false);
  });

  test('DC5 : anonyme, IC-161 ouvert et IC-2 verrouillé par la RPC @attend-deploiement', async ({ request }) => {
    // Migration 20261006071535_mm_items_essai_cliniques.sql : 10 items d'essai cliniques.
    const ouvert = await rest(request, 'rpc/mm_contenu_immersif_item', { methode: 'POST', corps: { p_item_code: 'IC-161' } });
    expect(ouvert.status).toBe(200);
    expect((ouvert.json as { verrouille?: boolean }).verrouille ?? false).toBe(false);
    expect(JSON.stringify(ouvert.json)).toMatch(/paroles_rang_a"\s*:\s*\[\s*"/);

    for (const code of ['IC-2', 'IC-10', 'IC-150']) {
      const verrouille = await rest(request, 'rpc/mm_contenu_immersif_item', { methode: 'POST', corps: { p_item_code: code } });
      expect(verrouille.status, code).toBe(200);
      expect(verrouille.json, code).toMatchObject({ verrouille: true });
      expect(JSON.stringify(verrouille.json), code).not.toMatch(/paroles_rang_a"\s*:\s*\[\s*"/);
    }
    for (const code of ['IC-1', 'IC-154', 'IC-27', 'IC-247', 'IC-359', 'IC-224', 'IC-340', 'IC-356', 'IC-66']) {
      const r = await rest(request, 'rpc/mm_item_gratuit', { methode: 'POST', corps: { p_item_code: code } });
      expect(r.json, code).toBe(true);
    }
  });

  test('RPC d’abonnement refusées à la clé publique seule @attend-deploiement', async ({ request }) => {
    // Migration 20261004130000_mm_rpc_abonnement_sans_anon.sql (D07).
    for (const [rpc, corps] of [
      ['get_user_subscription', { p_user_id: '00000000-0000-0000-0000-000000000000' }],
      ['mm_a_acces_premium', { p_user_id: '00000000-0000-0000-0000-000000000000' }],
      ['check_music_generation_quota', { p_user_id: '00000000-0000-0000-0000-000000000000' }],
    ] as const) {
      const r = await rest(request, `rpc/${rpc}`, { methode: 'POST', corps });
      expect([401, 403, 404], rpc).toContain(r.status);
    }
  });
});

test.describe('Verrou Premium — interface', () => {
  test('DC5 : compte gratuit, paroles d’IC-161 ouvertes, celles d’IC-2 réservées à Premium @attend-deploiement', async ({ browser }) => {
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    const ctx = await browser.newContext({ storageState: session('gratuit'), locale: 'fr-FR' });
    const page = await ctx.newPage();
    try {
      await page.goto('/edn-complete/ic-161/musique');
      await expect(page.locator('main')).toContainText('[Couplet 1]', { timeout: 30_000 });
      await expect(page.locator('main')).not.toContainText('Les paroles de cet item font partie de Med MNG Premium');

      await page.goto('/edn-complete/ic-2/musique');
      await expect(page.locator('main')).toContainText('Les paroles de cet item font partie de Med MNG Premium', { timeout: 30_000 });
      await expect(page.locator('main')).not.toContainText('[Couplet 1]');
    } finally {
      await ctx.close();
    }
  });


  test('compte gratuit : paroles d’IC-150 verrouillées, offre Premium proposée', async ({ browser }) => {
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    const ctx = await browser.newContext({ storageState: session('gratuit'), locale: 'fr-FR' });
    const page = await ctx.newPage();
    await page.goto('/edn-complete/ic-150/musique');
    await expect(page.locator('main')).toContainText('Les paroles de cet item font partie de Med MNG Premium');
    await expect(page.locator('main').getByRole('link', { name: /Voir l'offre Premium/ }).or(page.locator('main').getByRole('button', { name: /Voir l'offre Premium/ })).first()).toBeVisible();
    await expect(page.locator('main')).not.toContainText('[Couplet 1]');
    await ctx.close();
  });
});
