import { expect, test } from '@playwright/test';
import { GRATUIT, appelerFonction, dispo, jeton } from './helpers';

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
    // Génération audio réservée à Premium : refus avant toute génération (corps invalide de toute façon).
    const generation = await appelerFonction(request, 'mm-generate-music', { lyrics: '', itemCode: 'IC-1', rang: 'A' }, token);
    expect([400, 402], 'mm-generate-music (gratuit)').toContain(generation.status);
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
});
