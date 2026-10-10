import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Déduplication des appels `supabase.auth.getUser()` (sans argument) SIMULTANÉS.
 *
 * CONSTAT (test en production du 09.10.2026) : ~97 requêtes en 12 s à l'ouverture de
 * `/edn-complete`, dont 6 × `GET /auth/v1/user`, lancées au montage de la page par des
 * composants et des hooks différents.
 *
 * Ici : tant qu'un appel est EN COURS, les appels suivants reçoivent la même promesse. Aucun
 * résultat n'est conservé après sa réponse : chaque nouvel appel revalide le jeton auprès du
 * serveur d'authentification (une session révoquée côté serveur est refusée aussitôt — revue
 * Codex de la PR #241). Un événement d'authentification (connexion, déconnexion, jeton
 * rafraîchi…) détache l'appel en cours : les appels suivants repartent sur le réseau.
 * `getUser(jeton)` explicite n'est jamais partagé. Pour un simple affichage, préférer
 * `getSession()` (lecture locale, sans requête).
 */
type Auth = SupabaseClient['auth'];
type ReponseGetUser = Awaited<ReturnType<Auth['getUser']>>;

const INSTALLE = Symbol.for('medmng.partageGetUser');

export function installerPartageGetUser(auth: Auth): void {
  const marque = auth as unknown as Record<symbol, boolean>;
  if (marque[INSTALLE]) return;
  marque[INSTALLE] = true;

  const original = auth.getUser.bind(auth);
  let enCours: Promise<ReponseGetUser> | null = null;

  try {
    auth.onAuthStateChange((evenement) => {
      // INITIAL_SESSION : simple lecture de la session au démarrage, rien n'a changé.
      if (evenement !== 'INITIAL_SESSION') enCours = null;
    });
  } catch {
    // Client simulé (tests) sans onAuthStateChange : déduplication sans détachement.
  }

  const partage = (jwt?: string): Promise<ReponseGetUser> => {
    if (jwt) return original(jwt);
    if (enCours) return enCours;

    const promesse = original().finally(() => {
      if (enCours === promesse) enCours = null;
    });
    enCours = promesse;
    return promesse;
  };

  auth.getUser = partage as Auth['getUser'];
}
