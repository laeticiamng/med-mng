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

    console.log('🔧 Correction des tracks avec stream_url mais status generating...');

    // Trouver tous les tracks avec stream_url mais status = generating
    const { data: tracksToFix, error: selectError } = await supabase
      .from('generated_music_tracks')
      .select('*')
      .eq('generation_status', 'generating')
      .not('stream_url', 'is', null);

    if (selectError) {
      console.error('❌ Erreur sélection tracks:', selectError);
      return new Response(JSON.stringify({ error: selectError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🔍 ${tracksToFix?.length || 0} tracks trouvés à corriger`);

    let fixedCount = 0;
    if (tracksToFix && tracksToFix.length > 0) {
      for (const track of tracksToFix) {
        console.log(`🔧 Correction track ${track.id} - task_id: ${track.task_id}`);
        
        const { error: updateError } = await supabase
          .from('generated_music_tracks')
          .update({
            generation_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', track.id);

        if (updateError) {
          console.error(`❌ Erreur mise à jour track ${track.id}:`, updateError);
        } else {
          console.log(`✅ Track ${track.id} corrigé avec succès`);
          fixedCount++;
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: `${fixedCount} tracks corrigés avec succès`,
      tracksFound: tracksToFix?.length || 0,
      tracksFixed: fixedCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur correction tracks:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});