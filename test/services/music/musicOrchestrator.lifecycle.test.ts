import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GenerateMusicPayload } from '@/music/generate';
import { musicOrchestrator, musicOrchestratorTestUtils } from '@/services/musicOrchestrator';
import { useMusicQueueStore } from '@/stores/musicQueueStore';

const basePayload: GenerateMusicPayload = {
  model: 'V4',
  prompt: 'cardiology focus track',
  callBackUrl: 'https://example.com/callback',
  customMode: false,
  instrumental: true,
};

const mockEq = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn(() => ({ eq: mockEq }));
const mockInsert = vi.fn(() => ({ eq: mockEq }));
const mockUpsert = vi.fn(() => ({ eq: mockEq }));
const mockSelect = vi.fn(() => ({ eq: mockEq, maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }));
const mockFrom = vi.fn(() => ({
  update: mockUpdate,
  insert: mockInsert,
  upsert: mockUpsert,
  select: mockSelect,
}));
const mockAuthGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } });

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom,
    auth: { getUser: mockAuthGetUser },
  },
}));

vi.mock('@/services/CanonicalAnalyticsTracker', () => ({
  trackCanonicalEvent: vi.fn(),
}));

vi.mock('@/utils/structuredLogger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('musicOrchestrator lifecycle controls', () => {
  beforeEach(() => {
    useMusicQueueStore.getState().reset();
    vi.clearAllMocks();
    mockEq.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    useMusicQueueStore.getState().reset();
  });

  it('cancels a running job and persists the cancellation state', () => {
    const job = musicOrchestratorTestUtils.createJobFromOptions({
      payload: basePayload,
      metadata: { supabaseTrackId: 'track-99' },
    });

    useMusicQueueStore.getState().enqueueJob(job);
    useMusicQueueStore.getState().startNextJob();

    musicOrchestrator.cancelJob(job.id, 'User requested cancel');

    const stored = useMusicQueueStore.getState().jobs[job.id];
    expect(stored.status).toBe('canceled');
    expect(stored.error).toBe('User requested cancel');
    stored.segments.forEach((segment) => {
      expect(segment.status).toBe('canceled');
      expect(segment.error).toBe('User requested cancel');
    });

    expect(mockFrom).toHaveBeenCalledWith('generated_music_tracks');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'canceled', generation_status: 'canceled' }),
    );
    const eqArgs = mockEq.mock.calls.at(-1);
    expect(eqArgs?.[0]).toBe('id');
    expect(eqArgs?.[1]).toBe('track-99');
  });

  it('resets a failed job when retrying and requeues it with clean segments', async () => {
    const job = musicOrchestratorTestUtils.createJobFromOptions({
      payload: basePayload,
      metadata: { supabaseTrackId: 'track-07' },
    });

    useMusicQueueStore.getState().enqueueJob(job);
    useMusicQueueStore.getState().startNextJob();
    useMusicQueueStore.getState().setJobStatus(job.id, 'failed', 'Network error');
    useMusicQueueStore.getState().updateJob(job.id, (draft) => {
      draft.retryCount = 2;
      draft.segments.forEach((segment) => {
        segment.status = 'failed';
        segment.progress = 15;
        segment.error = 'Network error';
      });
    });

    const orchestratorProxy = musicOrchestrator as unknown as { processQueue: () => Promise<void> };
    const processQueueSpy = vi.spyOn(orchestratorProxy, 'processQueue').mockResolvedValue();

    await musicOrchestrator.retryJob(job.id);

    const retried = useMusicQueueStore.getState().jobs[job.id];
    expect(retried.status).toBe('queued');
    expect(retried.retryCount).toBe(0);
    expect(retried.error).toBeNull();
    expect(retried.backoffUntil).toBeUndefined();
    retried.segments.forEach((segment, index) => {
      expect(segment.status).toBe('pending');
      expect(segment.progress).toBe(0);
      expect(segment.error).toBeNull();
      expect(segment.index).toBe(index);
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'queued', generation_status: 'pending' }),
    );
    expect(processQueueSpy).toHaveBeenCalled();

    processQueueSpy.mockRestore();
  });
});
