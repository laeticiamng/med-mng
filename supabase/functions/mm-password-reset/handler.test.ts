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
import { creerHandler, empreinte, ipAppelant, normaliserEmail } from './handler.ts';

// Expéditeur fixé (sinon repli journalisé sur l'adresse de test de Resend).
Deno.env.set('RESEND_FROM', 'contact@medmng.com');

const MAINTENANT = new Date('2026-10-14T10:20:00Z');
const JETON_HACHE = 'abc123HASHEDtoken-_xyz';
const EXISTANT = 'camille.dupont@exemple.fr';

interface Reservation {
  p_cle: string;
  p_max: number;
  p_fenetre: string;
}

interface Options {
  comptes?: string[];
  limiteurEnPanne?: boolean;
  erreurGenerateLink?: boolean;
  resend?: 'ok' | 'refus' | 'panne';
  env?: Record<string, string>;
  /** Retarde volontairement generateLink / l'envoi Resend jusqu'à la résolution de ces promesses. */
  retardGenerateLink?: Promise<void>;
  retardResend?: Promise<void>;
}

function monter(options: Options = {}) {
  const comptes = new Set(options.comptes ?? [EXISTANT]);
  const appels: Reservation[] = [];
  const liens: Array<{ type: string; email: string }> = [];
  const envois: Array<{ from: string; to: string[]; subject: string; html: string }> = [];
  const requetesResend: Array<{ authorization: string | null }> = [];

  // Faux mm_reserver_reinit_mdp : atomique (un seul pas synchrone, comme l'instruction SQL), compteur par clé.
  const compteurs = new Map<string, number>();
  const client = {
    rpc: async (nom: string, args: Reservation) => {
      assertEquals(nom, 'mm_reserver_reinit_mdp');
      appels.push(args);
      if (options.limiteurEnPanne) return { data: null, error: { message: 'panne simulée' } };
      const nombre = compteurs.get(args.p_cle) ?? 0;
      if (nombre >= args.p_max) return { data: false, error: null };
      compteurs.set(args.p_cle, nombre + 1);
      return { data: true, error: null };
    },
    auth: {
      admin: {
        generateLink: async (params: { type: string; email: string }) => {
          liens.push(params);
          await options.retardGenerateLink;
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
  const fauxResend = async (_url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    requetesResend.push({ authorization: new Headers(init?.headers).get('authorization') });
    envois.push(JSON.parse(String(init?.body)));
    await options.retardResend;
    envoisTermines++;
    if (options.resend === 'refus') {
      return new Response(JSON.stringify({ name: 'validation_error', message: `adresse ${EXISTANT} refusée` }), { status: 422 });
    }
    if (options.resend === 'panne') throw new TypeError('réseau simulé');
    return new Response(JSON.stringify({ id: 'email-1' }), { status: 200 });
  };

  // Tâches de fond (en production : EdgeRuntime.waitUntil). `attendre()` les laisse se terminer.
  const taches: Array<Promise<void>> = [];
  let envoisTermines = 0;
  const brut = creerHandler({
    creerClientService: () => client,
    envoyerEmail: (email) => envoyerEmail(email, { cle: 're_factice', fetchImpl: fauxResend as typeof fetch }),
    lireEnv: (nom) => options.env?.[nom],
    maintenant: () => MAINTENANT,
    enArrierePlan: (tache) => void taches.push(tache),
  });
  const attendre = async () => {
    await Promise.all(taches);
  };
  // Par défaut, la réponse n'est rendue qu'une fois la tâche de fond terminée (assertions simples) ;
  // `brut` donne la réponse dès qu'elle part, pour mesurer ce qui est fait avant elle.
  const handler = async (req: Request): Promise<Response> => {
    const reponse = await brut(req);
    await attendre();
    return reponse;
  };

  return { handler, brut, attendre, appels, liens, envois, requetesResend, envoisTermines: () => envoisTermines };
}

function demande(email: unknown, entetes: Record<string, string> = {}, methode = 'POST'): Request {
  return new Request('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/mm-password-reset', {
    method: methode,
    headers: { 'content-type': 'application/json', origin: 'https://medmng.com', 'x-forwarded-for': '1.2.3.4, 203.0.113.7', ...entetes },
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
  const attendu = `https://medmng.com/med-mng/reset-password#token_hash=${JETON_HACHE}&amp;type=recovery`;
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
    assert(envois[0].html.includes(`href="${base}/med-mng/reset-password#token_hash=`), `${valeur} → ${base}`);
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

Deno.test('429 à la 11e demande depuis une même IP (dernière valeur de x-forwarded-for, celle de la passerelle)', async () => {
  const { handler } = monter();
  for (let i = 1; i <= 10; i++) {
    const r = await handler(demande(`personne${i}@exemple.fr`, { 'x-forwarded-for': `falsifiee-${i}, 192.0.2.50` }));
    assertEquals(r.status, 200, `demande ${i}`);
  }
  const onzieme = await handler(demande('personne11@exemple.fr', { 'x-forwarded-for': 'falsifiee-11, 192.0.2.50' }));
  assertEquals(onzieme.status, 429);
  assertEquals((await onzieme.json()).code, 'TROP_DE_DEMANDES');
  // Autre IP réelle (dernière valeur) : autre compteur.
  assertEquals((await handler(demande('personne12@exemple.fr', { 'x-forwarded-for': 'falsifiee-12, 192.0.2.51' }))).status, 200);
});

Deno.test('X-Forwarded-For falsifié en tête : changer la valeur falsifiée ne change pas de compartiment', async () => {
  const { handler, appels } = monter();
  for (let i = 1; i <= 11; i++) {
    const r = await handler(demande(`spray${i}@exemple.fr`, { 'x-forwarded-for': `1.2.3.${i},,  198.51.100.9 ` }));
    assertEquals(r.status, i <= 10 ? 200 : 429, `demande ${i}`);
  }
  const cleIp = `mm-mdp-ip:${await empreinte('198.51.100.9')}`;
  const ips = appels.filter((a) => a.p_cle.startsWith('mm-mdp-ip:'));
  assertEquals(ips.length, 11);
  assert(ips.every((a) => a.p_cle === cleIp), 'toutes les demandes comptées sur l’adresse réelle');
  assert(!JSON.stringify(appels).includes(await empreinte('1.2.3.1')), 'la valeur falsifiée n’est jamais une clé');
});

Deno.test('IP : en-tête absent, repli sur cf-connecting-ip puis x-real-ip ; sinon clé commune « inconnue »', () => {
  const avec = (entetes: Record<string, string>) => ipAppelant(new Request('https://x.test/', { headers: entetes }));
  assertEquals(avec({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3' }), '3.3.3.3');
  assertEquals(avec({ 'x-forwarded-for': '1.1.1.1' }), '1.1.1.1');
  assertEquals(avec({ 'cf-connecting-ip': '4.4.4.4' }), '4.4.4.4');
  assertEquals(avec({ 'x-real-ip': '5.5.5.5' }), '5.5.5.5');
  assertEquals(avec({ 'x-forwarded-for': ' , ' }), 'inconnue');
  assertEquals(avec({}), 'inconnue');
});

Deno.test('plafond global : 300 demandes par heure tous appelants confondus, la 301e reçoit 429', async () => {
  const { brut, appels, attendre } = monter();
  const statuts: number[] = [];
  for (let i = 1; i <= 301; i++) {
    // IP et adresse distinctes à chaque demande : seules les limites par IP / adresse seraient inopérantes.
    const r = await brut(demande(`anonyme${i}@exemple.fr`, { 'x-forwarded-for': `x, 10.${Math.floor(i / 250)}.${i % 250}.1` }));
    statuts.push(r.status);
  }
  await attendre();
  assertEquals(statuts.slice(0, 300).every((c) => c === 200), true);
  assertEquals(statuts[300], 429);
  assertEquals(appels.filter((a) => a.p_cle === 'global').every((a) => a.p_max === 300 && a.p_fenetre === '1 hour'), true);
  // Une demande déjà refusée (ici par l'adresse) ne consomme pas le plafond global.
  const m = monter();
  for (let i = 0; i < 4; i++) await m.handler(demande(EXISTANT, { 'x-forwarded-for': `x, 192.0.2.${i + 1}` }));
  assertEquals(m.appels.filter((a) => a.p_cle === 'global').length, 3);
});

Deno.test('plafond global : erreur du compteur global = 503, aucun jeton', async () => {
  const liens: unknown[] = [];
  const h = creerHandler({
    creerClientService: () => ({
      rpc: async (_n: string, a: { p_cle: string }) => (a.p_cle === 'global' ? { data: null, error: { message: 'x' } } : { data: true, error: null }),
      auth: { admin: { generateLink: async (p: unknown) => (liens.push(p), { data: null, error: null }) } },
    }),
    envoyerEmail: () => Promise.reject(new Error('ne doit pas être appelé')),
    lireEnv: () => undefined,
    maintenant: () => MAINTENANT,
    enArrierePlan: () => {},
  });
  const r = await h(demande(EXISTANT));
  assertEquals(r.status, 503);
  assertEquals(liens.length, 0);
});

Deno.test('503 si le limiteur échoue : aucun jeton produit, aucun e-mail envoyé (échec fermé)', async () => {
  const { handler, liens, envois } = monter({ limiteurEnPanne: true });
  const r = await handler(demande(EXISTANT));
  assertEquals(r.status, 503);
  assertEquals((await r.json()).code, 'VERIFICATION_IMPOSSIBLE');
  assertEquals(liens.length, 0);
  assertEquals(envois.length, 0);
});

Deno.test('compteurs : une réservation atomique par clé, clés hachées, ni adresse ni IP en clair', async () => {
  const { handler, appels } = monter();
  await handler(demande(EXISTANT));
  assertEquals(appels, [
    { p_cle: `mm-mdp-ip:${await empreinte('203.0.113.7')}`, p_max: 10, p_fenetre: '1 hour' },
    { p_cle: `mm-mdp-email:${await empreinte(EXISTANT)}`, p_max: 3, p_fenetre: '1 hour' },
    { p_cle: 'global', p_max: 300, p_fenetre: '1 hour' },
  ]);
  const tout = JSON.stringify(appels);
  assert(!tout.includes('exemple.fr') && !tout.includes('203.0.113.7') && !tout.includes('1.2.3.4'));
});

Deno.test('rafale : 10 demandes simultanées pour une même adresse, exactement 3 passent (limite atomique)', async () => {
  const { brut, attendre, envois } = monter();
  const reponses = await Promise.all(
    Array.from({ length: 10 }, (_, i) => brut(demande(EXISTANT, { 'x-forwarded-for': `198.51.100.${i + 1}` }))),
  );
  await attendre();
  const statuts = reponses.map((r) => r.status).sort();
  assertEquals(statuts, [200, 200, 200, 429, 429, 429, 429, 429, 429, 429]);
  assertEquals(envois.length, 3);
});

Deno.test('rafale : 25 demandes simultanées depuis une même IP, exactement 10 passent', async () => {
  const { brut, attendre } = monter();
  const reponses = await Promise.all(
    Array.from({ length: 25 }, (_, i) => brut(demande(`personne${i}@exemple.fr`, { 'x-forwarded-for': '192.0.2.77' }))),
  );
  await attendre();
  assertEquals(reponses.filter((r) => r.status === 200).length, 10);
  assertEquals(reponses.filter((r) => r.status === 429).length, 15);
});

Deno.test('limiteur en exception (rpc qui lève) : 503, aucun jeton', async () => {
  const brutLeve = creerHandler({
    creerClientService: () => ({ rpc: () => Promise.reject(new Error(`boom ${EXISTANT}`)) }),
    envoyerEmail: () => Promise.reject(new Error('ne doit pas être appelé')),
    lireEnv: () => undefined,
    maintenant: () => MAINTENANT,
    enArrierePlan: () => {},
  });
  const { journaux, resultat } = await avecJournaux(async () => await brutLeve(demande(EXISTANT)));
  assertEquals(resultat.status, 503);
  assert(!journaux.join('\n').includes('exemple.fr'));
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
  const { handler, appels, liens } = monter();
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
  assertEquals(appels.length, 0);
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

Deno.test("la réponse part AVANT generateLink et l'envoi Resend : aucun écart de délai selon le compte", async () => {
  let debloquerLien!: () => void;
  let debloquerEnvoi!: () => void;
  const retardGenerateLink = new Promise<void>((ok) => (debloquerLien = ok));
  const retardResend = new Promise<void>((ok) => (debloquerEnvoi = ok));

  // Compte existant : generateLink et Resend sont volontairement bloqués.
  const existant = monter({ retardGenerateLink, retardResend });
  const reponse = await existant.brut(demande(EXISTANT));
  assertEquals(await lire(reponse), { statut: 200, corps: '{"ok":true}' });
  assertEquals(existant.envois.length, 0, 'la réponse est partie sans attendre generateLink ni Resend');
  assertEquals(existant.envoisTermines(), 0);

  // Compte inexistant : même réponse, sans attendre non plus (même travail synchrone).
  const inexistant = monter({ comptes: [], retardGenerateLink });
  assertEquals(await lire(await inexistant.brut(demande('inconnu@exemple.fr'))), { statut: 200, corps: '{"ok":true}' });

  // Déblocage : l'e-mail est bien envoyé ensuite, à la bonne adresse, avec le lien.
  debloquerLien();
  debloquerEnvoi();
  await existant.attendre();
  await inexistant.attendre();
  assertEquals(existant.envois.length, 1);
  assertEquals(existant.envoisTermines(), 1);
  assertEquals(existant.envois[0].to, [EXISTANT]);
  assert(existant.envois[0].html.includes(JETON_HACHE));
  assertEquals(inexistant.envois.length, 0);
});

Deno.test('échec en tâche de fond : journalisé sans adresse, la tâche ne rejette jamais', async () => {
  const { brut, attendre } = monter({ resend: 'panne' });
  const { journaux } = await avecJournaux(async () => {
    const r = await brut(demande(EXISTANT));
    assertEquals(r.status, 200);
    await attendre();
  });
  assert(journaux.some((l) => l.includes('Resend injoignable')), journaux.join('\n'));
  assert(!journaux.join('\n').includes('exemple.fr'));
});
