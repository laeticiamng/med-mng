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
}));

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

vi.mock('@/integrations/supabase/client', () => {
  const chaine = (table: string) => {
    const resultat = () => {
      if (table === 'user_activity_log') {
        const d = new Date();
        const jour = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return { data: [{ activity_date: jour }], count: 1, error: null };
      }
      if (table === 'user_gamification_stats') return { data: null, error: null };
      return { data: [], count: 0, error: null };
    };
    const objet: Record<string, unknown> = {};
    for (const m of ['select', 'eq', 'order', 'limit', 'gte', 'in']) objet[m] = () => objet;
    objet.maybeSingle = () => objet;
    objet.then = (ok: (v: unknown) => unknown, ko: (e: unknown) => unknown) =>
      (etat.porte ?? Promise.resolve()).then(() => resultat()).then(ok, ko);
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
});
