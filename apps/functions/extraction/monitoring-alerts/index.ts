import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastCheck: string;
  errorMessage?: string;
}

interface AlertPayload {
  type: 'error' | 'warning' | 'critical';
  service: string;
  message: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function checkServiceHealth(url: string, serviceName: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    const responseTime = Date.now() - startTime;
    const status = response.ok ? 'healthy' : 'unhealthy';

    return {
      service: serviceName,
      status,
      responseTime,
      lastCheck: new Date().toISOString(),
      errorMessage: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (error) {
    return {
      service: serviceName,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      errorMessage: error.message
    };
  }
}

async function sendSlackAlert(alert: AlertPayload) {
  const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  if (!webhookUrl) return;

  const severityEmoji = {
    low: '🟡',
    medium: '🟠', 
    high: '🔴',
    critical: '🚨'
  };

  const message = {
    text: `${severityEmoji[alert.severity]} *${alert.type.toUpperCase()}* - ${alert.service}`,
    attachments: [{
      color: alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'warning' : 'good',
      fields: [
        {
          title: 'Message',
          value: alert.message,
          short: false
        },
        {
          title: 'Service',
          value: alert.service,
          short: true
        },
        {
          title: 'Severity',
          value: alert.severity.toUpperCase(),
          short: true
        },
        {
          title: 'Time',
          value: new Date().toISOString(),
          short: true
        }
      ]
    }]
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

async function sendDiscordAlert(alert: AlertPayload) {
  const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
  if (!webhookUrl) return;

  const severityColor = {
    low: 16776960,    // Yellow
    medium: 16753920, // Orange
    high: 16711680,   // Red
    critical: 8519680 // Dark red
  };

  const embed = {
    title: `🚨 ${alert.type.toUpperCase()} Alert`,
    description: alert.message,
    color: severityColor[alert.severity],
    fields: [
      { name: 'Service', value: alert.service, inline: true },
      { name: 'Severity', value: alert.severity.toUpperCase(), inline: true },
      { name: 'Time', value: new Date().toISOString(), inline: false }
    ],
    timestamp: new Date().toISOString()
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch (error) {
    console.error('Failed to send Discord alert:', error);
  }
}

async function logIncident(alert: AlertPayload) {
  try {
    const { error } = await supabase
      .from('monitoring_incidents')
      .insert({
        incident_type: alert.type,
        service_name: alert.service,
        message: alert.message,
        severity: alert.severity,
        details: alert.details || {},
        status: 'active',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log incident:', error);
    }
  } catch (error) {
    console.error('Failed to log incident:', error);
  }
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
      console.warn('❌ Tentative accès monitoring-alerts sans authentification');
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
      console.warn('❌ Token invalide pour monitoring-alerts');
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
      console.warn(`❌ Non-admin tentative monitoring-alerts par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ monitoring-alerts autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    const responseTime = Date.now() - startTime;
    const status = response.ok ? 'healthy' : 'unhealthy';

    return {
      service: serviceName,
      status,
      responseTime,
      lastCheck: new Date().toISOString(),
      errorMessage: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (error) {
    return {
      service: serviceName,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      errorMessage: error.message
    };
  }
}

async function sendSlackAlert(alert: AlertPayload) {
  const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  if (!webhookUrl) return;

  const severityEmoji = {
    low: '🟡',
    medium: '🟠', 
    high: '🔴',
    critical: '🚨'
  };

  const message = {
    text: `${severityEmoji[alert.severity]} *${alert.type.toUpperCase()}* - ${alert.service}`,
    attachments: [{
      color: alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'warning' : 'good',
      fields: [
        {
          title: 'Message',
          value: alert.message,
          short: false
        },
        {
          title: 'Service',
          value: alert.service,
          short: true
        },
        {
          title: 'Severity',
          value: alert.severity.toUpperCase(),
          short: true
        },
        {
          title: 'Time',
          value: new Date().toISOString(),
          short: true
        }
      ]
    }]
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

async function sendDiscordAlert(alert: AlertPayload) {
  const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
  if (!webhookUrl) return;

  const severityColor = {
    low: 16776960,    // Yellow
    medium: 16753920, // Orange
    high: 16711680,   // Red
    critical: 8519680 // Dark red
  };

  const embed = {
    title: `🚨 ${alert.type.toUpperCase()} Alert`,
    description: alert.message,
    color: severityColor[alert.severity],
    fields: [
      { name: 'Service', value: alert.service, inline: true },
      { name: 'Severity', value: alert.severity.toUpperCase(), inline: true },
      { name: 'Time', value: new Date().toISOString(), inline: false }
    ],
    timestamp: new Date().toISOString()
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch (error) {
    console.error('Failed to send Discord alert:', error);
  }
}

async function logIncident(alert: AlertPayload) {
  try {
    const { error } = await supabase
      .from('monitoring_incidents')
      .insert({
        incident_type: alert.type,
        service_name: alert.service,
        message: alert.message,
        severity: alert.severity,
        details: alert.details || {},
        status: 'active',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log incident:', error);
    }
  } catch (error) {
    console.error('Failed to log incident:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'health_check': {
        console.log('🔍 Starting health checks...');
        
        const services = [
          { name: 'Supabase', url: `${Deno.env.get('SUPABASE_URL')}/rest/v1/` },
          { name: 'OpenAI', url: 'https://api.openai.com/v1/models' },
          { name: 'Suno API', url: 'https://studio-api.suno.ai/api/external/v1/status' }
        ];

        const healthResults: HealthCheckResult[] = [];
        
        for (const service of services) {
          const result = await checkServiceHealth(service.url, service.name);
          healthResults.push(result);

          // Send alert if service is unhealthy
          if (result.status === 'unhealthy') {
            const alert: AlertPayload = {
              type: 'critical',
              service: result.service,
              message: `Service ${result.service} is down: ${result.errorMessage}`,
              severity: 'critical',
              details: { responseTime: result.responseTime, url: service.url }
            };

            await Promise.all([
              sendSlackAlert(alert),
              sendDiscordAlert(alert),
              logIncident(alert)
            ]);
          }
        }

        return new Response(JSON.stringify({ 
          status: 'completed',
          results: healthResults,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'send_alert': {
        const body = await req.json();
        const alert: AlertPayload = body;

        console.log('📢 Sending alert:', alert);

        await Promise.all([
          sendSlackAlert(alert),
          sendDiscordAlert(alert),
          logIncident(alert)
        ]);

        return new Response(JSON.stringify({ 
          status: 'alert_sent',
          alert: alert,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_incidents': {
        const { data, error } = await supabase
          .from('monitoring_incidents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          throw error;
        }

        return new Response(JSON.stringify({ 
          incidents: data,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'resolve_incident': {
        const body = await req.json();
        const { incident_id, resolution_notes } = body;

        const { error } = await supabase
          .from('monitoring_incidents')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolution_notes: resolution_notes
          })
          .eq('id', incident_id);

        if (error) {
          throw error;
        }

        return new Response(JSON.stringify({ 
          status: 'incident_resolved',
          incident_id: incident_id,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ 
          error: 'Invalid action',
          available_actions: ['health_check', 'send_alert', 'get_incidents', 'resolve_incident']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('❌ Monitoring function error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});