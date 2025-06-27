
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
    const { lyrics, style, rang } = await req.json()

    console.log('Requête reçue:', { lyrics: lyrics?.substring(0, 100) + '...', style, rang })

    if (!lyrics || !style || !rang) {
      throw new Error('Paramètres manquants: lyrics, style et rang sont requis')
    }

    // Pour l'instant, on simule une génération réussie car les APIs de génération musicale
    // sont très coûteuses et souvent instables. On retourne un exemple d'URL audio.
    
    const mockAudioUrls = {
      'lofi-piano': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
      'afrobeat': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
      'jazz-moderne': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
      'hip-hop-conscient': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
      'soul-rnb': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
      'electro-chill': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'
    }

    // Simulation d'un délai de génération
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log(`Musique simulée générée avec succès - Rang ${rang}, Style: ${style}`)

    return new Response(
      JSON.stringify({ 
        audioUrl: mockAudioUrls[style] || mockAudioUrls['lofi-piano'],
        rang,
        style,
        duration: 240, // 4 minutes
        status: 'success',
        message: `Chanson de 4 minutes générée avec succès pour le Rang ${rang}`,
        note: 'Version de démonstration - Audio simulé'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur génération musique:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur inconnue lors de la génération',
        status: 'error',
        details: 'Fonction en mode démonstration'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
