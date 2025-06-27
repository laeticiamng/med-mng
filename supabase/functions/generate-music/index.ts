
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    if (!lyrics || !style || !rang) {
      throw new Error('Paramètres manquants: lyrics, style et rang sont requis')
    }

    // Configuration des prompts MusicGen selon le style
    const stylePrompts = {
      'lofi-piano': 'lo-fi piano, soft jazz, relaxing, mellow, educational rap vocals',
      'afrobeat': 'afrobeat, energetic drums, bass guitar, educational rap vocals, rhythmic',
      'jazz-moderne': 'modern jazz, smooth saxophone, piano, educational rap vocals, sophisticated',
      'hip-hop-conscient': 'conscious hip-hop, deep bass, clear vocals, educational, storytelling',
      'soul-rnb': 'soul r&b, smooth vocals, emotional, educational, inspirational',
      'electro-chill': 'electronic chill, ambient, synth pads, educational rap vocals, atmospheric'
    }

    // Nettoyage et préparation des paroles
    const cleanLyrics = lyrics
      .replace(/\\n/g, '\n')
      .replace(/\[.*?\]/g, '') // Supprime les indications de structure
      .replace(/\n\n+/g, ' ') // Remplace les multiples retours à la ligne
      .trim()

    // Appel à l'API MusicGen (Replicate)
    const musicGenResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "fb2b8b5e07513b55ca8bb634534223b67e7f2c4b5a7e2b3e7b5b5e5b5e5b5e5b", // MusicGen model
        input: {
          model_version: "stereo-large",
          prompt: `${stylePrompts[style]}, lyrics: "${cleanLyrics.substring(0, 500)}"`,
          duration: rang === 'A' ? 120 : 100, // Durée différente selon le rang
          temperature: 0.8,
          top_k: 250,
          top_p: 0.0,
          classifier_free_guidance: 7.0
        }
      })
    })

    if (!musicGenResponse.ok) {
      throw new Error('Erreur lors de la génération musicale')
    }

    const musicGenData = await musicGenResponse.json()
    
    // Polling pour attendre la génération
    let attempts = 0
    const maxAttempts = 60 // 5 minutes maximum
    let finalResult = musicGenData

    while (finalResult.status !== 'succeeded' && finalResult.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Attendre 5 secondes
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${finalResult.id}`,
        {
          headers: {
            'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
          },
        }
      )
      
      finalResult = await statusResponse.json()
      attempts++
    }

    if (finalResult.status === 'failed') {
      throw new Error('La génération musicale a échoué')
    }

    if (finalResult.status !== 'succeeded') {
      throw new Error('Timeout: la génération musicale a pris trop de temps')
    }

    // Récupération de l'URL audio générée
    const audioUrl = finalResult.output?.[0] || finalResult.output

    if (!audioUrl) {
      throw new Error('Aucune URL audio générée')
    }

    // Log pour le suivi
    console.log(`Musique générée avec succès - Rang ${rang}, Style: ${style}`)

    return new Response(
      JSON.stringify({ 
        audioUrl,
        rang,
        style,
        duration: rang === 'A' ? 120 : 100,
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur génération musique:', error)
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
