import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { task_id } = await req.json()

    if (!task_id) {
      throw new Error('task_id requis')
    }

    console.log('🔍 Vérification statut:', task_id)

    // Récupérer le track de la base de données
    const { data: track, error } = await supabaseClient
      .from('generated_music_tracks')
      .select('*')
      .eq('id', task_id)
      .single()

    if (error || !track) {
      console.error('❌ Track non trouvé:', task_id, error)
      throw new Error('Tâche de génération non trouvée')
    }

    const metadata = track.metadata || {}
    console.log('📊 Statut actuel:', metadata.status, `(${metadata.progress || 0}%)`)

    // Construire la réponse de statut
    const statusResponse = {
      status: metadata.status || 'pending',
      progress: metadata.progress || 0,
      stage: metadata.stage || 'initializing',
      started_at: metadata.generation_started_at || track.created_at,
      error_message: metadata.error_message,
      track: null
    }

    // Si terminé avec succès, inclure les données du track
    if (metadata.status === 'completed' && track.audio_url) {
      statusResponse.track = {
        id: track.id,
        title: track.title,
        audio_url: track.audio_url,
        metadata: track.metadata,
        created_at: track.created_at,
        updated_at: track.updated_at,
        rang: metadata.rang,
        duration: metadata.duration
      }
    }

    return new Response(
      JSON.stringify(statusResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erreur récupération statut:', error)
    
    return new Response(
      JSON.stringify({ 
        status: 'error',
        progress: 0,
        stage: 'error',
        error_message: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})