import { describe, expect, it, vi } from 'vitest';

vi.mock('../../supabase/functions/_shared/rateLimit.ts', () => ({
  enforceRateLimit: vi.fn(),
}));

import { enforceRateLimit } from '../../supabase/functions/_shared/rateLimit.ts';
import { enforceDistributedRateLimit } from '../../supabase/functions/med-mng-api/middleware/rateLimit.ts';

describe('enforceDistributedRateLimit', () => {
  const request = new Request('https://example.com/api/generate', { method: 'POST' });
  const mockedEnforceRateLimit = vi.mocked(enforceRateLimit);

  it('passes through when rate limit allows request', async () => {
    mockedEnforceRateLimit.mockResolvedValueOnce({
      allowed: true,
      headers: { 'x-ratelimit-remaining': '5' },
    });

    const result = await enforceDistributedRateLimit(request, {
      identifier: 'test-user',
      limit: 5,
      windowSeconds: 60,
      action: 'génération musicale',
    });

    expect(result.blocked).toBe(false);
    expect(result.headers['x-ratelimit-remaining']).toBe('5');
    expect(result.response).toBeUndefined();
  });

  it('builds a structured 429 response when throttled', async () => {
    mockedEnforceRateLimit.mockResolvedValueOnce({
      allowed: false,
      headers: { 'x-ratelimit-remaining': '0' },
      retryAfterSeconds: 42,
    });

    const result = await enforceDistributedRateLimit(request, {
      identifier: 'test-user',
      limit: 5,
      windowSeconds: 60,
      action: 'génération musicale',
      defaultRetrySeconds: 30,
    });

    expect(result.blocked).toBe(true);
    expect(result.response?.status).toBe(429);
    expect(result.response?.headers.get('Retry-After')).toBe('42');
    const payload = await result.response?.clone().json();
    expect(payload).toMatchObject({
      error: 'rate_limit_exceeded',
      retryAfterSeconds: 42,
    });
  });

  it('falls back to default retry seconds when backend omits value', async () => {
    mockedEnforceRateLimit.mockResolvedValueOnce({
      allowed: false,
      headers: {},
    });

    const result = await enforceDistributedRateLimit(request, {
      identifier: 'test-user',
      limit: 1,
      windowSeconds: 15,
      action: 'export RGPD',
      defaultRetrySeconds: 12,
    });

    expect(result.blocked).toBe(true);
    expect(result.response?.headers.get('Retry-After')).toBe('12');
  });
});
