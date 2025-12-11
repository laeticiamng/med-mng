import { errorResponse } from '../response.ts';
import { log } from '../logger.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// In-memory cache for performance (with TTL)
const csrfTokenCache = new Map<string, { token: string; userId: string; expires: number }>();
const CACHE_MAX_SIZE = 1000;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Get Supabase client for CSRF storage
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    log('warn', 'Supabase credentials not configured for CSRF storage');
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Generate CSRF token with Supabase persistence
export async function generateCSRFToken(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expires = Date.now() + TOKEN_TTL_MS;
  const expiresAt = new Date(expires).toISOString();

  // Store in memory cache first
  cleanCacheIfNeeded();
  csrfTokenCache.set(token, { token, userId, expires });

  // Persist to Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('csrf_tokens')
        .upsert({
          token,
          user_id: userId,
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        });

      if (error) {
        log('warn', 'Failed to persist CSRF token to Supabase', { error: error.message });
      } else {
        log('info', 'CSRF token persisted', { userId, tokenPrefix: token.substring(0, 8) });
      }

      // Clean expired tokens in background (don't await)
      cleanExpiredTokensFromDB(supabase);
    } catch (err) {
      log('error', 'Error persisting CSRF token', { error: (err as Error).message });
    }
  }

  return token;
}

// Validate CSRF token (check cache first, then DB)
export async function validateCSRFToken(token: string, userId: string): Promise<boolean> {
  // Check memory cache first
  const cachedToken = csrfTokenCache.get(token);

  if (cachedToken) {
    if (cachedToken.expires < Date.now()) {
      csrfTokenCache.delete(token);
      log('warn', 'CSRF token expired (cache)', { userId });
      return false;
    }

    if (cachedToken.userId !== userId) {
      log('warn', 'CSRF token user mismatch (cache)', { userId, tokenUserId: cachedToken.userId });
      return false;
    }

    return true;
  }

  // Check Supabase if not in cache
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('csrf_tokens')
        .select('user_id, expires_at')
        .eq('token', token)
        .single();

      if (error || !data) {
        log('warn', 'CSRF token not found in DB', { token: token.substring(0, 8) + '...' });
        return false;
      }

      const expiresAt = new Date(data.expires_at).getTime();

      if (expiresAt < Date.now()) {
        // Delete expired token
        await supabase.from('csrf_tokens').delete().eq('token', token);
        log('warn', 'CSRF token expired (DB)', { userId });
        return false;
      }

      if (data.user_id !== userId) {
        log('warn', 'CSRF token user mismatch (DB)', { userId, tokenUserId: data.user_id });
        return false;
      }

      // Add to cache for future requests
      csrfTokenCache.set(token, {
        token,
        userId: data.user_id,
        expires: expiresAt
      });

      return true;
    } catch (err) {
      log('error', 'Error validating CSRF token from DB', { error: (err as Error).message });
      return false;
    }
  }

  log('warn', 'CSRF token not found', { token: token.substring(0, 8) + '...' });
  return false;
}

// Clean cache if it's getting too large
function cleanCacheIfNeeded(): void {
  if (csrfTokenCache.size >= CACHE_MAX_SIZE) {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [token, data] of csrfTokenCache.entries()) {
      if (data.expires < now) {
        csrfTokenCache.delete(token);
        cleanedCount++;
      }
    }

    // If still too large, remove oldest entries
    if (csrfTokenCache.size >= CACHE_MAX_SIZE) {
      const entries = Array.from(csrfTokenCache.entries());
      entries.sort((a, b) => a[1].expires - b[1].expires);

      const toRemove = entries.slice(0, Math.floor(CACHE_MAX_SIZE / 4));
      toRemove.forEach(([token]) => csrfTokenCache.delete(token));
      cleanedCount += toRemove.length;
    }

    log('info', 'CSRF cache cleanup', { cleanedCount, remainingSize: csrfTokenCache.size });
  }
}

// Clean expired tokens from database (background task)
async function cleanExpiredTokensFromDB(supabase: ReturnType<typeof createClient>): Promise<void> {
  try {
    const { error, count } = await supabase
      .from('csrf_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('*', { count: 'exact', head: true });

    if (error) {
      log('warn', 'Error cleaning expired CSRF tokens', { error: error.message });
    } else if (count && count > 0) {
      log('info', 'Cleaned expired CSRF tokens from DB', { count });
    }
  } catch (err) {
    log('error', 'Error in cleanExpiredTokensFromDB', { error: (err as Error).message });
  }
}

// Invalidate a CSRF token (after use or logout)
export async function invalidateCSRFToken(token: string): Promise<void> {
  // Remove from cache
  csrfTokenCache.delete(token);

  // Remove from DB
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('csrf_tokens').delete().eq('token', token);
    } catch (err) {
      log('error', 'Error invalidating CSRF token', { error: (err as Error).message });
    }
  }
}

// CSRF Protection middleware (now enabled with Supabase storage)
export async function csrfProtection(req: Request, userId: string): Promise<Response | null> {
  const method = req.method;

  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null;
  }

  const csrfToken = req.headers.get('X-CSRF-Token') || req.headers.get('x-csrf-token');

  if (!csrfToken) {
    log('warn', 'Missing CSRF token', { method, userId });
    return errorResponse(403, 'CSRF_TOKEN_MISSING', 'CSRF token required for this operation');
  }

  const isValid = await validateCSRFToken(csrfToken, userId);

  if (!isValid) {
    log('warn', 'Invalid CSRF token', { method, userId });
    return errorResponse(403, 'CSRF_TOKEN_INVALID', 'Invalid or expired CSRF token');
  }

  return null;
}

// Get CSRF metrics
export function getCSRFMetrics() {
  const now = Date.now();
  let activeCount = 0;
  let expiredCount = 0;

  for (const [, data] of csrfTokenCache.entries()) {
    if (data.expires > now) {
      activeCount++;
    } else {
      expiredCount++;
    }
  }

  return {
    cacheSize: csrfTokenCache.size,
    activeTokens: activeCount,
    expiredTokens: expiredCount,
    lastCheck: new Date().toISOString()
  };
}

/*
MIGRATION SQL REQUIRED:

CREATE TABLE IF NOT EXISTS csrf_tokens (
  token UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT csrf_tokens_expires_future CHECK (expires_at > created_at)
);

-- Index pour la recherche par user_id
CREATE INDEX idx_csrf_tokens_user_id ON csrf_tokens(user_id);

-- Index pour le nettoyage des tokens expirés
CREATE INDEX idx_csrf_tokens_expires_at ON csrf_tokens(expires_at);

-- Policy RLS (service role only)
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage csrf_tokens"
ON csrf_tokens FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Fonction de nettoyage automatique (optionnel)
CREATE OR REPLACE FUNCTION cleanup_expired_csrf_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM csrf_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
