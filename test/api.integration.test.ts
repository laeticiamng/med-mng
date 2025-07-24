import { handleSongs } from '../supabase/functions/med-mng-api/routes/songs.ts';
import { handleLibrary } from '../supabase/functions/med-mng-api/routes/library.ts';
import { handleQuota } from '../supabase/functions/med-mng-api/routes/quota.ts';

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

  test('POST /songs returns 403 when quota insufficient', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({ data: 0 }),
      from: jest.fn(),
    };
    const req = createRequest('/songs', 'POST', {
      title: 'Test',
      suno_audio_id: '123',
    });
    const res = await handleSongs(req, supabase, '/songs');
    expect(res?.status).toBe(403);
  });

  test('POST /songs creates song when quota ok', async () => {
    const insertMock = jest.fn().mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: '1' }, error: null }),
      }),
    });
    const supabase = {
      rpc: jest.fn().mockResolvedValue({ data: 2 }),
      from: jest.fn(() => ({ insert: insertMock })),
    };
    const req = createRequest('/songs', 'POST', {
      title: 'Demo',
      suno_audio_id: 'abc',
    });
    const res = await handleSongs(req, supabase, '/songs');
    expect(res?.status).toBe(200);
    const body = await res?.json();
    expect(body.id).toBe('1');
  });

  test('GET /quota returns remaining credits', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({ data: 5 }),
    };
    const req = createRequest('/quota', 'GET');
    const res = await handleQuota(req, supabase, '/quota');
    expect(res?.status).toBe(200);
    const body = await res?.json();
    expect(body.remaining_credits).toBe(5);
  });

  test('GET /library returns paginated list', async () => {
    const range = jest
      .fn()
      .mockResolvedValue({ data: [{ id: '1' }], count: 10, error: null });
    const supabase = {
      from: jest.fn(() => ({ select: () => ({ order: () => ({ range }) }) })),
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
    expect(body.totalCount).toBe(10);
  });

  test('GET /songs returns paginated list', async () => {
    const range = jest
      .fn()
      .mockResolvedValue({ data: [{ id: '1' }], count: 5, error: null });
    const supabase = {
      from: jest.fn(() => ({ select: () => ({ order: () => ({ range }) }) })),
    } as any;
    const req = createRequest('/songs?page=2&limit=1', 'GET');
    const res = await handleSongs(req, supabase, '/songs');
    expect(res?.status).toBe(200);
    const body = await res?.json();
    expect(body.page).toBe(2);
    expect(body.totalCount).toBe(5);
  });
});
