import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
  
  // Envoi des notifications externes
  await sendSecurityNotifications(incident)
  
  if (incident.severity === 'critical') {
    console.log('🔴 CRITICAL SECURITY INCIDENT - BUILD SHOULD BE BLOCKED!')
  }
}

async function sendSecurityNotifications(incident: SecurityIncident) {
  const tasks: Promise<void>[] = []
  
  // Configuration des webhooks depuis les variables d'environnement
  const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL')
  const discordWebhook = Deno.env.get('DISCORD_WEBHOOK_URL')
  const teamsWebhook = Deno.env.get('TEAMS_WEBHOOK_URL')
  
  // Message formaté pour les notifications
  const alertTitle = `🚨 Security Incident Detected [${incident.severity.toUpperCase()}]`
  const alertMessage = `**Type:** ${incident.pattern_matched}
**File:** ${incident.file_path}:${incident.line_number}
**Severity:** ${incident.severity}
**Preview:** ${incident.content_preview}
**Timestamp:** ${incident.timestamp}`

  // Notification Slack
  if (slackWebhook) {
    tasks.push(sendToSlack(slackWebhook, alertTitle, alertMessage, incident))
  }
  
  // Notification Discord
  if (discordWebhook) {
    tasks.push(sendToDiscord(discordWebhook, alertTitle, alertMessage, incident))
  }
  
  // Notification Teams
  if (teamsWebhook) {
    tasks.push(sendToTeams(teamsWebhook, alertTitle, alertMessage, incident))
  }
  
  // Envoi de toutes les notifications en parallèle
  if (tasks.length > 0) {
    await Promise.allSettled(tasks)
    console.log(`📤 Sent security notifications to ${tasks.length} channel(s)`)
  } else {
    console.log('⚠️ No webhook URLs configured for security notifications')
  }
}

async function sendToSlack(webhookUrl: string, title: string, message: string, incident: SecurityIncident) {
  try {
    const payload = {
      text: title,
      attachments: [{
        color: incident.severity === 'critical' ? 'danger' : incident.severity === 'high' ? 'warning' : 'good',
        fields: [
          { title: 'Pattern Matched', value: incident.pattern_matched, short: true },
          { title: 'Severity', value: incident.severity, short: true },
          { title: 'File', value: `${incident.file_path}:${incident.line_number}`, short: false },
          { title: 'Content Preview', value: `\`\`\`${incident.content_preview}\`\`\``, short: false }
        ],
        ts: Math.floor(new Date(incident.timestamp).getTime() / 1000)
      }]
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`)
    }
    
    console.log('✅ Slack notification sent successfully')
  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error)
  }
}

async function sendToDiscord(webhookUrl: string, title: string, message: string, incident: SecurityIncident) {
  try {
    const color = incident.severity === 'critical' ? 0xFF0000 : incident.severity === 'high' ? 0xFF8C00 : 0x00FF00
    
    const payload = {
      embeds: [{
        title: title,
        description: message,
        color: color,
        fields: [
          { name: 'Pattern', value: incident.pattern_matched, inline: true },
          { name: 'Severity', value: incident.severity.toUpperCase(), inline: true },
          { name: 'File', value: `${incident.file_path}:${incident.line_number}`, inline: false }
        ],
        timestamp: incident.timestamp,
        footer: { text: 'Security Scanner' }
      }]
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`Discord notification failed: ${response.statusText}`)
    }
    
    console.log('✅ Discord notification sent successfully')
  } catch (error) {
    console.error('❌ Failed to send Discord notification:', error)
  }
}

async function sendToTeams(webhookUrl: string, title: string, message: string, incident: SecurityIncident) {
  try {
    const themeColor = incident.severity === 'critical' ? 'FF0000' : incident.severity === 'high' ? 'FF8C00' : '00FF00'
    
    const payload = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      summary: title,
      themeColor: themeColor,
      sections: [{
        activityTitle: title,
        activitySubtitle: `Security incident detected in ${incident.file_path}`,
        facts: [
          { name: 'Pattern Matched', value: incident.pattern_matched },
          { name: 'Severity', value: incident.severity.toUpperCase() },
          { name: 'File', value: `${incident.file_path}:${incident.line_number}` },
          { name: 'Timestamp', value: incident.timestamp }
        ],
        text: `**Content Preview:**\n\`\`\`\n${incident.content_preview}\n\`\`\``
      }]
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`Teams notification failed: ${response.statusText}`)
    }
    
    console.log('✅ Teams notification sent successfully')
  } catch (error) {
    console.error('❌ Failed to send Teams notification:', error)
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
    
  } catch (error) {
    console.error('🚨 Security Scanner Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})