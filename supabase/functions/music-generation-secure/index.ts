import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GENERATION_COSTS = {
  'rang_a': 3,
  'rang_b': 5,
  'mix': 7
} as const;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎵 GÉNÉRATION MUSICALE SÉCURISÉE - Début');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Authentification obligatoire
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { 
      item_code, 
      type, // 'rang_a', 'rang_b', 'mix'
      paroles, 
      style = 'educational, medical',
      add_to_playlist_id = null,
      duration = 180 
    } = await req.json();

    // Validation des paramètres
    if (!item_code || !type || !paroles || paroles.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters',
        required: ['item_code', 'type', 'paroles'] 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const creditsRequired = GENERATION_COSTS[type as keyof typeof GENERATION_COSTS] || 5;

    // Vérifier et consommer le quota
    const { data: quotaResult, error: quotaError } = await supabase.rpc('med_mng_decrement_quota', {
      credits_to_use: creditsRequired
    });

    if (quotaError || !quotaResult?.success) {
      console.error('Quota check failed:', quotaError || quotaResult);
      
      return new Response(JSON.stringify({
        error: 'Insufficient credits',
        details: quotaResult?.error || 'Please upgrade your plan or wait for monthly reset',
        credits_required: creditsRequired,
        credits_remaining: quotaResult?.remaining_credits || 0
      }), {
        status: 402, // Payment Required
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Quota validé: ${creditsRequired} crédits consommés`);

    // Préparer le prompt optimisé pour Suno
    const title = `${item_code} ${type.toUpperCase()} - Formation Médicale`;
    const prompt = formatMedicalPrompt(paroles, type, item_code);

    console.log('🎵 Génération avec:', { item_code, type, creditsRequired, title });

    // Configuration Suno sécurisée
    const sunoPayload = {
      prompt: prompt,
      make_instrumental: false,
      wait_audio: false,
      model: 'chirp-v3-0',
      tags: `${style}, medical education, ${type}`,
      title: title
    };

    // Appel API Suno avec gestion d'erreur
    const sunoApiKey = Deno.env.get('SUNO_API_KEY');
    if (!sunoApiKey) {
      throw new Error('Suno API key not configured');
    }

    const sunoResponse = await fetch('https://api.suno.ai/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sunoApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sunoPayload)
    });

    if (!sunoResponse.ok) {
      const errorText = await sunoResponse.text();
      console.error(`Suno API Error: ${sunoResponse.status} - ${errorText}`);
      
      // Rollback du quota en cas d'erreur Suno
      await supabase.rpc('med_mng_increment_quota', {
        credits_to_add: creditsRequired
      });

      throw new Error(`Suno generation failed: ${sunoResponse.status}`);
    }

    const sunoData = await sunoResponse.json();
    console.log('🎵 Suno response:', { id: sunoData.id, status: sunoData.status });

    // Créer l'entrée en base immédiatement
    const { data: newSong, error: songError } = await supabase
      .from('med_mng_songs')
      .insert({
        title: title,
        suno_audio_id: sunoData.id,
        meta: {
          item_code,
          type,
          generation_status: sunoData.status,
          paroles: paroles,
          style: style,
          duration: duration,
          credits_used: creditsRequired,
          generated_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (songError) {
      console.error('Failed to create song record:', songError);
      throw new Error('Failed to save song to database');
    }

    // Ajouter automatiquement à la bibliothèque utilisateur
    const { error: libraryError } = await supabase
      .from('med_mng_user_songs')
      .insert({
        user_id: user.id,
        song_id: newSong.id
      });

    if (libraryError) {
      console.warn('Failed to add to user library:', libraryError);
    }

    // Ajouter à une playlist si spécifiée
    if (add_to_playlist_id) {
      const { error: playlistError } = await supabase
        .from('med_mng_playlist_songs')
        .insert({
          playlist_id: add_to_playlist_id,
          song_id: newSong.id,
          added_by: user.id
        });

      if (playlistError) {
        console.warn('Failed to add to playlist:', playlistError);
      }
    }

    // Logger la génération
    await supabase.rpc('log_ia_usage', {
      p_service_type: 'suno',
      p_operation_type: 'music_generation',
      p_credits_used: creditsRequired,
      p_request_details: {
        item_code,
        type,
        suno_id: sunoData.id,
        song_id: newSong.id
      },
      p_response_status: 'success'
    });

    console.log('✅ Génération musicale terminée:', newSong.id);

    return new Response(JSON.stringify({
      success: true,
      song_id: newSong.id,
      suno_id: sunoData.id,
      title: title,
      status: sunoData.status,
      credits_used: creditsRequired,
      estimated_completion: new Date(Date.now() + 45000).toISOString(), // ~45s
      message: 'Music generation started successfully',
      added_to_library: true,
      added_to_playlist: !!add_to_playlist_id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur génération musicale sécurisée:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Music generation failed',
      details: 'Please try again or contact support if the problem persists'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function formatMedicalPrompt(paroles: string[], type: string, itemCode: string): string {
  const typeLabels = {
    'rang_a': 'Connaissances fondamentales',
    'rang_b': 'Expertise clinique',
    'mix': 'Formation complète'
  };

  const typeLabel = typeLabels[type as keyof typeof typeLabels] || 'Formation médicale';

  return `[Verse 1]
${paroles.slice(0, 4).join('\n')}

[Chorus]
${itemCode} - ${typeLabel}
Excellence médicale en formation
Compétences cliniques à maîtriser

[Verse 2]
${paroles.slice(4, 8).join('\n')}

[Bridge]
Formation médicale de qualité
Savoir-faire professionnel confirmé

[Outro]
${itemCode} acquis avec succès
Prêt pour la pratique clinique`;
}