import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../../_shared/cors.ts'

import { getErrorMessage } from '../../_shared/error-utils.ts';
interface SecurityIncident {
  type: 'secret_detected' | 'suspicious_pattern' | 'build_scan'
  severity: 'low' | 'medium' | 'high' | 'critical'
  file_path: string
  line_number?: number
  pattern_matched: string
  content_preview: string
  timestamp: string
}

// Patterns pour détecter les secrets - AMÉLIORÉS pour Ticket 1.1
const SECRET_PATTERNS = [
  // API Keys spécifiques
  { name: 'OpenAI API Key', pattern: /sk-[A-Za-z0-9]{48}/, severity: 'critical' as const },
  { name: 'Supabase Anon Key', pattern: /eyJ[A-Za-z0-9-_]{100,}/, severity: 'high' as const },
  { name: 'Stripe Secret Key', pattern: /sk_live_[A-Za-z0-9]{24}/, severity: 'critical' as const },
  { name: 'Stripe Test Key', pattern: /sk_test_[A-Za-z0-9]{24}/, severity: 'medium' as const },
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/, severity: 'critical' as const },
  { name: 'Google API Key', pattern: /AIza[0-9A-Za-z-_]{35}/, severity: 'high' as const },
  
  // Patterns génériques
  { name: 'Generic API Key', pattern: /[Aa][Pp][Ii][_]?[Kk][Ee][Yy]["\s]*[:=]["\s]*[A-Za-z0-9]{20,}/, severity: 'medium' as const },
  { name: 'Secret Token', pattern: /[Ss][Ee][Cc][Rr][Ee][Tt]["\s]*[:=]["\s]*[A-Za-z0-9]{20,}/, severity: 'medium' as const },
  { name: 'Password in Code', pattern: /[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd]["\s]*[:=]["\s]*[A-Za-z0-9]{8,}/, severity: 'high' as const },
  
  // ⚠️ CRITIQUE: Fallbacks avec credentials en dur - Ticket 1.1
  { name: 'Hardcoded Credential Fallback', pattern: /Deno\.env\.get\([^)]+\)\s*\|\|\s*['""][^'"]*['""]/, severity: 'critical' as const },
  { name: 'Hardcoded Email/Username', pattern: /['""][a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}['""]/, severity: 'high' as const },
  { name: 'Hardcoded Password Pattern', pattern: /['""]\w*[A-Z]\w*[!@#$%^&*]\w*[0-9]\w*['""]/g, severity: 'critical' as const },
  
  // Logs sensibles - Ticket 1.2
  { name: 'Credential in Log', pattern: /console\.log.*(?:password|key|token|secret|credential)/i, severity: 'high' as const },
  { name: 'Sensitive Data Log', pattern: /console\.log.*Deno\.env\.get/i, severity: 'medium' as const },
  
  // Variables d'environnement exposées
  { name: 'Exposed Env Var', pattern: /process\.env\.[A-Z_]+["\s]*[:=]/, severity: 'low' as const },
  { name: 'Vite Env Var', pattern: /import\.meta\.env\.VITE_[A-Z_]+/, severity: 'medium' as const },
]

async function scanFileContent(content: string, filePath: string): Promise<SecurityIncident[]> {
  const incidents: SecurityIncident[] = []
  const lines = content.split('\n')
  
  lines.forEach((line, lineIndex) => {
    SECRET_PATTERNS.forEach(pattern => {
      const match = line.match(pattern.pattern)
      if (match) {
        incidents.push({
          type: 'secret_detected',
          severity: pattern.severity,
          file_path: filePath,
          line_number: lineIndex + 1,
          pattern_matched: pattern.name,
          content_preview: line.substring(0, 100) + (line.length > 100 ? '...' : ''),
          timestamp: new Date().toISOString()
        })
      }
    })
  })
  
  return incidents
}

async function scanBuildFiles(buildContent: string[]): Promise<SecurityIncident[]> {
  const allIncidents: SecurityIncident[] = []
  
  for (let i = 0; i < buildContent.length; i++) {
    const content = buildContent[i]
    const incidents = await scanFileContent(content, `build-file-${i}.js`)
    allIncidents.push(...incidents)
  }
  
  return allIncidents
}

async function sendWebhookAlert(incident: SecurityIncident): Promise<void> {
  const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  const teamsWebhookUrl = Deno.env.get('TEAMS_WEBHOOK_URL');
  const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');

  const severityEmoji = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };

  const emoji = severityEmoji[incident.severity];

  // Slack notification
  if (slackWebhookUrl) {
    try {
      const slackPayload = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${emoji} Security Alert: ${incident.pattern_matched}`,
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Severity:*\n${incident.severity.toUpperCase()}` },
              { type: 'mrkdwn', text: `*File:*\n${incident.file_path}:${incident.line_number || 'N/A'}` },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Preview:*\n\`\`\`${incident.content_preview}\`\`\``,
            },
          },
          {
            type: 'context',
            elements: [{ type: 'mrkdwn', text: `Detected at ${incident.timestamp}` }],
          },
        ],
      };

      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
      });
      console.log('✅ Slack alert sent');
    } catch (error: unknown) {
      console.error('❌ Failed to send Slack alert:', error);
    }
  }

  // Microsoft Teams notification
  if (teamsWebhookUrl) {
    try {
      const teamsPayload = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: incident.severity === 'critical' ? 'FF0000' : incident.severity === 'high' ? 'FF8C00' : 'FFFF00',
        summary: `Security Alert: ${incident.pattern_matched}`,
        sections: [
          {
            activityTitle: `${emoji} Security Alert: ${incident.pattern_matched}`,
            facts: [
              { name: 'Severity', value: incident.severity.toUpperCase() },
              { name: 'File', value: `${incident.file_path}:${incident.line_number || 'N/A'}` },
              { name: 'Pattern', value: incident.pattern_matched },
              { name: 'Detected', value: incident.timestamp },
            ],
            text: `Preview: ${incident.content_preview}`,
          },
        ],
      };

      await fetch(teamsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamsPayload),
      });
      console.log('✅ Teams alert sent');
    } catch (error: unknown) {
      console.error('❌ Failed to send Teams alert:', error);
    }
  }

  // Discord notification
  if (discordWebhookUrl) {
    try {
      const colorMap = { critical: 0xFF0000, high: 0xFF8C00, medium: 0xFFFF00, low: 0x00FF00 };

      const discordPayload = {
        embeds: [
          {
            title: `${emoji} Security Alert: ${incident.pattern_matched}`,
            color: colorMap[incident.severity],
            fields: [
              { name: 'Severity', value: incident.severity.toUpperCase(), inline: true },
              { name: 'File', value: `${incident.file_path}:${incident.line_number || 'N/A'}`, inline: true },
              { name: 'Preview', value: `\`\`\`${incident.content_preview.substring(0, 200)}\`\`\`` },
            ],
            timestamp: incident.timestamp,
          },
        ],
      };

      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload),
      });
      console.log('✅ Discord alert sent');
    } catch (error: unknown) {
      console.error('❌ Failed to send Discord alert:', error);
    }
  }
}

async function sendAlert(incident: SecurityIncident, supabase: any) {
  console.log(`🚨 SECURITY ALERT [${incident.severity.toUpperCase()}]: ${incident.pattern_matched}`)
  console.log(`📁 File: ${incident.file_path}:${incident.line_number}`)
  console.log(`🔍 Preview: ${incident.content_preview}`)

  // Enregistrer dans la base
  const { error } = await supabase
    .from('security_incidents')
    .insert({
      type: incident.type,
      severity: incident.severity,
      file_path: incident.file_path,
      line_number: incident.line_number,
      pattern_matched: incident.pattern_matched,
      content_preview: incident.content_preview,
      status: 'detected',
      created_at: incident.timestamp
    })

  if (error) {
    console.error('❌ Failed to log security incident:', error)
  }

  // Send webhook alerts for high severity incidents
  if (incident.severity === 'critical' || incident.severity === 'high') {
    await sendWebhookAlert(incident);
  }

  if (incident.severity === 'critical') {
    console.log('🔴 CRITICAL SECURITY INCIDENT - BUILD SHOULD BE BLOCKED!')
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès security-scanner sans authentification');
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
      console.warn('❌ Token invalide pour security-scanner');
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
      console.warn(`❌ Non-admin tentative security-scanner par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ security-scanner autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, files, buildContent } = await req.json()
    
    switch (action) {
      case 'scan_files': {
        const allIncidents: SecurityIncident[] = []
        
        for (const file of files) {
          const incidents = await scanFileContent(file.content, file.path)
          allIncidents.push(...incidents)
        }
        
        // Envoyer alertes pour les incidents critiques
        for (const incident of allIncidents) {
          if (incident.severity === 'critical' || incident.severity === 'high') {
            await sendAlert(incident, supabase)
          }
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            incidents: allIncidents,
            critical_count: allIncidents.filter(i => i.severity === 'critical').length,
            high_count: allIncidents.filter(i => i.severity === 'high').length,
            should_block_build: allIncidents.some(i => i.severity === 'critical')
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'scan_build': {
        const incidents = await scanBuildFiles(buildContent)
        
        // Alertes pour tous les incidents dans le build
        for (const incident of incidents) {
          await sendAlert(incident, supabase)
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            incidents,
            build_safe: incidents.length === 0,
            should_block_deploy: incidents.some(i => i.severity === 'critical' || i.severity === 'high')
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'get_incidents': {
        const { data: incidents, error } = await supabase
          .from('security_incidents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
        
        if (error) throw error
        
        return new Response(
          JSON.stringify({ success: true, incidents }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
    
  } catch (error: unknown) {
    console.error('🚨 Security Scanner Error:', error)
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})