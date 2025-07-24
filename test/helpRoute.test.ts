import { handleHelp } from '../supabase/functions/med-mng-api/routes/help.ts';

const createRequest = (path: string) => new Request(`https://example.com${path}`);

describe('help route', () => {
  test('GET /help/onboarding returns steps in requested language', async () => {
    const supabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({
              data: [
                {
                  id: 1,
                  key: 'welcome',
                  title: { en: 'Welcome', fr: 'Bienvenue' },
                  body: { en: 'body', fr: 'corps' },
                  type: 'onboarding',
                  version: 1,
                  is_active: true,
                },
              ],
              error: null,
            })),
          })),
        })),
      })),
    } as any;

    const req = createRequest('/help/onboarding?lang=fr');
    const res = await handleHelp(req, supabase, '/help/onboarding', new URL(req.url));
    expect(res).not.toBeNull();
    if (res) {
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.steps[0].title).toBe('Bienvenue');
    }
  });
});
