import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  EXPEDITEUR_PAR_DEFAUT,
  adresseNonLivrable,
  envoyerEmail,
  expediteur,
  refusDefinitif,
} from '../../supabase/functions/_shared/mm-email.ts';

/**
 * Audit du 07.10.2026 : les fonctions d'envoi utilisaient l'expéditeur de test
 * `onboarding@resend.dev` (refus 403 en production pour tout autre
 * destinataire que le titulaire du compte Resend) et journalisaient « envoyé »
 * sans lire la réponse de Resend.
 */

const FONCTIONS = [
  'send-welcome-email',
  'send-emails',
  'send-scheduled-reports',
  'send-accessibility-report',
  'send-security-alert',
];

const source = (fonction: string) =>
  readFileSync(resolve(__dirname, '../../supabase/functions', fonction, 'index.ts'), 'utf8');

const reponse = (status: number, corps: unknown) =>
  new Response(JSON.stringify(corps), { status, headers: { 'Content-Type': 'application/json' } });

describe('mm-email — expéditeur', () => {
  it('RESEND_FROM adresse seule : nom affiché ajouté', () => {
    expect(expediteur('Med MNG', () => 'contact@exemple.test')).toBe('Med MNG <contact@exemple.test>');
  });

  it('RESEND_FROM forme complète : utilisée telle quelle', () => {
    expect(expediteur('Med MNG', () => 'Équipe <x@exemple.test>')).toBe('Équipe <x@exemple.test>');
  });

  it('sans RESEND_FROM : repli documenté sur l’adresse de test, signalé', () => {
    const avert = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(expediteur('Med MNG', () => undefined)).toBe(`Med MNG <${EXPEDITEUR_PAR_DEFAUT}>`);
    expect(avert).toHaveBeenCalledWith(expect.stringContaining('RESEND_FROM absent'));
    avert.mockRestore();
  });
});

describe('mm-email — résultat réel de l’envoi', () => {
  const email = { from: 'Med MNG <x@exemple.test>', to: ['a@exemple.test'], subject: 's', html: '<p>h</p>' };

  it('403 de Resend : échec rendu, sans le message (qui peut contenir une adresse)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      reponse(403, { name: 'validation_error', message: 'You can only send testing emails to a@exemple.test' }),
    );
    const r = await envoyerEmail(email, { cle: 'cle-factice', fetchImpl });
    expect(r).toEqual({ ok: false, status: 403, erreur: 'validation_error' });
    expect(JSON.stringify(r)).not.toContain('@');
  });

  it('clé d’idempotence transmise à Resend (bienvenue : un seul e-mail par compte)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reponse(200, { id: 'em_2' }));
    await envoyerEmail(email, { cle: 'cle-factice', fetchImpl, idempotence: 'mm-bienvenue/u1' });
    expect(fetchImpl.mock.calls[0][1].headers['Idempotency-Key']).toBe('mm-bienvenue/u1');
    await envoyerEmail(email, { cle: 'cle-factice', fetchImpl });
    expect(fetchImpl.mock.calls[1][1].headers).not.toHaveProperty('Idempotency-Key');
  });

  it('bienvenue : la fonction envoie avec une clé par compte et traite 409 comme déjà envoyé', () => {
    const src = readFileSync(resolve(__dirname, '../../supabase/functions/send-welcome-email/index.ts'), 'utf8');
    expect(src).toContain('idempotence: `mm-bienvenue/${utilisateur.id}`');
    expect(src).toMatch(/envoi\.status === 409/);
  });

  it('200 : identifiant rendu', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reponse(200, { id: 'em_1' }));
    expect(await envoyerEmail(email, { cle: 'cle-factice', fetchImpl })).toEqual({ ok: true, id: 'em_1' });
  });

  it('sans clé : aucun appel, échec explicite (plus de faux identifiant « mock »)', async () => {
    const fetchImpl = vi.fn();
    expect(await envoyerEmail(email, { cle: null, fetchImpl })).toEqual({
      ok: false,
      status: 0,
      erreur: 'resend_api_key_absente',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('réseau en panne : échec explicite', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    expect(await envoyerEmail(email, { cle: 'cle-factice', fetchImpl })).toEqual({
      ok: false,
      status: 0,
      erreur: 'TypeError',
    });
  });
});

describe('fonctions d’envoi', () => {
  it.each(FONCTIONS)('%s : expéditeur configurable, aucune adresse resend.dev en dur, envoi vérifié', (fonction) => {
    const code = source(fonction);
    expect(code).not.toMatch(/@resend\.dev/);
    expect(code).toContain("from '../_shared/mm-email.ts'");
    expect(code).toMatch(/expediteur\(/);
    expect(code).toMatch(/envoyerEmail\(/);
    expect(code).toMatch(/\.ok\b/);
  });
});

/**
 * 09.10.2026 (test en production) : send-welcome-email répondait 502 pour des comptes de test
 * en « @example.com » — Resend refuse ces domaines réservés (422 validation_error). Ce n'est
 * pas une panne : plus de 502, et aucun appel à Resend pour une adresse sans boîte possible.
 */
describe('mm-email — destinataires non livrables et refus définitifs', () => {
  it('domaines réservés (RFC 2606 / 6761) : non livrables', () => {
    for (const a of ['qa@example.com', 'x@sub.example.org', 'y@example.net', 'z@foo.test', 'a@b.invalid', 'b@localhost', 'c@demo.example', 'sans-arobase', '', null]) {
      expect(adresseNonLivrable(a), String(a)).toBe(true);
    }
  });

  it('adresses réelles : livrables', () => {
    for (const a of ['etudiant@gmail.com', 'x@emotionscare-test.fr', 'y@exemple.fr', 'z@myexample.com', 'w@testing.io']) {
      expect(adresseNonLivrable(a), a).toBe(false);
    }
  });

  it('400/422 : refus définitif ; 403, 429, 5xx et réseau : panne', () => {
    expect(refusDefinitif({ ok: false, status: 422, erreur: 'validation_error' })).toBe(true);
    expect(refusDefinitif({ ok: false, status: 400, erreur: 'invalid' })).toBe(true);
    for (const status of [0, 403, 429, 500, 503]) {
      expect(refusDefinitif({ ok: false, status, erreur: 'x' }), String(status)).toBe(false);
    }
  });

  it('send-welcome-email : adresse vérifiée avant le quota et l’envoi, refus définitif sans 502', () => {
    const src = source('send-welcome-email');
    const iAdresse = src.indexOf('adresseNonLivrable(utilisateur.email)');
    expect(iAdresse).toBeGreaterThan(0);
    expect(iAdresse).toBeLessThan(src.indexOf('reserverUtilisationJournaliere(admin'));
    expect(iAdresse).toBeLessThan(src.indexOf('await envoyerEmail('));
    const iRefus = src.indexOf('refusDefinitif(envoi)');
    expect(iRefus).toBeGreaterThan(0);
    expect(iRefus).toBeLessThan(src.indexOf('}, 502)'));
  });
});
