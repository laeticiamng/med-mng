import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

type RateLimitResult = {
  identifier: string;
  current_count: number;
  max_requests: number;
  window_start: string;
  window_end: string;
  rate_limited: boolean;
  remaining_requests: number;
  reset_time: string;
};

export interface RateLimitOptions {
  /** Logical action name (ex: music.generate, edn.sync) */
  action: string;
  /** Sliding window duration in seconds */
  windowSeconds?: number;
  /** Maximum requests allowed during the window */
  maxRequests?: number;
  /** Override identifier if you want to enforce a specific key */
  identifier?: string;
  /** Optional additional context for console logging */
  context?: Record<string, unknown>;
}

export interface RateLimitCheck {
  allowed: boolean;
  headers: Record<string, string>;
  response?: Response;
  retryAfterSeconds?: number;
  result?: RateLimitResult;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

let supabaseClient:
  | ReturnType<typeof createClient>
  | undefined;

function getClient() {
  if (!supabaseClient) {
    if (!supabaseUrl || !serviceRoleKey) {
      console.warn('[rate-limit] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Rate limiting disabled.');
      return undefined;
    }

    supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`
        }
      }
    });
  }

  return supabaseClient;
}

async function hashIdentifier(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function decodeJwtSubject(authHeader: string | null): string | undefined {
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return undefined;
  }

  const token = authHeader.slice(7);
  const parts = token.split('.');
  if (parts.length < 2) {
    return undefined;
  }

  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload?.sub ?? payload?.user_id ?? payload?.id;
  } catch (error) {
    console.warn('[rate-limit] Unable to decode JWT payload for identifier', error);
    return undefined;
  }
}

async function buildIdentifier(req: Request, action: string, override?: string): Promise<string> {
  if (override) {
    return override;
  }

  const forwardedFor = req.headers.get('x-forwarded-for');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  const realIp = forwardedFor?.split(',')[0]?.trim() || cfConnectingIp || req.headers.get('x-real-ip');
  const authHeader = req.headers.get('authorization');
  const supabaseUserId = req.headers.get('x-supabase-auth-user-id');
  const jwtSubject = decodeJwtSubject(authHeader);

  const baseIdentifier = supabaseUserId || jwtSubject || realIp || 'anonymous';
  const raw = `${action}:${baseIdentifier}`;

  return hashIdentifier(raw);
}

function buildHeaders(result: RateLimitResult, windowSeconds: number): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.max_requests ?? 0),
    'X-RateLimit-Remaining': String(result.remaining_requests ?? 0),
    'X-RateLimit-Reset': String(Math.ceil(new Date(result.reset_time).getTime() / 1000)),
    'X-RateLimit-Window': String(windowSeconds)
  };
}

export async function enforceRateLimit(
  req: Request,
  options: RateLimitOptions
): Promise<RateLimitCheck> {
  const windowSeconds = Math.max(1, Math.floor(options.windowSeconds ?? 15 * 60));
  const maxRequests = Math.max(1, Math.floor(options.maxRequests ?? 10));

  const client = getClient();
  if (!client) {
    return {
      allowed: true,
      headers: {},
    };
  }

  const identifier = await buildIdentifier(req, options.action, options.identifier);

  try {
    const { data, error } = await client.rpc<RateLimitResult>('increment_rate_limit_counter', {
      p_identifier: identifier,
      p_window_duration_seconds: windowSeconds,
      p_max_requests: maxRequests,
    });

    if (error) {
      console.error('[rate-limit] Failed to increment counter', {
        action: options.action,
        identifier,
        windowSeconds,
        maxRequests,
        error: error.message,
        context: options.context,
      });

      return {
        allowed: true,
        headers: {},
      };
    }

    if (!data) {
      return {
        allowed: true,
        headers: {},
      };
    }

    const headers = buildHeaders(data, windowSeconds);

    if (data.rate_limited) {
      const retryAfterSeconds = Math.max(
        0,
        Math.ceil((new Date(data.reset_time).getTime() - Date.now()) / 1000)
      );

      const payload = {
        error: 'rate_limit_exceeded',
        message: `Limite atteinte pour ${options.action}. Réessayez dans ${retryAfterSeconds} secondes`,
        retryAfterSeconds,
        identifier,
        windowSeconds,
        maxRequests,
      };

      console.warn('[rate-limit] Throttling request', {
        ...payload,
        context: options.context,
      });

      const response = new Response(JSON.stringify(payload), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSeconds),
          ...headers,
        },
      });

      return {
        allowed: false,
        headers,
        response,
        retryAfterSeconds,
        result: data,
      };
    }

    return {
      allowed: true,
      headers,
      retryAfterSeconds: 0,
      result: data,
    };
  } catch (error) {
    console.error('[rate-limit] Unexpected failure', {
      action: options.action,
      identifier,
      windowSeconds,
      maxRequests,
      context: options.context,
      error,
    });

    return {
      allowed: true,
      headers: {},
    };
  }
}
