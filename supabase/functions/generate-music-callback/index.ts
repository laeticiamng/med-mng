import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🎵 Callback reçu de Suno API');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse callback data
    const body = await req.json();
    console.log('📊 Données callback:', JSON.stringify(body, null, 2));

    const { id: sunoId, status, audio_url, video_url, title, tags, model_name } = body;

    if (!sunoId) {
      throw new Error('❌ ID Suno manquant dans le callback');
    }

    // Update song in database
    const { data: songData, error: updateError } = await supabaseClient
      .from('songs')
      .update({
        status: status,
        audio_url: audio_url || null,
        video_url: video_url || null,
        suno_title: title || null,
        suno_tags: tags || null,
        model_name: model_name || null,
        updated_at: new Date().toISOString(),
        callback_received_at: new Date().toISOString()
      })
      .eq('suno_id', sunoId)
      .select();

    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError);
      throw updateError;
    }

    if (!songData || songData.length === 0) {
      console.error('❌ Aucune chanson trouvée avec suno_id:', sunoId);
      throw new Error(`Chanson non trouvée: ${sunoId}`);
    }

    const song = songData[0];
    console.log('✅ Chanson mise à jour:', song.title, '- Status:', status);

    // If complete, send notification
    if (status === 'complete' && audio_url) {
      console.log('🎉 Génération terminée pour:', song.title);
      
      // Trigger real-time update
      await supabaseClient
        .from('songs')
        .update({ 
          last_notification_sent: new Date().toISOString() 
        })
        .eq('id', song.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Callback traité avec succès',
        songId: song.id,
        status: status
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Erreur callback:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

