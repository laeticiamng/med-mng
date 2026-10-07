import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { archiverFacture } from '../../supabase/functions/_shared/mm-archive-facture.ts';

/**
 * Audit du 07.10.2026 : mm-stripe-webhook archive chaque facture dans
 * subscription_invoices, table absente en production (migration
 * 20260210130000 jamais appliquée, vérifié par SELECT to_regclass). L'archivage
 * doit rester non bloquant (le statut de l'abonnement est déjà écrit) sans
 * jamais être silencieux ni faire planter le webhook.
 */

const facture = {
  id: 'in_test_1',
  amount_paid: 6900,
  amount_due: 6900,
  currency: 'eur',
  hosted_invoice_url: 'https://invoice.stripe.com/i/test',
  created: 1_791_000_000,
};

type Reponse = { error: { code?: string; message?: string } | null };

const client = (resultat: Reponse | (() => never)) => ({
  from: vi.fn((_table: string) => ({
    upsert: vi.fn(
      (_ligne: Record<string, unknown>, _options: { onConflict: string }): Promise<Reponse> =>
        typeof resultat === 'function' ? resultat() : Promise.resolve(resultat),
    ),
  })),
});

afterEach(() => vi.restoreAllMocks());

describe('archiverFacture (mm-stripe-webhook)', () => {
  it('table absente (PostgREST PGRST205) : avertissement explicite, pas d’exception', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const r = await archiverFacture(
      client({ error: { code: 'PGRST205', message: "Could not find the table 'public.subscription_invoices' in the schema cache" } }),
      facture,
      'sub_1',
      'paid',
    );
    expect(r).toBe('table_absente');
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/in_test_1.*subscription_invoices absente.*20260210130000/));
  });

  it('table absente (Postgres 42P01) : même traitement', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const r = await archiverFacture(client({ error: { code: '42P01', message: 'relation does not exist' } }), facture, 'sub_1', 'failed');
    expect(r).toBe('table_absente');
  });

  it('autre erreur d’écriture : erreur journalisée avec son code, sans exception', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await archiverFacture(client({ error: { code: '23502', message: 'null value' } }), facture, 'sub_1', 'paid');
    expect(r).toBe('erreur');
    expect(err).toHaveBeenCalledWith(expect.stringMatching(/in_test_1.*23502/));
  });

  it('exception (réseau) : rattrapée et journalisée, le webhook continue', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await archiverFacture(client(() => { throw new TypeError('fetch failed'); }), facture, 'sub_1', 'paid');
    expect(r).toBe('erreur');
    expect(err).toHaveBeenCalled();
  });

  it('succès : montant payé ou dû selon le statut', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const c = client({ error: null });
    expect(await archiverFacture(c, { ...facture, amount_paid: 0, amount_due: 990 }, 'sub_1', 'failed')).toBe('archivee');
    const upsert = c.from.mock.results[0].value.upsert;
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ stripe_invoice_id: 'in_test_1', amount: 990, status: 'failed' }),
      { onConflict: 'stripe_invoice_id' },
    );
  });

  it('le webhook utilise le module partagé', () => {
    const code = readFileSync(resolve(__dirname, '../../supabase/functions/mm-stripe-webhook/index.ts'), 'utf8');
    expect(code).toContain("from \"../_shared/mm-archive-facture.ts\"");
    expect(code).not.toMatch(/async function archiverFacture/);
  });
});
