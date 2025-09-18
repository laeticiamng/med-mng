import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnValue({ data: null, error: null }),
  },
}));

vi.mock('@/utils/environment', () => ({
  isTestEnvironment: () => true,
}));

import { EdnProgressService } from '@/services/EdnProgressService';

describe('EdnProgressService (test harness mode)', () => {
  let service: EdnProgressService;

  beforeEach(() => {
    service = new EdnProgressService();
    window.localStorage.clear();
  });

  it('provides deterministic unified EDN catalog in test mode', async () => {
    const items = await service.fetchUnifiedItems();

    expect(items).toHaveLength(2);
    const cardio = items[0];
    expect(cardio.item_code).toBe('CARDIO-001');
    expect(cardio.tableaux.rang_a.sections).not.toHaveLength(0);
    expect(cardio.valeurs_professionnelles[0]?.title).toContain('Relation');
  });

  it('returns canned progression records bound to the test user', async () => {
    const progress = await service.fetchUserProgress('any-user-id');

    expect(progress).toHaveLength(2);
    expect(progress[0].user_id).toBe('test-edn-user');
  });

  it('persists session plans locally and supports updates/deletes', async () => {
    const created = await service.saveSessionPlan({
      userId: 'test-edn-user',
      title: 'Session cardio',
      durationMinutes: 8,
      plan: {
        jeDis: ['Points clés'],
        jeFais: ['Cas clinique'],
        jeConclue: ['Synthèse'],
      },
    });

    expect(created?.title).toBe('Session cardio');

    const plansAfterCreate = await service.listSessionPlans('test-edn-user');
    expect(plansAfterCreate).toHaveLength(1);

    const updated = await service.saveSessionPlan({
      id: created?.id,
      userId: 'test-edn-user',
      title: 'Session cardio ++',
      plan: {
        jeDis: ['Point unique'],
        jeFais: ['Simulation'],
        jeConclue: ['Question flash'],
      },
    });

    expect(updated?.title).toBe('Session cardio ++');

    const deleted = await service.deleteSessionPlan(updated!.id);
    expect(deleted).toBe(true);
    const plansAfterDelete = await service.listSessionPlans('test-edn-user');
    expect(plansAfterDelete).toHaveLength(0);
  });
});
