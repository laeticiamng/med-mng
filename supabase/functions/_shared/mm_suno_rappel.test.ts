// Signature des URL de rappel Suno (vague sécurité F66-MM, 05.10.2026) — sans réseau.
// deno test --no-lock supabase/functions/_shared/mm_suno_rappel.test.ts
import { assert, assertEquals, assertRejects } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { DUREE_VALIDITE_RAPPEL_MS, signerUrlRappel, verifierUrlRappel } from './mm-suno-rappel.ts';

const BASE = 'https://exemple.supabase.co';
const CLE = 'cle-de-service-factice-pour-les-tests-0123456789';
const AUTRE_CLE = 'autre-cle-de-service-factice-pour-les-tests-98765';
const UTILISATEUR = '0f8fad5b-d9cb-469f-a165-70867728950e';
const AUTRE = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const T0 = Date.UTC(2026, 9, 5, 12, 0, 0);

/** URL telle que la reçoit la fonction (la passerelle retire /functions/v1). */
const recue = (url: string) => url.replace('/functions/v1/', '/');

Deno.test('rappel signé : accepté pour son utilisateur, avec ou sans le préfixe /functions/v1', async () => {
  const url = await signerUrlRappel(BASE, UTILISATEUR, CLE, T0);
  assert(url.startsWith(`${BASE}/functions/v1/mm-suno-callback/${UTILISATEUR}/`), url);
  assertEquals(await verifierUrlRappel(url, CLE, T0 + 60_000), { userId: UTILISATEUR });
  assertEquals(await verifierUrlRappel(recue(url), CLE, T0 + 60_000), { userId: UTILISATEUR });
});

Deno.test('rappel d’une génération lancée avec la clé de service : utilisateur null', async () => {
  const url = await signerUrlRappel(BASE, null, CLE, T0);
  assertEquals(await verifierUrlRappel(url, CLE, T0), { userId: null });
});

Deno.test('rappel non signé (ancienne URL) ou mal formé : refusé', async () => {
  assertEquals(await verifierUrlRappel(`${BASE}/functions/v1/mm-suno-callback`, CLE, T0), false);
  assertEquals(await verifierUrlRappel(`${BASE}/mm-suno-callback?u=${UTILISATEUR}`, CLE, T0), false);
  assertEquals(await verifierUrlRappel('pas une url', CLE, T0), false);
  const url = await signerUrlRappel(BASE, UTILISATEUR, CLE, T0);
  assertEquals(await verifierUrlRappel(`${url}/en-trop`, CLE, T0), false);
});

Deno.test('rappel falsifié : autre utilisateur, signature modifiée, autre clé, clé absente', async () => {
  const url = await signerUrlRappel(BASE, UTILISATEUR, CLE, T0);
  assertEquals(await verifierUrlRappel(url.replace(UTILISATEUR, AUTRE), CLE, T0), false);
  const signature = url.slice(-64);
  const modifiee = (signature[0] === 'a' ? 'b' : 'a') + signature.slice(1);
  assertEquals(await verifierUrlRappel(url.slice(0, -64) + modifiee, CLE, T0), false);
  assertEquals(await verifierUrlRappel(url, AUTRE_CLE, T0), false);
  assertEquals(await verifierUrlRappel(url, '', T0), false);
});

Deno.test('rappel expiré, ou à échéance trop lointaine : refusé', async () => {
  const url = await signerUrlRappel(BASE, UTILISATEUR, CLE, T0);
  assertEquals(await verifierUrlRappel(url, CLE, T0 + DUREE_VALIDITE_RAPPEL_MS - 1), { userId: UTILISATEUR });
  assertEquals(await verifierUrlRappel(url, CLE, T0 + DUREE_VALIDITE_RAPPEL_MS + 1), false);
  // Signée « dans le futur » (horloge ou fabrication) : échéance au-delà de la durée de validité.
  const future = await signerUrlRappel(BASE, UTILISATEUR, CLE, T0 + 2 * DUREE_VALIDITE_RAPPEL_MS);
  assertEquals(await verifierUrlRappel(future, CLE, T0), false);
});

Deno.test('signature impossible sans clé ou avec un identifiant invalide', async () => {
  await assertRejects(() => signerUrlRappel(BASE, UTILISATEUR, '', T0));
  await assertRejects(() => signerUrlRappel(BASE, 'utilisateur/../autre', CLE, T0));
});
