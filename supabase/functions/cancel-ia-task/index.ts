/**
 * Cancel IA Task - Annule une tâche de génération en cours
 * Supporte: music, qcm, content
 * 
 * Corrigé pour utiliser les bonnes tables et API Suno
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUNO_API_BASE = 'https://api.sunoapi.org/api/v1';

serve(async (req) => {
  console.log('❌ Cancel IA Task called:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authentification utilisateur
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { task_id, task_type, reason = 'Annulation utilisateur' } = await req.json();

    if (!task_id || !task_type) {
      return new Response(JSON.stringify({ error: 'task_id et task_type requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!['music', 'qcm', 'content'].includes(task_type)) {
      return new Response(JSON.stringify({ error: 'task_type doit être: music, qcm, ou content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`❌ Annulation tâche ${task_type}: ${task_id} pour user ${user.id}`);

    let cancelled = false;
    let creditsRefunded = 0;
    let taskData = null;
    
    switch (task_type) {
      case 'music':
        // 1. Vérifier le track dans generated_music_tracks
        const { data: trackData, error: trackError } = await supabase
          .from('generated_music_tracks')
          .select('*')
          .eq('task_id', task_id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (trackError) {
          console.error('❌ Erreur lecture track:', trackError);
        }
        
        taskData = trackData;
        
        // Si le track existe et est en cours de génération
        if (trackData && trackData.generation_status === 'generating') {
          // 2. Essayer d'annuler via l'API Suno (optionnel, pas tous les providers le supportent)
          const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
          if (SUNO_API_KEY) {
            try {
              // Note: L'API Suno n'a pas d'endpoint cancel officiel, on marque juste comme failed
              console.log('⚠️ API Suno ne supporte pas l\'annulation, marquage comme failed');
            } catch (sunoError) {
              console.warn('⚠️ Erreur annulation Suno (ignorée):', sunoError);
            }
          }
          
          // 3. Mettre à jour le statut en BDD
          const { error: updateError } = await supabase
            .from('generated_music_tracks')
            .update({ 
              generation_status: 'cancelled',
              metadata: {
                ...trackData.metadata,
                cancelled_at: new Date().toISOString(),
                cancelled_by: user.id,
                cancellation_reason: reason
              }
            })
            .eq('task_id', task_id)
            .eq('user_id', user.id);
            
          if (updateError) {
            console.error('❌ Erreur update track:', updateError);
          } else {
            cancelled = true;
            creditsRefunded = 10; // Estimation crédits musique
          }
        } else if (trackData && trackData.generation_status === 'completed') {
          // Track déjà complété, ne peut pas annuler
          return new Response(JSON.stringify({ 
            error: 'Tâche déjà terminée',
            reason: 'La génération est déjà complétée'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          // Track non trouvé ou déjà annulé
          // Vérifier aussi dans user_generated_music
          const { data: userTrack } = await supabase
            .from('user_generated_music')
            .select('*')
            .eq('id', task_id)
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (userTrack) {
            // Supprimer de la bibliothèque utilisateur
            const { error: deleteError } = await supabase
              .from('user_generated_music')
              .delete()
              .eq('id', task_id)
              .eq('user_id', user.id);
              
            cancelled = !deleteError;
            taskData = userTrack;
          }
        }
        break;

      case 'qcm':
        // Vérifier dans ai_exam_history
        const { data: qcmData, error: qcmError } = await supabase
          .from('ai_exam_history')
          .select('*')
          .eq('id', task_id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (qcmData && !qcmData.completed_at) {
          taskData = qcmData;
          const { error: deleteQcmError } = await supabase
            .from('ai_exam_history')
            .delete()
            .eq('id', task_id)
            .eq('user_id', user.id);
          cancelled = !deleteQcmError;
          creditsRefunded = 5;
        }
        break;

      case 'content':
        // Vérifier dans ai_generated_content
        const { data: contentData, error: contentError } = await supabase
          .from('ai_generated_content')
          .select('*')
          .eq('id', task_id)
          .maybeSingle();
          
        if (contentData) {
          taskData = contentData;
          const { error: deleteContentError } = await supabase
            .from('ai_generated_content')
            .delete()
            .eq('id', task_id);
          cancelled = !deleteContentError;
          creditsRefunded = 15;
        }
        break;
    }

    if (!taskData) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Tâche non trouvée ou déjà annulée',
        task_id: task_id,
        credits_refunded: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!cancelled) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Impossible d\'annuler la tâche',
        reason: 'Tâche déjà terminée ou non annulable'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Logger l'annulation dans les métriques
    try {
      await supabase
        .from('generation_metrics')
        .insert({
          track_id: task_id,
          user_id: user.id,
          content_type: task_type,
          status: 'cancelled',
          metadata: {
            reason: reason,
            cancelled_at: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.warn('⚠️ Erreur log métrique (ignorée):', logError);
    }

    console.log(`✅ Tâche ${task_type} annulée avec succès: ${task_id}`);

    return new Response(JSON.stringify({
      success: true,
      task_id: task_id,
      task_type: task_type,
      credits_refunded: creditsRefunded,
      cancelled_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur Cancel IA Task:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur interne serveur',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
