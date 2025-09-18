
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
import { enforceDistributedRateLimit } from './middleware/rateLimit.ts';

serve(async (req) => {
  const rateLimitHeaders = new Map<string, string>();
  const mergeRateLimitHeaders = (headers?: Record<string, string>) => {
    if (!headers) return;
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        rateLimitHeaders.set(key, value);
      }
    }
  };
  const applyRateLimitHeaders = (response: Response): Response => {
    if (!response || rateLimitHeaders.size === 0) {
      return response;
    }
    const finalHeaders = new Headers(response.headers);
    rateLimitHeaders.forEach((value, key) => {
      finalHeaders.set(key, value);
    });
    return new Response(response.body, {
      status: response.status,
      headers: finalHeaders,
    });
  };

  let requestId: string | null = null;

  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return applyRateLimitHeaders(new Response(null, { headers: { ...corsHeaders, ...securityHeaders } }));
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/med-mng-api', '');
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anon';

    // Security checks
    const securityCheck = SecurityService.checkSecurityThreats(req, ip);
    if (securityCheck) return applyRateLimitHeaders(securityCheck);

    const contentTypeCheck = SecurityService.validateContentType(req);
    if (contentTypeCheck) return applyRateLimitHeaders(contentTypeCheck);

    // Distributed rate limiting (global)
    const globalRateLimit = await enforceDistributedRateLimit(req, {
      action: 'med_mng_api.global',
      maxRequests: Number(Deno.env.get('RATE_LIMIT_API_MAX_REQUESTS') ?? '120'),
      windowSeconds: Number(Deno.env.get('RATE_LIMIT_API_WINDOW_SECONDS') ?? '60'),
      defaultRetrySeconds: Number(Deno.env.get('RATE_LIMIT_API_RETRY_SECONDS') ?? '60'),
      context: { path, ip },
    });

    if (globalRateLimit.blocked && globalRateLimit.response) {
      log('warn', `Rate limit exceeded for IP: ${ip}`);
      return applyRateLimitHeaders(globalRateLimit.response);
    }

    mergeRateLimitHeaders(globalRateLimit.headers);

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
      const healthResponse = new Response(JSON.stringify(health), {
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
      const finalHealthResponse = applyRateLimitHeaders(healthResponse);
      MonitoringService.endRequest(requestId, finalHealthResponse.status);
      return finalHealthResponse;
    }

    // CSRF Token endpoint (public)
    if (path === '/csrf-token' && req.method === 'POST') {
      try {
        const { user_id } = await req.json();
        if (!user_id) {
          return applyRateLimitHeaders(errorResponse(400, 'MISSING_USER_ID', 'User ID required for CSRF token'));
        }
        const token = generateCSRFToken(user_id);
        return applyRateLimitHeaders(new Response(JSON.stringify({ csrf_token: token }), {
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        }));
      } catch (error) {
        return applyRateLimitHeaders(errorResponse(400, 'INVALID_REQUEST', 'Invalid request body'));
      }
    }

    // Public endpoints before auth check
    let publicRes = await handleHelp(req, null, path, url);
    if (publicRes) {
      const finalPublicRes = applyRateLimitHeaders(publicRes);
      MonitoringService.endRequest(requestId, finalPublicRes.status);
      return finalPublicRes;
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabaseUrl = 'https://yaincoxihiqdksxgrsrk.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const publicSupabase = createClient(supabaseUrl, supabaseKey);

    publicRes = await handleStatus(req, publicSupabase, path, url);
    if (publicRes) {
      const finalPublicRes = applyRateLimitHeaders(publicRes);
      MonitoringService.endRequest(requestId, finalPublicRes.status);
      return finalPublicRes;
    }

    publicRes = await handleAudit(req, publicSupabase, path, url);
    if (publicRes) {
      const finalPublicRes = applyRateLimitHeaders(publicRes);
      MonitoringService.endRequest(requestId, finalPublicRes.status);
      return finalPublicRes;
    }

    publicRes = await handleRGPD(req, publicSupabase, path, url);
    if (publicRes) {
      const finalPublicRes = applyRateLimitHeaders(publicRes);
      MonitoringService.endRequest(requestId, finalPublicRes.status);
      return finalPublicRes;
    }

    publicRes = await handleDocs(req, publicSupabase, path);
    if (publicRes) {
      const finalPublicRes = applyRateLimitHeaders(publicRes);
      MonitoringService.endRequest(requestId, finalPublicRes.status);
      return finalPublicRes;
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
          const finalQuotaResponse = applyRateLimitHeaders(quotaResponse);
          MonitoringService.endRequest(requestId, finalQuotaResponse.status);
          return finalQuotaResponse;
        }
      } catch (error) {
        console.warn('Quota endpoint failed, returning default:', error);
        const fallbackQuotaResponse = new Response(JSON.stringify({ remaining_credits: 0 }), {
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        });
        const finalFallbackResponse = applyRateLimitHeaders(fallbackQuotaResponse);
        MonitoringService.endRequest(requestId, finalFallbackResponse.status);
        return finalFallbackResponse;
      }
    }

    // Authentication with retry
    const authResult = await RetryService.withRetry(
      () => validateAuth(req),
      { maxRetries: 2 },
      'auth_validation'
    );

    if (authResult.error) {
      const finalAuthError = applyRateLimitHeaders(authResult.error);
      MonitoringService.endRequest(requestId, finalAuthError.status);
      return finalAuthError;
    }

    const { supabase, user } = authResult;
    
    // CSRF Protection for authenticated routes
    const csrfError = csrfProtection(req, user?.id || '');
    if (csrfError) {
      const finalCsrfError = applyRateLimitHeaders(csrfError);
      MonitoringService.endRequest(requestId, finalCsrfError.status);
      return finalCsrfError;
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
        const retryableResponse = errorResponse(503, 'SERVICE_UNAVAILABLE', 'Service temporarily unavailable');
        const finalRetryableResponse = applyRateLimitHeaders(retryableResponse);
        MonitoringService.endRequest(requestId, finalRetryableResponse.status, routeError as Error);
        return finalRetryableResponse;
      }
      
      throw routeError;
    }

    if (response) {
      const finalResponse = applyRateLimitHeaders(response);
      MonitoringService.endRequest(requestId, finalResponse.status);
      return finalResponse;
    }

    MonitoringService.endRequest(requestId, 404);
    return applyRateLimitHeaders(errorResponse(404, 'NOT_FOUND', 'Route not found'));

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

    return applyRateLimitHeaders(errorResponse(
      statusCode,
      statusCode === 400 ? 'VALIDATION_ERROR' : 'SERVER_ERROR',
      error instanceof Error ? error.message : 'An unexpected error occurred'
    ));
  }
});
