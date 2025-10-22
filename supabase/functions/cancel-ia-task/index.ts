import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REFUND_AMOUNTS = {
  'music': 10,      // Coût génération musique
  'qcm': 5,         // Coût génération QCM
  'content': 15     // Coût génération contenu IA
};

serve(async (req) => {
  console.log('❌ Cancel IA Task called:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authentification utilisateur
    const authHeader = req.headers.get('Authorization')!;
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

    let canCancel = false;
    let taskData = null;
    
    // Vérifier si la tâche peut être annulée selon le type
    switch (task_type) {
      case 'music':
        // Vérifier dans la table des chansons
        const { data: songData } = await supabase
          .from('med_mng_songs')
          .select('*')
          .or(`id.eq.${task_id},suno_audio_id.eq.${task_id}`)
          .single();
          
        if (songData) {
          taskData = songData;
          // Musique peut être annulée si pas encore dans la bibliothèque
          const { data: libraryEntry } = await supabase
            .from('med_mng_user_songs')
            .select('id')
            .eq('user_id', user.id)
            .eq('song_id', songData.id)
            .single();
            
          canCancel = !libraryEntry; // Peut annuler si pas encore ajouté à la bibliothèque
        }
        break;

      case 'qcm':
        // Vérifier dans les sessions QCM
        const { data: qcmData } = await supabase
          .from('med_mng_qcm_sessions')
          .select('*')
          .eq('id', task_id)
          .eq('user_id', user.id)
          .single();
          
        if (qcmData) {
          taskData = qcmData;
          canCancel = !qcmData.completed_at; // Peut annuler si pas terminé
        }
        break;

      case 'content':
        // Vérifier dans les contenus IA
        const { data: contentData } = await supabase
          .from('med_mng_content_ai')
          .select('*')
          .eq('id', task_id)
          .single();
          
        if (contentData) {
          taskData = contentData;
          canCancel = contentData.generation_status === 'generating'; // Peut annuler si en cours
        }
        break;
    }

    if (!taskData) {
      return new Response(JSON.stringify({ error: 'Tâche non trouvée' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!canCancel) {
      return new Response(JSON.stringify({ 
        error: 'Tâche ne peut pas être annulée',
        reason: 'Tâche déjà terminée ou intégrée'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Effectuer l'annulation selon le type
    let cancelled = false;
    
    switch (task_type) {
      case 'music':
        // Supprimer la chanson si pas encore dans une bibliothèque
        const { error: deleteError } = await supabase
          .from('med_mng_songs')
          .delete()
          .eq('id', taskData.id);
        cancelled = !deleteError;
        break;

      case 'qcm':
        // Marquer la session comme annulée
        const { error: cancelError } = await supabase
          .from('med_mng_qcm_sessions')
          .delete()
          .eq('id', task_id)
          .eq('user_id', user.id);
        cancelled = !cancelError;
        break;

      case 'content':
        // Marquer le contenu comme failed/cancelled
        const { error: contentError } = await supabase
          .from('med_mng_content_ai')
          .update({ 
            generation_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', task_id);
        cancelled = !contentError;
        break;
    }

    if (!cancelled) {
      console.error('❌ Erreur lors de l\'annulation');
      return new Response(JSON.stringify({ error: 'Erreur lors de l\'annulation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rembourser les crédits
    const refundAmount = REFUND_AMOUNTS[task_type];
    const { data: refundResult, error: refundError } = await supabase.rpc('med_mng_refund_credits', {
      p_user_id: user.id,
      p_credits: refundAmount
    });

    if (refundError) {
      console.error('❌ Erreur remboursement:', refundError);
      // L'annulation est déjà faite, on log juste l'erreur
    }

    // Enregistrer l'annulation
    const { data: cancellation, error: logError } = await supabase
      .from('med_mng_cancellations')
      .insert({
        user_id: user.id,
        task_id: task_id,
        task_type: task_type,
        reason: reason,
        credits_refunded: refundError ? 0 : refundAmount
      })
      .select()
      .single();

    // Logger l'annulation
    await supabase.rpc('log_ia_usage', {
      p_user_id: user.id,
      p_service: `${task_type}_cancellation`,
      p_credits_used: -refundAmount, // Négatif pour indiquer un remboursement
      p_item_id: null,
      p_metadata: {
        task_id: task_id,
        task_type: task_type,
        reason: reason,
        cancelled_at: new Date().toISOString()
      }
    });

    console.log(`✅ Tâche ${task_type} annulée avec succès: ${task_id}, crédits remboursés: ${refundAmount}`);

    return new Response(JSON.stringify({
      success: true,
      task_id: task_id,
      task_type: task_type,
      credits_refunded: refundError ? 0 : refundAmount,
      cancellation_id: cancellation?.id,
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