import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withSecurity, withRateLimit } from '../_shared/security.ts'
import { SecurityLogger, SecurityEventType } from '../_shared/securityLogger.ts'

// Validation backend
const validateSongInput = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Validation prompt
  if (!data.prompt || typeof data.prompt !== 'string') {
    errors.push('Prompt requis')
  } else if (data.prompt.length < 10 || data.prompt.length > 500) {
    errors.push('Prompt doit faire entre 10 et 500 caractères')
  } else if (!/^[a-zA-Z0-9\s\-_.,:;!?\u00e0\u00e2\u00e4\u00e9\u00e8\u00ea\u00eb\u00ef\u00ee\u00f4\u00f9\u00fb\u00fc\u00ff\u00e7]+$/.test(data.prompt)) {
    errors.push('Caractères non autorisés dans le prompt')
  }
  
  // Validation style
  const allowedStyles = ['lofi-piano', 'pop-melodique', 'jazz', 'rock', 'folk']
  if (!allowedStyles.includes(data.style)) {
    errors.push('Style non autorisé')
  }
  
  // Validation durée
  const allowedDurations = ['2:00', '4:00', '6:00']
  if (!allowedDurations.includes(data.duration)) {
    errors.push('Durée non autorisée')
  }
  
  return { valid: errors.length === 0, errors }
}

const handler = async (req: Request): Promise<Response> => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const securityLogger = new SecurityLogger(supabaseClient)
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'
  
  try {
    const body = await req.json()
    console.log('🎵 Génération demandée:', { ...body, ip })
    
    // Validation des données
    const validation = validateSongInput(body)
    if (!validation.valid) {
      await securityLogger.logSecurityEvent({
        type: SecurityEventType.INVALID_INPUT,
        ipAddress: ip,
        userAgent,
        endpoint: 'generate-song',
        payload: { errors: validation.errors },
        severity: 'medium'
      })
      
      return new Response(
        JSON.stringify({ 
          error: 'Données invalides', 
          details: validation.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Détection XSS/injection
    const dangerousContent = [body.prompt, body.title].some(text => 
      text && (/<script/i.test(text) || /javascript:/i.test(text))
    )
    
    if (dangerousContent) {
      await securityLogger.logSecurityEvent({
        type: SecurityEventType.XSS_ATTEMPT,
        ipAddress: ip,
        userAgent,
        endpoint: 'generate-song',
        payload: body,
        severity: 'high'
      })
      
      return new Response(
        JSON.stringify({ error: 'Contenu dangereux détecté' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Sanitiser les données
    const sanitizedData = {
      prompt: body.prompt.trim(),
      style: body.style,
      duration: body.duration,
      title: body.title?.trim() || null
    }
    
    // Continuer avec la génération...
    const sunoResponse = await fetch('https://api.suno.ai/v1/songs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUNO_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...sanitizedData,
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-music-callback`
      })
    })

    if (!sunoResponse.ok) {
      throw new Error(`Erreur Suno: ${sunoResponse.status}`)
    }

    const sunoData = await sunoResponse.json()
    
    // Sauvegarder en BDD avec données nettoyées
    const { data: song, error } = await supabaseClient
      .from('songs')
      .insert({
        suno_id: sunoData.id,
        title: sanitizedData.title,
        prompt: sanitizedData.prompt,
        style: sanitizedData.style,
        duration: sanitizedData.duration,
        status: 'generating',
        ip_address: ip,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({
      success: true,
      songId: song.id,
      sunoId: sunoData.id
    }))

  } catch (error: any) {
    console.error('💥 Erreur génération:', error)
    
    await securityLogger.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      ipAddress: ip,
      userAgent,
      endpoint: 'generate-song',
      payload: { error: error.message },
      severity: 'medium'
    })
    
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Appliquer les middlewares de sécurité
serve(withSecurity(withRateLimit('generate-song')(handler)))
