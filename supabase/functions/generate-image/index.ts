
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
    const { prompt, style, panelNumber, totalPanels, itemTitle } = await req.json()

    if (!prompt) {
      throw new Error('Prompt requis pour la génération d\'image')
    }

    // Vérifier si la clé API OpenAI est configurée
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY non configuré')
      return new Response(
        JSON.stringify({ 
          error: 'Configuration manquante: OPENAI_API_KEY requis dans les secrets Supabase.',
          status: 'error'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Style cohérent pour la bande dessinée médicale
    const medicalComicStyle = "professional medical comic book illustration, consistent cartoon style, clean line art, warm and reassuring colors, educational illustration for healthcare, consistent character design throughout the series"
    
    // Contexte de cohérence des personnages amélioré
    const characterConsistency = panelNumber === 1 
      ? "Establish main characters with very specific visual details: Dr. Martin (40s, brown hair, gentle brown eyes, white medical coat with blue shirt underneath, stethoscope around neck, kind professional smile), Nurse Sophie (30s, blonde hair in neat bun, blue scrubs, caring green eyes, professional demeanor), Patient Marie (50s, brown hair, concerned but hopeful expression, casual clothing)"
      : `CRITICAL: Use the EXACT SAME character appearances as established in panel 1: Dr. Martin (same brown hair, same brown eyes, same white coat, same facial features), Nurse Sophie (same blonde hair in bun, same blue scrubs, same green eyes), Patient Marie (same brown hair, same facial features). Maintain absolute visual consistency with previous panels.`

    // Prompt enrichi pour la cohérence narrative et visuelle
    const enhancedPrompt = `${medicalComicStyle}. ${characterConsistency}. 
    
    Scene description: ${prompt}
    
    Visual requirements:
    - Same art style as previous panels (cartoon medical illustration)
    - Same color palette (blues, whites, warm skin tones)
    - Same character proportions and features
    - Same medical facility background elements
    - Professional healthcare setting
    - Educational and reassuring mood
    
    Panel ${panelNumber} of ${totalPanels} for medical education topic: "${itemTitle}".
    
    MAINTAIN STRICT VISUAL CONTINUITY: Characters must look identical to previous panels, same faces, same clothing, same proportions. This is part of a continuous visual story.`

    console.log(`Génération image médicale panel ${panelNumber}/${totalPanels}:`, enhancedPrompt.substring(0, 300) + '...')

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        style: 'natural'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erreur OpenAI API:', response.status, errorText)
      
      let errorMessage = `API OpenAI: ${response.status}`
      
      if (response.status === 401) {
        errorMessage = 'Clé API OpenAI invalide ou manquante. Vérifiez la configuration.'
      } else if (response.status === 429) {
        errorMessage = 'Limite de requêtes API OpenAI atteinte. Réessayez dans quelques minutes.'
      } else if (response.status === 400) {
        errorMessage = 'Prompt invalide pour la génération d\'image.'
      } else if (response.status === 403) {
        errorMessage = 'Votre organisation OpenAI doit être vérifiée pour utiliser gpt-image-1. Visitez https://platform.openai.com/settings/organization/general'
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    
    // OpenAI retourne base64 pour gpt-image-1
    const imageData = data.data[0].b64_json
    const imageUrl = `data:image/png;base64,${imageData}`

    console.log(`Image médicale générée avec succès pour panel ${panelNumber}/${totalPanels}`)

    return new Response(
      JSON.stringify({ 
        imageUrl,
        prompt: enhancedPrompt,
        panelNumber,
        style: 'medical-comic',
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur génération image médicale:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur inconnue lors de la génération',
        status: 'error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
