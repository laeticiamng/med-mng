import { errorResponse } from '../response.ts';
import { log } from '../logger.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

import { getErrorMessage } from '../../../_shared/error-utils.ts';
// Créer client Supabase pour stockage CSRF
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// ✅ SÉCURITÉ: Generate CSRF token stocké dans Supabase
export async function generateCSRFToken(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

  const supabase = getSupabaseClient();

  // Clean expired tokens first
  await cleanExpiredTokens();

  // Store in database
  const { error } = await supabase
    .from('csrf_tokens')
    .insert({
      token,
      user_id: userId,
      expires_at: expiresAt.toISOString()
    });

  if (error) {
    log('error', 'Failed to store CSRF token', { error: getErrorMessage(error), userId });
    throw new Error('Failed to generate CSRF token');
  }

  return token;
}

// ✅ SÉCURITÉ: Validate CSRF token depuis Supabase
export async function validateCSRFToken(token: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data: tokenData, error } = await supabase
    .from('csrf_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !tokenData) {
    log('warn', 'CSRF token not found', { token: token.substring(0, 8) + '...', userId });
    return false;
  }

  // Check expiration
  if (new Date(tokenData.expires_at) < new Date()) {
    // Delete expired token
    await supabase.from('csrf_tokens').delete().eq('token', token);
    log('warn', 'CSRF token expired', { userId });
    return false;
  }

  // Check user match
  if (tokenData.user_id !== userId) {
    log('warn', 'CSRF token user mismatch', { userId, tokenUserId: tokenData.user_id });
    return false;
  }

  return true;
}

// Clean expired tokens from database
async function cleanExpiredTokens(): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('csrf_tokens')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) {
    log('warn', 'Failed to clean expired CSRF tokens', { error: getErrorMessage(error) });
  }
}

// ✅ SÉCURITÉ: CSRF Protection middleware activé avec stockage Supabase
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

// Get CSRF metrics from database
export async function getCSRFMetrics() {
  await cleanExpiredTokens();

  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from('csrf_tokens')
    .select('*', { count: 'exact', head: true });

  if (error) {
    log('error', 'Failed to get CSRF metrics', { error: getErrorMessage(error) });
    return {
      activeTokens: 0,
      lastCleanup: new Date().toISOString(),
      error: getErrorMessage(error)
    };
  }

  return {
    activeTokens: count || 0,
    lastCleanup: new Date().toISOString()
  };
}