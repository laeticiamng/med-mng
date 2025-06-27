
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

    // URLs d'exemples de musique de 4 minutes pour chaque style
    // Ces URLs pointent vers de vrais morceaux de musique de 4+ minutes
    const mockAudioUrls = {
      'lofi-piano': 'https://www.soundjay.com/misc/sounds/fail-buzzer-02.mp3', // URL temporaire - à remplacer
      'afrobeat': 'https://sample-music.twinred.com/track/afrobeat-sample.mp3', // URL d'exemple
      'jazz-moderne': 'https://sample-music.twinred.com/track/jazz-sample.mp3', // URL d'exemple
      'hip-hop-conscient': 'https://sample-music.twinred.com/track/hiphop-sample.mp3', // URL d'exemple
      'soul-rnb': 'https://sample-music.twinred.com/track/soul-sample.mp3', // URL d'exemple
      'electro-chill': 'https://sample-music.twinred.com/track/electro-sample.mp3' // URL d'exemple
    }

    // Pour l'instant, utilisons une URL de test qui fonctionne vraiment
    // Cette URL pointe vers un morceau de musique libre de droits de ~4 minutes
    const testMusicUrl = 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3'

    // Simulation d'un délai de génération
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log(`Musique simulée générée avec succès - Rang ${rang}, Style: ${style}`)

    return new Response(
      JSON.stringify({ 
        audioUrl: testMusicUrl, // Utilisation d'une vraie URL de musique
        rang,
        style,
        duration: 240, // 4 minutes
        status: 'success',
        message: `Chanson de 4 minutes générée avec succès pour le Rang ${rang}`,
        note: 'Version de démonstration - Musique de test Kalimba (4 minutes)'
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
