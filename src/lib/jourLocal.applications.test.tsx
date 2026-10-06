/**
 * Non-régression « jour UTC » sur le code de l'application (écriture puis relecture) :
 * séries de jours, défis du jour et compteur de cartes du jour, à Zurich (et autres fuseaux).
 *
 * Chaque scénario échoue avec l'ancien calcul `new Date().toISOString().split('T')[0]`
 * (jour UTC) : voir le commentaire « avant » de chaque test.
 */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Faux client Supabase en mémoire (chaînable, « thenable » comme le vrai) -----------------
type Ligne = Record<string, any>;
const faux = vi.hoisted(() => {
  const tables: Record<string, Ligne[]> = {};
  const journal: Array<{ table: string; op: string; colonne?: string; valeur?: unknown }> = [];

  class Requete {
    private filtres: Array<(l: Ligne) => boolean> = [];
    private tri: { colonne: string; asc: boolean } | null = null;
    private max: number | null = null;
    private unique = false;
    private aInserer: Ligne[] | null = null;
    constructor(private table: string) {}
    select() { return this; }
    insert(lignes: Ligne | Ligne[]) {
      this.aInserer = Array.isArray(lignes) ? lignes : [lignes];
      return this;
    }
    upsert(lignes: Ligne | Ligne[]) { return this.insert(lignes); }
    private filtre(op: string, colonne: string, valeur: unknown, f: (l: Ligne) => boolean) {
      journal.push({ table: this.table, op, colonne, valeur });
      this.filtres.push(f);
      return this;
    }
    eq(c: string, v: unknown) { return this.filtre('eq', c, v, (l) => l[c] === v); }
    gte(c: string, v: any) { return this.filtre('gte', c, v, (l) => l[c] >= v); }
    lte(c: string, v: any) { return this.filtre('lte', c, v, (l) => l[c] <= v); }
    lt(c: string, v: any) { return this.filtre('lt', c, v, (l) => l[c] < v); }
    in(c: string, v: unknown[]) { return this.filtre('in', c, v, (l) => v.includes(l[c])); }
    order(colonne: string, o?: { ascending?: boolean }) {
      this.tri = { colonne, asc: o?.ascending !== false };
      return this;
    }
    limit(n: number) { this.max = n; return this; }
    maybeSingle() { this.unique = true; return this; }
    single() { this.unique = true; return this; }
    private executer() {
      if (this.aInserer) {
        (tables[this.table] ??= []).push(...this.aInserer);
        journal.push({ table: this.table, op: 'insert', valeur: this.aInserer });
        return { data: this.aInserer, error: null };
      }
      let lignes = (tables[this.table] ?? []).filter((l) => this.filtres.every((f) => f(l)));
      if (this.tri) {
        const { colonne, asc } = this.tri;
        lignes = [...lignes].sort((a, b) => (a[colonne] < b[colonne] ? -1 : a[colonne] > b[colonne] ? 1 : 0) * (asc ? 1 : -1));
      }
      if (this.max != null) lignes = lignes.slice(0, this.max);
      return { data: this.unique ? lignes[0] ?? null : lignes, error: null, count: lignes.length };
    }
    then(ok: (v: unknown) => unknown, ko?: (e: unknown) => unknown) {
      return Promise.resolve(this.executer()).then(ok, ko);
    }
  }

  const supabase = {
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: (table: string) => new Requete(table),
  };
  return { tables, journal, supabase };
});

vi.mock('@/integrations/supabase/client', () => ({ supabase: faux.supabase }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { ecosService } from '@/services/ecosService';
import { qcmService } from '@/services/qcmService';
import { useUserStore } from '@/stores/userStore';
import { useDailyChallenges } from '@/hooks/useDailyChallenges';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useActivityTracking } from '@/hooks/useActivityTracking';

// --- Fuseau et horloge ----------------------------------------------------------------------
const fuseauInitial = process.env.TZ;
function aZurich() {
  process.env.TZ = 'Europe/Zurich';
}
function horloge(iso: string) {
  vi.setSystemTime(new Date(iso));
}

beforeEach(() => {
  for (const t of Object.keys(faux.tables)) delete faux.tables[t];
  faux.journal.length = 0;
  vi.useFakeTimers({ toFake: ['Date'] });
});
afterEach(() => {
  vi.useRealTimers();
  if (fuseauInitial === undefined) delete process.env.TZ;
  else process.env.TZ = fuseauInitial;
});

describe('série de jours : révision de nuit (00 h 30) enregistrée sur le bon jour', () => {
  it('ECOS : 14 juillet après-midi, 15 juillet à 00 h 30, 16 juillet → série de 3', async () => {
    aZurich();
    horloge('2026-07-14T13:00:00Z'); // 14 juillet, 15 h
    await ecosService.markAsStudied('u1', 1);
    horloge('2026-07-14T22:30:00Z'); // 15 juillet, 00 h 30 (heure d'été)
    await ecosService.markAsStudied('u1', 2);
    horloge('2026-07-16T13:00:00Z'); // 16 juillet, 15 h
    await ecosService.markAsStudied('u1', 3);

    expect(faux.tables.user_activity_log.map((l) => l.activity_date)).toEqual([
      '2026-07-14', '2026-07-15', '2026-07-16',
    ]); // avant : 14, 14, 16 (la révision de 00 h 30 tombait sur la veille)

    horloge('2026-07-16T16:00:00Z');
    const stats = await ecosService.getUserEcosStats('u1');
    expect(stats.studyStreak).toBe(3); // avant : 1
  });

  it('journal d’activité : jour local envoyé explicitement (la colonne vaut CURRENT_DATE, jour UTC)', async () => {
    aZurich();
    const { result } = renderHook(() => useActivityTracking());
    for (const instant of ['2026-07-14T13:00:00Z', '2026-07-14T22:30:00Z', '2026-07-16T06:00:00Z']) {
      horloge(instant);
      await act(async () => {
        await result.current.logActivity({ activity_type: 'srs_review' });
      });
    }
    // avant : activity_date absent, donc CURRENT_DATE du serveur (UTC) : 14, 14, 16
    expect(faux.tables.user_activity_log.map((l) => l.activity_date)).toEqual([
      '2026-07-14', '2026-07-15', '2026-07-16',
    ]);
    horloge('2026-07-16T18:00:00Z');
    let serie: { current: number; longest: number } | undefined;
    await act(async () => {
      serie = await result.current.getStreak();
    });
    expect(serie).toEqual({ current: 3, longest: 3 });
  });

  it('QCM : série traversant le changement d’heure du 25 octobre, sessions de nuit', () => {
    aZurich();
    horloge('2026-10-26T09:00:00Z'); // 26 octobre, 10 h
    const sessions = [
      { completed_at: '2026-10-24T13:00:00+00:00' }, // 24 oct., 15 h
      { completed_at: '2026-10-24T22:30:00+00:00' }, // 25 oct., 00 h 30 (UTC+2)
      { completed_at: '2026-10-25T23:30:00+00:00' }, // 26 oct., 00 h 30 (UTC+1)
    ] as any;
    expect(qcmService.calculateStreak(sessions)).toBe(3); // avant : 1
  });

  it('série locale du profil (store) : 14 juillet, 15 juillet à 00 h 30, 16 juillet à 8 h → 3', () => {
    aZurich();
    useUserStore.setState((s) => ({ progress: { ...s.progress, streak: 0, lastStudyDate: null } }));
    horloge('2026-07-14T13:00:00Z');
    useUserStore.getState().updateStreak();
    horloge('2026-07-14T22:30:00Z');
    useUserStore.getState().updateStreak(); // avant : « déjà étudié aujourd'hui » (jour UTC = 14)
    horloge('2026-07-16T06:00:00Z');
    useUserStore.getState().updateStreak(); // avant : remise à 1
    expect(useUserStore.getState().progress.streak).toBe(3);
    expect(useUserStore.getState().progress.lastStudyDate).toBe('2026-07-16');
  });
});

function enveloppe() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
const joursDemandes = () =>
  faux.journal.filter((j) => j.table === 'daily_challenges' && j.colonne === 'challenge_date').map((j) => j.valeur);

describe('défis du jour : jour local, bascule à minuit local', () => {
  it('à 00 h 30 (Zurich, été) ce sont les défis du 15 juillet', async () => {
    aZurich();
    horloge('2026-07-14T22:30:00Z');
    const { result } = renderHook(() => useDailyChallenges(), { wrapper: enveloppe() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(joursDemandes()).toEqual(['2026-07-15']); // avant : '2026-07-14' jusqu'à 2 h
  });

  it('page restée ouverte : à minuit local, les défis passent au jour suivant', async () => {
    aZurich();
    vi.useRealTimers();
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'], shouldAdvanceTime: true });
    horloge('2026-01-14T22:59:00Z'); // 14 janvier, 23 h 59 (heure d'hiver)
    const { result } = renderHook(() => useDailyChallenges(), { wrapper: enveloppe() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(joursDemandes()).toEqual(['2026-01-14']);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2 * 60_000); // minuit passé
    });
    await waitFor(() => expect(joursDemandes()).toEqual(['2026-01-14', '2026-01-15'])); // avant : jamais
  });
});

describe('cartes révisées « aujourd’hui » : depuis minuit local', () => {
  it('à 00 h 30 (Zurich, été), le compteur part du 15 juillet 00 h locale (22 h UTC)', async () => {
    aZurich();
    horloge('2026-07-14T22:30:00Z');
    const { result } = renderHook(() => useFlashcards());
    await act(async () => {
      await result.current.getStats('u1');
    });
    const borne = faux.journal.find((j) => j.table === 'flashcard_reviews' && j.op === 'gte');
    // avant : '2026-07-14' (minuit UTC : 22 h 30 de révisions de la veille comptées « aujourd'hui »)
    expect(borne?.valeur).toBe('2026-07-14T22:00:00.000Z');
  });
});
