import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * MM-A03 : upsertItemProgress écrivait content_type = 'item' et
 * mastery_level = 'revised', refusés par les contraintes CHECK de
 * user_progress ; la lecture filtrait sur 'item'. Lecture et écriture
 * doivent utiliser les mêmes valeurs autorisées.
 */
const appels: Array<{ table: string; op: string; arg: unknown }> = [];

vi.mock('@/integrations/supabase/client', () => {
  const builder = (table: string) => {
    const b: Record<string, unknown> = {};
    b.upsert = (arg: unknown) => {
      appels.push({ table, op: 'upsert', arg });
      return Promise.resolve({ error: null });
    };
    b.select = () => b;
    b.eq = (col: string, val: unknown) => {
      appels.push({ table, op: `eq:${col}`, arg: val });
      return b;
    };
    b.not = () => b;
    b.order = () => b;
    b.then = (r: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(r);
    return b;
  };
  return { supabase: { from: (t: string) => builder(t) } };
});

import { fetchItemsWithMeta, upsertItemProgress } from '../medMngItemsService';

const TYPES_AUTORISES = ['edn', 'ecos', 'quiz'];
const NIVEAUX_AUTORISES = ['beginner', 'intermediate', 'advanced', 'expert', null];

describe('medMngItemsService — user_progress', () => {
  beforeEach(() => {
    appels.length = 0;
  });

  it('écrit des valeurs acceptées par les contraintes CHECK', async () => {
    for (const status of ['not_started', 'in_progress', 'revised'] as const) {
      await upsertItemProgress({ userId: 'u', itemId: 'i', status, lastSeenAt: null, revisionCount: 1, score: 0 });
    }
    const ecritures = appels.filter((a) => a.op === 'upsert').map((a) => a.arg as Record<string, unknown>);
    expect(ecritures).toHaveLength(3);
    for (const e of ecritures) {
      expect(TYPES_AUTORISES).toContain(e.content_type);
      expect(NIVEAUX_AUTORISES).toContain(e.mastery_level);
    }
  });

  it('relit le même content_type que celui écrit', async () => {
    await upsertItemProgress({ userId: 'u', itemId: 'i', status: 'revised', lastSeenAt: null, revisionCount: 1, score: 0 });
    const ecrit = (appels.find((a) => a.op === 'upsert')!.arg as Record<string, unknown>).content_type;
    appels.length = 0;
    await fetchItemsWithMeta('u');
    const lu = appels.find((a) => a.table === 'user_progress' && a.op === 'eq:content_type')?.arg;
    expect(lu).toBe(ecrit);
  });
});
