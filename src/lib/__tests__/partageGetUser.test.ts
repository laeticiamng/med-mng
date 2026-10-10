import { describe, expect, it, vi } from 'vitest';
import { installerPartageGetUser } from '../partageGetUser';

/**
 * 09.10.2026 (test en production) : 6 × GET /auth/v1/user à l'ouverture de /edn-complete.
 * Les appels simultanés ou rapprochés doivent partager une seule requête, sans jamais
 * resservir l'utilisateur d'avant une déconnexion.
 */
function fauxAuth() {
  let ecouteur: ((evenement: string) => void) | null = null;
  let n = 0;
  let resolveurs: Array<() => void> = [];
  const auth = {
    getUser: vi.fn((jwt?: string) => {
      n += 1;
      const id = jwt ? `jeton-${jwt}` : `u${n}`;
      return new Promise((resolve) => {
        resolveurs.push(() => resolve({ data: { user: { id } }, error: null }));
      });
    }),
    onAuthStateChange: vi.fn((cb: (evenement: string) => void) => {
      ecouteur = cb;
      return { data: { subscription: { unsubscribe: () => {} } } };
    }),
  };
  return {
    auth,
    emettre: (evenement: string) => ecouteur?.(evenement),
    resoudre: () => {
      const r = resolveurs;
      resolveurs = [];
      r.forEach((f) => f());
    },
  };
}

describe('installerPartageGetUser', () => {
  it('appels simultanés : une seule requête, même réponse', async () => {
    const f = fauxAuth();
    const original = f.auth.getUser;
    installerPartageGetUser(f.auth as never);
    const p = Promise.all([1, 2, 3, 4, 5, 6].map(() => f.auth.getUser()));
    f.resoudre();
    const reponses = await p;
    expect(original).toHaveBeenCalledTimes(1);
    expect(new Set(reponses.map((r) => (r as { data: { user: { id: string } } }).data.user.id))).toEqual(new Set(['u1']));
  });

  it('appel rapproché : resservi depuis le cache, sans requête', async () => {
    const f = fauxAuth();
    const original = f.auth.getUser;
    installerPartageGetUser(f.auth as never);
    const p1 = f.auth.getUser();
    f.resoudre();
    await p1;
    await f.auth.getUser();
    expect(original).toHaveBeenCalledTimes(1);
  });

  it('cache expiré : nouvelle requête', async () => {
    let maintenant = 1_000_000;
    const horloge = vi.spyOn(Date, 'now').mockImplementation(() => maintenant);
    try {
      const f = fauxAuth();
      const original = f.auth.getUser;
      installerPartageGetUser(f.auth as never, 1000);
      const p1 = f.auth.getUser();
      f.resoudre();
      await p1;
      maintenant += 1500;
      const p2 = f.auth.getUser();
      f.resoudre();
      await p2;
      expect(original).toHaveBeenCalledTimes(2);
    } finally {
      horloge.mockRestore();
    }
  });

  it('déconnexion : cache vidé, et une requête lancée avant n’est pas mise en cache', async () => {
    const f = fauxAuth();
    const original = f.auth.getUser;
    installerPartageGetUser(f.auth as never);
    const avant = f.auth.getUser();
    f.emettre('SIGNED_OUT');
    f.resoudre();
    await avant;
    const apres = f.auth.getUser();
    f.resoudre();
    const r = (await apres) as { data: { user: { id: string } } };
    expect(original).toHaveBeenCalledTimes(2);
    expect(r.data.user.id).toBe('u2');
  });

  it('INITIAL_SESSION ne vide pas le cache', async () => {
    const f = fauxAuth();
    const original = f.auth.getUser;
    installerPartageGetUser(f.auth as never);
    const p1 = f.auth.getUser();
    f.resoudre();
    await p1;
    f.emettre('INITIAL_SESSION');
    await f.auth.getUser();
    expect(original).toHaveBeenCalledTimes(1);
  });

  it('jeton explicite : jamais partagé ni mis en cache', async () => {
    const f = fauxAuth();
    const original = f.auth.getUser;
    installerPartageGetUser(f.auth as never);
    const p = Promise.all([f.auth.getUser('a'), f.auth.getUser('a')]);
    f.resoudre();
    await p;
    expect(original).toHaveBeenCalledTimes(2);
  });

  it('installation idempotente', async () => {
    const f = fauxAuth();
    const original = f.auth.getUser;
    installerPartageGetUser(f.auth as never);
    installerPartageGetUser(f.auth as never);
    const p = Promise.all([f.auth.getUser(), f.auth.getUser()]);
    f.resoudre();
    await p;
    expect(original).toHaveBeenCalledTimes(1);
    expect(f.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
  });
});
