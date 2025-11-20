import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface VoiceGenerationRequest {
  text: string;
  voiceId?: string;
  model?: string;
  userId?: string;
  settings?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

interface VoiceGenerationResponse {
  success: boolean;
  audioUrl?: string;
  audioBase64?: string;
  metadata?: {
    voiceId: string;
    model: string;
    duration: number;
    generatedAt: string;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ: Authentification JWT obligatoire
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès generate-voice sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour generate-voice');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ generate-voice autorisé pour user ${user.id}`);

    // Code original de la fonction
    
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      throw new Error('ELEVENLABS_API_KEY non configurée');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      text,
      voiceId = '9BWtsMINqrJLrRacOk9x', // Aria par défaut
      model = 'eleven_multilingual_v2',
      userId,
      settings = {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.0,
        useSpeakerBoost: true
      }
    }: VoiceGenerationRequest = await req.json();

    console.log('🎤 Génération de voix:', { text: text.substring(0, 50), voiceId, model });

    // Appel à l'API ElevenLabs
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.similarityBoost,
            style: settings.style,
            use_speaker_boost: settings.useSpeakerBoost,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      throw new Error(`Erreur ElevenLabs: ${elevenLabsResponse.status} - ${errorText}`);
    }

    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    
    // Estimation de la durée (approximative)
    const estimatedDuration = Math.ceil(text.length / 10); // ~10 caractères par seconde

    // Sauvegarder dans la base de données
    if (userId) {
      const { error } = await supabase.from('generated_voice_tracks').insert({
        user_id: userId,
        text,
        voice_id: voiceId,
        model,
        audio_base64: audioBase64,
        metadata: {
          duration: estimatedDuration,
          voice_settings: settings,
          character_count: text.length
        },
        generation_status: 'completed'
      });

      if (error) {
        console.error('Erreur sauvegarde voix:', error);
      }
    }

    const response: VoiceGenerationResponse = {
      success: true,
      audioBase64,
      metadata: {
        voiceId,
        model,
        duration: estimatedDuration,
        generatedAt: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur génération voix:', error);
    
    const errorResponse: VoiceGenerationResponse = {
      success: false,
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});