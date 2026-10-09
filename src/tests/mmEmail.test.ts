import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  EXPEDITEUR_PAR_DEFAUT,
  envoyerEmail,
  expediteur,
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
