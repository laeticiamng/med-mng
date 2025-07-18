import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Ajouter plus de logs et validation
  try {
    const { prompt, style, duration, title } = await req.json();
    
    // Validation
    if (!prompt || prompt.length < 10) {
      throw new Error('Prompt trop court (minimum 10 caractères)');
    }
    
    console.log('🎵 Démarrage génération:', { prompt, style, duration });
    
    // Appel Suno avec gestion d'erreur
    const sunoResponse = await fetch('https://api.suno.ai/v1/songs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUNO_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        style,
        duration,
        title,
        tags: `medical,learning,${style}`,
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-music-callback`,
        wait_audio: false // Important: ne pas attendre
      })
    });

    if (!sunoResponse.ok) {
      const errorText = await sunoResponse.text();
      console.error('❌ Erreur Suno API:', sunoResponse.status, errorText);
      throw new Error(`Erreur Suno: ${sunoResponse.status}`);
    }

    const sunoData = await sunoResponse.json();
    console.log('✅ Réponse Suno:', sunoData);

    // Sauvegarder en BDD
    const { data: song, error } = await supabaseClient
      .from('songs')
      .insert({
        suno_id: sunoData.id,
        title: title,
        prompt: prompt,
        style: style,
        duration: duration,
        status: sunoData.status || 'generating',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      songId: song.id,
      sunoId: sunoData.id,
      status: sunoData.status
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('💥 Erreur génération:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
