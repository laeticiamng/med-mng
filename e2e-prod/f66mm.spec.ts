import { expect, test, type APIRequestContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createServer, type IncomingHttpHeaders } from 'node:http';
import type { AddressInfo } from 'node:net';
import { GRATUIT, appelerFonction, dispo, jeton, supabasePublic } from './helpers';

/**
 * Vague sécurité F66-MM (05.10.2026) — @attend-deploiement tant que les fonctions ne sont pas redéployées.
 *
 * Fonctions MED MNG du projet Supabase partagé joignables avec la seule clé publique (verify_jwt ne
 * la filtre pas : c'est un JWT valide) alors qu'elles lisaient ou écrivaient avec la clé de service,
 * appelaient un fournisseur payant ou relayaient des e-mails. Règles (source unique, vérifiée
 * statiquement : supabase/functions/_shared/f66mm_regles.test.ts) :
 *   - administrateur / personne connectée → 401 AUTH_REQUISE avec la seule clé publique ;
 *   - rappel Suno (URL signée)            → 401 sans URL signée ;
 *   - retirée                             → 410 RETIREE + en-tête témoin x-mm-fonction-retiree.
 *
 * SANS COÛT, Y COMPRIS CONTRE LES ANCIENNES VERSIONS :
 *   1. Le corps des sondes est du JSON INVALIDE (`{`), transmis octet pour octet (Buffer). Ne JAMAIS
 *      passer une chaîne à `data` avec `content-type: application/json` : Playwright la sérialise
 *      (`'{'` part sous la forme `"{"`, un JSON VALIDE) — incident EmotionsCare du 05.10.2026 (appels
 *      OpenAI payants déclenchés par des sondes « invalides »). Le garde-fou `verifierCorpsTransmis`
 *      le prouve contre un serveur LOCAL (127.0.0.1) avant toute sonde de production.
 *   2. Premier groupe : fonctions dont l'ANCIENNE version (code du dépôt à 5ff1d069, déployé le
 *      05.10.2026 à 09:28 UTC) lit le corps AVANT toute opération — elle échoue donc en 500/400 sans
 *      rien faire — ou ne route pas la requête (secure-streaming-proxy : 404). Relu fonction par
 *      fonction ; la nouvelle version refuse avant même de lire le corps.
 *   3. Second groupe (E2E_F66MM_DEPLOYE=1, à poser SEULEMENT après avoir vérifié dans la liste des
 *      fonctions Supabase que CHACUNE a une version postérieure au déploiement F66-MM) : fonctions
 *      dont l'ancienne version travaille dès l'appel (lectures et écritures en clé de service ;
 *      orphelines au code inconnu, dont reimport-edn-complete qui RÉÉCRIVAIT le contenu des
 *      367 items). Défense supplémentaire : pour une fonction retirée, la réponse OPTIONS doit porter
 *      le témoin x-mm-fonction-retiree AVANT que la sonde ne parte ; sinon le test échoue sans sonder.
 *
 * Seuls le statut, le code d'erreur et l'en-tête témoin sont lus.
 */

type Attendu = { statut: number; code?: string; erreur?: string };
const RETIREE: Attendu = { statut: 410, code: 'RETIREE' };
const AUTH: Attendu = { statut: 401, code: 'AUTH_REQUISE' };
const RAPPEL: Attendu = { statut: 401, erreur: 'Rappel non authentifié.' };

/** Premier groupe : sûres contre l'ancienne ET la nouvelle version (voir l'en-tête). */
const SONDES_SURES: Record<string, Attendu> = {
  // retirées : l'ancienne version lisait le corps en premier
  'admin-quick-edit': RETIREE,
  'advanced-search': RETIREE,
  'analytics-tracker': RETIREE,
  'auth-webhook': RETIREE,
  'error-logger': RETIREE,
  'generate-exam': RETIREE,
  'system': RETIREE,
  // administrateur
  'analytics-aggregator': AUTH,
  'data-integrity-check': AUTH,
  'resend-notification': AUTH,
  'secure-streaming-proxy': AUTH,
  'ai-chat': AUTH,
  // personne connectée (puis accès à l'item)
  'illustrer-case': AUTH,
  // rappel Suno : URL signée exigée
  'mm-suno-callback': RAPPEL,
};

/** Second groupe, fonctions du dépôt : l'ancienne version lit ou écrit avant le corps. */
const SONDES_APRES_DEPLOIEMENT: Record<string, Attendu> = {
  'analytics-engine': RETIREE,
  'check-performance-degradation': RETIREE,
  'check-recommendation-alerts': RETIREE,
  'compare-official-content': RETIREE,
  'content-master-api': RETIREE,
  'ecos-api': RETIREE,
  'edn-tableaux-api': RETIREE,
  'error-handling-service': RETIREE,
  'generate-security-report': RETIREE,
  'items-completeness-check': RETIREE,
  'mm-monitoring-alerts': RETIREE,
  'pedagogical-content-api': RETIREE,
  'security-scanner': RETIREE,
  'spotify-ai-complete': RETIREE,
  'webhooks': RETIREE,
  'extraction-monitoring': AUTH,
  'music-metrics': AUTH,
  'security-metrics': AUTH,
  // fonctions à session (l'ancienne version refusait déjà la clé publique ; gardées ici par prudence)
  'import-edn-data': AUTH,
  'ai-recommendations': RETIREE,
  'cancel-ia-task': RETIREE,
  'content-ai-generator': RETIREE,
  'items-completeness-api': RETIREE,
  'mm-send-push-notification': RETIREE,
};

/** Orphelines retirées (110), lues dans le test Deno (source unique). */
function orphelinesRetirees(): string[] {
  const source = readFileSync(new URL('../supabase/functions/_shared/f66mm_regles.test.ts', import.meta.url), 'utf8');
  const noms: string[] = [];
  for (const liste of ['ORPHELINES_MED_MNG', 'ORPHELINES_SANS_ORIGINE']) {
    const bloc = source.match(new RegExp(`export const ${liste}: string\\[\\] = \\[([\\s\\S]*?)\\];`));
    if (!bloc) throw new Error(`${liste} introuvable dans f66mm_regles.test.ts`);
    noms.push(...[...bloc[1].matchAll(/'([a-z0-9_-]+)'/g)].map((m) => m[1]));
  }
  return noms;
}
const ORPHELINES = orphelinesRetirees();

/** Corps JSON INVALIDE, transmis octet pour octet (voir l'en-tête). */
const CORPS_INVALIDE = Buffer.from('{', 'utf8');

function estJsonValide(texte: string): boolean {
  try {
    JSON.parse(texte);
    return true;
  } catch {
    return false;
  }
}

/** Serveur LOCAL qui enregistre ce qu'il reçoit (octets, en-têtes, chemin). */
async function avecServeurLocal<T>(
  action: (base: string) => Promise<T>,
): Promise<{ resultat: T; recus: { corps: string; enTetes: IncomingHttpHeaders; chemin: string }[] }> {
  const recus: { corps: string; enTetes: IncomingHttpHeaders; chemin: string }[] = [];
  const serveur = createServer((req, res) => {
    const morceaux: Buffer[] = [];
    req.on('data', (m: Buffer) => morceaux.push(m));
    req.on('end', () => {
      recus.push({ corps: Buffer.concat(morceaux).toString('utf8'), enTetes: req.headers, chemin: req.url ?? '' });
      res.writeHead(204).end();
    });
  });
  await new Promise<void>((ok) => serveur.listen(0, '127.0.0.1', () => ok()));
  try {
    const { port } = serveur.address() as AddressInfo;
    const resultat = await action(`http://127.0.0.1:${port}`);
    return { resultat, recus };
  } finally {
    await new Promise<void>((ok) => serveur.close(() => ok()));
  }
}

/**
 * Garde-fou de coût : envoie le corps des sondes, avec les mêmes options, à un serveur LOCAL et
 * vérifie que les octets reçus sont exactement `{` (JSON invalide). Lève une erreur sinon : aucune
 * sonde de production ne part.
 */
async function verifierCorpsTransmis(contexte: APIRequestContext): Promise<void> {
  const { recus } = await avecServeurLocal((base) =>
    contexte.post(`${base}/echo`, { headers: { 'content-type': 'application/json' }, data: CORPS_INVALIDE, failOnStatusCode: false }),
  );
  if (recus.length !== 1 || recus[0].corps !== '{' || estJsonValide(recus[0].corps)) {
    throw new Error(`Garde-fou F66-MM : le corps des sondes n'est pas du JSON invalide (reçu : ${JSON.stringify(recus.map((r) => r.corps))}). Aucune sonde envoyée.`);
  }
}

/** Sonde : corps invalide, seule clé publique (`auth`) ou aucun en-tête. */
async function sonder(request: APIRequestContext, fonction: string, auth: boolean) {
  const sb = await supabasePublic(request);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (auth) {
    headers.apikey = sb.anon;
    headers.authorization = `Bearer ${sb.anon}`;
  }
  const r = await request.post(`${sb.url}/functions/v1/${fonction}`, { headers, data: CORPS_INVALIDE, failOnStatusCode: false, timeout: 25_000 });
  const corps = (await r.json().catch(() => ({}))) as { code?: string; error?: string };
  return { statut: r.status(), code: corps.code, erreur: corps.error, temoin: r.headers()['x-mm-fonction-retiree'] };
}

/** Témoin de la version retirée sur OPTIONS (sans en-tête d'authentification, sans corps). */
async function temoinRetiree(request: APIRequestContext, fonction: string): Promise<string | undefined> {
  const sb = await supabasePublic(request);
  const r = await request.fetch(`${sb.url}/functions/v1/${fonction}`, { method: 'OPTIONS', failOnStatusCode: false, timeout: 25_000 });
  return r.headers()['x-mm-fonction-retiree'];
}

function verifierReponse(fonction: string, r: Awaited<ReturnType<typeof sonder>>, attendu: Attendu) {
  expect(r.statut, `${fonction} appelée avec la seule clé publique`).toBe(attendu.statut);
  if (attendu.code) expect(r.code, `${fonction} : code de la version F66-MM`).toBe(attendu.code);
  if (attendu.erreur) expect(r.erreur, `${fonction} : réponse de la version F66-MM`).toBe(attendu.erreur);
  if (attendu === RETIREE) expect(r.temoin, `${fonction} : témoin de la version retirée`).toBe('F66-MM');
}

test.describe('F66-MM — garde-fous locaux des sondes (aucun appel de production)', () => {
  test('le corps des sondes (Buffer) part tel quel : `{`, du JSON invalide', async ({ request }) => {
    await verifierCorpsTransmis(request);
  });

  test('raison du Buffer : Playwright réécrit une CHAÎNE en JSON valide si content-type est JSON', async ({ request }) => {
    const { recus } = await avecServeurLocal((base) =>
      request.post(`${base}/echo`, { headers: { 'content-type': 'application/json' }, data: '{', failOnStatusCode: false }),
    );
    expect(recus.map((r) => r.corps)).toEqual(['"{"']);
    expect(estJsonValide(recus[0].corps)).toBe(true);
  });

  test('appelerFonction (helpers.ts) envoie une chaîne en octets bruts (text/plain), jamais réécrite en JSON', async ({ request }) => {
    // Adresse Supabase redirigée vers le serveur local le temps du test (surcharge prévue par supabasePublic).
    const avant = { url: process.env.E2E_SUPABASE_URL, anon: process.env.E2E_SUPABASE_ANON_KEY };
    try {
      const { recus } = await avecServeurLocal(async (base) => {
        process.env.E2E_SUPABASE_URL = base;
        process.env.E2E_SUPABASE_ANON_KEY = 'cle-publique-factice';
        return appelerFonction(request, 'sonde-locale', '{', 'anon');
      });
      expect(recus.length).toBe(1);
      expect(recus[0].chemin).toBe('/functions/v1/sonde-locale');
      expect(recus[0].corps).toBe('{');
      expect(estJsonValide(recus[0].corps)).toBe(false);
      expect(recus[0].enTetes['content-type']).toBe('text/plain');
    } finally {
      if (avant.url === undefined) delete process.env.E2E_SUPABASE_URL;
      else process.env.E2E_SUPABASE_URL = avant.url;
      if (avant.anon === undefined) delete process.env.E2E_SUPABASE_ANON_KEY;
      else process.env.E2E_SUPABASE_ANON_KEY = avant.anon;
    }
  });
});

test.describe('F66-MM — la clé publique ne suffit plus (sondes sûres contre l’ancienne version) @attend-deploiement', () => {
  test.beforeAll(async ({ playwright }) => {
    const contexte = await playwright.request.newContext();
    try {
      await verifierCorpsTransmis(contexte);
    } finally {
      await contexte.dispose();
    }
  });

  for (const [fonction, attendu] of Object.entries(SONDES_SURES)) {
    test(`${fonction} → ${attendu.statut} ${attendu.code ?? attendu.erreur} @attend-deploiement`, async ({ request }) => {
      verifierReponse(fonction, await sonder(request, fonction, true), attendu);
    });
  }

  test('sans aucun en-tête : 401 (ou 410 pour une retirée), jamais de succès ni d’erreur serveur @attend-deploiement', async ({ request }) => {
    const ecarts: string[] = [];
    for (const [fonction, attendu] of Object.entries(SONDES_SURES)) {
      const { statut } = await sonder(request, fonction, false);
      const admis = attendu === RETIREE ? [401, 410] : [401];
      if (!admis.includes(statut)) ecarts.push(`${fonction}=${statut}`);
    }
    expect(ecarts, 'fonctions qui ne refusent pas un appel sans en-tête').toEqual([]);
  });
});

test.describe('F66-MM — après déploiement CONFIRMÉ (E2E_F66MM_DEPLOYE=1) @attend-deploiement', () => {
  test.beforeAll(async ({ playwright }) => {
    if (process.env.E2E_F66MM_DEPLOYE !== '1') return;
    const contexte = await playwright.request.newContext();
    try {
      await verifierCorpsTransmis(contexte);
    } finally {
      await contexte.dispose();
    }
  });

  test.beforeEach(() => {
    test.skip(
      process.env.E2E_F66MM_DEPLOYE !== '1',
      "E2E_F66MM_DEPLOYE=1 seulement après vérification des versions déployées : l'ancienne version travaillerait dès l'appel",
    );
  });

  test('orphelines : liste complète lue dans le test Deno @attend-deploiement', () => {
    expect(ORPHELINES.length, 'orphelines retirées').toBe(110);
  });

  for (const [fonction, attendu] of Object.entries(SONDES_APRES_DEPLOIEMENT)) {
    test(`${fonction} → ${attendu.statut} ${attendu.code} @attend-deploiement`, async ({ request }) => {
      if (attendu === RETIREE) {
        expect(await temoinRetiree(request, fonction), `${fonction} : version retirée déployée (OPTIONS) — sinon aucune sonde`).toBe('F66-MM');
      }
      verifierReponse(fonction, await sonder(request, fonction, true), attendu);
    });
  }

  for (const fonction of ORPHELINES) {
    test(`orpheline ${fonction} → 410 RETIREE @attend-deploiement`, async ({ request }) => {
      expect(await temoinRetiree(request, fonction), `${fonction} : version retirée déployée (OPTIONS) — sinon aucune sonde`).toBe('F66-MM');
      verifierReponse(fonction, await sonder(request, fonction, true), RETIREE);
    });
  }

  test('illustrer-case : compte gratuit, item réservé à Premium → 402 avant toute lecture @attend-deploiement', async ({ request }) => {
    test.skip(!dispo(GRATUIT), 'E2E_FREE_* absents');
    const { token } = await jeton(request, GRATUIT);
    // Corps valide pour un item hors essai (IC-200) : la nouvelle version vérifie l'accès à l'item
    // avant toute lecture en base et tout appel à OpenAI.
    const r = await appelerFonction(request, 'illustrer-case', { itemCode: 'IC-200', illustration: 'Description de case pour la sonde F66-MM.' }, token);
    expect(r.status).toBe(402);
    expect(r.json?.code).toBe('PREMIUM_REQUIS');
  });
});
