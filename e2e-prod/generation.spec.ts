import { expect, test } from '@playwright/test';
import { PREMIUM, appelerFonction, dispo, jeton, rest, supabasePublic } from './helpers';

/**
 * Génération audio RÉELLE (Suno via sunoapi.org) avec le compte Premium : 1 génération décomptée
 * sur son quota mensuel (30) et 1 crédit Suno consommé par exécution.
 * Lancée seulement si E2E_GENERATION=1 (sinon ignorée). Une exécution au plus par campagne.
 * Appels courts par API (pas de requête navigateur > 30 s) ; attente totale jusqu'à 6 min.
 *
 * Vérifie la chaîne corrigée en vague 1 : mm-generate-music → rappel Suno (mm-suno-callback) ou
 * rattrapage (mm-music-status) → fichier COPIÉ dans le stockage Supabase « mm-chansons »
 * (et non l'URL temporaire Suno, effacée au bout de 14 jours).
 */
test.describe('Génération audio Premium @couteux @long', () => {
  test.skip(process.env.E2E_GENERATION !== '1', 'E2E_GENERATION=1 non défini (génération payante)');
  test.skip(!dispo(PREMIUM), 'E2E_PREMIUM_* absents');
  test.setTimeout(8 * 60_000);

  test('IC-150 rang A, 2 min : chanson terminée, audio conservé dans mm-chansons', async ({ request }) => {
    const sb = await supabasePublic(request);
    const { token, userId } = await jeton(request, PREMIUM);

    // Paroles affichées de l'item (contenu Premium, via la RPC verrouillée).
    const contenu = await rest(request, 'rpc/mm_contenu_immersif_item', { methode: 'POST', corps: { p_item_code: 'IC-150' }, token });
    const paroles = (contenu.json as { paroles_rang_a?: string[] })?.paroles_rang_a ?? [];
    expect(paroles.length, 'paroles rang A d’IC-150').toBeGreaterThan(4);

    const lancement = await appelerFonction(
      request,
      'mm-generate-music',
      { lyrics: paroles, style: 'pop', rang: 'A', itemCode: 'IC-150', itemTitle: "Otites infectieuses de l'adulte et de l'enfant", duration: 120 },
      token,
    );
    expect(lancement.status, JSON.stringify(lancement.json)).toBe(200);
    const taskId = String(lancement.json?.trackId ?? '');
    expect(taskId).not.toBe('');

    let etat: Record<string, unknown> | null = null;
    for (let i = 0; i < 36 && etat?.status !== 'completed' && etat?.status !== 'failed'; i++) {
      await new Promise((r) => setTimeout(r, 10_000));
      etat = (await appelerFonction(request, 'mm-music-status', { taskId }, token)).json;
    }
    expect(etat?.status, JSON.stringify(etat)).toBe('completed');
    expect(String(etat?.audioUrl)).toContain(`${sb.url}/storage/v1/object/public/mm-chansons/${userId}/`);
    // Le fichier est lisible.
    const audio = await request.head(String(etat?.audioUrl));
    expect(audio.status()).toBe(200);
    expect(audio.headers()['content-type']).toMatch(/audio|mpeg|octet-stream/);
  });
});
