import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer chansons en attente depuis plus de 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: pendingSongs, error } = await supabaseClient
      .from('songs')
      .select('*')
      .eq('status', 'generating')
      .lt('created_at', fiveMinutesAgo);

    if (error) throw error;

    console.log(`🔍 ${pendingSongs?.length || 0} chansons en attente trouvées`);

    let updatedCount = 0;

    // Vérifier chaque chanson via l'API Suno
    for (const song of pendingSongs || []) {
      try {
        console.log(`🔍 Vérification chanson: ${song.suno_id}`);
        
        const response = await fetch(`https://api.suno.ai/v1/songs/${song.suno_id}`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUNO_API_KEY')}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          console.error(`❌ Erreur API Suno pour ${song.suno_id}:`, response.status);
          continue;
        }

        const sunoData = await response.json();
        console.log(`📊 Status Suno pour ${song.suno_id}:`, sunoData.status);
        
        // Mettre à jour si le statut a changé
        if (sunoData.status !== song.status) {
          await supabaseClient
            .from('songs')
            .update({
              status: sunoData.status,
              audio_url: sunoData.audio_url || song.audio_url,
              video_url: sunoData.video_url || song.video_url,
              updated_at: new Date().toISOString(),
              manual_check_at: new Date().toISOString()
            })
            .eq('id', song.id);
          
          updatedCount++;
          console.log(`✅ Chanson ${song.id} mise à jour: ${sunoData.status}`);
        }
      } catch (err) {
        console.error(`💥 Erreur vérification ${song.id}:`, err);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      checked: pendingSongs?.length || 0,
      updated: updatedCount
    }));

  } catch (error) {
    console.error('💥 Erreur check pending:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
