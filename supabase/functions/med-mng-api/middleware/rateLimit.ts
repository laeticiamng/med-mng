import { enforceRateLimit, RateLimitOptions } from '../../_shared/rateLimit.ts';
import { corsHeaders, securityHeaders } from '../types.ts';
import { log } from '../logger.ts';

export interface DistributedRateLimitOptions extends RateLimitOptions {
  defaultRetrySeconds?: number;
}

export interface DistributedRateLimitResult {
  blocked: boolean;
  response?: Response;
  headers: Record<string, string>;
}

function normalizeRetryAfter(result: { retryAfterSeconds?: number }, fallbackSeconds?: number): number {
  if (typeof result.retryAfterSeconds === 'number') {
    return Math.max(1, Math.round(result.retryAfterSeconds));
  }
  if (typeof fallbackSeconds === 'number') {
    return Math.max(1, Math.round(fallbackSeconds));
  }
  return 60;
}

export async function enforceDistributedRateLimit(
  req: Request,
  options: DistributedRateLimitOptions
): Promise<DistributedRateLimitResult> {
  const check = await enforceRateLimit(req, options);

  if (check.allowed) {
    return { blocked: false, headers: check.headers };
  }

  const retryAfter = normalizeRetryAfter(check, options.defaultRetrySeconds ?? options.windowSeconds);
  let body = JSON.stringify({
    error: 'rate_limit_exceeded',
    message: `Limite atteinte pour ${options.action}. Réessayez plus tard.`,
    retryAfterSeconds: retryAfter,
  });
  let status = 429;

  if (check.response) {
    status = check.response.status;
    try {
      body = await check.response.clone().text();
    } catch (error) {
      log('warn', 'Unable to clone rate limit response body', error);
    }
  }

  const headers: Record<string, string> = {
    ...corsHeaders,
    ...securityHeaders,
    ...check.headers,
    'Content-Type': 'application/json',
    'Retry-After': String(retryAfter),
  };

  return {
    blocked: true,
    headers: check.headers,
    response: new Response(body, {
      status,
      headers,
    }),
  };
}
