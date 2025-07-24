
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, securityHeaders } from './types.ts';
import { validateAuth } from './auth.ts';
import { handleSubscriptions } from './routes/subscriptions.ts';
import { handleSongs } from './routes/songs.ts';
import { handleLibrary } from './routes/library.ts';
import { handleQuota } from './routes/quota.ts';
import { handleVerify } from './routes/verify.ts';
import { handleComplete } from './routes/complete.ts';
import { handleHelp } from './routes/help.ts';
import { log } from './logger.ts';
import { errorResponse } from './response.ts';

const rateMap = new Map<string, { count: number; reset: number }>();

function checkRate(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (entry && now < entry.reset) {
    if (entry.count >= limit) return false;
    entry.count++;
    return true;
  }
  rateMap.set(key, { count: 1, reset: now + windowMs });
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'anon';
  if (!checkRate(ip, 60, 60_000)) {
    return errorResponse(429, 'RATE_LIMIT', 'Too Many Requests');
  }

  const url = new URL(req.url);
  const path = url.pathname.replace('/functions/v1/med-mng-api', '');

  // Public help endpoints before auth check
  const publicRes = await handleHelp(req, null, path, url);
  if (publicRes) return publicRes;

  const { error, supabase, user } = await validateAuth(req);
  if (error) return error;

  try {
    // Route handlers
    let response;
    
    response = await handleSubscriptions(req, supabase);
    if (response) return response;

    response = await handleSongs(req, supabase, path);
    if (response) return response;

    response = await handleLibrary(req, supabase, path, url);
    if (response) return response;

    response = await handleQuota(req, supabase, path);
    if (response) return response;

    response = await handleVerify(req, supabase, path);
    if (response) return response;

    response = await handleComplete(req, supabase, path);
    if (response) return response;

    return errorResponse(404, 'NOT_FOUND', 'Route not found');

  } catch (error) {
    log('error', 'API Error', error);
    return errorResponse(500, 'SERVER_ERROR', (error as Error).message);
  }
});
