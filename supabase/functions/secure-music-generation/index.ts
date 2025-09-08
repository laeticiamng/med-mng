import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MusicGenerationRequest {
  lyrics: string[];
  style: string;
  duration: number;
  rang: 'A' | 'B' | 'AB';
  itemCode?: string;
  title?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const requestBody: MusicGenerationRequest = await req.json();
    const { lyrics, style, duration, rang, itemCode, title } = requestBody;

    // Validate request
    if (!lyrics || !style || !duration || !rang) {
      throw new Error('Missing required fields: lyrics, style, duration, rang');
    }

    // Check user quota
    const { data: quotaCheck } = await supabase.rpc('check_music_generation_quota', {
      user_uuid: user.id
    });

    if (!quotaCheck?.can_generate) {
      throw new Error('Music generation quota exceeded');
    }

    // Get API keys
    const sunoApiKey = Deno.env.get('SUNO_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!sunoApiKey || !openaiApiKey) {
      throw new Error('API keys not configured');
    }

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from('med_mng_music_generations')
      .insert({
        user_id: user.id,
        item_code: itemCode || null,
        title: title || `Musique ${rang}`,
        lyrics: lyrics,
        style: style,
        duration: duration,
        rang: rang,
        status: 'generating',
        metadata: {
          request_timestamp: new Date().toISOString(),
          user_agent: req.headers.get('user-agent')
        }
      })
      .select()
      .single();

    if (insertError || !generation) {
      throw new Error('Failed to create generation record');
    }

    // Enhanced lyrics with OpenAI
    const lyricsPrompt = `Améliore ces paroles médicales pour l'item ${itemCode || 'médical'} en style ${style}. 
    Garde le contenu médical précis et ajoute de la musicalité:
    ${lyrics.join('\n')}
    
    Retourne uniquement les paroles améliorées, pas d'explication.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un expert en paroles médicales musicales.' },
          { role: 'user', content: lyricsPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    let enhancedLyrics = lyrics.join('\n');
    if (openaiResponse.ok) {
      const aiData = await openaiResponse.json();
      enhancedLyrics = aiData.choices[0]?.message?.content || enhancedLyrics;
    }

    // Generate music with Suno
    const sunoResponse = await fetch('https://studio-api.suno.ai/api/external/generate/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sunoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedLyrics,
        tags: style,
        title: title || `EDN ${itemCode} - ${rang}`,
        make_instrumental: false,
        wait_audio: true
      }),
    });

    if (!sunoResponse.ok) {
      throw new Error(`Suno API error: ${sunoResponse.status}`);
    }

    const sunoData = await sunoResponse.json();
    const audioUrl = sunoData[0]?.audio_url;
    const imageUrl = sunoData[0]?.image_url;
    const trackId = sunoData[0]?.id;

    if (!audioUrl) {
      throw new Error('No audio generated');
    }

    // Update generation record with results
    await supabase
      .from('med_mng_music_generations')
      .update({
        status: 'completed',
        audio_url: audioUrl,
        image_url: imageUrl,
        suno_track_id: trackId,
        enhanced_lyrics: enhancedLyrics,
        completed_at: new Date().toISOString(),
        metadata: {
          ...generation.metadata,
          completion_timestamp: new Date().toISOString(),
          suno_response: {
            id: trackId,
            audio_url: audioUrl,
            image_url: imageUrl
          }
        }
      })
      .eq('id', generation.id);

    // Increment user quota usage
    await supabase.rpc('increment_rate_limit_counter', {
      p_identifier: user.id,
      p_window_duration_seconds: 3600, // 1 hour
      p_max_requests: quotaCheck.quota_limit
    });

    console.log(`Music generated successfully for user ${user.id}, item ${itemCode}`);

    return new Response(JSON.stringify({
      success: true,
      generationId: generation.id,
      audioUrl: audioUrl,
      imageUrl: imageUrl,
      trackId: trackId,
      enhancedLyrics: enhancedLyrics,
      message: 'Musique générée avec succès'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in secure-music-generation:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Une erreur est survenue lors de la génération'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});