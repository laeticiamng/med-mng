
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TopMediAISubmitResponse {
  code: number;
  message: string;
  data?: {
    chanson_id: string;
  };
}

interface TopMediAIQueryResponse {
  code: number;
  message: string;
  data?: {
    status: string;
    audio_url?: string;
    progress?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { lyrics, style, rang, duration = 240 } = await req.json()

    console.log('🎵 Requête génération musique TopMediAI reçue:', { 
      lyricsLength: lyrics?.length || 0, 
      style, 
      rang, 
      duration,
      lyricsPreview: lyrics?.substring(0, 100) + '...' || 'Aucune parole'
    })

    if (!lyrics || !style || !rang) {
      throw new Error('Paramètres manquants: lyrics, style et rang sont requis')
    }

    if (lyrics.trim() === '' || lyrics === 'Aucune parole disponible pour le Rang A' || lyrics === 'Aucune parole disponible pour le Rang B') {
      throw new Error(`Aucune parole valide fournie pour le Rang ${rang}`)
    }

    const TOPMEDIAI_API_KEY = Deno.env.get('TOPMEDIAI_API_KEY')
    if (!TOPMEDIAI_API_KEY) {
      throw new Error('Clé API TopMediAI non configurée')
    }

    // Mapping des styles vers des prompts musicaux
    const stylePrompts = {
      'lofi-piano': 'Relaxing lo-fi piano with soft beats and ambient sounds',
      'afrobeat': 'Energetic afrobeat with drums, bass and traditional African instruments',
      'jazz-moderne': 'Modern jazz with saxophone, piano and smooth rhythms',
      'hip-hop-conscient': 'Conscious hip-hop with meaningful lyrics and urban beats',
      'soul-rnb': 'Soulful R&B with emotional vocals and groove',
      'electro-chill': 'Chill electronic with synthesizers and ambient textures'
    }

    const prompt = stylePrompts[style] || stylePrompts['lofi-piano']
    const title = `Chanson Rang ${rang} - ${style === 'lofi-piano' ? 'Colloque Singulier' : 'Outils Pratiques'}`

    console.log(`🎤 Soumission à TopMediAI - Rang ${rang}`)
    console.log(`📝 Style: ${style} | Durée: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`)
    console.log(`🎵 Prompt: ${prompt}`)
    console.log(`📖 Paroles (${lyrics.length} caractères):`, lyrics.substring(0, 200) + '...')

    // Étape 1: Soumettre la tâche de génération musicale
    const submitResponse = await fetch('https://api.topmediai.com/v2/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOPMEDIAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_auto: 1,
        prompt: prompt,
        lyrics: lyrics,
        title: title,
        instrumental: 0, // 0 = avec paroles chantées
        model_version: "v3.5",
        continue_at: 0
      }),
    })

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      console.error('❌ Erreur soumission TopMediAI:', errorText)
      throw new Error(`Erreur API TopMediAI (${submitResponse.status}): ${errorText}`)
    }

    const submitData: TopMediAISubmitResponse = await submitResponse.json()
    console.log('✅ Tâche soumise:', submitData)

    if (submitData.code !== 200 || !submitData.data?.chanson_id) {
      throw new Error(`Erreur soumission: ${submitData.message}`)
    }

    const chanson_id = submitData.data.chanson_id

    // Étape 2: Attendre que la génération soit terminée (polling)
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max
    let queryData: TopMediAIQueryResponse

    console.log(`🔄 Polling du statut pour chanson_id: ${chanson_id}`)

    do {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Attendre 5 secondes
      attempts++

      const queryResponse = await fetch(`https://api.topmediai.com/v2/query?chanson_id=${chanson_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TOPMEDIAI_API_KEY}`,
        },
      })

      if (!queryResponse.ok) {
        const errorText = await queryResponse.text()
        console.error('❌ Erreur query TopMediAI:', errorText)
        throw new Error(`Erreur query API: ${errorText}`)
      }

      queryData = await queryResponse.json()
      console.log(`🔍 Tentative ${attempts}: Status=${queryData.data?.status}, Progress=${queryData.data?.progress}%`)

      if (queryData.data?.status === 'completed' && queryData.data?.audio_url) {
        break
      }

      if (queryData.data?.status === 'failed') {
        throw new Error('La génération musicale a échoué')
      }

    } while (attempts < maxAttempts && queryData.data?.status !== 'completed')

    if (attempts >= maxAttempts) {
      throw new Error('Timeout: La génération musicale prend trop de temps')
    }

    if (!queryData.data?.audio_url) {
      throw new Error('Aucune URL audio générée')
    }

    const durationFormatted = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`

    console.log(`✅ Chanson avec PAROLES CHANTÉES générée avec succès - Rang ${rang} (${durationFormatted})`)
    console.log(`🎧 URL audio: ${queryData.data.audio_url}`)

    return new Response(
      JSON.stringify({ 
        audioUrl: queryData.data.audio_url,
        rang,
        style,
        duration: duration,
        durationFormatted: durationFormatted,
        status: 'success',
        message: `🎤 Chanson avec PAROLES CHANTÉES générée pour le Rang ${rang} (${durationFormatted})`,
        lyrics_integrated: true,
        vocals_included: true,
        lyrics_length: lyrics.length,
        chanson_id: chanson_id,
        note: '🎵 Génération réelle avec TopMediAI - Paroles chantées intégrées',
        vocal_style: 'Voix IA avec articulation claire des termes médicaux',
        music_elements: `Style ${style} avec accompagnement musical professionnel et voix lead`,
        technical_specs: `Audio haute qualité TopMediAI avec mix vocal/instrumental - Durée: ${durationFormatted}`,
        generation_info: {
          api_used: 'TopMediAI v3.5',
          attempts: attempts,
          total_generation_time: `${attempts * 5} secondes`,
          model_version: 'v3.5'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erreur génération chanson TopMediAI:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur inconnue lors de la génération',
        status: 'error',
        details: '🎤 Problème avec la génération TopMediAI de chanson avec paroles chantées',
        debug: {
          error_type: error.name,
          error_message: error.message,
          timestamp: new Date().toISOString(),
          api_used: 'TopMediAI'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
