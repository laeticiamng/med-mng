
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, securityHeaders } from './types.ts';
import { validateAuth } from './auth.ts';
import { handleSubscriptions } from './routes/subscriptions.ts';
import { handleSongs } from './routes/songs.ts';
import { handleLibrary } from './routes/library.ts';
import { handleQuota } from './routes/quota.ts';
import { handleVerify } from './routes/verify.ts';
import { handleComplete } from './routes/complete.ts';
import { handleHelp } from './routes/help.ts';
import { handleEdn } from './routes/edn.ts';
import { handleOic } from './routes/oic.ts';
import { handleStatus } from './routes/status.ts';
import { handleAudit } from './routes/audit.ts';
import { handleRGPD } from './routes/rgpd.ts';
import { handleDocs } from './routes/docs.ts';
import { log } from './logger.ts';
import { errorResponse } from './response.ts';
import { MonitoringService } from './middleware/monitoring.ts';
import { SecurityService } from './middleware/security.ts';
import { RetryService } from './middleware/retry.ts';
import { csrfProtection, generateCSRFToken } from './middleware/csrf.ts';
import { alertingService, alertCriticalError } from './middleware/alerting.ts';

import { getErrorMessage } from '../../_shared/error-utils.ts';
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès med-mng-api sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour med-mng-api');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      console.warn(`❌ Non-admin tentative med-mng-api par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ med-mng-api autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
    }

    const url = new URL(req.url);
    const originalPath = url.pathname;
    let path = url.pathname.replace('/med-mng-api', '');

    // ✅ COMPATIBILITÉ FRONT: Autoriser les appels envoyant le path dans le corps
    if (!path || path === '/') {
      try {
        const clonedRequest = req.clone();
        const body = await clonedRequest.json();

        const bodyPath = typeof body.path === 'string'
          ? body.path
          : typeof body.endpoint === 'string'
            ? body.endpoint
            : null;

        if (bodyPath) {
          path = bodyPath.startsWith('/') ? bodyPath : `/${bodyPath}`;
        }
      } catch (error: unknown) {
        log('warn', 'Impossible de lire le chemin depuis le corps de la requête', { error: (error as Error).message });
      }
    }

    console.log('🔍 Path extraction - Original:', originalPath, 'Extracted:', path);
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anon';

    // Security checks
    const securityCheck = SecurityService.checkSecurityThreats(req, ip);
    if (securityCheck) return securityCheck;

    const contentTypeCheck = SecurityService.validateContentType(req);
    if (contentTypeCheck) return contentTypeCheck;

    // Rate limiting
    if (!checkRate(ip, 60, 60_000)) {
      log('warn', `Rate limit exceeded for IP: ${ip}`);
      return errorResponse(429, 'RATE_LIMIT', 'Too Many Requests');
    }

    // Start monitoring
    requestId = MonitoringService.startRequest(req, path);

    // Health check endpoint
    if (path === '/health' && req.method === 'GET') {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.1.0',
        metrics: MonitoringService.getHealthMetrics(),
        security: SecurityService.getSecurityMetrics(),
        alerts: alertingService.getAlertStats()
      };
      MonitoringService.endRequest(requestId, 200);
      return new Response(JSON.stringify(health), {
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    // CSRF Token endpoint (public)
    if (path === '/csrf-token' && req.method === 'POST') {
      try {
        const { user_id } = await req.json();
        if (!user_id) {
          return errorResponse(400, 'MISSING_USER_ID', 'User ID required for CSRF token');
        }
        const token = generateCSRFToken(user_id);
        return new Response(JSON.stringify({ csrf_token: token }), {
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error: unknown) {
        return errorResponse(400, 'INVALID_REQUEST', 'Invalid request body');
      }
    }

    // Public endpoints before auth check
    let publicRes = await handleHelp(req, null, path, url);
    if (publicRes) {
      MonitoringService.endRequest(requestId, publicRes.status);
      return publicRes;
    }

    publicRes = await handleStatus(req, null, path, url);
    if (publicRes) {
      MonitoringService.endRequest(requestId, publicRes.status);
      return publicRes;
    }

    publicRes = await handleAudit(req, null, path, url);
    if (publicRes) {
      MonitoringService.endRequest(requestId, publicRes.status);
      return publicRes;
    }

    publicRes = await handleRGPD(req, null, path, url);
    if (publicRes) {
      MonitoringService.endRequest(requestId, publicRes.status);
      return publicRes;
    }

    publicRes = await handleDocs(req, null, path);
    if (publicRes) {
      MonitoringService.endRequest(requestId, publicRes.status);
      return publicRes;
    }

    // Authentication with retry
    const authResult = await RetryService.withRetry(
      () => validateAuth(req),
      { maxRetries: 2 },
      'auth_validation'
    );

    if (authResult.error) {
      MonitoringService.endRequest(requestId, 401);
      return authResult.error;
    }

    const { supabase, user } = authResult;
    
    // CSRF Protection for authenticated routes
    const csrfError = csrfProtection(req, user?.id || '');
    if (csrfError) {
      MonitoringService.endRequest(requestId, 403);
      return csrfError;
    }
    
    // Update monitoring with user info
    requestId = MonitoringService.startRequest(req, path, user?.id);

    // Route handlers with retry logic for database operations
    let response: Response | null = null;
    
    try {
      response = await RetryService.withRetry(
        async () => {
          let res: Response | null = null;
          
          res = await handleSubscriptions(req, supabase);
          if (res) return res;

          res = await handleSongs(req, supabase, path);
          if (res) return res;

          res = await handleLibrary(req, supabase, path, url);
          if (res) return res;

          res = await handleEdn(req, supabase, path, url);
          if (res) return res;

          res = await handleOic(req, supabase, path, url);
          if (res) return res;

          res = await handleQuota(req, supabase, user, path);
          if (res) return res;

          res = await handleVerify(req, supabase, path);
          if (res) return res;

          res = await handleComplete(req, supabase, path);
          if (res) return res;

          return null;
        },
        { maxRetries: 1, baseDelay: 500 },
        `route_handler_${path}`
      );
    } catch (routeError) {
      log('error', `Route handler error for ${path}`, routeError);
      
      if (RetryService.isRetryableError(routeError as Error)) {
        MonitoringService.endRequest(requestId, 503, routeError as Error);
        return errorResponse(503, 'SERVICE_UNAVAILABLE', 'Service temporarily unavailable');
      }
      
      throw routeError;
    }

    if (response) {
      MonitoringService.endRequest(requestId, response.status);
      return response;
    }

    MonitoringService.endRequest(requestId, 404);
    return errorResponse(404, 'NOT_FOUND', 'Route not found');

  } catch (error: unknown) {
    const statusCode = error instanceof Error && getErrorMessage(error).includes('validation') ? 400 : 500;
    
    log('error', 'Unhandled API Error', {
      error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    });

    // Send critical alert for 500 errors
    if (statusCode >= 500) {
      await alertCriticalError('api_handler', `Unhandled server error: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`, {
        path,
        requestId,
        statusCode
      });
    }

    if (requestId) {
      MonitoringService.endRequest(requestId, statusCode, error as Error);
    }

    return errorResponse(
      statusCode, 
      statusCode === 400 ? 'VALIDATION_ERROR' : 'SERVER_ERROR', 
      error instanceof Error ? getErrorMessage(error) : 'An unexpected error occurred'
    );
  }
});
