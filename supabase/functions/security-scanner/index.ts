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

// Patterns pour détecter les secrets
const SECRET_PATTERNS = [
  // API Keys
  { name: 'OpenAI API Key', pattern: /sk-[A-Za-z0-9]{48}/, severity: 'critical' as const },
  { name: 'Supabase Anon Key', pattern: /eyJ[A-Za-z0-9-_]{100,}/, severity: 'high' as const },
  { name: 'Stripe Secret Key', pattern: /sk_live_[A-Za-z0-9]{24}/, severity: 'critical' as const },
  { name: 'Stripe Test Key', pattern: /sk_test_[A-Za-z0-9]{24}/, severity: 'medium' as const },
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/, severity: 'critical' as const },
  { name: 'Google API Key', pattern: /AIza[0-9A-Za-z-_]{35}/, severity: 'high' as const },
  
  // Generic patterns
  { name: 'Generic API Key', pattern: /[Aa][Pp][Ii][_]?[Kk][Ee][Yy]["\s]*[:=]["\s]*[A-Za-z0-9]{20,}/, severity: 'medium' as const },
  { name: 'Secret Token', pattern: /[Ss][Ee][Cc][Rr][Ee][Tt]["\s]*[:=]["\s]*[A-Za-z0-9]{20,}/, severity: 'medium' as const },
  { name: 'Password in Code', pattern: /[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd]["\s]*[:=]["\s]*[A-Za-z0-9]{8,}/, severity: 'high' as const },
  
  // Environment variables exposées
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
  
  // TODO: Intégrer webhook Slack/Teams ici
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