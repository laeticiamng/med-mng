import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, model = 'tts-1', voice = 'alloy', response_format = 'mp3', speed = 1.0 } = await req.json();
    
    if (!input) {
      throw new Error('Text input is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('🎤 Generating speech with OpenAI TTS:', { model, voice, input: input.substring(0, 50) + '...' });

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input,
        voice,
        response_format,
        speed
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI TTS Error:', error);
      throw new Error(`OpenAI TTS failed: ${response.status} ${error}`);
    }

    // Convert audio to base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log('✅ Speech generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        audioContent: base64Audio,
        format: response_format,
        voice,
        model
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ OpenAI TTS Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Speech generation failed' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});