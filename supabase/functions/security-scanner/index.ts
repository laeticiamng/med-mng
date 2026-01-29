import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../_shared/cors.ts'

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

// Send webhook notification to Slack or Teams
async function sendWebhookNotification(incident: SecurityIncident): Promise<void> {
  const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  const teamsWebhookUrl = Deno.env.get('TEAMS_WEBHOOK_URL');

  const severityEmoji = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢'
  };

  // Slack notification
  if (slackWebhookUrl) {
    try {
      const slackPayload = {
        text: `${severityEmoji[incident.severity]} Security Alert: ${incident.pattern_matched}`,
        attachments: [
          {
            color: incident.severity === 'critical' ? '#FF0000' :
                   incident.severity === 'high' ? '#FF8C00' :
                   incident.severity === 'medium' ? '#FFD700' : '#00FF00',
            fields: [
              {
                title: 'Severity',
                value: incident.severity.toUpperCase(),
                short: true
              },
              {
                title: 'Type',
                value: incident.type,
                short: true
              },
              {
                title: 'File',
                value: `${incident.file_path}:${incident.line_number || 'N/A'}`,
                short: false
              },
              {
                title: 'Pattern Detected',
                value: incident.pattern_matched,
                short: false
              },
              {
                title: 'Preview',
                value: `\`\`\`${incident.content_preview.substring(0, 200)}\`\`\``,
                short: false
              }
            ],
            footer: 'MED-MNG Security Scanner',
            ts: Math.floor(new Date(incident.timestamp).getTime() / 1000)
          }
        ]
      };

      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload)
      });

      console.log('✅ Slack notification sent');
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error);
    }
  }

  // Microsoft Teams notification
  if (teamsWebhookUrl) {
    try {
      const teamsPayload = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: incident.severity === 'critical' ? 'FF0000' :
                    incident.severity === 'high' ? 'FF8C00' :
                    incident.severity === 'medium' ? 'FFD700' : '00FF00',
        summary: `Security Alert: ${incident.pattern_matched}`,
        sections: [
          {
            activityTitle: `${severityEmoji[incident.severity]} Security Incident Detected`,
            activitySubtitle: incident.timestamp,
            facts: [
              { name: 'Severity', value: incident.severity.toUpperCase() },
              { name: 'Type', value: incident.type },
              { name: 'Pattern', value: incident.pattern_matched },
              { name: 'File', value: `${incident.file_path}:${incident.line_number || 'N/A'}` }
            ],
            text: `\`\`\`${incident.content_preview.substring(0, 200)}\`\`\``,
            markdown: true
          }
        ],
        potentialAction: [
          {
            '@type': 'ActionCard',
            name: 'View Details',
            inputs: [],
            actions: [
              {
                '@type': 'HttpPOST',
                name: 'Acknowledge',
                target: 'https://your-app.com/api/security/acknowledge'
              }
            ]
          }
        ]
      };

      await fetch(teamsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamsPayload)
      });

      console.log('✅ Teams notification sent');
    } catch (error) {
      console.error('❌ Failed to send Teams notification:', error);
    }
  }

  // Discord notification (bonus)
  const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
  if (discordWebhookUrl) {
    try {
      const discordPayload = {
        embeds: [
          {
            title: `${severityEmoji[incident.severity]} Security Alert`,
            description: incident.pattern_matched,
            color: incident.severity === 'critical' ? 0xFF0000 :
                   incident.severity === 'high' ? 0xFF8C00 :
                   incident.severity === 'medium' ? 0xFFD700 : 0x00FF00,
            fields: [
              { name: 'Severity', value: incident.severity.toUpperCase(), inline: true },
              { name: 'Type', value: incident.type, inline: true },
              { name: 'File', value: `\`${incident.file_path}:${incident.line_number || 'N/A'}\``, inline: false },
              { name: 'Preview', value: `\`\`\`\n${incident.content_preview.substring(0, 200)}\n\`\`\``, inline: false }
            ],
            timestamp: incident.timestamp,
            footer: { text: 'MED-MNG Security Scanner' }
          }
        ]
      };

      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });

      console.log('✅ Discord notification sent');
    } catch (error) {
      console.error('❌ Failed to send Discord notification:', error);
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

  // Send webhook notifications for high/critical incidents
  if (incident.severity === 'critical' || incident.severity === 'high') {
    await sendWebhookNotification(incident);
  }

  if (incident.severity === 'critical') {
    console.log('🔴 CRITICAL SECURITY INCIDENT - BUILD SHOULD BE BLOCKED!')
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle GET requests for health check
    if (req.method === 'GET') {
      const { data: recentIncidents, error } = await supabase
        .from('security_incidents')
        .select('severity')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      return new Response(
        JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          incidents_24h: recentIncidents?.length || 0,
          critical_count: recentIncidents?.filter((i: any) => i.severity === 'critical').length || 0,
          patterns_loaded: SECRET_PATTERNS.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.text();
    if (!body) {
      return new Response(
        JSON.stringify({ error: 'Request body is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const { action, files, buildContent } = JSON.parse(body)
    
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
    
  } catch (error) {
    console.error('🚨 Security Scanner Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})