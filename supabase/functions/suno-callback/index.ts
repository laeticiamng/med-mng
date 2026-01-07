
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { checkIdempotency, markCompleted, markFailed } from '../_shared/idempotency.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let callbackData: any;
  let operationKey: string;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    callbackData = await req.json();
    console.log('🔔 Callback Suno reçu:', JSON.stringify(callbackData, null, 2));

    // Vérification d'idempotence (évite les doublons)
    const taskId = callbackData.data?.task_id || callbackData.task_id;
    const callbackType = callbackData.data?.callbackType || 'unknown';
    operationKey = `suno_callback_${taskId}_${callbackType}_${Date.now()}`;
    
    const { canProceed, existingResult } = await checkIdempotency(
      supabase,
      operationKey,
      undefined,
      300 // TTL 5 minutes
    );

    if (!canProceed) {
      console.log('⏭️ Callback déjà traité, skip pour éviter doublons');
      return new Response(JSON.stringify({ 
        received: true, 
        skipped: true, 
        reason: 'already_processed' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Traiter les vrais callbacks Suno selon la structure des logs
    if (callbackData.code === 200 && callbackData.data) {
      const { callbackType, data: tracks, task_id } = callbackData.data;
      
      console.log(`📋 Type callback: ${callbackType}, TaskID: ${task_id}, Tracks: ${tracks?.length || 0}`);
      
      // Traitement selon le type de callback
      if ((callbackType === 'text' || callbackType === 'complete' || callbackType === 'first') && tracks && tracks.length > 0) {
        // 🎵 GÉNÉRATION EN COURS - Mettre à jour le track principal d'abord
        
        // 1️⃣ Trouver le track principal (celui avec task_id === suno_track_id OU juste task_id)
        const { data: mainTracks } = await supabase
          .from('generated_music_tracks')
          .select('*')
          .eq('task_id', task_id)
          .order('created_at', { ascending: true }); // Le premier créé est le principal

        const mainTrack = mainTracks?.[0]; // Le premier créé est le track principal

        // Trouver le premier track avec audio disponible
        const trackWithAudio = tracks.find(t => 
          (t.audio_url && t.audio_url !== '') || 
          (t.source_audio_url && t.source_audio_url !== '')
        );
        
        if (mainTrack) {
          console.log(`🎯 Track principal trouvé: ${mainTrack.id}`);
          
          // Construire l'update du track principal
          const updateData: any = {
            generation_status: callbackType === 'complete' ? 'completed' : 'generating',
            updated_at: new Date().toISOString()
          };

          // Si on a un track avec audio, mettre à jour le track principal
          if (trackWithAudio) {
            console.log(`🎵 Mise à jour avec audio de ${trackWithAudio.id}`);
            
            updateData.audio_url = trackWithAudio.audio_url || trackWithAudio.source_audio_url;
            updateData.stream_url = trackWithAudio.stream_audio_url || trackWithAudio.source_stream_audio_url;
            updateData.image_url = trackWithAudio.image_url || trackWithAudio.source_image_url;
            updateData.duration = trackWithAudio.duration;
            updateData.generation_status = 'completed'; // Marquer comme complété
            updateData.metadata = {
              ...(typeof mainTrack.metadata === 'object' && mainTrack.metadata !== null ? mainTrack.metadata : {}),
              duration: trackWithAudio.duration,
              model_name: trackWithAudio.model_name,
              tags: trackWithAudio.tags,
              first_audio_received_at: new Date().toISOString(),
              callback_type: callbackType,
              suno_track_id: trackWithAudio.id
            };

            // 🎵 NOUVEAU: Sauvegarder aussi dans med_mng_songs pour la bibliothèque
            if (callbackType === 'complete' || callbackType === 'first') {
              try {
                // Vérifier si la chanson existe déjà
                const { data: existingSong } = await supabase
                  .from('med_mng_songs')
                  .select('id')
                  .eq('suno_audio_id', trackWithAudio.id)
                  .maybeSingle();

                if (!existingSong) {
                  // Créer la chanson dans med_mng_songs avec préservation des métadonnées originales
                  const { data: newSong, error: songError } = await supabase
                    .from('med_mng_songs')
                    .insert({
                      title: trackWithAudio.title || mainTrack.title || 'Musique générée',
                      suno_audio_id: trackWithAudio.id,
                      meta: {
                        // ✅ Préserver les métadonnées originales du mainTrack (itemCode, rang, etc.)
                        ...(typeof mainTrack.metadata === 'object' && mainTrack.metadata !== null ? mainTrack.metadata : {}),
                        // Puis ajouter/écraser avec les nouvelles infos audio
                        audio_url: trackWithAudio.audio_url || trackWithAudio.source_audio_url,
                        stream_url: trackWithAudio.stream_audio_url || trackWithAudio.source_stream_audio_url,
                        image_url: trackWithAudio.image_url || trackWithAudio.source_image_url,
                        duration: trackWithAudio.duration,
                        model_name: trackWithAudio.model_name,
                        tags: trackWithAudio.tags,
                        task_id: task_id,
                        generated_at: new Date().toISOString()
                      }
                    })
                    .select()
                    .single();

                  if (songError) {
                    console.error('❌ Erreur création med_mng_songs:', songError);
                  } else if (newSong && mainTrack.user_id) {
                    console.log('✅ Chanson créée dans med_mng_songs:', newSong.id);
                    
                    // Ajouter automatiquement à la bibliothèque de l'utilisateur
                    const { error: libraryError } = await supabase
                      .from('med_mng_user_songs')
                      .insert({
                        user_id: mainTrack.user_id,
                        song_id: newSong.id
                      })
                      .select();

                    if (libraryError && libraryError.code !== '23505') { // Ignorer duplicate key
                      console.error('❌ Erreur ajout bibliothèque:', libraryError);
                    } else {
                      console.log('✅ Chanson ajoutée à la bibliothèque utilisateur');
                    }
                  }
                }
              } catch (songCreationError) {
                console.error('❌ Erreur création chanson MED MNG:', songCreationError);
              }
            }
          }

          const { error: updateError } = await supabase
            .from('generated_music_tracks')
            .update(updateData)
            .eq('id', mainTrack.id);
            
          if (updateError) {
            console.error('❌ Erreur mise à jour track principal:', updateError);
            await markFailed(supabase, operationKey, updateError);
          } else {
            console.log('✅ Track principal mis à jour avec succès');
            await markCompleted(supabase, operationKey, { track_id: mainTrack.id, status: 'updated', audio_url: updateData.audio_url });
          }
        } else {
          console.warn('⚠️ Aucun track principal trouvé pour task_id:', task_id);
        }
        
        // 2️⃣ Créer ou mettre à jour les tracks individuels Suno (non-bloquant)
        // Seulement si on veut garder la trace de chaque track individuel
        for (const track of tracks) {
          try {
            const { data: existingTrack } = await supabase
              .from('generated_music_tracks')
              .select('*')
              .eq('suno_track_id', track.id)
              .maybeSingle();

            if (existingTrack && existingTrack.suno_track_id !== existingTrack.task_id) {
              // Ne mettre à jour que les tracks individuels (pas le principal)
              const updateData: any = {
                generation_status: callbackType === 'complete' ? 'completed' : 'generating',
                updated_at: new Date().toISOString()
              };

              // Ajouter les URLs seulement si disponibles
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
              if (track.duration) {
                updateData.duration = track.duration;
              }

              await supabase
                .from('generated_music_tracks')
                .update(updateData)
                .eq('id', existingTrack.id);
                
              console.log(`📝 Track individuel ${track.id} mis à jour`);
            } else if (!existingTrack) {
              // Créer un nouveau record pour ce track individuel
              // IMPORTANT: Préserver le user_id du track principal pour que l'utilisateur voie ses musiques
              const insertData: any = {
                task_id: task_id,
                suno_track_id: track.id,
                title: track.title || 'Musique générée',
                generation_status: callbackType === 'complete' ? 'completed' : 'generating',
                duration: track.duration || 240,
                user_id: mainTrack?.user_id || null, // ✅ Hériter du track principal
                metadata: {
                  ...(typeof mainTrack?.metadata === 'object' && mainTrack?.metadata !== null ? mainTrack.metadata : {}),
                  model_name: track.model_name,
                  tags: track.tags,
                  prompt: track.prompt,
                  created_at: track.createTime,
                  callback_type: callbackType
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

              await supabase
                .from('generated_music_tracks')
                .insert(insertData);
                
              console.log(`💾 Track individuel ${track.id} créé`);
            }
          } catch (error) {
            console.error(`❌ Erreur traitement track individuel ${track.id}:`, error);
          }
        }
      }
      
    } else if (callbackData.status === 'FAILED' || callbackData.code !== 200) {
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
          
        await markFailed(supabase, operationKey, callbackData.error);
      }
    }

    return new Response(JSON.stringify({ received: true, processed: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur callback Suno:', error);
    
    // Marquer comme échoué si on a l'operation key
    if (operationKey) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        await markFailed(supabase, operationKey, error);
      } catch (markError) {
        console.error('Failed to mark as failed:', markError);
      }
    }
    
    return new Response(JSON.stringify({ error: error.message, received: true }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
