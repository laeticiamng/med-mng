import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Partage des appels `supabase.auth.getUser()` (sans argument) entre composants.
 *
 * CONSTAT (test en production du 09.10.2026) : ~97 requêtes en 12 s à l'ouverture de
 * `/edn-complete`, dont 6 × `GET /auth/v1/user`. Une cinquantaine de composants et de hooks
 * appellent `getUser()` chacun de leur côté ; chaque appel part sur le réseau (le serveur
 * d'authentification revalide le jeton à chaque fois).
 *
 * Ici : un appel en cours est partagé, et le résultat est réutilisé pendant `dureeMs`
 * (30 s par défaut). Tout événement d'authentification (connexion, déconnexion, jeton
 * rafraîchi, profil modifié) vide le cache, et un appel lancé avant l'événement n'y est
 * jamais rangé : après une déconnexion, aucun composant ne reçoit l'ancien utilisateur.
 * La sécurité ne change pas : les droits sont contrôlés côté serveur (RLS, fonctions), le
 * cache ne sert qu'à l'affichage. `getUser(jeton)` explicite n'est pas mis en cache.
 */
type Auth = SupabaseClient['auth'];
type ReponseGetUser = Awaited<ReturnType<Auth['getUser']>>;

const INSTALLE = Symbol.for('medmng.partageGetUser');

export function installerPartageGetUser(auth: Auth, dureeMs = 30_000): void {
  const marque = auth as unknown as Record<symbol, boolean>;
  if (marque[INSTALLE]) return;
  marque[INSTALLE] = true;

  const original = auth.getUser.bind(auth);
  let generation = 0;
  let enCours: { generation: number; promesse: Promise<ReponseGetUser> } | null = null;
  let memorise: { generation: number; a: number; reponse: ReponseGetUser } | null = null;

  const vider = () => {
    generation += 1;
    enCours = null;
    memorise = null;
  };

  try {
    auth.onAuthStateChange((evenement) => {
      // INITIAL_SESSION : simple lecture de la session au démarrage, rien n'a changé.
      if (evenement !== 'INITIAL_SESSION') vider();
    });
  } catch {
    // Client simulé (tests) sans onAuthStateChange : cache sans invalidation automatique.
  }

  const partage = (jwt?: string): Promise<ReponseGetUser> => {
    if (jwt) return original(jwt);
    const maintenant = Date.now();
    if (memorise && memorise.generation === generation && maintenant - memorise.a < dureeMs) {
      return Promise.resolve(memorise.reponse);
    }
    if (enCours && enCours.generation === generation) return enCours.promesse;

    const gen = generation;
    const promesse = original().then((reponse) => {
      // Rangé seulement si aucun événement d'authentification n'est survenu entre-temps
      // et si la réponse est valable (une erreur réseau sera retentée au prochain appel).
      if (gen === generation && !reponse.error && reponse.data?.user) {
        memorise = { generation: gen, a: Date.now(), reponse };
      }
      return reponse;
    }).finally(() => {
      if (enCours?.promesse === promesse) enCours = null;
    });
    enCours = { generation: gen, promesse };
    return promesse;
  };

  auth.getUser = partage as Auth['getUser'];
}
