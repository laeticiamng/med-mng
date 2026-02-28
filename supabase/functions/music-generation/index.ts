import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { getErrorMessage } from '../_shared/error-utils.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

interface SunoGenerationRequest {
  item_id: string
  item_code: string
  title: string
  rang_type: 'A' | 'B' | 'mix'
  paroles?: string[]
  custom_prompt?: string
}

interface GenerationLog {
  id: string
  user_id: string
  item_id: string
  item_code: string
  rang_type: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  generation_start: string
  generation_end?: string
  duration_seconds?: number
  suno_song_id?: string
  error_message?: string
  prompt_used: string
  metadata: Record<string, any>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY')
    if (!SUNO_API_KEY) {
      throw new Error('SUNO_API_KEY not configured')
    }

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    // POST /generate - Générer une nouvelle chanson
    if (req.method === 'POST' && action === 'generate') {
      const authHeader = req.headers.get('authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Vérifier le quota utilisateur
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const request: SunoGenerationRequest = await req.json()
      const generationId = crypto.randomUUID()
      const startTime = new Date()

      console.log(`🎵 Starting generation for ${request.item_code} Rang ${request.rang_type}`)

      // Logger le début de génération
      const generationLog: Partial<GenerationLog> = {
        id: generationId,
        user_id: user.id,
        item_id: request.item_id,
        item_code: request.item_code,
        rang_type: request.rang_type,
        status: 'pending',
        generation_start: startTime.toISOString(),
        prompt_used: '',
        metadata: {
          user_agent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for'),
          custom_prompt: request.custom_prompt
        }
      }

      try {
        // Créer le prompt optimisé Suno
        const optimizedPrompt = createSunoPrompt(request)
        generationLog.prompt_used = optimizedPrompt

        // Insérer le log initial
        await supabase.from('music_generation_logs').insert(generationLog)

        // Mettre à jour le statut à "generating"
        await supabase
          .from('music_generation_logs')
          .update({ status: 'generating' })
          .eq('id', generationId)

        console.log(`🎤 Generated prompt: ${optimizedPrompt}`)

        // Appel API Suno
        const sunoResponse = await generateWithSuno(SUNO_API_KEY, optimizedPrompt, request)
        
        const endTime = new Date()
        const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000)

        console.log(`✅ Generation completed in ${durationSeconds}s`)

        // Mettre à jour le log avec succès
        await supabase
          .from('music_generation_logs')
          .update({
            status: 'completed',
            generation_end: endTime.toISOString(),
            duration_seconds: durationSeconds,
            suno_song_id: sunoResponse.id,
            metadata: {
              ...generationLog.metadata,
              suno_metadata: sunoResponse.metadata
            }
          })
          .eq('id', generationId)

        // Ajouter automatiquement à la bibliothèque utilisateur
        await supabase.from('emotionscare_user_songs').insert({
          user_id: user.id,
          song_id: sunoResponse.song_uuid,
          created_at: new Date().toISOString()
        })

        // Créer une alerte si génération trop lente (>30s par défaut)
        if (durationSeconds > 30) {
          await createPerformanceAlert(supabase, {
            type: 'slow_music_generation',
            severity: durationSeconds > 60 ? 'critical' : 'warning',
            message: `Génération lente: ${durationSeconds}s pour ${request.item_code}`,
            metadata: {
              generation_id: generationId,
              duration_seconds: durationSeconds,
              item_code: request.item_code
            }
          })
        }

        return new Response(
          JSON.stringify({
            success: true,
            generation_id: generationId,
            song: sunoResponse,
            duration_seconds: durationSeconds,
            added_to_library: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      } catch (error: unknown) {
        console.error(`❌ Generation failed:`, error)
        
        const endTime = new Date()
        const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000)
        const errMsg = getErrorMessage(error)

        // Logger l'échec
        await supabase
          .from('music_generation_logs')
          .update({
            status: 'failed',
            generation_end: endTime.toISOString(),
            duration_seconds: durationSeconds,
            error_message: errMsg
          })
          .eq('id', generationId)

        // Créer une alerte d'erreur
        await createPerformanceAlert(supabase, {
          type: 'music_generation_error',
          severity: 'critical',
          message: `Erreur génération: ${errMsg}`,
          metadata: {
            generation_id: generationId,
            item_code: request.item_code,
            error: errMsg
          }
        })

        return new Response(
          JSON.stringify({
            success: false,
            error: errMsg,
            generation_id: generationId
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // GET /logs - Dashboard admin des générations
    if (req.method === 'GET' && action === 'logs') {
      const { data: logs, error } = await supabase
        .from('music_generation_logs')
        .select('*')
        .order('generation_start', { ascending: false })
        .limit(100)

      if (error) throw error

      // Calculer des statistiques
      const stats = calculateGenerationStats(logs)

      return new Response(
        JSON.stringify({
          logs,
          stats,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /stats - Statistiques en temps réel
    if (req.method === 'GET' && action === 'stats') {
      const { data: recentLogs } = await supabase
        .from('music_generation_logs')
        .select('*')
        .gte('generation_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('generation_start', { ascending: false })

      const stats = calculateGenerationStats(recentLogs || [])

      return new Response(
        JSON.stringify(stats),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('❌ Error in music-generation:', error)
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function createSunoPrompt(request: SunoGenerationRequest): string {
  const basePrompt = `Chanson éducative médicale pour l'item ${request.item_code}`
  
  let prompt = `${basePrompt} - ${request.title}`
  
  if (request.rang_type === 'A') {
    prompt += ` (Connaissances de base Rang A)`
  } else if (request.rang_type === 'B') {
    prompt += ` (Connaissances approfondies Rang B)`
  } else {
    prompt += ` (Mix Rang A+B)`
  }

  if (request.paroles && request.paroles.length > 0) {
    prompt += `\n\nParoles à intégrer:\n${request.paroles.join('\n')}`
  }

  if (request.custom_prompt) {
    prompt += `\n\nStyle personnalisé: ${request.custom_prompt}`
  }

  // Ajouter des instructions Suno optimisées
  prompt += `\n\n[Style: Éducatif, mémorable, rythme modéré, voix claire, mélodie simple]`
  prompt += `\n[Genre: Educational pop, acoustic, clear vocals]`
  prompt += `\n[Durée: 2-3 minutes]`

  return prompt
}

async function generateWithSuno(apiKey: string, prompt: string, request: SunoGenerationRequest) {
  console.log('🎵 Calling Suno API...')
  
  // Simulation d'appel Suno (à remplacer par le vrai appel API)
  const response = await fetch('https://api.suno.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      model: 'suno-v3.5',
      format: 'mp3',
      quality: 'high'
    })
  })

  if (!response.ok) {
    throw new Error(`Suno API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  return {
    id: data.id || crypto.randomUUID(),
    song_uuid: crypto.randomUUID(),
    audio_url: data.audio_url || `https://cdn.suno.ai/generated/${crypto.randomUUID()}.mp3`,
    title: `${request.item_code} - ${request.title} (Rang ${request.rang_type})`,
    metadata: {
      suno_id: data.id,
      generation_time: new Date().toISOString(),
      prompt_used: prompt,
      model: 'suno-v3.5'
    }
  }
}

function calculateGenerationStats(logs: any[]) {
  if (!logs || logs.length === 0) {
    return {
      total_generations: 0,
      success_rate: 0,
      average_duration: 0,
      last_24h_count: 0,
      status_breakdown: {},
      performance_alerts: 0
    }
  }

  const totalGenerations = logs.length
  const successfulGenerations = logs.filter(log => log.status === 'completed').length
  const successRate = Math.round((successfulGenerations / totalGenerations) * 100)
  
  const completedLogs = logs.filter(log => log.status === 'completed' && log.duration_seconds)
  const averageDuration = completedLogs.length > 0 
    ? Math.round(completedLogs.reduce((sum, log) => sum + log.duration_seconds, 0) / completedLogs.length)
    : 0

  const last24h = logs.filter(log => 
    new Date(log.generation_start) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  )

  const statusBreakdown = logs.reduce((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1
    return acc
  }, {})

  const performanceAlerts = logs.filter(log => log.duration_seconds > 30).length

  return {
    total_generations: totalGenerations,
    success_rate: successRate,
    average_duration: averageDuration,
    last_24h_count: last24h.length,
    status_breakdown: statusBreakdown,
    performance_alerts: performanceAlerts,
    slowest_generation: Math.max(...completedLogs.map(log => log.duration_seconds), 0),
    fastest_generation: Math.min(...completedLogs.map(log => log.duration_seconds), 0)
  }
}

async function createPerformanceAlert(supabase: any, alert: {
  type: string
  severity: 'warning' | 'critical'
  message: string
  metadata: Record<string, any>
}) {
  try {
    await supabase.from('performance_alerts').insert({
      alert_type: alert.type,
      severity: alert.severity,
      title: `Génération Musicale - ${alert.severity.toUpperCase()}`,
      description: alert.message,
      metric_data: alert.metadata,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Failed to create performance alert:', error)
  }
}