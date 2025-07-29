
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const callbackData = await req.json();
    console.log('🔔 Callback Suno reçu:', JSON.stringify(callbackData, null, 2));
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Traiter les vrais callbacks Suno selon la structure des logs
    if (callbackData.code === 200 && callbackData.data) {
      const { callbackType, data: tracks, task_id } = callbackData.data;
      
      console.log(`📋 Type callback: ${callbackType}, TaskID: ${task_id}, Tracks: ${tracks?.length || 0}`);
      
      // Traitement asynchrone pour éviter timeout (Bonnes pratiques Suno)
      const processTrackUpdates = async () => {
        try {
          // Traitement selon le type de callback
          if ((callbackType === 'text' || callbackType === 'complete') && tracks && tracks.length > 0) {
            // 🎵 GÉNÉRATION EN COURS - Créer ou mettre à jour la BDD
            for (const track of tracks) {
          console.log(`🎵 Processing track: ${track.id} - Type: ${callbackType}`);
          
              try {
                // Vérification idempotente - éviter doublons
                const { data: existingTrack, error: findError } = await supabase
                  .from('generated_music_tracks')
                  .select('id, metadata, generation_status')
                  .eq('suno_track_id', track.id)
                  .maybeSingle();

                if (findError) {
                  console.error(`❌ Erreur query track ${track.id}:`, findError);
                  continue;
                }

                if (existingTrack) {
                  // Mise à jour idempotente - éviter doublons
                  if (callbackType === 'complete' && track.audio_url && existingTrack.generation_status !== 'completed') {
                    const updateData: any = {
                      generation_status: 'completed',
                      audio_url: track.audio_url || track.source_audio_url,
                      stream_url: track.stream_audio_url || track.source_stream_audio_url,
                      image_url: track.image_url || track.source_image_url,
                      duration: track.duration ? Math.floor(track.duration) : 240,
                      metadata: {
                        ...(typeof existingTrack.metadata === 'object' && existingTrack.metadata !== null ? existingTrack.metadata : {}),
                        duration: track.duration,
                        suno_complete_data: track,
                        created_at: new Date(track.createTime || Date.now()).toISOString()
                      },
                      updated_at: new Date().toISOString(),
                      created_via_callback: true
                    };

                    const { error: updateError } = await supabase
                      .from('generated_music_tracks')
                      .update(updateData)
                      .eq('suno_track_id', track.id);
                      
                    if (updateError) {
                      console.error('❌ Erreur mise à jour BDD:', updateError);
                    } else {
                      console.log(`📝 Statut ${callbackType} mis à jour pour track ${track.id}`);
                    }
                  } else if (callbackType === 'text') {
                    // Mise à jour intermédiaire pour phase text
                    const { error: updateError } = await supabase
                      .from('generated_music_tracks')
                      .update({
                        generation_status: 'text_generated',
                        image_url: track.image_url || track.source_image_url,
                        metadata: {
                          ...(typeof existingTrack.metadata === 'object' && existingTrack.metadata !== null ? existingTrack.metadata : {}),
                          suno_text_data: track
                        },
                        updated_at: new Date().toISOString()
                      })
                      .eq('suno_track_id', track.id);

                    if (updateError) {
                      console.error('❌ Erreur update text track:', updateError);
                    }
                  }
                } else {
                  // Créer un nouveau record - Prévention doublons
                  console.log('💾 Création nouveau track en BDD');
                  
                  const insertData: any = {
                    task_id: task_id,
                    suno_track_id: track.id,
                    title: track.title || 'Musique générée',
                    generation_status: callbackType === 'complete' ? 'completed' : 
                                      callbackType === 'text' ? 'text_generated' : 'generating',
                    duration: track.duration ? Math.floor(track.duration) : 240,
                    user_id: null, // Permettre les utilisateurs anonymes
                    audio_url: (callbackType === 'complete' && track.audio_url) ? track.audio_url : null,
                    stream_url: track.stream_audio_url || track.source_stream_audio_url || null,
                    image_url: track.image_url || track.source_image_url || null,
                    metadata: {
                      prompt: track.prompt,
                      tags: track.tags,
                      model_name: track.model_name,
                      duration: track.duration,
                      real_track_id: track.id,
                      original_task_id: task_id,
                      created_at: new Date(track.createTime || Date.now()).toISOString(),
                      suno_complete_data: callbackType === 'complete' ? track : null,
                      suno_text_data: callbackType === 'text' ? track : null,
                      rang: track.title?.includes('Rang B') ? 'B' : 'A'
                    },
                    created_via_callback: true
                  };

                  const { error: insertError } = await supabase
                    .from('generated_music_tracks')
                    .insert(insertData);
                    
                  if (insertError) {
                    console.error('❌ Erreur insertion BDD:', insertError);
                  } else {
                    console.log(`💾 Track ${track.id} créé avec succès en BDD`);
                  }
                }
              } catch (error) {
                console.error(`❌ Erreur traitement track ${track.id}:`, error);
              }
            }
          }
        } catch (error) {
          console.error('❌ Erreur traitement asynchrone:', error);
        }
      };

      // Traitement asynchrone en arrière-plan
      processTrackUpdates();
      
    } else if (callbackData.status === 'FAILED') {
      console.error('❌ Génération Suno échouée:', callbackData.error || 'Erreur inconnue');
      
      // Marquer comme échoué en BDD
      if (callbackData.task_id) {
        await supabase
          .from('generated_music_tracks')
          .update({
            generation_status: 'failed',
            metadata: {
              error: callbackData.error || 'Génération échouée',
              failed_at: new Date().toISOString()
            }
          })
          .eq('task_id', callbackData.task_id);
      }
    }

    // Réponse immédiate (conformité timeout 15s Suno)
    const responseTime = Date.now() - startTime;
    console.log(`⚡ Callback traité en ${responseTime}ms`);
    
    return new Response(JSON.stringify({ 
      status: 'received',
      taskId: callbackData.data?.task_id,
      tracksProcessed: callbackData.data?.data?.length || 0,
      processingTime: responseTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur callback Suno:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
