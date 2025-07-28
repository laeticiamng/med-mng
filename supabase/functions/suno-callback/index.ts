
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const callbackData = await req.json();
    console.log('🔔 Callback Suno reçu:', JSON.stringify(callbackData, null, 2));

    // Traiter les vrais callbacks Suno selon la structure des logs
    if (callbackData.code === 200 && callbackData.data) {
      const { callbackType, data: tracks, task_id } = callbackData.data;
      
      console.log(`📋 Type callback: ${callbackType}, TaskID: ${task_id}, Tracks: ${tracks?.length || 0}`);
      
      // Traitement selon le type de callback
      if (callbackType === 'complete' && tracks && tracks.length > 0) {
        // 🎵 GÉNÉRATION TERMINÉE - Mettre à jour la BDD immédiatement
        for (const track of tracks) {
          console.log(`✅ Track finalisé: ${track.id} - ${track.audio_url}`);
          
          try {
            // D'abord essayer de mettre à jour avec le task_id original
            const { data: existingTrack, error: findError } = await supabase
              .from('generated_music_tracks')
              .select('*')
              .eq('task_id', task_id)
              .single();

            if (existingTrack) {
              // Mettre à jour le track existant avec les vraies données
              const { error: updateError } = await supabase
                .from('generated_music_tracks')
                .update({
                  suno_track_id: track.id, // Vrai ID du track
                  audio_url: track.audio_url || track.source_audio_url,
                  stream_url: track.stream_audio_url || track.source_stream_audio_url,
                  image_url: track.image_url || track.source_image_url,
                  generation_status: 'completed',
                  metadata: {
                    ...(typeof existingTrack.metadata === 'object' && existingTrack.metadata !== null ? existingTrack.metadata : {}),
                    duration: track.duration,
                    model_name: track.model_name,
                    tags: track.tags,
                    prompt: track.prompt,
                    created_at: new Date(track.createTime).toISOString(),
                    suno_complete_data: track,
                    real_track_id: track.id,
                    original_task_id: task_id
                  },
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingTrack.id);
                
              if (updateError) {
                console.error('❌ Erreur mise à jour BDD:', updateError);
              } else {
                console.log(`💾 Track ${track.id} mis à jour avec succès en BDD`);
              }
            } else {
              // Si pas trouvé par task_id, créer un nouveau record
              console.log('⚠️ Aucun track trouvé avec task_id, création d\'un nouveau record');
              
              const { error: insertError } = await supabase
                .from('generated_music_tracks')
                .insert({
                  task_id: task_id,
                  suno_track_id: track.id,
                  title: track.title || 'Musique générée',
                  audio_url: track.audio_url || track.source_audio_url,
                  stream_url: track.stream_audio_url || track.source_stream_audio_url,
                  image_url: track.image_url || track.source_image_url,
                  generation_status: 'completed',
                  metadata: {
                    duration: track.duration,
                    model_name: track.model_name,
                    tags: track.tags,
                    prompt: track.prompt,
                    created_at: new Date(track.createTime).toISOString(),
                    suno_complete_data: track,
                    real_track_id: track.id,
                    original_task_id: task_id,
                    created_via_callback: true
                  }
                });
                
              if (insertError) {
                console.error('❌ Erreur insertion callback:', insertError);
              } else {
                console.log(`💾 Nouveau track ${track.id} créé via callback`);
              }
            }
          } catch (dbError) {
            console.error('❌ Erreur BDD complète:', dbError);
          }
        }
        
      } else if (callbackType === 'text' && tracks && tracks.length > 0) {
        // 📝 TEXTE GÉNÉRÉ - Mettre à jour le statut intermédiaire
        console.log('📝 Phase texte terminée, audio en cours de génération...');
        
        for (const track of tracks) {
          try {
            const { error: updateError } = await supabase
              .from('generated_music_tracks')
              .update({
                generation_status: 'text_complete',
                metadata: {
                  model_name: track.model_name,
                  tags: track.tags,
                  prompt: track.prompt,
                  image_url: track.image_url,
                  progress: 75,
                  text_phase_complete: true
                },
                updated_at: new Date().toISOString()
              })
              .eq('task_id', task_id);
              
            if (updateError) {
              console.error('❌ Erreur mise à jour statut texte:', updateError);
            } else {
              console.log(`📝 Statut texte mis à jour pour track ${track.id}`);
            }
          } catch (dbError) {
            console.error('❌ Erreur mise à jour statut texte:', dbError);
          }
        }
      }
      
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

    return new Response(JSON.stringify({ received: true }), {
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
