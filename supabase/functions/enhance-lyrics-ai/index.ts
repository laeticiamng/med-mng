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
    const { lyrics, itemCode, model = 'gpt-5-2025-08-07' } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un expert en pédagogie médicale et en création de contenus mnémotechniques. Améliore les paroles pour optimiser la mémorisation médicale.' 
          },
          { 
            role: 'user', 
            content: `Améliore ces paroles médicales pour ${itemCode}:\n\n${lyrics.join('\n')}\n\nOptimise pour la mémorisation, ajoute des rimes et des connexions logiques.` 
          }
        ],
        max_completion_tokens: 1000
      }),
    });

    const data = await response.json();
    const enhancedText = data.choices[0].message.content;
    const enhancedLyrics = enhancedText.split('\n').filter(line => line.trim());

    return new Response(JSON.stringify({ enhancedLyrics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ enhancedLyrics: lyrics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});