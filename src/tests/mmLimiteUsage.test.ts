import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  fenetreJourUtc,
  reponseQuotaJournalier,
  reponseVerificationImpossible,
  reserverUtilisationJournaliere,
  tailleBase64Decodee,
} from '../../supabase/functions/_shared/mm-limite-usage.ts';

/**
 * D45 (vague 3, 04.10.2026) : whisper-transcribe (OpenAI, facturée à l'appel) était ouverte à
 * tout compte connecté sans limite de volume ni de taille. Compteur journalier par compte dans
 * mm_usage_compteurs (réservation atomique en base, écriture réservée au service).
 */

/**
 * Faux client Supabase : la seule opération permise est la RPC mm_reserver_usage_journalier. Elle
 * reproduit la sémantique de la fonction SQL — réservation ATOMIQUE par (identifiant, jour UTC),
 * jamais au-delà du maximum — avec une latence aléatoire AVANT la section atomique pour entrelacer
 * les appels simultanés. Toute lecture/écriture directe d'une table fait échouer le test : le
 * module ne doit plus passer par rate_limit_counters (sans unicité, donc non atomique).
 * La même sémantique est vérifiée sur un vrai Postgres par scripts/test-mm-usage-compteurs.sh.
 */
function fausseBase(options: { erreur?: boolean; reponse?: unknown } = {}) {
  const compteurs = new Map<string, number>();
  const appels: Array<Record<string, unknown>> = [];
  const client = {
    from: (table: string) => {
      throw new Error(`accès direct à la table ${table} interdit`);
    },
    rpc: async (nom: string, args: { p_identifiant: string; p_max: number; p_maintenant: string }) => {
      expect(nom).toBe('mm_reserver_usage_journalier');
      appels.push(args);
      await new Promise((ok) => setTimeout(ok, Math.random() * 5));
      if (options.erreur) return { data: null, error: { message: 'indisponible' } };
      if (options.reponse !== undefined) return { data: options.reponse, error: null };
      const jour = new Date(args.p_maintenant).toISOString().slice(0, 10);
      const cle = `${args.p_identifiant}|${jour}`;
      const actuel = compteurs.get(cle) ?? 0;
      if (actuel >= args.p_max) return { data: [{ autorise: false, utilise: actuel }], error: null };
      compteurs.set(cle, actuel + 1);
      return { data: [{ autorise: true, utilise: actuel + 1 }], error: null };
    },
  };
  return { client, compteurs, appels };
}

const MIDI = new Date('2026-10-04T12:00:00Z');

describe('fenetreJourUtc', () => {
  it('borne le jour UTC', () => {
    expect(fenetreJourUtc(new Date('2026-10-04T23:59:59Z'))).toEqual({ debut: '2026-10-04T00:00:00.000Z', fin: '2026-10-05T00:00:00.000Z' });
  });
});

describe('tailleBase64Decodee', () => {
  it('compte les octets décodés, préfixe data: et remplissage compris', () => {
    expect(tailleBase64Decodee(btoa('abcd'))).toBe(4);
    expect(tailleBase64Decodee(btoa('abcde'))).toBe(5);
    expect(tailleBase64Decodee(`data:audio/webm;base64,${btoa('abcdef')}`)).toBe(6);
    expect(tailleBase64Decodee('A'.repeat(14_000_000))).toBeGreaterThan(10 * 1024 * 1024);
  });
});

describe('reserverUtilisationJournaliere', () => {
  it('autorise jusqu’au maximum puis refuse, par compte et par jour', async () => {
    const { client } = fausseBase();
    for (let i = 1; i <= 3; i++) {
      expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, MIDI)).toEqual({ autorise: true, utilise: i });
    }
    expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, MIDI)).toEqual({ autorise: false, utilise: 3 });
    // Autre compte : compteur distinct ; jour suivant : nouvelle fenêtre.
    expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u2', 3, MIDI)).toEqual({ autorise: true, utilise: 1 });
    expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, new Date('2026-10-05T00:00:01Z'))).toEqual({ autorise: true, utilise: 1 });
  });

  it('transmet l’identifiant « action:utilisateur », le maximum et l’horloge à la fonction SQL', async () => {
    const { client, appels } = fausseBase();
    await reserverUtilisationJournaliere(client, 'mm-bienvenue', 'abc', 2, MIDI);
    expect(appels).toEqual([{ p_identifiant: 'mm-bienvenue:abc', p_max: 2, p_maintenant: '2026-10-04T12:00:00.000Z' }]);
  });

  it('CONCURRENCE : 6 appels simultanés pour une limite de 2 → exactement 2 réservations', async () => {
    for (let essai = 0; essai < 5; essai++) {
      const { client, compteurs } = fausseBase();
      const resultats = await Promise.all(
        Array.from({ length: 6 }, () => reserverUtilisationJournaliere(client, 'mm-bienvenue', 'u1', 2, MIDI)),
      );
      expect(resultats.filter((r) => r?.autorise === true)).toHaveLength(2);
      expect(resultats.filter((r) => r?.autorise === false)).toHaveLength(4);
      expect([...compteurs.values()]).toEqual([2]); // aucune réservation supplémentaire
    }
  });

  it('CONCURRENCE : un refus n’écrit rien et un compteur plein reste plein', async () => {
    const { client, compteurs } = fausseBase();
    await Promise.all(Array.from({ length: 3 }, () => reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, MIDI)));
    const apres = await Promise.all(Array.from({ length: 10 }, () => reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, MIDI)));
    expect(apres.every((r) => r?.autorise === false && r.utilise === 3)).toBe(true);
    expect([...compteurs.values()]).toEqual([3]);
  });

  it('CONCURRENCE : utilisateurs distincts, 3 appels chacun pour une limite de 2 → 2 par utilisateur', async () => {
    const { client, compteurs } = fausseBase();
    const utilisateurs = ['u1', 'u2', 'u3', 'u4'];
    const resultats = await Promise.all(
      utilisateurs.flatMap((u) => Array.from({ length: 3 }, () => reserverUtilisationJournaliere(client, 'mm-bienvenue', u, 2, MIDI))),
    );
    expect(resultats.filter((r) => r?.autorise).length).toBe(8);
    expect([...compteurs.values()]).toEqual([2, 2, 2, 2]);
  });

  it('fenêtres : le même utilisateur a un compteur par jour UTC, y compris en simultané', async () => {
    const { client } = fausseBase();
    const veille = new Date('2026-10-04T23:59:59Z');
    const lendemain = new Date('2026-10-05T00:00:01Z');
    const resultats = await Promise.all([
      reserverUtilisationJournaliere(client, 'mm-bienvenue', 'u1', 1, veille),
      reserverUtilisationJournaliere(client, 'mm-bienvenue', 'u1', 1, lendemain),
      reserverUtilisationJournaliere(client, 'mm-bienvenue', 'u1', 1, veille),
      reserverUtilisationJournaliere(client, 'mm-bienvenue', 'u1', 1, lendemain),
    ]);
    expect(resultats.filter((r) => r?.autorise)).toHaveLength(2);
  });

  it('erreur de la base : null (l’appel payant est refusé, échec fermé)', async () => {
    const { client } = fausseBase({ erreur: true });
    expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, MIDI)).toBeNull();
  });

  it('réponse inattendue : null (jamais d’autorisation par défaut)', async () => {
    for (const reponse of [null, [], [{ autorise: true, utilise: 1 }, { autorise: false, utilise: 1 }], [{ autorise: 'oui', utilise: 1 }], [{ autorise: true }], 'x']) {
      const { client } = fausseBase({ reponse });
      expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, MIDI)).toBeNull();
    }
  });

  it('exception de la base : null', async () => {
    const client = { rpc: async () => { throw new Error('réseau'); } };
    expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, MIDI)).toBeNull();
  });
});

describe('migration du compteur atomique', () => {
  const sql = readFileSync(resolve(__dirname, '../../supabase/migrations/20261014170000_mm_compteur_usage_journalier.sql'), 'utf8');

  it('unicité en base et réservation en une instruction conditionnelle', () => {
    expect(sql).toMatch(/primary key \(identifiant, fenetre_debut\)/);
    expect(sql).toMatch(/on conflict \(identifiant, fenetre_debut\) do update\s+set nombre = c\.nombre \+ 1\s+where c\.nombre < p_max/);
    expect(sql).toContain('create or replace function public.mm_reserver_usage_journalier');
  });

  it('idempotente : création conditionnelle, reprise sans double comptage', () => {
    expect(sql).toMatch(/create table if not exists public\.mm_usage_compteurs/);
    expect(sql).toMatch(/create index if not exists/);
    expect(sql).toMatch(/set nombre = greatest\(/);
    expect(sql).toMatch(/sum\(request_count\)/); // doublons existants additionnés
  });

  it('ne touche pas à la table partagée rate_limit_counters (lecture seule pour la reprise)', () => {
    expect(sql).not.toMatch(/(alter|drop|delete from|update|truncate)\s+(table\s+)?public\.rate_limit_counters/i);
  });

  it('accès réservé au service : RLS, aucun droit pour anon / authenticated', () => {
    expect(sql).toMatch(/enable row level security/);
    expect(sql).toMatch(/revoke all on table public\.mm_usage_compteurs from public, anon, authenticated/);
    expect(sql).toMatch(/revoke all on function public\.mm_reserver_usage_journalier\(text, integer, timestamptz\) from public, anon, authenticated/);
    expect(sql).toMatch(/grant execute on function public\.mm_reserver_usage_journalier\(text, integer, timestamptz\) to service_role/);
  });

  it('le module appelle bien la fonction créée par la migration', () => {
    const module = readFileSync(resolve(__dirname, '../../supabase/functions/_shared/mm-limite-usage.ts'), 'utf8');
    expect(module).toContain("rpc('mm_reserver_usage_journalier'");
    expect(module).not.toMatch(/\.from\('rate_limit_counters'\)/);
  });
});

describe('réponses de la vague « limites d’usage » (05.10.2026)', () => {
  const CORS = { 'Access-Control-Allow-Origin': 'https://medmng.com' };

  it('429 QUOTA_JOURNALIER : message français lisible tel quel, Retry-After jusqu’à minuit UTC', async () => {
    const r = reponseQuotaJournalier(CORS, 'e-mails de bienvenue', 2, MIDI);
    expect(r.status).toBe(429);
    expect(r.headers.get('Access-Control-Allow-Origin')).toBe('https://medmng.com');
    expect(r.headers.get('Retry-After')).toBe(String(12 * 3600));
    const corps = await r.json();
    expect(corps).toMatchObject({ success: false, code: 'QUOTA_JOURNALIER', limite: 2, reinitialisation: '2026-10-05T00:00:00.000Z' });
    expect(corps.message).toBe('Vous avez atteint la limite quotidienne de 2 e-mails de bienvenue ; elle repart demain.');
    expect(corps.error).toBe(corps.message);
  });

  it('503 VERIFICATION_IMPOSSIBLE quand le compteur est illisible', async () => {
    const r = reponseVerificationImpossible(CORS);
    expect(r.status).toBe(503);
    expect((await r.json()).code).toBe('VERIFICATION_IMPOSSIBLE');
  });

  it('send-welcome-email : compteur réservé après la session et la fenêtre de 15 min, AVANT l’envoi Resend ; fail-closed', () => {
    const source = readFileSync(resolve(process.cwd(), 'supabase/functions/send-welcome-email/index.ts'), 'utf8');
    const session = source.indexOf('admin.auth.getUser(jeton)');
    const fenetre = source.indexOf('Date.now() - creeLe > FENETRE_MS');
    const reservation = source.indexOf("reserverUtilisationJournaliere(admin, 'mm-bienvenue', utilisateur.id, ENVOIS_MAX_PAR_JOUR)");
    const envoi = source.indexOf('await envoyerEmail(');
    expect(session).toBeGreaterThan(0);
    expect(fenetre).toBeGreaterThan(session);
    expect(reservation).toBeGreaterThan(fenetre);
    expect(envoi).toBeGreaterThan(reservation);
    expect(source).toMatch(/if \(!reservation\) return reponseVerificationImpossible\(corsHeaders\);/);
    expect(source).toMatch(/if \(!reservation\.autorise\) return reponseQuotaJournalier\(/);
    expect(source).toMatch(/const ENVOIS_MAX_PAR_JOUR = 2;/);
  });

  it('whisper-transcribe : même contrat (429 QUOTA_JOURNALIER), compteur réservé AVANT l’appel OpenAI', () => {
    const source = readFileSync(resolve(process.cwd(), 'supabase/functions/whisper-transcribe/index.ts'), 'utf8');
    const reservation = source.indexOf("reserverUtilisationJournaliere(");
    const appel = source.indexOf("fetch('https://api.openai.com/v1/audio/transcriptions'");
    expect(reservation).toBeGreaterThan(0);
    expect(appel).toBeGreaterThan(reservation);
    expect(source).toMatch(/if \(!reservation\) return reponseVerificationImpossible\(corsHeaders\);/);
    expect(source).toMatch(/reponseQuotaJournalier\(corsHeaders, 'transcriptions vocales', TRANSCRIPTIONS_MAX_PAR_JOUR\)/);
    expect(source).not.toMatch(/LIMITE_ATTEINTE/);
  });
});
