
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, style } = await req.json()

    if (!prompt) {
      throw new Error('Prompt requis pour la génération d\'image')
    }

    // Enrichir le prompt avec le style
    const enhancedPrompt = `${prompt}, ${style || 'professional illustration'}, high quality, detailed, clear, educational`

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la génération d\'image')
    }

    const data = await response.json()
    const imageUrl = data.data[0].url

    console.log('Image générée avec succès')

    return new Response(
      JSON.stringify({ 
        imageUrl,
        prompt: enhancedPrompt,
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur génération image:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
