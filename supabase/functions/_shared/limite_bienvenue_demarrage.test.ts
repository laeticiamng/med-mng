// Vague « limites d'usage » (05.10.2026) — DÉMARRAGE RÉEL de send-welcome-email, en local.
//
//   LIMITE_DEMARRAGE=1 deno test --no-lock --allow-run --allow-env --allow-read \
//     --allow-net=127.0.0.1,0.0.0.0,localhost,deno.land,esm.sh \
//     supabase/functions/_shared/limite_bienvenue_demarrage.test.ts
//
// Un faux Supabase local (GoTrue + PostgREST minimaux) répond à l'identification et à la table
// `rate_limit_counters`. La fonction est lancée seule, clés FACTICES, réseau limité au faux Supabase
// et au téléchargement des modules : un envoi Resend échouerait (permission refusée) et la réponse
// serait 502/500. Sondes :
//   compte créé à l'instant, compteur au maximum → 429 QUOTA_JOURNALIER, sans envoi ;
//   compte créé à l'instant, compteur illisible  → 503 VERIFICATION_IMPOSSIBLE, sans envoi ;
//   compte ancien (> 15 min)                     → 200 { envoye: false }, compteur non consulté.
// Aucun appel à la production, aucun fournisseur joignable.
import { assert, assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';

const ACTIF = Deno.env.get('LIMITE_DEMARRAGE') === '1';
const RACINE = new URL('../', import.meta.url);
const PORT_SUPABASE = 54398;
const JETON = 'jeton-de-test-bienvenue';

let mode: 'plein' | 'illisible' = 'plein';
let creeLe = new Date().toISOString();
const consultations: string[] = [];

function json(corps: unknown, status = 200): Response {
  return new Response(JSON.stringify(corps), { status, headers: { 'Content-Type': 'application/json' } });
}

function fauxSupabase(req: Request): Response {
  const url = new URL(req.url);
  if (url.pathname === '/auth/v1/user') {
    if ((req.headers.get('authorization') ?? '') !== `Bearer ${JETON}`) return json({ message: 'invalid JWT' }, 401);
    return json({
      id: '00000000-0000-4000-8000-0000000000bb', aud: 'authenticated', role: 'authenticated',
      email: 'personne@exemple.test', app_metadata: {}, user_metadata: {}, created_at: creeLe,
    });
  }
  if (url.pathname === '/rest/v1/rate_limit_counters') {
    consultations.push(`${req.method} ${url.searchParams.get('identifier') ?? ''}`);
    if (mode === 'illisible') return json({ message: 'erreur simulée' }, 500);
    if (req.method === 'GET') return json([{ id: 'compteur', request_count: 1_000_000 }]);
    return json([], 201);
  }
  return json({ message: 'non simulé' }, 404);
}

async function appeler(): Promise<{ statut: number; corps: string }> {
  const r = await fetch('http://127.0.0.1:8000/', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${JETON}`, origin: 'https://medmng.com' },
    body: JSON.stringify({ name: 'Camille' }),
    signal: AbortSignal.timeout(15_000),
  });
  return { statut: r.status, corps: await r.text() };
}

Deno.test({
  name: 'send-welcome-email démarre : 429 au-delà de la limite, 503 si compteur illisible, aucun envoi ; compte ancien sans compteur',
  ignore: !ACTIF,
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const serveur = Deno.serve({ port: PORT_SUPABASE, hostname: '127.0.0.1', onListen() {} }, fauxSupabase);
    const processus = new Deno.Command(Deno.execPath(), {
      args: [
        'run', '--no-lock', '--allow-env', '--allow-read', '--allow-sys',
        '--allow-net=127.0.0.1,0.0.0.0,localhost,deno.land,esm.sh',
        new URL('send-welcome-email/index.ts', RACINE).pathname,
      ],
      env: {
        SUPABASE_URL: `http://127.0.0.1:${PORT_SUPABASE}`,
        SUPABASE_SERVICE_ROLE_KEY: 'cle-service-factice',
        SUPABASE_ANON_KEY: 'cle-anon-factice',
        RESEND_API_KEY: 're_factice',
        ALLOWED_ORIGINS: 'https://medmng.com',
      },
      stdout: 'null',
      stderr: 'piped',
    }).spawn();
    try {
      let pret = false;
      for (let i = 0; i < 150 && !pret; i++) {
        await new Promise((ok) => setTimeout(ok, 400));
        try {
          await fetch('http://127.0.0.1:8000/', { method: 'OPTIONS' }).then((r) => r.body?.cancel());
          pret = true;
        } catch {
          // pas encore prêt
        }
      }
      assert(pret, 'la fonction ne démarre pas');

      creeLe = new Date().toISOString();
      mode = 'plein';
      const plein = await appeler();
      assertEquals(plein.statut, 429, plein.corps);
      const refus = JSON.parse(plein.corps);
      assertEquals(refus.code, 'QUOTA_JOURNALIER');
      assertEquals(refus.message, 'Vous avez atteint la limite quotidienne de 2 e-mails de bienvenue ; elle repart demain.');

      mode = 'illisible';
      const illisible = await appeler();
      assertEquals(illisible.statut, 503, illisible.corps);
      assertEquals(JSON.parse(illisible.corps).code, 'VERIFICATION_IMPOSSIBLE');
      assert(consultations.length >= 2 && consultations.every((c) => c.includes('mm-bienvenue:')), consultations.join(' | '));

      const avant = consultations.length;
      creeLe = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const ancien = await appeler();
      assertEquals(ancien.statut, 200, ancien.corps);
      assertEquals(JSON.parse(ancien.corps).envoye, false);
      assertEquals(consultations.length, avant, 'compte ancien : compteur non consulté');
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
