import { describe, expect, it, vi } from 'vitest';
import { installerPartageGetUser } from '../partageGetUser';

/**
 * 09.10.2026 (test en production) : 6 × GET /auth/v1/user à l'ouverture de /edn-complete.
 * Les appels simultanés partagent une seule requête ; rien n'est conservé après la réponse
 * (revue Codex #241 : la validation serveur de getUser() doit être préservée).
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

  it('après la réponse : aucun cache, l’appel suivant revalide auprès du serveur (session révoquée détectée)', async () => {
    const f = fauxAuth();
    const original = f.auth.getUser;
    installerPartageGetUser(f.auth as never);
    const p1 = f.auth.getUser();
    f.resoudre();
    await p1;
    const p2 = f.auth.getUser();
    f.resoudre();
    const r2 = (await p2) as { data: { user: { id: string } } };
    expect(original).toHaveBeenCalledTimes(2);
    expect(r2.data.user.id).toBe('u2');
  });

  it('déconnexion pendant un appel : les appels suivants ne rejoignent pas l’appel d’avant', async () => {
    const f = fauxAuth();
    const original = f.auth.getUser;
    installerPartageGetUser(f.auth as never);
    const avant = f.auth.getUser();
    f.emettre('SIGNED_OUT');
    const apres = f.auth.getUser();
    f.resoudre();
    await avant;
    const r = (await apres) as { data: { user: { id: string } } };
    expect(original).toHaveBeenCalledTimes(2);
    expect(r.data.user.id).toBe('u2');
  });

  it('INITIAL_SESSION ne détache pas l’appel en cours', async () => {
    const f = fauxAuth();
    const original = f.auth.getUser;
    installerPartageGetUser(f.auth as never);
    const p1 = f.auth.getUser();
    f.emettre('INITIAL_SESSION');
    const p2 = f.auth.getUser();
    f.resoudre();
    await Promise.all([p1, p2]);
    expect(original).toHaveBeenCalledTimes(1);
  });

  it('jeton explicite : jamais partagé', async () => {
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
