
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { lyrics, style, rang } = await req.json()

    console.log('Requête reçue:', { lyrics: lyrics?.substring(0, 100) + '...', style, rang })

    if (!lyrics || !style || !rang) {
      throw new Error('Paramètres manquants: lyrics, style et rang sont requis')
    }

    // Vérifier si la clé API TopMediAI est configurée
    const topMediAIApiKey = Deno.env.get('TOPMEDIAI_API_KEY')
    if (!topMediAIApiKey) {
      console.error('TOPMEDIAI_API_KEY non configuré')
      return new Response(
        JSON.stringify({ 
          error: 'Configuration manquante: TOPMEDIAI_API_KEY requis dans les secrets Supabase. Veuillez configurer cette clé API dans les paramètres Supabase.',
          status: 'error',
          details: 'Allez dans Supabase Dashboard > Settings > Edge Functions > Environment Variables et ajoutez TOPMEDIAI_API_KEY'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Configuration des prompts musicaux selon le style pour 4 minutes de musique
    const stylePrompts = {
      'lofi-piano': 'lo-fi piano, soft jazz, relaxing, mellow, educational music, extended composition, 4 minutes',
      'afrobeat': 'afrobeat, energetic drums, bass guitar, rhythmic, educational music, full song structure, 4 minutes',
      'jazz-moderne': 'modern jazz, smooth saxophone, piano, sophisticated, educational music, complete song, 4 minutes',
      'hip-hop-conscient': 'conscious hip-hop, deep bass, clear beats, educational, storytelling, full track, 4 minutes',
      'soul-rnb': 'soul r&b, smooth vocals, emotional, educational, inspirational, complete song, 4 minutes',
      'electro-chill': 'electronic chill, ambient, synth pads, atmospheric, educational music, extended ambient track, 4 minutes'
    }

    // Nettoyage et préparation des paroles
    const cleanLyrics = lyrics
      .replace(/\\n/g, ' ')
      .replace(/\[.*?\]/g, '') // Supprime les indications de structure
      .replace(/\n\n+/g, ' ') // Remplace les multiples retours à la ligne
      .replace(/\s+/g, ' ') // Normalise les espaces
      .trim()

    console.log(`Génération musique - Rang ${rang}, Style: ${style}`)
    console.log('Paroles nettoyées:', cleanLyrics.substring(0, 200) + '...')

    // Prompt optimisé pour TopMediAI avec composition étendue
    const musicPrompt = `${stylePrompts[style] || 'educational music'}, instrumental, ${rang === 'A' ? 'contemplative and deep' : 'practical and engaging'}, clear melody, full composition, 240 seconds duration`

    console.log('Prompt musical:', musicPrompt)

    // Appel à l'API TopMediAI pour génération musicale
    const topMediAIResponse = await fetch('https://api.topmediai.com/v1/music/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${topMediAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: musicPrompt,
        lyrics: cleanLyrics,
        duration: 240, // 4 minutes = 240 secondes
        style: style,
        format: 'mp3',
        quality: 'high'
      })
    })

    if (!topMediAIResponse.ok) {
      const errorText = await topMediAIResponse.text()
      console.error('Erreur TopMediAI API:', topMediAIResponse.status, errorText)
      
      let errorMessage = `API TopMediAI: ${topMediAIResponse.status}`
      
      if (topMediAIResponse.status === 401) {
        errorMessage = 'Clé API TopMediAI invalide ou manquante. Vérifiez la configuration de TOPMEDIAI_API_KEY dans Supabase.'
      } else if (topMediAIResponse.status === 429) {
        errorMessage = 'Limite de requêtes API TopMediAI atteinte. Veuillez réessayer dans quelques minutes.'
      } else if (topMediAIResponse.status === 400) {
        errorMessage = 'Paramètres de génération invalides. Veuillez réessayer avec un autre style.'
      }
      
      throw new Error(errorMessage)
    }

    const topMediAIData = await topMediAIResponse.json()
    console.log('Réponse initiale TopMediAI:', topMediAIData.task_id, topMediAIData.status)
    
    // Polling pour attendre la génération avec timeout étendu pour 4 minutes
    let attempts = 0
    const maxAttempts = 60 // 5 minutes maximum pour générer 4 minutes de musique
    let finalResult = topMediAIData

    while (finalResult.status !== 'completed' && finalResult.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Attendre 5 secondes
      
      const statusResponse = await fetch(
        `https://api.topmediai.com/v1/music/task/${finalResult.task_id}`,
        {
          headers: {
            'Authorization': `Bearer ${topMediAIApiKey}`,
          },
        }
      )
      
      if (!statusResponse.ok) {
        console.error('Erreur vérification status:', statusResponse.status)
        break
      }
      
      finalResult = await statusResponse.json()
      console.log(`Tentative ${attempts + 1}/${maxAttempts}: Status = ${finalResult.status}`)
      attempts++
    }

    if (finalResult.status === 'failed') {
      console.error('Génération échouée:', finalResult.error)
      throw new Error(`Génération échouée: ${finalResult.error || 'Erreur inconnue lors de la génération musicale'}`)
    }

    if (finalResult.status !== 'completed') {
      throw new Error('Timeout: la génération musicale a pris trop de temps. Veuillez réessayer.')
    }

    // Récupération de l'URL audio générée
    const audioUrl = finalResult.result?.audio_url || finalResult.audio_url

    if (!audioUrl) {
      console.error('Pas de sortie audio:', finalResult)
      throw new Error('Aucune URL audio générée. Veuillez réessayer.')
    }

    console.log(`Musique générée avec succès - Rang ${rang}, Style: ${style}`)
    console.log('URL audio:', audioUrl)

    return new Response(
      JSON.stringify({ 
        audioUrl,
        rang,
        style,
        duration: 240, // 4 minutes
        status: 'success',
        prompt: musicPrompt,
        message: `Chanson de 4 minutes générée avec succès pour le Rang ${rang}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur génération musique:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur inconnue lors de la génération',
        status: 'error',
        details: 'Vérifiez que TOPMEDIAI_API_KEY est correctement configuré dans Supabase'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
