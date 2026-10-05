// Non-régression F66-MM (05.10.2026) — DÉMARRAGE RÉEL de chaque fonction de la vague, en local.
//
//   F66MM_DEMARRAGE=1 deno test --no-lock --allow-run --allow-env --allow-read \
//     --allow-net=127.0.0.1,0.0.0.0,localhost \
//     supabase/functions/_shared/f66mm_demarrage.test.ts
//   (les modules distants sont téléchargés au premier lancement, par le mandataire HTTPS éventuel)
//
// POURQUOI : `deno check` ne prouve pas qu'une fonction démarre (modules distants résolus au
// lancement, fichiers @ts-nocheck). Chaque fonction est lancée seule (port 8000, celui de
// serve()/Deno.serve), avec des clés FACTICES et une URL Supabase injoignable (127.0.0.1:9) ;
// le sous-processus ne peut joindre que le réseau local (--allow-net) : aucun fournisseur.
// Corps `{` brut (JSON invalide). Aucun appel à la production, aucun fournisseur joignable.
//
// Attendu :
//   retirée          → 410 RETIREE + témoin x-mm-fonction-retiree (OPTIONS compris)
//   administrateur   → 401 AUTH_REQUISE sans en-tête ET avec une clé publique (factice)
//   connexion_item   → 401 AUTH_REQUISE
//   rappel_signe     → 401 sans URL signée ; URL signée + corps invalide → 400 (signature acceptée,
//                      corps lu ensuite) ; URL signée + génération introuvable → 403 sans écriture
//   mm-generate-music (modifiée : URL de rappel signée) → 401 AUTH_REQUISE avant le corps
import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { signerUrlRappel } from './mm-suno-rappel.ts';

const ACTIF = Deno.env.get('F66MM_DEMARRAGE') === '1';
const RACINE = new URL('../', import.meta.url);
const PORT = 8000;
const CLE_SERVICE_FACTICE = 'cle-de-service-factice-0123456789';

/** Règles lues dans f66mm_regles.test.ts (source unique), sans importer ses tests. */
function lireRegles(): Record<string, string> {
  const source = Deno.readTextFileSync(new URL('./f66mm_regles.test.ts', import.meta.url));
  const bloc = source.match(/export const REGLES_F66MM: Record<string, Regle> = \{([\s\S]*?)\n\};/);
  const mm = source.match(/export const ORPHELINES_MED_MNG: string\[\] = \[([\s\S]*?)\];/);
  const sans = source.match(/export const ORPHELINES_SANS_ORIGINE: string\[\] = \[([\s\S]*?)\];/);
  if (!bloc || !mm || !sans) throw new Error('listes F66-MM introuvables dans f66mm_regles.test.ts');
  const regles: Record<string, string> = {};
  for (const m of bloc[1].matchAll(/'([a-z0-9_-]+)':\s*'([a-z_]+)'/g)) regles[m[1]] = m[2];
  for (const m of `${mm[1]}${sans[1]}`.matchAll(/'([a-z0-9_-]+)'/g)) regles[m[1]] = 'retiree';
  return regles;
}

const ENV_FACTICE: Record<string, string> = {
  SUPABASE_URL: 'http://127.0.0.1:9',
  SUPABASE_ANON_KEY: 'cle-anon-factice',
  SUPABASE_SERVICE_ROLE_KEY: CLE_SERVICE_FACTICE,
  OPENAI_API_KEY: 'factice',
  LOVABLE_API_KEY: 'factice',
  SUNO_API_KEY: 'factice-factice',
  ELEVENLABS_API_KEY: 'factice',
  PERPLEXITY_API_KEY: 'factice',
  FIRECRAWL_API_KEY: 'factice',
  STRIPE_SECRET_KEY: 'factice',
  RESEND_API_KEY: 're_factice',
  ADMIN_EMAIL: 'admin@exemple.invalid',
  HOME: Deno.env.get('HOME') ?? '/tmp',
  DENO_DIR: Deno.env.get('DENO_DIR') ?? '',
  DENO_CERT: Deno.env.get('DENO_CERT') ?? '',
};
// Mandataire pour le téléchargement des modules (le réseau local reste direct : NO_PROXY).
for (const nom of ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy', 'NO_PROXY', 'no_proxy']) {
  const valeur = Deno.env.get(nom);
  if (valeur) ENV_FACTICE[nom] = valeur;
}

interface Reponse { statut: number; corps: string; temoin: string | null }

async function appeler(chemin: string, init: RequestInit, delaiMs = 5_000): Promise<Reponse | null> {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}${chemin}`, { ...init, signal: AbortSignal.timeout(delaiMs) });
    return { statut: r.status, corps: await r.text(), temoin: r.headers.get('x-mm-fonction-retiree') };
  } catch {
    return null;
  }
}

/** Lance la fonction, attend qu'elle réponde, exécute `sondes`, puis l'arrête. */
async function avecFonction(fonction: string, sondes: () => Promise<void>): Promise<string> {
  const processus = new Deno.Command(Deno.execPath(), {
    args: [
      'run', '--no-lock', '--allow-env', '--allow-read', '--allow-sys',
      '--allow-net=127.0.0.1,0.0.0.0,localhost',
      new URL(`${fonction}/index.ts`, RACINE).pathname,
    ],
    clearEnv: true,
    env: ENV_FACTICE,
    stdout: 'null',
    stderr: 'piped',
  }).spawn();
  try {
    let pret = false;
    const limite = Date.now() + 45_000;
    while (!pret && Date.now() < limite) {
      await new Promise((ok) => setTimeout(ok, 300));
      pret = (await appeler(`/${fonction}`, { method: 'OPTIONS' })) !== null;
    }
    if (pret) await sondes();
    else throw new Error('la fonction ne répond pas');
  } finally {
    try {
      processus.kill('SIGKILL');
    } catch {
      // déjà arrêtée (échec de démarrage)
    }
  }
  const sortie = await processus.output().catch(() => null);
  return sortie ? new TextDecoder().decode(sortie.stderr).slice(0, 600) : '';
}

const code = (corps: string) => {
  try {
    return (JSON.parse(corps) as { code?: string }).code;
  } catch {
    return undefined;
  }
};
const erreur = (corps: string) => {
  try {
    return (JSON.parse(corps) as { error?: string }).error;
  } catch {
    return undefined;
  }
};
const CORPS_INVALIDE: RequestInit = { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' };
const avecCle = (cle: string): RequestInit => ({
  ...CORPS_INVALIDE,
  headers: { 'content-type': 'application/json', apikey: cle, authorization: `Bearer ${cle}` },
});

const REGLES = lireRegles();

Deno.test({
  name: 'F66-MM démarrage : 142 fonctions, listes lues dans f66mm_regles.test.ts',
  ignore: !ACTIF,
  fn() {
    assertEquals(Object.keys(REGLES).length, 142);
  },
});

for (const [fonction, regle] of Object.entries(REGLES)) {
  Deno.test({
    name: `F66-MM démarrage : ${fonction} (${regle})`,
    ignore: !ACTIF,
    sanitizeResources: false,
    sanitizeOps: false,
    async fn() {
      const echecs: string[] = [];
      const journal = await avecFonction(fonction, async () => {
        const verifier = (libelle: string, r: Reponse | null, statut: number, attendu?: (corps: string) => boolean) => {
          if (!r) echecs.push(`${libelle} : aucune réponse`);
          else if (r.statut !== statut || (attendu && !attendu(r.corps))) echecs.push(`${libelle} : ${r.statut} ${r.corps.slice(0, 160)}`);
        };
        if (regle === 'retiree') {
          const options = await appeler(`/${fonction}`, { method: 'OPTIONS' });
          if (options?.temoin !== 'F66-MM') echecs.push('OPTIONS sans témoin x-mm-fonction-retiree');
          const r = await appeler(`/${fonction}`, CORPS_INVALIDE);
          verifier('sans en-tête', r, 410, (c) => code(c) === 'RETIREE');
          if (r && r.temoin !== 'F66-MM') echecs.push('410 sans témoin x-mm-fonction-retiree');
          verifier('clé publique', await appeler(`/${fonction}`, avecCle('cle-anon-factice')), 410, (c) => code(c) === 'RETIREE');
        } else if (regle === 'administrateur' || regle === 'connexion_item') {
          verifier('sans en-tête', await appeler(`/${fonction}`, CORPS_INVALIDE), 401, (c) => code(c) === 'AUTH_REQUISE');
          // Clé publique : la garde interroge l'authentification (injoignable ici) avant de refuser.
          verifier('clé publique', await appeler(`/${fonction}`, avecCle('cle-anon-factice'), 30_000), 401, (c) => code(c) === 'AUTH_REQUISE');
        } else if (regle === 'rappel_signe') {
          verifier('URL non signée', await appeler(`/${fonction}`, CORPS_INVALIDE), 401, (c) => erreur(c) === 'Rappel non authentifié.');
          const signee = await signerUrlRappel('http://127.0.0.1', '0f8fad5b-d9cb-469f-a165-70867728950e', CLE_SERVICE_FACTICE);
          const chemin = new URL(signee).pathname.replace('/functions/v1', '');
          verifier('URL signée, corps invalide', await appeler(chemin, CORPS_INVALIDE), 400, (c) => erreur(c) === 'Corps JSON invalide');
          verifier('URL falsifiée', await appeler(chemin.replace('0f8fad5b', '0f8fad5c'), CORPS_INVALIDE), 401);
          const rappel = { code: 200, msg: 'success', data: { callbackType: 'complete', task_id: 'tache-inconnue', data: [] } };
          verifier(
            'URL signée, génération introuvable',
            // La lecture de la génération vise une base injoignable : supabase-js abandonne en quelques secondes.
            await appeler(chemin, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(rappel) }, 30_000),
            403,
          );
        } else {
          echecs.push(`règle inconnue ${regle}`);
        }
      });
      assertEquals(echecs, [], `${fonction} (journal : ${journal})`);
    },
  });
}

Deno.test({
  name: 'F66-MM démarrage : mm-generate-music (URL de rappel signée) démarre et refuse sans compte avant le corps',
  ignore: !ACTIF,
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    let r: Reponse | null = null;
    const journal = await avecFonction('mm-generate-music', async () => {
      r = await appeler('/mm-generate-music', CORPS_INVALIDE);
    });
    const reponse = r as Reponse | null;
    assertEquals(reponse?.statut, 401, `journal : ${journal}`);
    assertEquals(code(reponse?.corps ?? ''), 'AUTH_REQUISE');
  },
});
