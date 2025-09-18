import { describeRateLimitError } from '@/utils/errors/rateLimit';

describe('describeRateLimitError', () => {
  it('detects rate limit errors with retry information', () => {
    const error = {
      status: 429,
      message: JSON.stringify({
        error: 'rate_limit_exceeded',
        message: 'Limite atteinte pour music.generate. Réessayez dans 42 secondes',
        retryAfterSeconds: 42,
      }),
    };

    const result = describeRateLimitError(error, 'fallback');

    expect(result.isRateLimited).toBe(true);
    expect(result.retryAfterSeconds).toBe(42);
    expect(result.message).toContain('Réessayez');
  });

  it('returns fallback for non rate limited errors', () => {
    const error = { status: 500, message: 'Internal error' };

    const result = describeRateLimitError(error, 'fallback message');

    expect(result.isRateLimited).toBe(false);
    expect(result.message).toBe('fallback message');
  });
});
