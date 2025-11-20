import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface EnhancedErrorLog {
  error: {
    message: string;
    stack?: string;
    name?: string;
    category: 'auth' | 'authz' | 'validation' | 'network' | 'database' | 'external_api' | 'business' | 'system' | 'user_input';
    severity: 'low' | 'medium' | 'high' | 'critical';
    code: number;
    retryable?: boolean;
    requestId?: string;
  };
  context: {
    userId?: string;
    userAgent?: string;
    url?: string;
    component?: string;
    action?: string;
    metadata?: Record<string, any>;
  };
  timestamp: string;
}

interface ErrorPattern {
  errorKey: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  affectedUsers: Set<string>;
  affectedUrls: Set<string>;
  severity: string;
}

// In-memory storage for error patterns (in production, use Redis or database)
const errorPatterns = new Map<string, ErrorPattern>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès error-handling-service sans authentification');
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
      console.warn('❌ Token invalide pour error-handling-service');
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
      console.warn(`❌ Non-admin tentative error-handling-service par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ error-handling-service autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      return await handleErrorLog(req, supabase);
    } else if (req.method === 'GET') {
      return await handleErrorQuery(req, supabase);
    } else {
      return new Response(
        JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Error handling service failure:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'SERVICE_ERROR',
        code: 500,
        message: 'Error handling service failed',
        timestamp: new Date().toISOString(),
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})

async function handleErrorLog(req: Request, supabase: any) {
  const { error, context, timestamp }: EnhancedErrorLog = await req.json();

  console.log(`🚨 Enhanced Error Logged [${error.severity.toUpperCase()}]:`, {
    message: error.message,
    category: error.category,
    component: context.component,
    requestId: error.requestId
  });

  // Generate error hash for deduplication
  const errorHash = await hashError(`${error.message}-${error.category}-${context.component}`);

  // Enhanced metadata
  const enhancedMetadata = {
    browser: context.userAgent || 'unknown',
    page: context.url || 'unknown',
    component: context.component || 'unknown',
    action: context.action || 'unknown',
    timestamp,
    user_id: context.userId,
    error_hash: errorHash,
    request_id: error.requestId,
    retryable: error.retryable || false,
    ...context.metadata
  };

  // Store in enhanced_error_logs table
  const { data: errorLogData, error: logError } = await supabase
    .from('enhanced_error_logs')
    .insert({
      user_id: context.userId,
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name || 'Error',
      error_code: error.code,
      category: error.category,
      severity: error.severity,
      component: context.component,
      action: context.action,
      retryable: error.retryable || false,
      request_id: error.requestId,
      metadata: enhancedMetadata
    })
    .select()
    .single();

  if (logError) {
    console.error('❌ Failed to log enhanced error:', logError);
    throw logError;
  }

  // Track error patterns
  const patternAnalysis = await trackErrorPattern(error, context, supabase);

  // Create notifications for critical errors
  const notifications = await handleErrorNotifications(error, context, errorLogData.id, supabase);

  // Send alerts to external systems for high/critical errors
  const alerts = await sendExternalAlerts(error, context, errorLogData.id);

  return new Response(
    JSON.stringify({ 
      success: true,
      errorId: errorLogData.id,
      errorHash,
      patternAnalysis,
      notifications,
      alerts: alerts.length
    }),
    { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      } 
    }
  );
}

async function handleErrorQuery(req: Request, supabase: any) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const timeframe = url.searchParams.get('timeframe') || '24h';
  const category = url.searchParams.get('category');
  const severity = url.searchParams.get('severity');

  switch (action) {
    case 'patterns':
      return await getErrorPatterns(supabase, timeframe, category, severity);
    case 'stats':
      return await getErrorStats(supabase, timeframe);
    case 'recent':
      return await getRecentErrors(supabase, timeframe, category, severity);
    default:
      return new Response(
        JSON.stringify({ error: 'INVALID_ACTION', message: 'Invalid query action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}

async function trackErrorPattern(error: any, context: any, supabase: any) {
  const errorKey = `${error.category}-${error.message}`;
  const now = new Date().toISOString();
  const oneHour = 60 * 60 * 1000;

  // Get recent similar errors from database
  const { data: recentErrors } = await supabase
    .from('enhanced_error_logs')
    .select('created_at, user_id, metadata')
    .eq('category', error.category)
    .eq('error_message', error.message)
    .gte('created_at', new Date(Date.now() - oneHour).toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  const errorCount = recentErrors?.length || 0;
  const uniqueUsers = new Set(recentErrors?.map(e => e.user_id).filter(Boolean)).size;
  const uniqueUrls = new Set(recentErrors?.map(e => e.metadata?.page).filter(Boolean)).size;

  // Pattern detection thresholds
  const isPattern = (
    errorCount >= 5 || // 5+ occurrences in an hour
    (uniqueUsers >= 3 && errorCount >= 3) || // 3+ users affected
    (error.severity === 'critical' && errorCount >= 2) // 2+ critical errors
  );

  if (isPattern) {
    console.log('🔥 Error pattern detected:', {
      errorKey,
      count: errorCount,
      uniqueUsers,
      uniqueUrls,
      severity: error.severity
    });
    
    // Create pattern alert in database
    await supabase
      .from('error_patterns')
      .upsert({
        pattern_key: errorKey,
        error_category: error.category,
        error_message: error.message,
        severity: error.severity,
        occurrence_count: errorCount,
        unique_users: uniqueUsers,
        unique_urls: uniqueUrls,
        first_seen: recentErrors?.[recentErrors.length - 1]?.created_at || now,
        last_seen: now,
        status: 'active'
      });

    // Create admin notification for pattern
    await supabase
      .from('admin_notifications')
      .insert({
        type: 'error_pattern',
        severity: error.severity === 'critical' ? 'urgent' : 'high',
        title: `Error Pattern Detected: ${error.category}`,
        message: `Pattern detected for "${error.message}" - ${errorCount} occurrences affecting ${uniqueUsers} users`,
        data: {
          pattern_key: errorKey,
          category: error.category,
          occurrence_count: errorCount,
          unique_users: uniqueUsers,
          unique_urls: uniqueUrls
        },
        actionable: true,
        action_url: '/admin/errors/patterns',
        action_label: 'Investigate Pattern'
      });
  }

  return {
    isPattern,
    occurrenceCount: errorCount,
    uniqueUsers,
    uniqueUrls,
    timeWindow: '1 hour'
  };
}

async function handleErrorNotifications(error: any, context: any, errorId: string, supabase: any) {
  const notifications = [];

  // User notification for high/critical errors
  if ((error.severity === 'critical' || error.severity === 'high') && context.userId) {
    const { error: notifError } = await supabase
      .from('user_notifications')
      .insert({
        user_id: context.userId,
        type: 'error',
        title: `${error.severity === 'critical' ? 'Critical' : 'Important'} Error Occurred`,
        message: getUserFriendlyErrorMessage(error),
        category: 'system',
        priority: error.severity === 'critical' ? 'urgent' : 'high',
        actionable: error.retryable,
        action_url: error.retryable ? context.url : '/support',
        action_label: error.retryable ? 'Retry' : 'Get Help',
        data: {
          error_id: errorId,
          category: error.category,
          retryable: error.retryable
        }
      });

    if (!notifError) {
      notifications.push('user_notification_created');
    }
  }

  // Admin notification for system errors
  if (error.category === 'system' || error.severity === 'critical') {
    const { error: adminNotifError } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'system_error',
        severity: error.severity === 'critical' ? 'urgent' : 'high',
        title: `${error.severity.toUpperCase()} System Error`,
        message: `${error.category} error in ${context.component}: ${error.message}`,
        data: {
          error_id: errorId,
          category: error.category,
          component: context.component,
          user_id: context.userId,
          request_id: error.requestId
        },
        actionable: true,
        action_url: `/admin/errors/${errorId}`,
        action_label: 'View Error Details'
      });

    if (!adminNotifError) {
      notifications.push('admin_notification_created');
    }
  }

  return notifications;
}

async function sendExternalAlerts(error: any, context: any, errorId: string) {
  const alerts = [];

  // Only send external alerts for critical errors or system failures
  if (error.severity !== 'critical' && error.category !== 'system') {
    return alerts;
  }

  // Discord/Slack webhook (implement if webhooks are configured)
  const webhookUrl = Deno.env.get('ERROR_ALERT_WEBHOOK_URL');
  if (webhookUrl) {
    try {
      const payload = {
        text: `🚨 CRITICAL ERROR ALERT`,
        attachments: [{
          color: 'danger',
          title: `${error.category.toUpperCase()} Error in ${context.component}`,
          text: error.message,
          fields: [
            { title: 'Severity', value: error.severity, short: true },
            { title: 'Category', value: error.category, short: true },
            { title: 'User', value: context.userId || 'Anonymous', short: true },
            { title: 'Error ID', value: errorId, short: true }
          ],
          timestamp: new Date().toISOString()
        }]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alerts.push('webhook_sent');
      }
    } catch (webhookError) {
      console.error('Failed to send webhook alert:', webhookError);
    }
  }

  return alerts;
}

function getUserFriendlyErrorMessage(error: any): string {
  switch (error.category) {
    case 'auth':
      return 'Please log in again to continue using the application.';
    case 'authz':
      return 'You don\'t have permission to perform this action.';
    case 'validation':
      return error.message; // Validation messages are usually user-friendly
    case 'network':
      return 'Network connection issue. Please check your internet connection.';
    case 'external_api':
      return 'External service is temporarily unavailable. Please try again later.';
    case 'database':
      return 'Data access issue. Please try again in a moment.';
    default:
      return 'An unexpected error occurred. Our team has been notified.';
  }
}

async function getErrorPatterns(supabase: any, timeframe: string, category?: string, severity?: string) {
  const timeframeMs = parseTimeframe(timeframe);
  const since = new Date(Date.now() - timeframeMs).toISOString();

  let query = supabase
    .from('error_patterns')
    .select('*')
    .gte('last_seen', since)
    .order('occurrence_count', { ascending: false });

  if (category) query = query.eq('error_category', category);
  if (severity) query = query.eq('severity', severity);

  const { data, error } = await query.limit(50);

  return new Response(
    JSON.stringify({ 
      patterns: data || [],
      timeframe,
      error: error?.message 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getErrorStats(supabase: any, timeframe: string) {
  const timeframeMs = parseTimeframe(timeframe);
  const since = new Date(Date.now() - timeframeMs).toISOString();

  const { data, error } = await supabase
    .from('enhanced_error_logs')
    .select('category, severity, created_at')
    .gte('created_at', since);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const stats = {
    total: data.length,
    by_category: {},
    by_severity: {},
    by_hour: {}
  };

  data.forEach((log: any) => {
    // Count by category
    stats.by_category[log.category] = (stats.by_category[log.category] || 0) + 1;
    
    // Count by severity
    stats.by_severity[log.severity] = (stats.by_severity[log.severity] || 0) + 1;
    
    // Count by hour
    const hour = new Date(log.created_at).getHours();
    stats.by_hour[hour] = (stats.by_hour[hour] || 0) + 1;
  });

  return new Response(
    JSON.stringify({ stats, timeframe }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getRecentErrors(supabase: any, timeframe: string, category?: string, severity?: string) {
  const timeframeMs = parseTimeframe(timeframe);
  const since = new Date(Date.now() - timeframeMs).toISOString();

  let query = supabase
    .from('enhanced_error_logs')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (severity) query = query.eq('severity', severity);

  const { data, error } = await query.limit(100);

  return new Response(
    JSON.stringify({ 
      errors: data || [],
      timeframe,
      filters: { category, severity },
      error: error?.message 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function parseTimeframe(timeframe: string): number {
  const timeframeMap: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };
  return timeframeMap[timeframe] || timeframeMap['24h'];
}

async function hashError(errorString: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(errorString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}