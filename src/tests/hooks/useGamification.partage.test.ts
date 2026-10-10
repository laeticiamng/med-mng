import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * 09.10.2026 (test en production) : ~97 requêtes en 12 s sur /edn-complete (chaque composant
 * rechargeait les statistiques de gamification) et 2 × 401 sur user_gamification_stats à la
 * déconnexion (écriture partie après la fin de session).
 */
const etat = vi.hoisted(() => ({
  requetes: [] as string[],
  upserts: 0,
  ecouteurAuth: null as ((evenement: string) => void) | null,
  session: { user: { id: 'u1' } } as { user: { id: string } } | null,
  porte: null as Promise<void> | null,
  points: 10,
  /** Porte propre à une table (une requête de cette table attend son ouverture). */
  porteTable: null as { table: string; porte: Promise<void> } | null,
  /** Table dont la lecture échoue ({ data: null, error }). */
  erreurTable: null as string | null,
  badges: [] as Array<Record<string, unknown>>,
}));

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

vi.mock('@/integrations/supabase/client', () => {
  const chaine = (table: string) => {
    const resultat = () => {
      if (etat.erreurTable === table) return { data: null, count: null, error: { message: 'panne simulée' } };
      if (table === 'user_activity_log') {
        const d = new Date();
        const jour = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return { data: [{ activity_date: jour }], count: 1, error: null };
      }
      if (table === 'user_gamification_stats') return { data: null, error: null };
      if (table === 'user_badges') return { data: etat.badges, error: null };
      if (table === 'gamification_activities') return { data: [{ points_earned: etat.points }], error: null };
      return { data: [], count: 0, error: null };
    };
    // Valeur et porte figées à l'appel (une requête lit l'état de la base au moment où elle part).
    const valeur = resultat();
    const porte = etat.porteTable?.table === table ? etat.porteTable.porte : etat.porte;
    const objet: Record<string, unknown> = {};
    for (const m of ['select', 'eq', 'order', 'limit', 'gte', 'in']) objet[m] = () => objet;
    objet.maybeSingle = () => objet;
    objet.then = (ok: (v: unknown) => unknown, ko: (e: unknown) => unknown) =>
      (porte ?? Promise.resolve()).then(() => valeur).then(ok, ko);
    return objet;
  };
  return {
    supabase: {
      auth: {
        onAuthStateChange: (cb: (evenement: string) => void) => {
          etat.ecouteurAuth = cb;
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        getSession: async () => ({ data: { session: etat.session } }),
      },
      from: (table: string) => {
        etat.requetes.push(table);
        const c = chaine(table);
        c.insert = async () => ({ error: null });
        c.upsert = async () => {
          etat.upserts += 1;
          return { error: null };
        };
        return c;
      },
    },
  };
});

import { useGamification, viderCacheGamification } from '@/hooks/useGamification';

describe('useGamification — chargement partagé', () => {
  beforeEach(() => {
    viderCacheGamification();
    etat.requetes = [];
    etat.upserts = 0;
    etat.session = { user: { id: 'u1' } };
    etat.porte = null;
    etat.points = 10;
    etat.porteTable = null;
    etat.erreurTable = null;
    etat.badges = [];
  });

  it('plusieurs composants : un seul chargement, mêmes statistiques partout', async () => {
    const instances = [1, 2, 3, 4].map(() => renderHook(() => useGamification()));
    await act(async () => {
      await Promise.all(instances.map((i) => i.result.current.loadStats('u1')));
    });
    expect(etat.requetes.filter((t) => t === 'user_badges')).toHaveLength(1);
    expect(etat.requetes.filter((t) => t === 'user_gamification_stats').length).toBeLessThanOrEqual(2);
    for (const i of instances) expect(i.result.current.stats?.currentStreak).toBe(1);

    // Un composant monté plus tard : servi par le cache, sans requête
    const n = etat.requetes.length;
    const tardif = renderHook(() => useGamification());
    await act(async () => {
      await tardif.result.current.loadStats('u1');
    });
    expect(etat.requetes.length).toBe(n);
    expect(tardif.result.current.stats?.currentStreak).toBe(1);
  });

  it('déconnexion pendant un chargement : aucune écriture sans session (plus de 401)', async () => {
    let ouvrir: () => void = () => {};
    etat.porte = new Promise<void>((r) => {
      ouvrir = r;
    });
    const { result } = renderHook(() => useGamification());
    let chargement: Promise<void> = Promise.resolve();
    act(() => {
      chargement = result.current.loadStats('u1');
    });
    // Déconnexion : session vidée et événement émis avant la fin des lectures
    etat.session = null;
    etat.ecouteurAuth?.('SIGNED_OUT');
    await act(async () => {
      ouvrir();
      await chargement;
    });
    expect(etat.upserts).toBe(0);
  });

  it('session toujours active : la plus longue série est bien enregistrée', async () => {
    const { result } = renderHook(() => useGamification());
    await act(async () => {
      await result.current.loadStats('u1');
    });
    expect(etat.upserts).toBe(1);
  });

  // Revue Codex #241 : un chargement lancé AVANT addPoints et terminé APRÈS la relecture forcée
  // ne doit pas republier les anciens points.
  it('chargement ancien terminé après une relecture forcée : les nouveaux points restent', async () => {
    // L'ancien chargement lit les points (10) puis reste bloqué sur la lecture suivante
    let ouvrir: () => void = () => {};
    etat.porteTable = {
      table: 'user_activity_log',
      porte: new Promise<void>((r) => {
        ouvrir = r;
      }),
    };
    const { result } = renderHook(() => useGamification());
    let ancien: Promise<void> = Promise.resolve();
    await act(async () => {
      ancien = result.current.loadStats('u1');
      await new Promise((r) => setTimeout(r, 0));
    });
    // La base change (points gagnés) et la relecture forcée répond immédiatement
    etat.porteTable = null;
    etat.points = 110;
    await act(async () => {
      await result.current.addPoints('u1', 100, 'examCompleted');
    });
    expect(result.current.stats?.totalPoints).toBe(110);
    // L'ancien chargement (10 points) se termine maintenant
    await act(async () => {
      ouvrir();
      await ancien;
    });
    expect(result.current.stats?.totalPoints).toBe(110);
    // Le cache partagé n'a pas été écrasé : un nouveau composant voit 110
    const tardif = renderHook(() => useGamification());
    await act(async () => {
      await tardif.result.current.loadStats('u1');
    });
    expect(tardif.result.current.stats?.totalPoints).toBe(110);
  });

  // Revue Codex #241 : une lecture en erreur ne doit pas être mise en cache (zéros fabriqués).
  it('lecture en erreur : rien de publié ni mis en cache, le chargement suivant relit le serveur', async () => {
    const erreurConsole = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      etat.erreurTable = 'gamification_activities';
      const a = renderHook(() => useGamification());
      await act(async () => {
        await a.result.current.loadStats('u1');
      });
      expect(a.result.current.stats).toBeNull();
      expect(a.result.current.loading).toBe(false);

      etat.erreurTable = null;
      etat.points = 42;
      const n = etat.requetes.length;
      const b = renderHook(() => useGamification());
      await act(async () => {
        await b.result.current.loadStats('u1');
      });
      expect(etat.requetes.length).toBeGreaterThan(n);
      expect(b.result.current.stats?.totalPoints).toBe(42);
    } finally {
      erreurConsole.mockRestore();
    }
  });

  it('badge débloqué pendant un chargement : le chargement ancien ne l’efface pas', async () => {
    let ouvrir: () => void = () => {};
    const a = renderHook(() => useGamification());
    await act(async () => {
      await a.result.current.loadStats('u1');
    });
    // Un autre composant relance une lecture (forcée) qui reste bloquée avant la lecture des badges
    etat.porteTable = {
      table: 'user_badges',
      porte: new Promise<void>((r) => {
        ouvrir = r;
      }),
    };
    let lecture: Promise<boolean> = Promise.resolve(true);
    act(() => {
      lecture = a.result.current.addPoints('u1', 10, 'itemReviewed');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    etat.porteTable = null;
    etat.points = 20;
    etat.badges = [{ badge_id: 'first_item', badge_name: 'Premier Pas', unlocked: true }];
    await act(async () => {
      await a.result.current.unlockBadge('u1', 'first_item');
    });
    expect(a.result.current.stats?.badges.map((b) => b.id)).toContain('first_item');
    await act(async () => {
      ouvrir();
      await lecture;
    });
    // La lecture bloquée (sans le badge) ne republie pas par-dessus
    expect(a.result.current.stats?.badges.map((b) => b.id)).toContain('first_item');
    const tardif = renderHook(() => useGamification());
    await act(async () => {
      await tardif.result.current.loadStats('u1');
    });
    expect(tardif.result.current.stats?.badges.map((b) => b.id)).toContain('first_item');
    expect(tardif.result.current.stats?.totalPoints).toBe(20);
  });
});
