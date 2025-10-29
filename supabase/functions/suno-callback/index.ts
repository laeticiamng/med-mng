
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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
      if ((callbackType === 'text' || callbackType === 'complete' || callbackType === 'first') && tracks && tracks.length > 0) {
        // 🎵 GÉNÉRATION EN COURS - Mettre à jour le track principal d'abord
        
        // 1️⃣ Trouver et mettre à jour le track principal (celui avec task_id)
        const { data: mainTrack } = await supabase
          .from('generated_music_tracks')
          .select('*')
          .eq('task_id', task_id)
          .is('suno_track_id', task_id) // Le track principal a task_id === suno_track_id
          .maybeSingle();

        // Trouver le premier track avec audio disponible
        const trackWithAudio = tracks.find(t => t.audio_url || t.source_audio_url);
        
        if (mainTrack && trackWithAudio) {
          console.log(`🎯 Mise à jour track principal avec audio de ${trackWithAudio.id}`);
          
          const updateData: any = {
            audio_url: trackWithAudio.audio_url || trackWithAudio.source_audio_url,
            stream_url: trackWithAudio.stream_audio_url || trackWithAudio.source_stream_audio_url,
            image_url: trackWithAudio.image_url || trackWithAudio.source_image_url,
            duration: trackWithAudio.duration,
            generation_status: (trackWithAudio.audio_url || trackWithAudio.source_audio_url) ? 'completed' : 'generating',
            metadata: {
              ...(typeof mainTrack.metadata === 'object' && mainTrack.metadata !== null ? mainTrack.metadata : {}),
              duration: trackWithAudio.duration,
              model_name: trackWithAudio.model_name,
              tags: trackWithAudio.tags,
              first_audio_received_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          };

          await supabase
            .from('generated_music_tracks')
            .update(updateData)
            .eq('id', mainTrack.id);
            
          console.log('✅ Track principal mis à jour avec audio disponible');
        }
        
        // 2️⃣ Créer ou mettre à jour les tracks individuels Suno
        for (const track of tracks) {
          console.log(`🎵 Processing track: ${track.id} - Type: ${callbackType}`);
          
          try {
            // D'abord essayer de trouver un track existant par suno_track_id
            const { data: existingTrack, error: findError } = await supabase
              .from('generated_music_tracks')
              .select('*')
              .eq('suno_track_id', track.id)
              .maybeSingle();

            if (existingTrack) {
              // Mettre à jour le track existant
              const updateData: any = {
                generation_status: callbackType === 'complete' ? 'completed' : 'generating',
                metadata: {
                  ...(typeof existingTrack.metadata === 'object' && existingTrack.metadata !== null ? existingTrack.metadata : {}),
                  duration: track.duration,
                  model_name: track.model_name,
                  tags: track.tags,
                  prompt: track.prompt,
                  created_at: new Date(track.createTime).toISOString(),
                  suno_complete_data: track,
                  real_track_id: track.id,
                  original_task_id: task_id,
                  rang: track.title?.includes('Rang B') ? 'B' : 'A'
                },
                updated_at: new Date().toISOString()
              };

              // Ajouter les URLs seulement si disponibles (callbackType === 'complete')
              if (track.audio_url || track.source_audio_url) {
                updateData.audio_url = track.audio_url || track.source_audio_url;
                updateData.generation_status = 'completed';
              }
              if (track.stream_audio_url || track.source_stream_audio_url) {
                updateData.stream_url = track.stream_audio_url || track.source_stream_audio_url;
              }
              if (track.image_url || track.source_image_url) {
                updateData.image_url = track.image_url || track.source_image_url;
              }

              const { error: updateError } = await supabase
                .from('generated_music_tracks')
                .update(updateData)
                .eq('id', existingTrack.id);
                
              if (updateError) {
                console.error('❌ Erreur mise à jour BDD:', updateError);
              } else {
                console.log(`📝 Statut ${callbackType} mis à jour pour track ${track.id}`);
              }
            } else {
              // Créer un nouveau record avec user_id par défaut
              console.log('💾 Création nouveau track en BDD');
              
              const insertData: any = {
                task_id: task_id,
                suno_track_id: track.id,
                title: track.title || 'Musique générée',
                generation_status: callbackType === 'complete' ? 'completed' : 'generating',
                duration: 240,
                user_id: null, // Permettre les utilisateurs anonymes
                metadata: {
                  duration: track.duration,
                  model_name: track.model_name,
                  tags: track.tags,
                  prompt: track.prompt,
                  created_at: new Date(track.createTime).toISOString(),
                  suno_complete_data: track,
                  real_track_id: track.id,
                  original_task_id: task_id,
                  created_via_callback: true,
                  rang: track.title?.includes('Rang B') ? 'B' : 'A'
                }
              };

              // Ajouter les URLs seulement si disponibles
              if (track.audio_url || track.source_audio_url) {
                insertData.audio_url = track.audio_url || track.source_audio_url;
                insertData.generation_status = 'completed';
              }
              if (track.stream_audio_url || track.source_stream_audio_url) {
                insertData.stream_url = track.stream_audio_url || track.source_stream_audio_url;
              }
              if (track.image_url || track.source_image_url) {
                insertData.image_url = track.image_url || track.source_image_url;
              }

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
