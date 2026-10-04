import { expect, test } from '@playwright/test';
import { GRATUIT, PREMIUM, appelerFonction, dispo, jeton, rest } from './helpers';

/**
 * Sondes de sécurité des fonctions Edge (aucune génération déclenchée) :
 * - sans en-tête → 401 ; avec un compte gratuit → 403 sur les fonctions d'administration ;
 * - génération Suno hors mm-generate-music → 410 (retirée).
 * Corps volontairement INVALIDE (« { ») : même sans contrôle d'accès, la fonction échouerait
 * à la lecture du corps, avant tout appel à un prestataire payant.
 */
const CORPS_INVALIDE = '{';

/** Fonctions d'administration déjà protégées en production (vague 1). */
const ADMIN_VAGUE_1 = [
  'mm-chat-with-ai', 'mm-openai-chat', 'mm-perplexity-search', 'mm-firecrawl-scrape',
  'extract-ecos-uness', 'suno-credits', 'firecrawl-search', 'verify-items-perplexity', 'generate-embeddings',
  'audit-edn-completeness', 'check-item-competences', 'complete-missing-competences',
];
/** Fonctions IA hors offre (DC7) et fonctions payantes sans appelant : admin depuis la vague 2. */
const ADMIN_VAGUE_2 = [
  'ai-tutor', 'medical-chat-ai', 'medical-ai-copilot', 'medical-ai-copilot-stream', 'generate-clinical-case',
  'generate-national-exam', 'generate-qcm', 'study-planner', 'contextual-ai-chat', 'enhanced-contextual-chat',
  'generate-content', 'generate-image', 'generate-comic-images', 'generate-medical-lyrics', 'generate-voice',
  'translate', 'ai-core', 'ai-content', 'synchronized-lyrics', 'send-emails',
];

test.describe('Fonctions Edge — contrôle d’accès', () => {
  test('sans en-tête : 401 (fonctions payantes et d’administration)', async ({ request }) => {
    for (const nom of ['ai-audio', ...ADMIN_VAGUE_1, 'ai-tutor', 'medical-chat-ai', 'mm-generate-music']) {
      const r = await appelerFonction(request, nom, nom === 'ai-audio' ? { action: 'get_credits' } : CORPS_INVALIDE, null);
      expect(r.status, nom).toBe(401);
    }
  });

  test('ai-audio generate_music : retirée (410), même avec la clé publique', async ({ request }) => {
    const r = await appelerFonction(request, 'ai-audio', { action: 'generate_music', payload: {} }, 'anon');
    expect(r.status).toBe(410);
    expect(r.json?.code).toBe('RETIREE');
  });

  test('compte gratuit : 403 sur les fonctions d’administration ; 410 sur music-generation', async ({ request }) => {
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    const { token } = await jeton(request, GRATUIT);
    for (const nom of ADMIN_VAGUE_1) {
      const r = await appelerFonction(request, nom, CORPS_INVALIDE, token);
      expect(r.status, nom).toBe(403);
      expect(r.json?.code, nom).toBe('ADMIN_REQUIS');
    }
    const ancienne = await appelerFonction(request, 'music-generation/generate', CORPS_INVALIDE, token);
    expect(ancienne.status).toBe(410);
    // Génération audio réservée à Premium : 402 PREMIUM_REQUIS. Le contrôle d'abonnement précède la
    // lecture des paroles ; les paroles vides garantissent qu'aucune génération ne part même s'il
    // venait à manquer (réponse 400 PAROLES_VIDES, qui fait alors échouer ce test : un 400 ne
    // prouvait pas le verrou).
    const generation = await appelerFonction(request, 'mm-generate-music', { lyrics: '', itemCode: 'IC-1', rang: 'A' }, token);
    expect(generation.status, 'mm-generate-music (gratuit)').toBe(402);
    expect(generation.json?.code).toBe('PREMIUM_REQUIS');
  });

  test('compte gratuit : 403 sur les fonctions IA hors offre (DC7) et sans appelant @attend-deploiement', async ({ request }) => {
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    const { token } = await jeton(request, GRATUIT);
    const refusees: string[] = [];
    for (const nom of ADMIN_VAGUE_2) {
      const r = await appelerFonction(request, nom, CORPS_INVALIDE, token);
      if (r.status !== 403 || r.json?.code !== 'ADMIN_REQUIS') refusees.push(`${nom}=${r.status}`);
    }
    expect(refusees, 'fonctions encore ouvertes aux comptes gratuits').toEqual([]);
    const audio = await appelerFonction(request, 'ai-audio', { action: 'generate_voice', payload: {} }, token);
    expect(audio.status, 'ai-audio generate_voice').toBe(403);
  });

  test('e-mail de bienvenue : session requise (plus de relais ouvert) @attend-deploiement', async ({ request }) => {
    // Corps invalide : l'ancienne version (sans contrôle) échoue à la lecture du corps, sans rien envoyer.
    const r = await appelerFonction(request, 'send-welcome-email', CORPS_INVALIDE, 'anon');
    expect(r.status).toBe(401);
  });

  test('alertes, rapports et ancien suivi Suno : 401 sans en-tête, 403 pour un compte gratuit @attend-deploiement', async ({ request }) => {
    // Correctif 3b5fc283. send-accessibility-report n'est PAS sondée : l'ancienne version ne lit pas
    // le corps et enverrait le rapport aux destinataires configurés.
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    const { token } = await jeton(request, GRATUIT);
    const ouvertes: string[] = [];
    for (const nom of ['send-security-alert', 'send-scheduled-reports', 'music-status']) {
      const sans = await appelerFonction(request, nom, CORPS_INVALIDE, null);
      const gratuit = await appelerFonction(request, nom, CORPS_INVALIDE, token);
      if (sans.status !== 401 || gratuit.status !== 403 || gratuit.json?.code !== 'ADMIN_REQUIS') {
        ouvertes.push(`${nom}=${sans.status}/${gratuit.status}`);
      }
    }
    expect(ouvertes, 'fonctions encore ouvertes').toEqual([]);
  });

  test('Premium : paroles rédigées d’IC-150 rendues telles quelles, sans IA ni réécriture @attend-deploiement', async ({ request }) => {
    // Correctif 6d62cff9. Seulement avec E2E_PAROLES=1, APRÈS le redéploiement de generer-paroles-item :
    // l'ancienne version produirait une nouvelle version des paroles par l'IA (1 à 3 appels ; rien
    // n'est enregistré grâce à « enregistrer: false »).
    test.skip(process.env.E2E_PAROLES !== '1', 'E2E_PAROLES=1 non défini (à lancer après le redéploiement)');
    test.skip(!dispo(PREMIUM), 'E2E_PREMIUM_* absents');
    const { token } = await jeton(request, PREMIUM);
    const contenu = await rest(request, 'rpc/mm_contenu_immersif_item', { methode: 'POST', corps: { p_item_code: 'IC-150' }, token });
    const publiees = ((contenu.json as { paroles_rang_a?: unknown[] })?.paroles_rang_a ?? [])
      .filter((l): l is string => typeof l === 'string' && l.trim().length > 0);
    expect(publiees.length, 'paroles rang A publiées d’IC-150').toBeGreaterThan(4);
    const r = await appelerFonction(request, 'generer-paroles-item', { itemCode: 'IC-150', rang: 'A', enregistrer: false }, token);
    expect(r.status).toBe(200);
    expect(r.json?.deja_redigees).toBe(true);
    expect(r.json?.enregistre).toBe(false);
    expect(r.json?.paroles).toEqual(publiees);
  });

  test('whisper-transcribe (D45) : adresse externe refusée, enregistrement trop volumineux refusé (413) @attend-deploiement', async ({ request }) => {
    // Vague 3. Sondes sans coût : l'ancienne version échoue AVANT l'appel à OpenAI (domaine .invalid
    // introuvable ; corps JSON invalide), la nouvelle refuse avec un code explicite.
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    const { token } = await jeton(request, GRATUIT);
    const externe = await appelerFonction(request, 'whisper-transcribe', { audioUrl: 'https://exemple.invalid/note.mp3' }, token);
    expect(externe.status, 'audioUrl externe').toBe(400);
    expect(externe.json?.code).toBe('URL_NON_AUTORISEE');
    const volumineux = await appelerFonction(request, 'whisper-transcribe', `{${' '.repeat(14 * 1024 * 1024)}`, token);
    expect(volumineux.status, 'corps de 14 Mo').toBe(413);
    expect(volumineux.json?.code).toBe('AUDIO_TROP_VOLUMINEUX');
    // Sans en-tête : toujours 401.
    expect((await appelerFonction(request, 'whisper-transcribe', CORPS_INVALIDE, null)).status).toBe(401);
  });
});
