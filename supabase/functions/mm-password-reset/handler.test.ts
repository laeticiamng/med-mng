// Réinitialisation du mot de passe Med MNG (14.10.2026) — tests du handler, en local, sans réseau.
//
//   deno test --no-lock --allow-env supabase/functions/mm-password-reset/handler.test.ts
//
// Un faux Supabase (table rate_limit_counters + auth.admin.generateLink) et un faux Resend (le vrai
// module _shared/mm-email.ts, avec un fetch simulé) remplacent les services : aucun appel réseau,
// aucune clé réelle. Sondes :
//   - même réponse (statut, corps) pour un compte existant et inexistant ;
//   - lien construit sur la base fixe, jamais sur Origin / Host / X-Forwarded-Host, jamais action_link ;
//   - 429 (Retry-After) à la 4e demande pour une même adresse, à la 11e pour une même IP ;
//   - 503 si le limiteur échoue, sans produire de jeton ni envoyer d'e-mail ;
//   - aucune adresse (ni jeton) dans les journaux, même quand Resend ou GoTrue la citent dans leurs erreurs.
import { assert, assertEquals, assertNotEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { envoyerEmail } from '../_shared/mm-email.ts';
import { creerHandler, empreinte, normaliserEmail } from './handler.ts';

// Expéditeur fixé (sinon repli journalisé sur l'adresse de test de Resend).
Deno.env.set('RESEND_FROM', 'contact@medmng.com');

const MAINTENANT = new Date('2026-10-14T10:20:00Z');
const JETON_HACHE = 'abc123HASHEDtoken-_xyz';
const EXISTANT = 'camille.dupont@exemple.fr';

interface Ligne {
  id: string;
  identifier: string;
  window_start: string;
  request_count: number;
  [cle: string]: unknown;
}

interface Options {
  comptes?: string[];
  limiteurEnPanne?: boolean;
  erreurGenerateLink?: boolean;
  resend?: 'ok' | 'refus' | 'panne';
  env?: Record<string, string>;
}

function monter(options: Options = {}) {
  const comptes = new Set(options.comptes ?? [EXISTANT]);
  const lignes: Ligne[] = [];
  const liens: Array<{ type: string; email: string }> = [];
  const envois: Array<{ from: string; to: string[]; subject: string; html: string }> = [];
  const requetesResend: Array<{ authorization: string | null }> = [];

  const client = {
    from: (table: string) => {
      assertEquals(table, 'rate_limit_counters');
      const filtres: Array<[string, unknown]> = [];
      const correspond = (l: Ligne) => filtres.every(([c, v]) => l[c] === v);
      let maj: Record<string, unknown> = {};
      const chaine = {
        select: () => chaine,
        eq: (c: string, v: unknown) => {
          filtres.push([c, v]);
          return chaine;
        },
        order: () => chaine,
        limit: async () =>
          options.limiteurEnPanne ? { data: null, error: { message: 'panne simulée' } } : { data: lignes.filter(correspond), error: null },
        insert: async (l: Record<string, unknown>) => {
          lignes.push({ ...(l as Omit<Ligne, 'id'>), id: `l${lignes.length}` } as Ligne);
          return { error: null };
        },
        update: (champs: Record<string, unknown>) => {
          maj = champs;
          const suite = {
            eq: (c: string, v: unknown) => {
              filtres.push([c, v]);
              return {
                ...suite,
                select: async () => {
                  const cibles = lignes.filter(correspond);
                  cibles.forEach((l) => Object.assign(l, maj));
                  return { data: cibles.map((l) => ({ request_count: l.request_count })), error: null };
                },
              };
            },
          };
          return suite;
        },
      };
      return chaine;
    },
    auth: {
      admin: {
        generateLink: async (params: { type: string; email: string }) => {
          liens.push(params);
          if (options.erreurGenerateLink) {
            return { data: { properties: null, user: null }, error: { status: 500, message: `échec pour ${params.email}` } };
          }
          if (!comptes.has(params.email)) {
            return { data: { properties: null, user: null }, error: { status: 404, code: 'user_not_found', message: `User ${params.email} not found` } };
          }
          return {
            data: {
              properties: {
                hashed_token: JETON_HACHE,
                // Porte la redirection fautive : ne doit JAMAIS apparaître dans l'e-mail.
                action_link: 'https://yaincoxihiqdksxgrsrk.supabase.co/auth/v1/verify?token=XXX&type=recovery&redirect_to=https://emotionscare.com',
                redirect_to: 'https://emotionscare.com',
              },
              user: { id: 'u1' },
            },
            error: null,
          };
        },
      },
    },
  };

  // Faux Resend : le vrai module d'envoi, avec un fetch simulé.
  const fauxResend = (_url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    requetesResend.push({ authorization: new Headers(init?.headers).get('authorization') });
    envois.push(JSON.parse(String(init?.body)));
    if (options.resend === 'refus') {
      return Promise.resolve(new Response(JSON.stringify({ name: 'validation_error', message: `adresse ${EXISTANT} refusée` }), { status: 422 }));
    }
    if (options.resend === 'panne') return Promise.reject(new TypeError('réseau simulé'));
    return Promise.resolve(new Response(JSON.stringify({ id: 'email-1' }), { status: 200 }));
  };

  const handler = creerHandler({
    creerClientService: () => client,
    envoyerEmail: (email) => envoyerEmail(email, { cle: 're_factice', fetchImpl: fauxResend as typeof fetch }),
    lireEnv: (nom) => options.env?.[nom],
    maintenant: () => MAINTENANT,
  });

  return { handler, lignes, liens, envois, requetesResend };
}

function demande(email: unknown, entetes: Record<string, string> = {}, methode = 'POST'): Request {
  return new Request('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/mm-password-reset', {
    method: methode,
    headers: { 'content-type': 'application/json', origin: 'https://medmng.com', 'x-forwarded-for': '203.0.113.7, 10.0.0.1', ...entetes },
    body: methode === 'POST' ? JSON.stringify({ email }) : undefined,
  });
}

/** Capture console.* pendant `fn` et rend les lignes écrites. */
async function avecJournaux<T>(fn: () => Promise<T>): Promise<{ resultat: T; journaux: string[] }> {
  const journaux: string[] = [];
  const originaux = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  const capter = (...args: unknown[]) => void journaux.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
  console.log = capter;
  console.warn = capter;
  console.error = capter;
  console.info = capter;
  try {
    return { resultat: await fn(), journaux };
  } finally {
    Object.assign(console, originaux);
  }
}

const lire = async (r: Response) => ({ statut: r.status, corps: await r.text() });

Deno.test('même réponse 200 { ok: true } pour un compte existant et inexistant', async () => {
  const { handler, liens, envois } = monter();
  const existant = await handler(demande(EXISTANT));
  const inexistant = await handler(demande('qa-inexistant-1@medmng-qa.exemple'));
  const a = await lire(existant);
  const b = await lire(inexistant);
  assertEquals(a, { statut: 200, corps: '{"ok":true}' });
  assertEquals(b, a);
  assertEquals(existant.headers.get('content-type'), inexistant.headers.get('content-type'));
  assertEquals(existant.headers.get('cache-control'), 'no-store');
  // Les deux comptes sont passés par generateLink ; seul le compte existant reçoit un e-mail.
  assertEquals(liens.length, 2);
  assertEquals(liens.every((l) => l.type === 'recovery'), true);
  assertEquals(envois.length, 1);
  assertEquals(envois[0].to, [EXISTANT]);
  assertEquals(envois[0].from, 'Med MNG <contact@medmng.com>');
});

Deno.test('échec de generateLink ou de Resend : même réponse, rien de plus', async () => {
  for (const options of [{ erreurGenerateLink: true }, { resend: 'refus' as const }, { resend: 'panne' as const }]) {
    const { handler } = monter(options);
    const r = await lire(await handler(demande(EXISTANT)));
    assertEquals(r, { statut: 200, corps: '{"ok":true}' });
  }
});

Deno.test('le lien est construit sur la base fixe, jamais sur Origin, Host ni action_link', async () => {
  const { handler, envois } = monter();
  await handler(demande(EXISTANT, {
    origin: 'https://evil.example',
    host: 'evil.example',
    'x-forwarded-host': 'evil.example',
    referer: 'https://evil.example/piege',
  }));
  assertEquals(envois.length, 1);
  const html = envois[0].html;
  const attendu = `https://medmng.com/med-mng/reset-password?token_hash=${JETON_HACHE}&amp;type=recovery`;
  assert(html.includes(`href="${attendu}"`), 'bouton sur la base fixe');
  assert(!html.includes('evil.example'), 'aucune trace de l’hôte de la requête');
  assert(!html.includes('emotionscare.com'), 'aucune trace de la redirection fautive');
  assert(!html.includes('supabase.co'), 'action_link non réutilisé');
  assertEquals(envois[0].subject, 'Réinitialisation de votre mot de passe Med MNG');
  assert(html.includes('Choisir un nouveau mot de passe') && html.includes('valable 1 heure') && html.includes("ignorez ce message"));
});

Deno.test('MEDMNG_SITE_URL : origine https retenue, valeur non https ou invalide ignorée', async () => {
  const cas: Array<[string, string]> = [
    ['https://preprod.medmng.com/', 'https://preprod.medmng.com'],
    ['http://preprod.medmng.com', 'https://medmng.com'],
    ['pas une url', 'https://medmng.com'],
    ['javascript:alert(1)', 'https://medmng.com'],
  ];
  for (const [valeur, base] of cas) {
    const { handler, envois } = monter({ env: { MEDMNG_SITE_URL: valeur } });
    await handler(demande(EXISTANT));
    assert(envois[0].html.includes(`href="${base}/med-mng/reset-password?token_hash=`), `${valeur} → ${base}`);
  }
});

Deno.test('429 avec Retry-After à la 4e demande pour une même adresse (casse et espaces ignorés)', async () => {
  const { handler, envois, liens } = monter();
  const variantes = [EXISTANT, EXISTANT.toUpperCase(), `  ${EXISTANT}  `];
  for (const [i, v] of variantes.entries()) {
    // IP différente à chaque appel : seule la limite par adresse est en jeu.
    const r = await handler(demande(v, { 'x-forwarded-for': `198.51.100.${i + 1}` }));
    assertEquals(r.status, 200);
  }
  const quatrieme = await handler(demande(EXISTANT, { 'x-forwarded-for': '198.51.100.9' }));
  assertEquals(quatrieme.status, 429);
  // Fenêtre = heure UTC pleine : 10:20 → 40 minutes restantes.
  assertEquals(quatrieme.headers.get('retry-after'), String(40 * 60));
  assertEquals(quatrieme.headers.get('access-control-expose-headers'), 'Retry-After');
  const corps = await quatrieme.json();
  assertEquals(corps, { ok: false, code: 'TROP_DE_DEMANDES', message: 'Trop de demandes, réessayez dans 40 minutes.', retry_after: 2400 });
  assertEquals(envois.length, 3, 'la 4e demande n’envoie rien');
  assertEquals(liens.length, 3, 'la 4e demande ne produit aucun jeton');
  // Une autre adresse n'est pas touchée ; l'heure suivante repart de zéro (autre fenêtre).
  assertEquals((await handler(demande('autre@exemple.fr', { 'x-forwarded-for': '198.51.100.20' }))).status, 200);
});

Deno.test('429 à la 11e demande depuis une même IP (première valeur de x-forwarded-for)', async () => {
  const { handler } = monter();
  for (let i = 1; i <= 10; i++) {
    const r = await handler(demande(`personne${i}@exemple.fr`, { 'x-forwarded-for': '192.0.2.50, 10.9.9.9' }));
    assertEquals(r.status, 200, `demande ${i}`);
  }
  const onzieme = await handler(demande('personne11@exemple.fr', { 'x-forwarded-for': '192.0.2.50, 10.1.1.1' }));
  assertEquals(onzieme.status, 429);
  assertEquals((await onzieme.json()).code, 'TROP_DE_DEMANDES');
  // Même adresse « de proxy » en 2e position, première valeur différente : autre IP, autre compteur.
  assertEquals((await handler(demande('personne12@exemple.fr', { 'x-forwarded-for': '192.0.2.51, 10.9.9.9' }))).status, 200);
});

Deno.test('503 si le limiteur échoue : aucun jeton produit, aucun e-mail envoyé (échec fermé)', async () => {
  const { handler, liens, envois } = monter({ limiteurEnPanne: true });
  const r = await handler(demande(EXISTANT));
  assertEquals(r.status, 503);
  assertEquals((await r.json()).code, 'VERIFICATION_IMPOSSIBLE');
  assertEquals(liens.length, 0);
  assertEquals(envois.length, 0);
});

Deno.test('compteurs : clés hachées, ni adresse ni IP en clair', async () => {
  const { handler, lignes } = monter();
  await handler(demande(EXISTANT));
  assertEquals(lignes.length, 2);
  const [ip, email] = lignes;
  assertEquals(ip.identifier, `mm-mdp-ip:${await empreinte('203.0.113.7')}`);
  assertEquals(email.identifier, `mm-mdp-email:${await empreinte(EXISTANT)}`);
  assertEquals(ip.max_requests, 10);
  assertEquals(email.max_requests, 3);
  assertEquals(email.window_start, '2026-10-14T10:00:00.000Z');
  assertEquals(email.window_end, '2026-10-14T11:00:00.000Z');
  const tout = JSON.stringify(lignes);
  assert(!tout.includes('exemple.fr') && !tout.includes('203.0.113.7'));
});

Deno.test('aucune adresse ni jeton dans les journaux, même quand les erreurs amont les citent', async () => {
  const scenarios: Array<[string, Options, string]> = [
    ['succès', {}, EXISTANT],
    ['compte inexistant (GoTrue cite l’adresse)', { comptes: [] }, EXISTANT],
    ['échec generateLink (GoTrue cite l’adresse)', { erreurGenerateLink: true }, EXISTANT],
    ['refus Resend (Resend cite l’adresse)', { resend: 'refus' }, EXISTANT],
    ['panne réseau Resend', { resend: 'panne' }, EXISTANT],
    ['limiteur en panne', { limiteurEnPanne: true }, EXISTANT],
  ];
  for (const [nom, options, email] of scenarios) {
    const { handler } = monter(options);
    const { journaux } = await avecJournaux(async () => {
      await handler(demande(email));
    });
    const texte = journaux.join('\n');
    assert(!texte.toLowerCase().includes('camille'), `${nom} : adresse dans les journaux\n${texte}`);
    assert(!texte.includes('exemple.fr'), `${nom} : domaine dans les journaux\n${texte}`);
    assert(!texte.includes(JETON_HACHE) && !texte.includes('203.0.113.7'), `${nom} : jeton ou IP dans les journaux`);
  }
  // Les échecs sont bien journalisés (sans donnée personnelle), pour l'exploitation.
  const { handler } = monter({ resend: 'refus' });
  const { journaux } = await avecJournaux(async () => {
    await handler(demande(EXISTANT));
  });
  assert(journaux.some((l) => l.includes('Resend 422 : validation_error')), journaux.join('\n'));
});

Deno.test('adresse mal formée : 400, rien n’est compté ni produit ; normalisation', async () => {
  const { handler, lignes, liens } = monter();
  const invalides: unknown[] = [undefined, null, 42, '', '   ', 'sans-arobase', 'a@b', 'a b@exemple.fr', 'a@@exemple.fr', '@exemple.fr', 'a@exemple..fr', '.a@exemple.fr', `${'x'.repeat(250)}@exemple.fr`];
  for (const v of invalides) {
    const r = await handler(demande(v));
    assertEquals(r.status, 400, JSON.stringify(v));
    assertEquals((await r.json()).code, 'EMAIL_INVALIDE');
  }
  const corpsIllisible = await handler(new Request('https://x.test/', { method: 'POST', body: 'pas du json' }));
  assertEquals(corpsIllisible.status, 400);
  const corpsGeant = await handler(demande(`${'a'.repeat(5000)}@exemple.fr`));
  assertEquals(corpsGeant.status, 400);
  assertEquals(lignes.length, 0);
  assertEquals(liens.length, 0);
  assertEquals(normaliserEmail('  Camille.Dupont@Exemple.FR '), EXISTANT);
});

Deno.test('adresse à domaine réservé : comptée, 200, aucun jeton ni e-mail ; la limite s’applique quand même', async () => {
  const { handler, liens, envois } = monter();
  const adresse = 'qa-inexistant-1@medmng-qa.invalid';
  for (let i = 1; i <= 3; i++) {
    const r = await handler(demande(adresse, { 'x-forwarded-for': `198.51.100.${i}` }));
    assertEquals(await lire(r), { statut: 200, corps: '{"ok":true}' });
  }
  assertEquals((await handler(demande(adresse, { 'x-forwarded-for': '198.51.100.99' }))).status, 429);
  assertEquals(liens.length + envois.length, 0);
});

Deno.test('CORS : préflight depuis medmng.com, méthode autre que POST refusée', async () => {
  const { handler } = monter();
  const pre = await handler(demande(null, { origin: 'https://medmng.com' }, 'OPTIONS'));
  assertEquals(pre.status, 200);
  assertEquals(pre.headers.get('access-control-allow-origin'), 'https://medmng.com');
  const lovable = await handler(demande(EXISTANT, { origin: 'https://apercu--med-mng.lovable.app' }));
  assertEquals(lovable.headers.get('access-control-allow-origin'), 'https://apercu--med-mng.lovable.app');
  const evil = await handler(demande(EXISTANT, { origin: 'https://evil.example' }));
  assertNotEquals(evil.headers.get('access-control-allow-origin'), 'https://evil.example');
  const get = await handler(demande(null, {}, 'GET'));
  assertEquals(get.status, 405);
});
