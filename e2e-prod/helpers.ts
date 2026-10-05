import { expect, type APIRequestContext, type Page } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';

/**
 * Outils partagés de la suite E2E de production Med MNG.
 * Identifiants : UNIQUEMENT par variables d'environnement (jamais dans le dépôt, jamais affichés).
 */
export const BASE = (process.env.E2E_BASE_URL ?? 'https://medmng.com').replace(/\/$/, '');

export interface Compte {
  email: string;
  password: string;
}
/** Compte GRATUIT confirmé (verrous Premium, Stripe Checkout, connexion/déconnexion). */
export const GRATUIT: Compte = { email: process.env.E2E_FREE_EMAIL ?? '', password: process.env.E2E_FREE_PASSWORD ?? '' };
/** Compte PREMIUM (abonnement actif ou en essai) : contenu des 367 items, bibliothèque, portail. */
export const PREMIUM: Compte = { email: process.env.E2E_PREMIUM_EMAIL ?? '', password: process.env.E2E_PREMIUM_PASSWORD ?? '' };
export const dispo = (c: Compte) => Boolean(c.email && c.password);

/** États de session (cookies + localStorage) : hors du dépôt, supprimés par global-teardown. */
export const DOSSIER_SESSIONS = path.join(process.env.E2E_OUTPUT_DIR ?? os.tmpdir(), 'medmng-e2e-prod-sessions');
export const session = (nom: 'gratuit' | 'premium') => path.join(DOSSIER_SESSIONS, `${nom}.json`);

/** Connexion par le formulaire, comme une personne. */
export async function seConnecter(page: Page, compte: Compte, suivant?: string) {
  await page.goto(suivant ? `/med-mng/login?next=${encodeURIComponent(suivant)}` : '/med-mng/login');
  await page.locator('#email').fill(compte.email);
  await page.locator('#password').fill(compte.password);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/med-mng/login'), { timeout: 30_000 });
}

/**
 * Ferme le bandeau cookies (il masque le bas de l'écran sur mobile) en refusant la mesure d'audience.
 * « Refuser la mesure » depuis la vague 3 ; « Essentiels » sur l'ancienne version.
 */
export async function fermerCookies(page: Page) {
  const bouton = page.getByRole('button', { name: /^(Refuser la mesure|Essentiels)$/ });
  if (await bouton.first().isVisible().catch(() => false)) await bouton.first().click();
}

/**
 * Texte visible d'une zone, espaces normalisés, lu APRÈS l'apparition de `attendu`
 * (les pages sont chargées à la demande : lire trop tôt rend une page vide).
 */
export async function texte(page: Page, attendu: string | RegExp, selecteur = 'main'): Promise<string> {
  const zone = page.locator(selecteur).first();
  await expect(zone).toContainText(attendu, { timeout: 30_000 });
  return ((await zone.innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
}

/**
 * Erreurs visibles côté navigateur : console « error », exceptions JS, réponses 4xx/5xx du site
 * et de Supabase. `ignorer` : motifs attendus pour un test donné.
 * Ignorés par défaut : le WebSocket temps réel (coupé par certains proxys) et l'avertissement
 * de React Router sur les futures options.
 */
const IGNORES_PAR_DEFAUT = [/realtime\/v1\/websocket/i, /WebSocket connection/i, /React Router Future Flag/i];
export function surveillerErreurs(page: Page, ignorer: RegExp[] = []) {
  const erreurs: string[] = [];
  const motifs = [...IGNORES_PAR_DEFAUT, ...ignorer];
  const garder = (s: string) => {
    if (!motifs.some((re) => re.test(s))) erreurs.push(s);
  };
  // Un page.goto() pendant un chargement interrompt les requêtes de la page précédente
  // (net::ERR_ABORTED) et supabase-js écrit alors « TypeError: Failed to fetch » : artefact du
  // test, pas un défaut. Les autres échecs réseau (CORS, DNS, refus…) restent des erreurs.
  let interrompues = 0;
  page.on('requestfailed', (r) => {
    const raison = r.failure()?.errorText ?? '';
    if (raison === 'net::ERR_ABORTED') interrompues++;
    else garder(`échec réseau: ${raison} ${r.method()} ${r.url().slice(0, 120)}`);
  });
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (interrompues > 0 && /Failed to fetch/.test(m.text())) return;
    garder(`console: ${m.text().slice(0, 240)}`);
  });
  page.on('pageerror', (e) => garder(`exception: ${e.message.slice(0, 240)}`));
  page.on('response', (r) => {
    const url = new URL(r.url());
    const surveille = url.host === new URL(BASE).host || url.host.endsWith('.supabase.co');
    if (surveille && r.status() >= 400) garder(`${r.status()} ${r.request().method()} ${url.pathname}${url.search.slice(0, 80)}`);
  });
  return erreurs;
}

export async function sansDebordementHorizontal(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
}

/**
 * Adresse et clé PUBLIQUE (anon) Supabase, lues dans le JavaScript servi aux navigateurs :
 * aucun secret nécessaire. Surcharge possible : E2E_SUPABASE_URL / E2E_SUPABASE_ANON_KEY.
 * Jamais affichées ni écrites.
 */
let cacheSupabase: { url: string; anon: string } | null = null;
export async function supabasePublic(request: APIRequestContext): Promise<{ url: string; anon: string }> {
  if (process.env.E2E_SUPABASE_URL && process.env.E2E_SUPABASE_ANON_KEY) {
    return { url: process.env.E2E_SUPABASE_URL, anon: process.env.E2E_SUPABASE_ANON_KEY };
  }
  if (cacheSupabase) return cacheSupabase;
  const html = await (await request.get(`${BASE}/`)).text();
  const principal = html.match(/\/assets\/index-[\w-]+\.js/)?.[0];
  if (!principal) throw new Error('Bundle principal introuvable dans la page d’accueil.');
  const js = await (await request.get(`${BASE}${principal}`)).text();
  const url = js.match(/https:\/\/[a-z0-9]{20}\.supabase\.co/)?.[0];
  const anon = js.match(/eyJhbGciOi[\w-]+\.[\w-]+\.[\w-]+|sb_publishable_[\w-]+/)?.[0];
  if (!url || !anon) throw new Error('Configuration publique Supabase introuvable (définir E2E_SUPABASE_URL / E2E_SUPABASE_ANON_KEY).');
  cacheSupabase = { url, anon };
  return cacheSupabase;
}

/** Jeton d'accès (connexion par mot de passe), gardé en mémoire uniquement. */
export async function jeton(request: APIRequestContext, compte: Compte): Promise<{ token: string; userId: string }> {
  const sb = await supabasePublic(request);
  const r = await request.post(`${sb.url}/auth/v1/token?grant_type=password`, {
    headers: { apikey: sb.anon, 'content-type': 'application/json' },
    data: { email: compte.email, password: compte.password },
  });
  expect(r.status(), 'connexion API').toBe(200);
  const corps = (await r.json()) as { access_token: string; user: { id: string } };
  return { token: corps.access_token, userId: corps.user.id };
}

/**
 * Appel d'une fonction Edge ; `auth` : null = aucun en-tête, 'anon' = clé publique seule, sinon un jeton.
 * `corps` chaîne = envoyé tel quel : les sondes utilisent un JSON INVALIDE (« { ») pour qu'aucune
 * fonction ne puisse dépasser la lecture du corps, donc ne déclencher aucune génération payante,
 * même si son contrôle d'accès venait à manquer.
 */
export async function appelerFonction(
  request: APIRequestContext,
  nom: string,
  corps: unknown,
  auth: null | 'anon' | string,
): Promise<{ status: number; json: Record<string, unknown> | null }> {
  const sb = await supabasePublic(request);
  // Corps chaîne : envoyé en text/plain pour qu'il parte TEL QUEL. En application/json, Playwright
  // convertit une chaîne non-JSON en chaîne JSON valide (« "{" ») : la sonde devenait un corps valide
  // et des fonctions sans contrôle d'accès ont généré du contenu (incident du 04.10.2026, rapport).
  // Vérifié contre un serveur local (f66mm.spec.ts, « garde-fous locaux ») : octets reçus exactement
  // « { », content-type text/plain ; et une chaîne envoyée en application/json arrive bien « "{" ».
  const headers: Record<string, string> = { 'content-type': typeof corps === 'string' ? 'text/plain' : 'application/json' };
  if (auth === 'anon') {
    headers.apikey = sb.anon;
    headers.authorization = `Bearer ${sb.anon}`;
  } else if (auth) {
    headers.apikey = sb.anon;
    headers.authorization = `Bearer ${auth}`;
  }
  const r = await request.post(`${sb.url}/functions/v1/${nom}`, { headers, data: corps, timeout: 25_000 });
  let json: Record<string, unknown> | null = null;
  try {
    json = (await r.json()) as Record<string, unknown>;
  } catch {
    json = null;
  }
  return { status: r.status(), json };
}

/** Requête REST / RPC PostgREST avec la clé publique (et un jeton utilisateur facultatif). */
export async function rest(
  request: APIRequestContext,
  chemin: string,
  options: { token?: string; methode?: 'GET' | 'POST'; corps?: unknown } = {},
) {
  const sb = await supabasePublic(request);
  const headers: Record<string, string> = { apikey: sb.anon, authorization: `Bearer ${options.token ?? sb.anon}`, 'content-type': 'application/json' };
  const url = `${sb.url}/rest/v1/${chemin}`;
  const r = options.methode === 'POST' ? await request.post(url, { headers, data: options.corps ?? {} }) : await request.get(url, { headers });
  let json: unknown = null;
  try {
    json = await r.json();
  } catch {
    json = null;
  }
  return { status: r.status(), json };
}
