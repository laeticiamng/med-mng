
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
  let requestId: string | null = null;

  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/med-mng-api', '');
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
      } catch (error) {
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

    // Handle quota endpoint without authentication for read-only operations
    if (path === '/quota' && req.method === 'GET') {
      try {
        // Créer un client Supabase temporaire pour les quotas publics
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
        const supabaseUrl = 'https://yaincoxihiqdksxgrsrk.supabase.co';
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
        const tempSupabase = createClient(supabaseUrl, supabaseKey);
        
        const quotaResponse = await handleQuota(req, tempSupabase, path);
        if (quotaResponse) {
          MonitoringService.endRequest(requestId, quotaResponse.status);
          return quotaResponse;
        }
      } catch (error) {
        console.warn('Quota endpoint failed, returning default:', error);
        MonitoringService.endRequest(requestId, 200);
        return new Response(JSON.stringify({ remaining_credits: 0 }), {
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        });
      }
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
          
          res = await handleSubscriptions(req, supabase, user);
          if (res) return res;

          res = await handleSongs(req, supabase, path, user);
          if (res) return res;

          res = await handleLibrary(req, supabase, path, url, user);
          if (res) return res;

          res = await handleEdn(req, supabase, path, url);
          if (res) return res;

          res = await handleOic(req, supabase, path, url);
          if (res) return res;

          res = await handleQuota(req, supabase, path);
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

  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('validation') ? 400 : 500;
    
    log('error', 'Unhandled API Error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    });

    // Send critical alert for 500 errors
    if (statusCode >= 500) {
      await alertCriticalError('api_handler', `Unhandled server error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
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
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
});
