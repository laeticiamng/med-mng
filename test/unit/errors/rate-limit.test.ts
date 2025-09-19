import { describeRateLimitError, toRateLimitError, RateLimitExceededError } from '@/utils/errors/rateLimit';

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

  it('wraps rate limit metadata into a dedicated error instance', () => {
    const error = {
      status: 429,
      message: JSON.stringify({
        message: 'Rate limit reached',
        retry_after_seconds: 90,
      }),
    };

    const wrapped = toRateLimitError(error, 'fallback', 'music.generate');

    expect(wrapped).toBeInstanceOf(RateLimitExceededError);
    expect(wrapped?.message).toContain('Rate limit reached');
    expect(wrapped?.retryAfterSeconds).toBe(90);
    expect(wrapped?.scope).toBe('music.generate');
    expect(wrapped?.retryAt).toBeGreaterThan(Date.now());
  });

  it('returns null when the payload is not a rate limit error', () => {
    const wrapped = toRateLimitError({ status: 400, message: 'Bad request' }, 'fallback');

    expect(wrapped).toBeNull();
  });
});
