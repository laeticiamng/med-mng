// Alignement de la description du produit Stripe existant (revue PR #232) — sans réseau.
// deno test --no-lock supabase/functions/_shared/mm_stripe_catalogue.test.ts
import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { DESCRIPTION_PRODUIT, prixMedMng } from './mm-stripe-catalog.ts';

// deno-lint-ignore no-explicit-any
const fauxStripe = (description: string, echecUpdate = false): any => {
  const appels: string[] = [];
  return {
    appels,
    prices: {
      list: () => Promise.resolve({ data: [{ id: 'price_x', product: 'prod_x' }] }),
    },
    products: {
      retrieve: (id: string) => { appels.push(`retrieve:${id}`); return Promise.resolve({ id, description }); },
      update: (id: string, p: { description: string }) => {
        appels.push(`update:${id}:${p.description}`);
        return echecUpdate ? Promise.reject(new Error('refus')) : Promise.resolve({ id, ...p });
      },
    },
  };
};

Deno.test('prix existant : la description du produit existant est réalignée une seule fois', async () => {
  const s = fauxStripe('Contenu immersif des 367 items EDN et génération audio.');
  assertEquals(await prixMedMng(s, 'annual'), 'price_x');
  assertEquals(await prixMedMng(s, 'monthly'), 'price_x');
  assertEquals(s.appels, ['retrieve:prod_x', `update:prod_x:${DESCRIPTION_PRODUIT}`]);
});

Deno.test('échec Stripe sur la description : le paiement n’est jamais bloqué', async () => {
  const s = fauxStripe('ancienne', true);
  s.prices.list = () => Promise.resolve({ data: [{ id: 'price_y', product: { id: 'prod_y' } }] });
  assertEquals(await prixMedMng(s, 'annual'), 'price_y');
});
