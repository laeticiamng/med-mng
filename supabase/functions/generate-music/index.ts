import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MusicGenerator } from './musicGeneration.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lyrics, style, rang, duration = 240 } = await req.json();

    console.log('🎵 Requête génération musique Suno reçue:', { 
      lyricsLength: lyrics?.length || 0, 
      style, 
      rang, 
      duration,
      lyricsPreview: lyrics?.substring(0, 100) + '...' || 'Aucune parole'
    });

    if (!lyrics || !style || !rang) {
      throw new Error('Paramètres manquants: lyrics, style et rang sont requis');
    }

    if (lyrics.trim() === '' || lyrics === 'Aucune parole disponible pour le Rang A' || lyrics === 'Aucune parole disponible pour le Rang B') {
      throw new Error(`Aucune parole valide fournie pour le Rang ${rang}`);
    }

    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    if (!SUNO_API_KEY) {
      throw new Error('Clé API Suno non configurée');
    }

    // Mapping des styles vers des descriptions musicales pour Suno
    const styleDescriptions = {
      'lofi-piano': 'relaxing lo-fi piano with soft beats, chill, ambient, mellow',
      'afrobeat': 'energetic afrobeat with drums, bass, traditional African instruments, upbeat',
      'jazz-moderne': 'modern jazz with saxophone, piano, smooth rhythms, sophisticated',
      'hip-hop-conscient': 'conscious hip-hop with meaningful lyrics, urban beats, thoughtful',
      'soul-rnb': 'soulful R&B with emotional vocals, groove, heartfelt',
      'electro-chill': 'chill electronic with synthesizers, ambient textures, downtempo'
    };

    const musicStyle = styleDescriptions[style] || styleDescriptions['lofi-piano'];
    const title = `Rang ${rang} - ${style === 'lofi-piano' ? 'Colloque Singulier' : 'Outils Pratiques'}`;

    // Générer une URL de callback unique (pas utilisée mais requise par l'API)
    const callBackUrl = `https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/generate-music/callback?taskId=${crypto.randomUUID()}`;

    console.log(`🎤 Génération Suno optimisée - Rang ${rang}`);
    console.log(`📝 Style: ${style} | Durée: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`);
    console.log(`🎵 Description: ${musicStyle}`);
    console.log(`📖 Paroles (${lyrics.length} caractères):`, lyrics.substring(0, 200) + '...');

    // Initialiser le générateur de musique
    const generator = new MusicGenerator(SUNO_API_KEY);

    // Étape 1: Générer la chanson avec Suno
    console.log('🚀 Lancement de la génération musicale optimisée...');
    const startTime = Date.now();
    
    const generateData = await generator.generateMusic({
      prompt: lyrics,
      style: musicStyle,
      title: title,
      customMode: true,
      instrumental: false,
      model: "V3_5",
      negativeTags: undefined,
      callBackUrl: callBackUrl
    });

    console.log('✅ Génération Suno lancée:', generateData);

    if (!generateData?.taskId) {
      throw new Error('Aucun ID de tâche retourné par Suno');
    }

    // Étape 2: Attendre que la génération soit terminée avec polling optimisé (timeout 20 minutes)
    console.log('⏳ Attente optimisée de la génération musicale...');
    const musicData = await generator.waitForCompletion(generateData.taskId, 120);

    // Calculer le temps total
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    console.log(`⏱️ Génération terminée en ${totalTime} secondes`);

    // Vérifier plusieurs structures possibles pour l'URL audio
    let audioUrl = null;
    if (musicData.data?.audio?.[0]?.audio_url) {
      audioUrl = musicData.data.audio[0].audio_url;
    } else if (musicData.data?.audio_url) {
      audioUrl = musicData.data.audio_url;
    } else if (musicData.audio_url) {
      audioUrl = musicData.audio_url;
    }

    if (!audioUrl) {
      console.error('❌ Réponse Suno sans URL audio:', JSON.stringify(musicData, null, 2));
      throw new Error('Aucune URL audio dans la réponse de Suno');
    }

    const durationFormatted = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;

    console.log(`✅ Chanson avec PAROLES CHANTÉES générée avec succès - Rang ${rang} (${durationFormatted}) en ${totalTime}s`);
    console.log(`🎧 URL audio: ${audioUrl}`);

    return new Response(
      JSON.stringify({ 
        audioUrl: audioUrl,
        rang,
        style,
        duration: duration,
        durationFormatted: durationFormatted,
        generationTime: totalTime,
        status: 'success',
        message: `🎤 Chanson avec PAROLES CHANTÉES générée pour le Rang ${rang} (${durationFormatted}) en ${totalTime}s`,
        lyrics_integrated: true,
        vocals_included: true,
        lyrics_length: lyrics.length,
        task_id: generateData.taskId,
        final_status: musicData.status,
        note: '🎵 Génération optimisée avec Suno AI - Paroles chantées intégrées',
        vocal_style: 'Voix IA haute qualité avec articulation claire',
        music_elements: `Style ${style} avec accompagnement musical professionnel et voix lead`,
        technical_specs: `Audio haute qualité Suno AI avec mix vocal/instrumental - Durée: ${durationFormatted} - Temps: ${totalTime}s`,
        optimization_info: {
          polling_optimized: true,
          adaptive_intervals: true,
          early_detection: true,
          max_attempts: 120,
          estimated_max_time: '10 minutes'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur génération chanson Suno:', error);
    
    // Analyser le type d'erreur pour donner une réponse plus précise
    let userMessage = 'Erreur inconnue lors de la génération';
    let httpStatus = 500;
    
    if (error.message?.includes('429') || error.code === 429) {
      userMessage = 'Crédits Suno insuffisants. Veuillez recharger votre compte Suno AI.';
      httpStatus = 429;
      console.error('💳 Crédits Suno épuisés - L\'utilisateur doit recharger son compte');
    } else if (error.message?.includes('401') || error.code === 401) {
      userMessage = 'Clé API Suno invalide ou expirée. Vérifiez votre configuration.';
      httpStatus = 401;
      console.error('🔑 Problème d\'authentification Suno API');
    } else if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      userMessage = 'La génération prend trop de temps. Réessayez avec des paroles plus courtes.';
      httpStatus = 408;
      console.error('⏰ Timeout de génération Suno');
    } else if (error.message?.includes('sensitive') || error.message?.includes('SENSITIVE_WORD_ERROR')) {
      userMessage = 'Les paroles contiennent du contenu non autorisé par Suno AI.';
      httpStatus = 400;
      console.error('🚫 Contenu sensible détecté par Suno');
    } else if (error.message?.includes('Paramètres manquants')) {
      userMessage = error.message;
      httpStatus = 400;
    } else if (error.message?.includes('Aucune parole valide')) {
      userMessage = error.message;
      httpStatus = 400;
    } else if (error.message?.includes('Clé API Suno non configurée')) {
      userMessage = 'Configuration manquante : Clé API Suno requise.';
      httpStatus = 500;
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        status: 'error',
        error_code: error.code || httpStatus,
        details: '🎤 Problème avec la génération Suno AI de chanson avec paroles chantées',
        debug: {
          error_type: error.name,
          error_message: error.message,
          timestamp: new Date().toISOString(),
          api_used: 'Suno AI',
          base_url: 'https://apibox.erweima.ai',
          timeout_info: 'Timeout configuré à 30 minutes (180 tentatives × 10s)',
          suggestion: httpStatus === 429 ? 'Rechargez vos crédits Suno AI sur https://apibox.erweima.ai' : 'Vérifiez la configuration de l\'API'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: httpStatus
      }
    );
  }
});
