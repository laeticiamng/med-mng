
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

    // Vérifier si la clé API Replicate est configurée
    const replicateToken = Deno.env.get('REPLICATE_API_TOKEN')
    if (!replicateToken) {
      console.error('REPLICATE_API_TOKEN non configuré')
      return new Response(
        JSON.stringify({ 
          error: 'Configuration manquante: REPLICATE_API_TOKEN requis dans les secrets Supabase. Veuillez configurer cette clé API dans les paramètres Supabase.',
          status: 'error',
          details: 'Allez dans Supabase Dashboard > Settings > Edge Functions > Environment Variables et ajoutez REPLICATE_API_TOKEN'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Configuration des prompts MusicGen selon le style pour 4 minutes de musique
    const stylePrompts = {
      'lofi-piano': 'lo-fi piano, soft jazz, relaxing, mellow, educational music, long composition, extended melody',
      'afrobeat': 'afrobeat, energetic drums, bass guitar, rhythmic, educational music, full song structure, extended composition',
      'jazz-moderne': 'modern jazz, smooth saxophone, piano, sophisticated, educational music, complete song, extended arrangement',
      'hip-hop-conscient': 'conscious hip-hop, deep bass, clear beats, educational, storytelling, full track, extended verses',
      'soul-rnb': 'soul r&b, smooth vocals, emotional, educational, inspirational, complete song, extended composition',
      'electro-chill': 'electronic chill, ambient, synth pads, atmospheric, educational music, long form, extended ambient track'
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

    // Prompt optimisé pour MusicGen avec composition étendue
    const musicPrompt = `${stylePrompts[style] || 'educational music'}, instrumental, ${rang === 'A' ? 'contemplative and deep' : 'practical and engaging'}, clear melody, full composition, extended track`

    console.log('Prompt musical:', musicPrompt)

    // Appel à l'API MusicGen (Replicate) avec durée de 4 minutes
    const musicGenResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2dbe",
        input: {
          model_version: "stereo-large",
          prompt: musicPrompt,
          duration: 240, // 4 minutes = 240 secondes
          temperature: 0.8,
          top_k: 250,
          top_p: 0.0,
          classifier_free_guidance: 7.0
        }
      })
    })

    if (!musicGenResponse.ok) {
      const errorText = await musicGenResponse.text()
      console.error('Erreur Replicate API:', musicGenResponse.status, errorText)
      
      let errorMessage = `API Replicate: ${musicGenResponse.status}`
      
      if (musicGenResponse.status === 401) {
        errorMessage = 'Clé API Replicate invalide ou manquante. Vérifiez la configuration de REPLICATE_API_TOKEN dans Supabase.'
      } else if (musicGenResponse.status === 429) {
        errorMessage = 'Limite de requêtes API Replicate atteinte. Veuillez réessayer dans quelques minutes.'
      } else if (musicGenResponse.status === 400) {
        errorMessage = 'Paramètres de génération invalides. Veuillez réessayer avec un autre style.'
      }
      
      throw new Error(errorMessage)
    }

    const musicGenData = await musicGenResponse.json()
    console.log('Réponse initiale Replicate:', musicGenData.id, musicGenData.status)
    
    // Polling pour attendre la génération avec timeout étendu pour 4 minutes
    let attempts = 0
    const maxAttempts = 60 // 5 minutes maximum pour générer 4 minutes de musique
    let finalResult = musicGenData

    while (finalResult.status !== 'succeeded' && finalResult.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Attendre 5 secondes
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${finalResult.id}`,
        {
          headers: {
            'Authorization': `Token ${replicateToken}`,
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

    if (finalResult.status !== 'succeeded') {
      throw new Error('Timeout: la génération musicale a pris trop de temps. Veuillez réessayer.')
    }

    // Récupération de l'URL audio générée
    const audioUrl = finalResult.output?.[0] || finalResult.output

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
        details: 'Vérifiez que REPLICATE_API_TOKEN est correctement configuré dans Supabase'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
