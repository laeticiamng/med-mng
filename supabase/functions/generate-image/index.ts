
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  mood?: string;
  size?: string;
  quality?: string;
  userId?: string;
}

interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  metadata?: {
    prompt: string;
    style: string;
    mood: string;
    size: string;
    generatedAt: string;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY non configurée');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      prompt,
      style = 'ambient',
      mood = 'serene',
      size = '1024x1024',
      quality = 'hd',
      userId
    }: ImageGenerationRequest = await req.json();

    console.log('🎨 Génération d\'image d\'ambiance:', { prompt: prompt.substring(0, 50), style, mood });

    // Construction du prompt enrichi pour images d'ambiance musicale
    const enhancedPrompt = `Beautiful ${style} ambient scene for meditation and relaxation. ${prompt}. ${mood} atmosphere, soft lighting, peaceful environment, calming colors, serene composition, high quality, detailed, atmospheric, perfect for background imagery during music listening sessions.`;

    // Appel à l'API OpenAI DALL-E
    const openAIResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: quality,
        response_format: 'b64_json'
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      throw new Error(`Erreur OpenAI: ${openAIResponse.status} - ${errorText}`);
    }

    const openAIResult = await openAIResponse.json();
    const imageBase64 = openAIResult.data[0].b64_json;
    const revisedPrompt = openAIResult.data[0].revised_prompt || prompt;

    // Sauvegarder dans la base de données
    if (userId) {
      const { error } = await supabase.from('generated_ambient_images').insert({
        user_id: userId,
        prompt: revisedPrompt,
        image_base64: imageBase64,
        metadata: {
          original_prompt: prompt,
          style,
          mood,
          size,
          quality,
          model: 'dall-e-3'
        },
        generation_status: 'completed'
      });

      if (error) {
        console.error('Erreur sauvegarde image:', error);
      }
    }

    const response: ImageGenerationResponse = {
      success: true,
      imageBase64,
      metadata: {
        prompt: revisedPrompt,
        style,
        mood,
        size,
        generatedAt: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur génération image:', error);
    
    const errorResponse: ImageGenerationResponse = {
      success: false,
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
