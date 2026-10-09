import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Stripe ne garantit pas l'ordre de livraison des événements. Le webhook enregistre l'état
 * COURANT de l'abonnement (relu chez Stripe), jamais l'instantané d'un événement qui peut
 * être plus ancien que le dernier traité (sinon : Premium rouvert après une résiliation,
 * ou accès coupé par un échec de paiement déjà régularisé).
 */
const code = readFileSync(
  resolve(__dirname, '../../supabase/functions/mm-stripe-webhook/index.ts'),
  'utf8'
);

const bloc = (debut: string, fin: string) => {
  const i = code.indexOf(debut);
  const j = code.indexOf(fin, i + debut.length);
  expect(i, debut).toBeGreaterThan(0);
  expect(j, fin).toBeGreaterThan(i);
  return code.slice(i, j);
};

describe('mm-stripe-webhook : événements livrés dans le désordre', () => {
  it('created/updated : abonnement relu chez Stripe avant enregistrement', () => {
    const b = bloc(
      'case "customer.subscription.updated"',
      'case "customer.subscription.deleted"'
    );
    const relecture = b.indexOf('stripe.subscriptions.retrieve(instantane.id)');
    expect(relecture).toBeGreaterThan(0);
    expect(relecture).toBeLessThan(b.indexOf('enregistrerAbonnement('));
    expect(b).toContain('enregistrerAbonnement(supabase, userId, sub,');
  });

  it('échec de paiement : statut courant relu, jamais « past_due » écrit en dur', () => {
    const b = bloc('case "invoice.payment_failed"', 'default:');
    expect(b).toContain('stripe.subscriptions.retrieve(subscriptionId)');
    expect(b).toContain('majStatut(supabase, subscriptionId, courant.status)');
    expect(b).not.toMatch(/majStatut\([^)]*"past_due"\)/);
  });

  it('signature vérifiée avant tout traitement', () => {
    expect(code.indexOf('constructEventAsync(')).toBeLessThan(
      code.indexOf('switch (event.type)')
    );
  });
});
