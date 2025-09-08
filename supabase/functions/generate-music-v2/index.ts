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

    const requestBody = await req.json()
    console.log('🎵 Génération musicale v2:', requestBody)

    const {
      item_code,
      rang,
      style,
      duration = 240,
      lyrics,
      language = 'fr',
      fast_mode = true,
      priority = 'normal',
      user_preferences
    } = requestBody

    // Validation des paramètres
    if (!item_code || !rang || !lyrics || !Array.isArray(lyrics)) {
      throw new Error('Paramètres manquants: item_code, rang, lyrics requis')
    }

    // Générer un ID de tâche unique
    const taskId = crypto.randomUUID()

    // Créer l'entrée dans la base de données
    const { data: track, error: insertError } = await supabaseClient
      .from('generated_music_tracks')
      .insert({
        id: taskId,
        title: `${item_code} - Rang ${rang}`,
        metadata: {
          item_code,
          rang,
          style,
          duration,
          language,
          fast_mode,
          priority,
          lyrics_count: lyrics.length,
          user_preferences,
          generation_started_at: new Date().toISOString(),
          status: 'pending',
          progress: 0,
          stage: 'initializing'
        }
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erreur insertion track:', insertError)
      throw new Error(`Erreur base de données: ${insertError.message}`)
    }

    console.log('✅ Track créé:', track.id)

    // Démarrer le processus de génération en arrière-plan
    // Dans une implémentation complète, ceci appellerait Suno API
    startMusicGeneration(supabaseClient, track, lyrics, requestBody)

    return new Response(
      JSON.stringify({ 
        success: true, 
        task_id: taskId,
        message: 'Génération musicale démarrée',
        estimated_duration_seconds: fast_mode ? 120 : 300
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erreur génération musicale:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Voir les logs pour plus de détails'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Fonction pour démarrer la génération en arrière-plan
async function startMusicGeneration(supabaseClient: any, track: any, lyrics: string[], config: any) {
  try {
    console.log('🎵 Démarrage génération pour:', track.id)

    // Simulation du processus de génération Suno
    const stages = [
      { stage: 'generating_lyrics', progress: 20, duration: 10000 },
      { stage: 'creating_music', progress: 50, duration: 60000 },
      { stage: 'processing_audio', progress: 80, duration: 30000 },
      { stage: 'finalizing', progress: 95, duration: 10000 },
      { stage: 'uploading', progress: 100, duration: 5000 }
    ]

    for (const stageInfo of stages) {
      // Mise à jour du statut
      await supabaseClient
        .from('generated_music_tracks')
        .update({
          metadata: {
            ...track.metadata,
            status: 'processing',
            progress: stageInfo.progress,
            stage: stageInfo.stage,
            updated_at: new Date().toISOString()
          }
        })
        .eq('id', track.id)

      console.log(`🎵 ${track.id}: ${stageInfo.stage} (${stageInfo.progress}%)`)
      
      // Simulation de l'attente
      await new Promise(resolve => setTimeout(resolve, stageInfo.duration))
    }

    // Simulation d'URL audio générée
    const audioUrl = `https://example.com/audio/${track.id}.mp3`

    // Finalisation avec succès
    await supabaseClient
      .from('generated_music_tracks')
      .update({
        audio_url: audioUrl,
        metadata: {
          ...track.metadata,
          status: 'completed',
          progress: 100,
          stage: 'completed',
          completed_at: new Date().toISOString(),
          total_generation_time: Date.now() - new Date(track.metadata.generation_started_at).getTime()
        }
      })
      .eq('id', track.id)

    console.log('✅ Génération terminée:', track.id, audioUrl)

  } catch (error) {
    console.error('❌ Erreur génération:', error)
    
    // Marquer comme échoué
    await supabaseClient
      .from('generated_music_tracks')
      .update({
        metadata: {
          ...track.metadata,
          status: 'failed',
          error_message: error.message,
          failed_at: new Date().toISOString()
        }
      })
      .eq('id', track.id)
  }
}