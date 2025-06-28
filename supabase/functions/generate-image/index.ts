
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
    const { prompt, panelNumber, totalPanels, itemTitle } = await req.json()

    if (!prompt) {
      throw new Error('Prompt requis pour la génération d\'image')
    }

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

    // Style cartoon médical cohérent
    const medicalCartoonStyle = "high quality cartoon illustration, medical comic book style, clean vector art, bright warm colors, professional healthcare setting, consistent character design, educational illustration"
    
    // Personnages récurrents avec descriptions détaillées
    const characterConsistency = panelNumber === 1 
      ? "Establish main characters: Dr. Martin (friendly doctor, 40s, brown hair, white medical coat, stethoscope, kind smile), Nurse Claire (professional nurse, 30s, blonde ponytail, blue scrubs, caring expression), Patient Thomas (middle-aged man, concerned but hopeful)"
      : `Continue with same consistent characters: Dr. Martin (same friendly doctor appearance), Nurse Claire (same professional nurse), Patient Thomas (same patient). Maintain EXACT same visual style and character designs as previous panels.`

    // Prompt enrichi pour cohérence visuelle
    const enhancedPrompt = `${medicalCartoonStyle}. ${characterConsistency}. 
    
    Scene: ${prompt}
    
    Visual requirements:
    - Cartoon/animated style (NOT photorealistic)
    - Consistent medical facility background
    - Same color palette throughout (blues, whites, warm skin tones)
    - Professional healthcare environment
    - Educational and reassuring mood
    - Clear, clean lines like a medical textbook illustration
    
    Panel ${panelNumber} of ${totalPanels} for "${itemTitle}".
    
    CRITICAL: Maintain strict visual continuity with previous panels - same characters, same art style, same proportions.`

    console.log(`Génération image médicale panel ${panelNumber}/${totalPanels}`)

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erreur OpenAI API:', response.status, errorText)
      
      let errorMessage = `API OpenAI: ${response.status}`
      
      if (response.status === 401) {
        errorMessage = 'Clé API OpenAI invalide ou manquante.'
      } else if (response.status === 429) {
        errorMessage = 'Limite de requêtes API OpenAI atteinte. Réessayez dans quelques minutes.'
      } else if (response.status === 400) {
        errorMessage = 'Prompt invalide pour la génération d\'image.'
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const imageUrl = data.data[0].url

    console.log(`Image médicale générée avec succès pour panel ${panelNumber}/${totalPanels}`)

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
