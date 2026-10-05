// Non-régression (05.10.2026) — lecture statique du code, sans réseau.
//
//   deno test --no-lock --allow-read supabase/functions/_shared/getuser_jeton.test.ts
//
// Côté serveur, le client Supabase n'a pas de session : `auth.getUser()` SANS argument dépend de la
// version d'auth-js que esm.sh résout au déploiement. Avec certaines (supabase-js 2.39.3, constaté en
// production sur EmotionsCare, projet partagé), la réponse est « AuthSessionMissingError » pour tout
// le monde → 401 même avec une session valide. Règle : toute fonction passe le jeton explicitement
// (`getUser(jeton)`), ou passe par `_shared/mm-garde.ts` (`identifierAppelant`, qui le fait déjà).
import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';

const RACINE = new URL('../', import.meta.url);

/** Appels `getUser()` sans argument (espaces et retours à la ligne compris). */
export const appelsSansJeton = (source: string): number =>
  (source.match(/\.getUser\(\s*\)/g) ?? []).length;

async function* fichiersTs(dossier: URL): AsyncGenerator<URL> {
  for await (const entree of Deno.readDir(dossier)) {
    if (entree.isDirectory) {
      if (entree.name === 'node_modules') continue;
      yield* fichiersTs(new URL(`${entree.name}/`, dossier));
    } else if (entree.isFile && /\.(ts|js)$/.test(entree.name) && !/[._]test\.(ts|js)$/.test(entree.name)) {
      yield new URL(entree.name, dossier);
    }
  }
}

Deno.test('détecteur : getUser() sans jeton repéré, getUser(jeton) accepté', () => {
  assertEquals(appelsSansJeton('await supabase.auth.getUser();'), 1);
  assertEquals(appelsSansJeton('await supabase.auth.getUser(\n  );'), 1);
  assertEquals(appelsSansJeton('await supabase.auth.getUser(jeton);'), 0);
  assertEquals(appelsSansJeton("await client.auth.getUser(authHeader.replace(/^Bearer\\s+/i, ''));"), 0);
});

Deno.test('aucune fonction Edge n\'appelle auth.getUser() sans jeton', async () => {
  const fautifs: string[] = [];
  for await (const fichier of fichiersTs(RACINE)) {
    const n = appelsSansJeton(await Deno.readTextFile(fichier));
    if (n > 0) fautifs.push(`${fichier.pathname.replace(RACINE.pathname, '')} (${n})`);
  }
  assertEquals(fautifs, []);
});
