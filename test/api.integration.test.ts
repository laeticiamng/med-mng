import { describe, test, expect, beforeAll, vi } from 'vitest';
import { handleSongs } from '../supabase/functions/med-mng-api/routes/songs.ts';
import { handleLibrary } from '../supabase/functions/med-mng-api/routes/library.ts';
import { handleQuota } from '../supabase/functions/med-mng-api/routes/quota.ts';
import { handleSubscriptions } from '../supabase/functions/med-mng-api/routes/subscriptions.ts';

const createRequest = (path: string, method: string, body?: any) =>
  new Request(`https://example.com${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

describe('med-mng-api route handlers', () => {
  beforeAll(() => {
    // Provide Deno.env.get in Node tests
    // @ts-ignore
    global.Deno = { env: { get: (k: string) => process.env[k] } };
  });

  // Contrat actuel (routes/songs.ts) : quota épuisé => 409 QUOTA_EXCEEDED, et aucune insertion.
  test('POST /songs returns 409 when quota insufficient', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: 0 }),
      from: vi.fn(),
    };
    const req = createRequest('/songs', 'POST', {
      title: 'Test',
      suno_audio_id: '123',
    });
    const res = await handleSongs(req, supabase, '/songs', 'user-1');
    expect(res?.status).toBe(409);
    const body = await res?.json();
    expect(body).toMatchObject({
      error: 'QUOTA_EXCEEDED',
      code: 409,
      message: 'Quota insuffisant pour créer une chanson',
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  // Contrat actuel : 201 Created, et la chanson est rattachée à l'utilisateur authentifié (RLS).
  test('POST /songs creates song for the authenticated user when quota ok', async () => {
    const insertMock = vi.fn().mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: '1' }, error: null }),
      }),
    });
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: 2 }),
      from: vi.fn(() => ({ insert: insertMock })),
    };
    const req = createRequest('/songs', 'POST', {
      title: 'Demo',
      suno_audio_id: 'abc',
    });
    const res = await handleSongs(req, supabase, '/songs', 'user-1');
    expect(res?.status).toBe(201);
    const body = await res?.json();
    expect(body.id).toBe('1');
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Demo', suno_audio_id: 'abc', user_id: 'user-1' })
    );
  });

  // Signature actuelle : handleQuota(req, supabase, user, path) ; la RPC get_music_quota renvoie un tableau.
  test('GET /quota returns remaining credits', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: [{ remaining_credits: 5, total_credits: 10, credits_used_this_period: 5, can_generate: true }],
        error: null,
      }),
    };
    const req = createRequest('/quota', 'GET');
    const res = await handleQuota(req, supabase, { id: 'user-1' }, '/quota');
    expect(res?.status).toBe(200);
    const body = await res?.json();
    expect(body.remaining_credits).toBe(5);
    expect(body.total_credits).toBe(10);
    expect(body.can_generate).toBe(true);
    expect(supabase.rpc).toHaveBeenCalledWith('get_music_quota', { p_user_id: 'user-1' });
  });

  // Pagination standardisée : le total est désormais dans body.pagination.
  test('GET /library returns paginated list', async () => {
    const range = vi
      .fn()
      .mockResolvedValue({ data: [{ id: '1' }], count: 10, error: null });
    const supabase = {
      from: vi.fn(() => ({ select: () => ({ order: () => ({ range }) }) })),
    } as any;
    const req = createRequest('/library?page=1&limit=1', 'GET');
    const res = await handleLibrary(
      req,
      supabase,
      '/library',
      new URL(req.url)
    );
    expect(res?.status).toBe(200);
    const body = await res?.json();
    expect(body.items.length).toBe(1);
    expect(body.pagination.totalCount).toBe(10);
    expect(range).toHaveBeenCalledWith(0, 0);
  });

  test('GET /songs returns paginated list', async () => {
    const range = vi
      .fn()
      .mockResolvedValue({ data: [{ id: '1' }], count: 5, error: null });
    const supabase = {
      from: vi.fn(() => ({ select: () => ({ order: () => ({ range }) }) })),
    } as any;
    const req = createRequest('/songs?page=2&limit=1', 'GET');
    const res = await handleSongs(req, supabase, '/songs');
    expect(res?.status).toBe(200);
    const body = await res?.json();
    expect(body.pagination.page).toBe(2);
    expect(body.pagination.totalCount).toBe(5);
  });

  test('POST /songs validates input properly', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: 2 }),
      from: vi.fn(),
    };
    
    // Test missing title
    const reqMissingTitle = createRequest('/songs', 'POST', {
      suno_audio_id: '123',
    });
    const resMissingTitle = await handleSongs(reqMissingTitle, supabase, '/songs');
    expect(resMissingTitle?.status).toBe(400);

    // Test invalid title length
    const reqLongTitle = createRequest('/songs', 'POST', {
      title: 'a'.repeat(300),
      suno_audio_id: '123',
    });
    const resLongTitle = await handleSongs(reqLongTitle, supabase, '/songs');
    expect(resLongTitle?.status).toBe(400);
  });

  // Correctif de sécurité cf5d8726 (2026-09-29) : la route permettait de s'auto-attribuer un
  // abonnement. Elle est désactivée : toute requête POST doit être refusée sans appeler la RPC.
  test('POST /subscriptions is refused (403) and never calls the RPC', async () => {
    const supabase = { rpc: vi.fn().mockResolvedValue({ error: null }) };
    for (const payload of [
      { plan_id: 'pro', gateway: 'stripe', subscription_id: 'sub_123' },
      { gateway: 'stripe' },
    ]) {
      const req = createRequest('/subscriptions', 'POST', payload);
      const res = await handleSubscriptions(req, supabase);
      expect(res?.status).toBe(403);
      const body = await res?.json();
      expect(body.error).toBe('FORBIDDEN');
    }
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
