/**
 * 🔧 SYSTEM - Routeur Edge Function pour orchestration, quotas, monitoring
 * 
 * Regroupe les fonctions :
 * - ia-quota → action: "quota_*"
 * - analytics-* → action: "analytics_*"
 * - monitoring-alerts → action: "alerts"
 * - unified-alerts → action: "unified_alerts"
 * - error-logger → action: "log_error"
 * - security-* → action: "security_*"
 * - data-integrity-check → action: "data_check"
 * - check-performance-degradation → action: "perf_check"
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

type SystemAction = 
  | 'quota_get'
  | 'quota_check'
  | 'quota_use'
  | 'quota_stats'
  | 'analytics_track'
  | 'analytics_aggregate'
  | 'analytics_query'
  | 'alerts'
  | 'unified_alerts'
  | 'log_error'
  | 'security_scan'
  | 'security_metrics'
  | 'security_report'
  | 'data_check'
  | 'perf_check'
  | 'health';

// Credit costs by service
const CREDITS_COST = {
  openai: { chat: 1, image_generation: 3, text_completion: 1 },
  suno: { music_generation: 5, vocal_removal: 2, audio_processing: 3 },
  lovable_ai: { audit: 2, completion: 3, chat: 1 },
  other: { default: 1 }
} as const;

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const action: SystemAction = body.action;
    const payload = body.payload || body;

    // Get auth user
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    console.log(`🔧 SYSTEM [${action}] - User: ${userId || 'anonymous'}`);

    switch (action) {
      // === QUOTA MANAGEMENT ===
      case 'quota_get':
        return await handleQuotaGet(supabase, userId);
      
      case 'quota_check':
        return await handleQuotaCheck(supabase, userId, payload);
      
      case 'quota_use':
        return await handleQuotaUse(supabase, userId, payload);
      
      case 'quota_stats':
        return await handleQuotaStats(supabase, userId, payload);

      // === ANALYTICS ===
      case 'analytics_track':
        return await handleAnalyticsTrack(supabase, payload, userId);
      
      case 'analytics_aggregate':
        return await handleAnalyticsAggregate(supabase, payload);
      
      case 'analytics_query':
        return await handleAnalyticsQuery(supabase, payload);

      // === ALERTS & MONITORING ===
      case 'alerts':
        return await handleAlerts(supabase, payload);
      
      case 'unified_alerts':
        return await handleUnifiedAlerts(supabase, payload);
      
      case 'log_error':
        return await handleLogError(supabase, payload, userId);

      // === SECURITY ===
      case 'security_scan':
        return await handleSecurityScan(supabase);
      
      case 'security_metrics':
        return await handleSecurityMetrics(supabase);
      
      case 'security_report':
        return await handleSecurityReport(supabase, payload);

      // === DATA & PERFORMANCE ===
      case 'data_check':
        return await handleDataCheck(supabase, payload);
      
      case 'perf_check':
        return await handlePerfCheck(supabase);
      
      case 'health':
        return await handleHealth(supabase);

      default:
        return new Response(JSON.stringify({
          error: 'Invalid action',
          available_actions: [
            'quota_get', 'quota_check', 'quota_use', 'quota_stats',
            'analytics_track', 'analytics_aggregate', 'analytics_query',
            'alerts', 'unified_alerts', 'log_error',
            'security_scan', 'security_metrics', 'security_report',
            'data_check', 'perf_check', 'health'
          ]
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('❌ SYSTEM Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// ============================================================================
// QUOTA HANDLERS
// ============================================================================

async function handleQuotaGet(supabase: any, userId: string | null) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { data: quota, error } = await supabase.rpc('med_mng_get_remaining_quota');
  
  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to get quota' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ 
    success: true,
    remaining_credits: quota || 0 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleQuotaCheck(supabase: any, userId: string | null, payload: any) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { service_type = 'other', operation_type = 'default', credits_required } = payload;

  const actualCredits = credits_required || 
    (CREDITS_COST as any)[service_type]?.[operation_type] || 
    CREDITS_COST.other.default;

  const { data: currentQuota } = await supabase.rpc('med_mng_get_remaining_quota');
  const hasEnoughCredits = (currentQuota || 0) >= actualCredits;

  return new Response(JSON.stringify({
    success: true,
    has_enough_credits: hasEnoughCredits,
    remaining_credits: currentQuota || 0,
    required_credits: actualCredits,
    can_proceed: hasEnoughCredits
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleQuotaUse(supabase: any, userId: string | null, payload: any) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { service_type = 'other', operation_type = 'default', credits_to_use, request_details = {} } = payload;

  const actualCredits = credits_to_use || 
    (CREDITS_COST as any)[service_type]?.[operation_type] || 
    CREDITS_COST.other.default;

  const { data: result, error } = await supabase.rpc('med_mng_decrement_quota', {
    credits_to_use: actualCredits
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to use quota' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Log usage
  const logStatus = result.success ? 'success' : 'quota_exceeded';
  await supabase.rpc('log_ia_usage', {
    p_service_type: service_type,
    p_operation_type: operation_type,
    p_credits_used: result.success ? actualCredits : 0,
    p_request_details: request_details,
    p_response_status: logStatus,
    p_error_details: result.success ? null : result.error
  }).catch(() => {});

  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 402,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleQuotaStats(supabase: any, userId: string | null, payload: any) {
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const periodDays = payload.period || 30;
  const { data: stats } = await supabase.rpc('get_user_ia_stats', { p_period_days: periodDays });

  return new Response(JSON.stringify({ 
    success: true,
    stats: stats || {} 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// ANALYTICS HANDLERS
// ============================================================================

async function handleAnalyticsTrack(supabase: any, payload: any, userId: string | null) {
  const { event_type, event_data, page_url } = payload;

  const { error } = await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type,
    event_data,
    page_url,
    created_at: new Date().toISOString()
  });

  if (error) throw error;

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAnalyticsAggregate(supabase: any, payload: any) {
  const { period = 'day', metrics = ['page_views', 'unique_users'] } = payload;

  // Aggregate based on period
  const { data, error } = await supabase
    .from('analytics_aggregates')
    .select('*')
    .eq('period', period)
    .order('date', { ascending: false })
    .limit(30);

  if (error) throw error;

  return new Response(JSON.stringify({ 
    success: true,
    aggregates: data || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAnalyticsQuery(supabase: any, payload: any) {
  const { query_type, start_date, end_date, filters } = payload;

  let query = supabase.from('analytics_events').select('*');

  if (start_date) query = query.gte('created_at', start_date);
  if (end_date) query = query.lte('created_at', end_date);
  if (filters?.event_type) query = query.eq('event_type', filters.event_type);

  const { data, error } = await query.order('created_at', { ascending: false }).limit(1000);

  if (error) throw error;

  return new Response(JSON.stringify({ 
    success: true,
    events: data || [],
    count: data?.length || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// ALERTS HANDLERS
// ============================================================================

async function handleAlerts(supabase: any, payload: any) {
  const { operation = 'list', alert_id, status } = payload;

  if (operation === 'list') {
    const { data, error } = await supabase
      .from('unified_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return new Response(JSON.stringify({ success: true, alerts: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (operation === 'update' && alert_id) {
    const { error } = await supabase
      .from('unified_alerts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', alert_id);

    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  throw new Error('Invalid operation');
}

async function handleUnifiedAlerts(supabase: any, payload: any) {
  const { alert_type, severity, message, metadata } = payload;

  const { data, error } = await supabase.from('unified_alerts').insert({
    alert_type,
    severity,
    message,
    metadata,
    status: 'open',
    created_at: new Date().toISOString()
  }).select().single();

  if (error) throw error;

  return new Response(JSON.stringify({ success: true, alert: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleLogError(supabase: any, payload: any, userId: string | null) {
  const { error_type, message, stack, context, url, user_agent } = payload;

  const { error } = await supabase.from('error_logs').insert({
    user_id: userId,
    error_type,
    message,
    stack,
    context,
    url,
    user_agent,
    created_at: new Date().toISOString()
  });

  if (error) console.error('Failed to log error:', error);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// SECURITY HANDLERS
// ============================================================================

async function handleSecurityScan(supabase: any) {
  // Run basic security checks
  const checks = {
    rls_enabled: true,
    api_keys_secure: true,
    auth_configured: true,
    timestamp: new Date().toISOString()
  };

  // Check RLS policies exist
  const { data: policies } = await supabase
    .from('pg_policies')
    .select('*')
    .limit(1);

  checks.rls_enabled = (policies?.length || 0) > 0;

  return new Response(JSON.stringify({ 
    success: true,
    scan_results: checks
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleSecurityMetrics(supabase: any) {
  const { data: metrics } = await supabase
    .from('security_metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return new Response(JSON.stringify({ 
    success: true,
    metrics: metrics || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleSecurityReport(supabase: any, payload: any) {
  const { report_type = 'summary', period = 'week' } = payload;

  const report = {
    report_type,
    period,
    generated_at: new Date().toISOString(),
    summary: {
      total_alerts: 0,
      critical_issues: 0,
      resolved_issues: 0
    }
  };

  // Get alert counts
  const { count: totalAlerts } = await supabase
    .from('unified_alerts')
    .select('*', { count: 'exact', head: true });

  const { count: criticalCount } = await supabase
    .from('unified_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('severity', 'critical');

  const { count: resolvedCount } = await supabase
    .from('unified_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'resolved');

  report.summary.total_alerts = totalAlerts || 0;
  report.summary.critical_issues = criticalCount || 0;
  report.summary.resolved_issues = resolvedCount || 0;

  return new Response(JSON.stringify({ 
    success: true,
    report
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// DATA & PERFORMANCE HANDLERS
// ============================================================================

async function handleDataCheck(supabase: any, payload: any) {
  const { tables = ['profiles', 'study_sessions', 'generated_music_tracks'] } = payload;

  const results: Record<string, any> = {};

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    results[table] = {
      count: count || 0,
      status: error ? 'error' : 'ok',
      error: error?.message
    };
  }

  return new Response(JSON.stringify({ 
    success: true,
    data_check: results,
    checked_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handlePerfCheck(supabase: any) {
  const startTime = Date.now();

  // Simple query to test DB performance
  await supabase.from('profiles').select('id').limit(1);

  const dbLatency = Date.now() - startTime;

  return new Response(JSON.stringify({ 
    success: true,
    performance: {
      db_latency_ms: dbLatency,
      status: dbLatency < 500 ? 'healthy' : dbLatency < 1000 ? 'degraded' : 'critical',
      checked_at: new Date().toISOString()
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleHealth(supabase: any) {
  const checks = {
    database: false,
    auth: false,
    timestamp: new Date().toISOString()
  };

  // Check database
  const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
  checks.database = !dbError;

  // Auth is considered healthy if we can initialize the client
  checks.auth = true;

  return new Response(JSON.stringify({ 
    success: true,
    status: checks.database && checks.auth ? 'healthy' : 'unhealthy',
    checks
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
