
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SunoGenerateResponse {
  id: string;
  title: string;
  image_url?: string;
  lyric: string;
  audio_url?: string;
  video_url?: string;
  created_at: string;
  model_name: string;
  status: string;
  gpt_description_prompt?: string;
  prompt?: string;
  type: string;
  tags?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { lyrics, style, rang, duration = 240 } = await req.json()

    console.log('🎵 Requête génération musique Suno reçue:', { 
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

    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY')
    if (!SUNO_API_KEY) {
      throw new Error('Clé API Suno non configurée')
    }

    // Mapping des styles vers des descriptions musicales pour Suno
    const styleDescriptions = {
      'lofi-piano': 'relaxing lo-fi piano with soft beats, chill, ambient, mellow',
      'afrobeat': 'energetic afrobeat with drums, bass, traditional African instruments, upbeat',
      'jazz-moderne': 'modern jazz with saxophone, piano, smooth rhythms, sophisticated',
      'hip-hop-conscient': 'conscious hip-hop with meaningful lyrics, urban beats, thoughtful',
      'soul-rnb': 'soulful R&B with emotional vocals, groove, heartfelt',
      'electro-chill': 'chill electronic with synthesizers, ambient textures, downtempo'
    }

    const musicStyle = styleDescriptions[style] || styleDescriptions['lofi-piano']
    const title = `Rang ${rang} - ${style === 'lofi-piano' ? 'Colloque Singulier' : 'Outils Pratiques'}`

    console.log(`🎤 Génération Suno - Rang ${rang}`)
    console.log(`📝 Style: ${style} | Durée: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`)
    console.log(`🎵 Description: ${musicStyle}`)
    console.log(`📖 Paroles (${lyrics.length} caractères):`, lyrics.substring(0, 200) + '...')

    // Étape 1: Générer la chanson avec Suno
    const generateResponse = await fetch('https://api.suno.ai/v1/songs/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        tags: musicStyle,
        prompt: `${lyrics}

Style musical: ${musicStyle}
Durée souhaitée: ${Math.floor(duration / 60)} minutes`,
        mv: "chirp-v3-5",
        continue_clip_id: null,
        continue_at: null
      }),
    })

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text()
      console.error('❌ Erreur génération Suno:', errorText)
      throw new Error(`Erreur API Suno (${generateResponse.status}): ${errorText}`)
    }

    const generateData = await generateResponse.json()
    console.log('✅ Génération Suno lancée:', generateData)

    if (!generateData || !generateData.id) {
      throw new Error('Aucun ID de génération retourné par Suno')
    }

    const songId = generateData.id

    // Étape 2: Attendre que la génération soit terminée (polling)
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max
    let songData: SunoGenerateResponse

    console.log(`🔄 Polling du statut pour song_id: ${songId}`)

    do {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Attendre 5 secondes
      attempts++

      const statusResponse = await fetch(`https://api.suno.ai/v1/songs/${songId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
        },
      })

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text()
        console.error('❌ Erreur status Suno:', errorText)
        throw new Error(`Erreur status API: ${errorText}`)
      }

      songData = await statusResponse.json()
      console.log(`🔍 Tentative ${attempts}: Status=${songData.status}`)

      if (songData.status === 'complete' && songData.audio_url) {
        break
      }

      if (songData.status === 'error') {
        throw new Error('La génération musicale a échoué sur Suno')
      }

    } while (attempts < maxAttempts && songData.status !== 'complete')

    if (attempts >= maxAttempts) {
      throw new Error('Timeout: La génération musicale prend trop de temps')
    }

    if (!songData.audio_url) {
      throw new Error('Aucune URL audio générée par Suno')
    }

    const durationFormatted = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`

    console.log(`✅ Chanson avec PAROLES CHANTÉES générée avec succès - Rang ${rang} (${durationFormatted})`)
    console.log(`🎧 URL audio: ${songData.audio_url}`)

    return new Response(
      JSON.stringify({ 
        audioUrl: songData.audio_url,
        rang,
        style,
        duration: duration,
        durationFormatted: durationFormatted,
        status: 'success',
        message: `🎤 Chanson avec PAROLES CHANTÉES générée pour le Rang ${rang} (${durationFormatted})`,
        lyrics_integrated: true,
        vocals_included: true,
        lyrics_length: lyrics.length,
        song_id: songId,
        note: '🎵 Génération réelle avec Suno AI - Paroles chantées intégrées',
        vocal_style: 'Voix IA haute qualité avec articulation claire',
        music_elements: `Style ${style} avec accompagnement musical professionnel et voix lead`,
        technical_specs: `Audio haute qualité Suno AI avec mix vocal/instrumental - Durée: ${durationFormatted}`,
        generation_info: {
          api_used: 'Suno AI',
          attempts: attempts,
          total_generation_time: `${attempts * 5} secondes`,
          model_version: 'chirp-v3-5'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erreur génération chanson Suno:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur inconnue lors de la génération',
        status: 'error',
        details: '🎤 Problème avec la génération Suno AI de chanson avec paroles chantées',
        debug: {
          error_type: error.name,
          error_message: error.message,
          timestamp: new Date().toISOString(),
          api_used: 'Suno AI'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
