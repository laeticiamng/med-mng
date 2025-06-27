
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

    // Style cohérent pour la bande dessinée
    const comicStyle = "comic book illustration, clean line art, professional graphic novel style, consistent character design, medical setting, warm colors, educational illustration"
    
    // Contexte pour maintenir la cohérence des personnages
    const characterContext = panelNumber === 1 
      ? "Introduce main characters: a professional doctor (middle-aged, kind face, white coat) and a patient (concerned but hopeful expression)"
      : "Same consistent characters from previous panels: the professional doctor and patient, maintaining their appearance"

    // Prompt enrichi pour la cohérence narrative
    const enhancedPrompt = `${comicStyle}, ${characterContext}, ${prompt}. Panel ${panelNumber} of ${totalPanels} for "${itemTitle}". High quality, detailed, clear composition, consistent art style throughout the series.`

    console.log(`Génération image panel ${panelNumber}/${totalPanels}:`, enhancedPrompt.substring(0, 200) + '...')

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
        quality: 'high'
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

    console.log(`Image générée avec succès pour panel ${panelNumber}/${totalPanels}`)

    return new Response(
      JSON.stringify({ 
        imageUrl,
        prompt: enhancedPrompt,
        panelNumber,
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur génération image:', error)
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
