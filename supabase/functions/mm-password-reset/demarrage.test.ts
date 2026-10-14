// Réinitialisation du mot de passe Med MNG (14.10.2026) — DÉMARRAGE RÉEL de mm-password-reset, en local.
//
//   MDP_DEMARRAGE=1 deno test --no-lock --allow-run --allow-env --allow-read \
//     --allow-net=127.0.0.1,0.0.0.0,localhost,deno.land,esm.sh \
//     supabase/functions/mm-password-reset/demarrage.test.ts
//
// Pour tester index.ts (point d'entrée réel, vrai client Supabase, vrai Deno.serve) : un faux
// Supabase local (PostgREST minimal : rpc mm_reserver_reinit_mdp + GoTrue admin) répond ; la fonction est
// lancée seule, clés FACTICES, réseau limité au faux Supabase et au téléchargement des modules. Resend
// n'est pas joignable : l'e-mail ne part pas, la réponse reste 200 (anti-énumération). Sondes :
//   compte inexistant → 200 { ok: true } ; 4e demande avec la même adresse → 429 ; compteur illisible → 503.
// Aucun appel à la production. DENO_IMPORT_MAP : import map facultative (environnements sans esm.sh).
import { assert, assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';

const ACTIF = Deno.env.get('MDP_DEMARRAGE') === '1';
const RACINE = new URL('../', import.meta.url);
const PORT_SUPABASE = 54397;
const PORT_FONCTION = 8000; // port par défaut de Deno.serve

let illisible = false;
const compteurs = new Map<string, number>();
let generations = 0;

const json = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), { status, headers: { 'Content-Type': 'application/json' } });

async function fauxSupabase(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname === '/auth/v1/admin/generate_link') {
    generations++;
    return json({ code: 404, error_code: 'user_not_found', msg: 'User not found' }, 404);
  }
  if (url.pathname === '/rest/v1/rpc/mm_reserver_reinit_mdp' && req.method === 'POST') {
    if (illisible) return json({ message: 'erreur simulée' }, 500);
    const { p_cle, p_max } = await req.json();
    const nombre = compteurs.get(p_cle) ?? 0;
    if (nombre >= p_max) return json(false);
    compteurs.set(p_cle, nombre + 1);
    return json(true);
  }
  return json({ message: 'non simulé' }, 404);
}

async function appeler(email: string): Promise<{ statut: number; corps: string }> {
  const r = await fetch(`http://127.0.0.1:${PORT_FONCTION}/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://medmng.com', 'x-forwarded-for': '203.0.113.9' },
    body: JSON.stringify({ email }),
    signal: AbortSignal.timeout(15_000),
  });
  return { statut: r.status, corps: await r.text() };
}

Deno.test({
  name: 'mm-password-reset démarre : 200 identique pour un compte inexistant, 429 à la 4e demande, 503 si le compteur est illisible',
  ignore: !ACTIF,
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const serveur = Deno.serve({ port: PORT_SUPABASE, hostname: '127.0.0.1', onListen() {} }, fauxSupabase);
    const carte = Deno.env.get('DENO_IMPORT_MAP');
    const processus = new Deno.Command(Deno.execPath(), {
      args: [
        'run', '--no-lock', '--allow-env', '--allow-read', '--allow-sys',
        '--allow-net=127.0.0.1,0.0.0.0,localhost,deno.land,esm.sh',
        ...(carte ? [`--import-map=${carte}`, '--node-modules-dir=none'] : []),
        new URL('mm-password-reset/index.ts', RACINE).pathname,
      ],
      env: {
        SUPABASE_URL: `http://127.0.0.1:${PORT_SUPABASE}`,
        SUPABASE_SERVICE_ROLE_KEY: 'cle-service-factice',
        RESEND_API_KEY: 're_factice',
        RESEND_FROM: 'contact@medmng.com',
      },
      stdout: 'null',
      stderr: 'piped',
    }).spawn();
    try {
      let pret = false;
      for (let i = 0; i < 150 && !pret; i++) {
        await new Promise((ok) => setTimeout(ok, 400));
        try {
          await fetch(`http://127.0.0.1:${PORT_FONCTION}/`, { method: 'OPTIONS' }).then((r) => r.body?.cancel());
          pret = true;
        } catch {
          // pas encore prêt
        }
      }
      assert(pret, 'la fonction ne démarre pas');

      const adresse = `qa-inexistant-${Date.now()}@medmng-qa.exemple`;
      for (let i = 1; i <= 3; i++) {
        const r = await appeler(adresse);
        assertEquals(r, { statut: 200, corps: '{"ok":true}' }, `demande ${i}`);
      }
      // generateLink se fait en tâche de fond, après la réponse : on attend qu'il ait eu lieu 3 fois.
      for (let i = 0; i < 50 && generations < 3; i++) await new Promise((ok) => setTimeout(ok, 100));
      assertEquals(generations, 3);
      const quatrieme = await appeler(adresse);
      assertEquals(quatrieme.statut, 429, quatrieme.corps);
      assertEquals(JSON.parse(quatrieme.corps).code, 'TROP_DE_DEMANDES');
      await new Promise((ok) => setTimeout(ok, 500));
      assertEquals(generations, 3, 'la 4e demande ne produit aucun jeton');

      illisible = true;
      const panne = await appeler('autre@medmng-qa.exemple');
      assertEquals(panne.statut, 503, panne.corps);
      assertEquals(JSON.parse(panne.corps).code, 'VERIFICATION_IMPOSSIBLE');
    } finally {
      try {
        processus.kill('SIGKILL');
      } catch {
        // déjà arrêté
      }
      await processus.output().catch(() => null);
      await serveur.shutdown();
    }
  },
});
