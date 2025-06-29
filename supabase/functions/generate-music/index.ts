
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
    const body = await req.text();
    console.log(`📥 Raw request body: ${body}`);
    
    if (!body || body.trim() === '') {
      throw new Error('Corps de requête vide');
    }

    let requestData;
    try {
      requestData = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON requête:', parseError);
      throw new Error('JSON invalide dans la requête');
    }

    const { 
      lyrics, 
      style, 
      rang, 
      duration = 240, 
      language = 'fr', 
      fastMode = true 
    } = requestData;

    console.log('🎵 Requête génération musique Suno reçue:', { 
      lyricsLength: lyrics?.length || 0, 
      style, 
      rang, 
      duration,
      language,
      fastMode,
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
      console.error('❌ SUNO_API_KEY manquante dans les secrets Supabase');
      throw new Error('Clé API Suno non configurée dans les secrets Supabase. Veuillez ajouter SUNO_API_KEY dans les paramètres des fonctions.');
    }

    console.log('🔑 SUNO_API_KEY trouvée, longueur:', SUNO_API_KEY.length);

    // Vérifier d'abord la disponibilité de l'API Suno
    console.log('🔍 Vérification de la disponibilité de l\'API Suno...');
    
    try {
      const healthCheck = await fetch('https://apibox.erweima.ai/api/v1/health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
          'Accept': 'application/json'
        }
      });

      console.log(`🏥 Health check Suno: ${healthCheck.status} ${healthCheck.statusText}`);
      
      if (healthCheck.status === 503) {
        throw new Error('🚫 Service Suno AI temporairement indisponible (503). Réessayez dans quelques minutes.');
      }
      
      if (healthCheck.status === 401) {
        throw new Error('🔑 Clé API Suno invalide ou expirée. Vérifiez votre clé dans les secrets Supabase.');
      }
      
    } catch (healthError) {
      console.log('⚠️ Health check échoué:', healthError.message);
      if (healthError.message.includes('503') || healthError.message.includes('Service Temporarily Unavailable')) {
        throw new Error('🚫 Service Suno AI temporairement indisponible. Réessayez dans quelques minutes.');
      }
      if (healthError.message.includes('401') || healthError.message.includes('Invalid')) {
        throw new Error('🔑 Clé API Suno invalide. Vérifiez votre configuration dans les secrets Supabase.');
      }
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
    
    // Adapter le titre selon la langue
    let title;
    if (rang === 'TRANSPOSE') {
      const languageNames = {
        'en': 'English',
        'es': 'Español', 
        'de': 'Deutsch',
        'zh': '中文',
        'ja': '日本語',
        'ar': 'العربية'
      };
      title = `Transposed to ${languageNames[language] || language}`;
    } else {
      const styleNames = {
        'lofi-piano': language === 'fr' ? 'Colloque Singulier' : 'Medical Dialogue',
        'afrobeat': language === 'fr' ? 'Formation Dynamique' : 'Dynamic Training',
        'jazz-moderne': language === 'fr' ? 'Médecine Moderne' : 'Modern Medicine',
        'hip-hop-conscient': language === 'fr' ? 'Conscience Médicale' : 'Medical Awareness',
        'soul-rnb': language === 'fr' ? 'Âme Soignante' : 'Healing Soul',
        'electro-chill': language === 'fr' ? 'Méditation Médicale' : 'Medical Meditation'
      };
      
      const styleName = styleNames[style] || (language === 'fr' ? 'Formation Médicale' : 'Medical Training');
      title = `Rang ${rang} - ${styleName}`;
    }

    // Générer une URL de callback unique
    const callBackUrl = `https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/generate-music/callback?taskId=${crypto.randomUUID()}`;

    const languageFlag = {
      'fr': '🇫🇷',
      'en': '🇺🇸', 
      'es': '🇪🇸',
      'de': '🇩🇪',
      'zh': '🇨🇳',
      'ja': '🇯🇵',
      'ar': '🇸🇦'
    };

    console.log(`🎤 Génération Suno ${fastMode ? 'RAPIDE ⚡' : 'NORMALE'} - Rang ${rang} ${languageFlag[language] || '🌍'}`);
    console.log(`📝 Style: ${style} | Durée: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')} | Langue: ${language}`);
    console.log(`🎵 Description: ${musicStyle}`);
    console.log(`📖 Paroles (${lyrics.length} caractères):`, lyrics.substring(0, 200) + '...');

    // Initialiser le générateur de musique
    const generator = new MusicGenerator(SUNO_API_KEY);

    // Étape 1: Générer la chanson avec Suno
    console.log(`🚀 Lancement génération musicale...`);
    const startTime = Date.now();
    
    let generateData;
    try {
      generateData = await generator.generateMusic({
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
    } catch (generateError) {
      console.error('❌ Erreur lors de la génération:', generateError);
      
      if (generateError.message.includes('503') || generateError.message.includes('Service Temporarily Unavailable')) {
        throw new Error('🚫 Service Suno AI temporairement indisponible (503). Réessayez dans quelques minutes.');
      }
      
      if (generateError.message.includes('401') || generateError.message.includes('Unauthorized')) {
        throw new Error('🔑 Clé API Suno invalide ou expirée. Vérifiez votre configuration.');
      }
      
      throw new Error(`Erreur génération Suno: ${generateError.message}`);
    }

    // Extraire le taskId
    let taskId;
    if (generateData?.data?.taskId) {
      taskId = generateData.data.taskId;
    } else if (generateData?.taskId) {
      taskId = generateData.taskId;
    } else {
      console.error('❌ Structure de réponse inattendue:', JSON.stringify(generateData, null, 2));
      throw new Error('Aucun ID de tâche retourné par Suno');
    }

    console.log(`🔑 TaskId extrait: ${taskId}`);

    // Étape 2: Attendre que la génération soit terminée
    console.log(`⏳ Attente de la génération musicale...`);
    const maxAttempts = fastMode ? 80 : 60;
    
    let musicData;
    try {
      musicData = await generator.waitForCompletion(taskId, maxAttempts, fastMode);
      console.log('✅ Génération terminée:', musicData);
    } catch (waitError) {
      console.error('❌ Erreur lors de l\'attente:', waitError);
      
      let userErrorMessage = 'Timeout génération: La génération musicale prend plus de temps que prévu.';
      if (fastMode) {
        userErrorMessage = 'Timeout génération rapide: La génération dépasse les 2 minutes. Le service pourrait être surchargé.';
      } else {
        userErrorMessage = 'Timeout génération: La génération dépasse les 4 minutes. Réessayez avec des paroles plus courtes.';
      }
      
      throw new Error(userErrorMessage);
    }

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

    // Valider que l'URL est bien une URL complète
    if (!audioUrl.startsWith('http')) {
      console.error('❌ URL audio invalide (pas une URL complète):', audioUrl);
      throw new Error('URL audio invalide retournée par Suno');
    }

    const durationFormatted = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
    const languageName = language === 'fr' ? 'français' : language;

    console.log(`✅ Chanson générée avec succès - Rang ${rang} (${durationFormatted}) en ${languageName} en ${totalTime}s`);
    console.log(`🎧 URL audio valide: ${audioUrl}`);

    return new Response(
      JSON.stringify({ 
        audioUrl: audioUrl,
        rang,
        style,
        duration: duration,
        durationFormatted: durationFormatted,
        generationTime: totalTime,
        language: language,
        status: 'success',
        message: `🎤 Chanson générée pour le Rang ${rang} (${durationFormatted}) en ${languageName} en ${totalTime}s`,
        lyrics_integrated: true,
        vocals_included: true,
        lyrics_length: lyrics.length,
        task_id: taskId,
        final_status: musicData.status,
        note: `🎵 Génération avec Suno AI - Paroles chantées intégrées en ${languageName}`,
        vocal_style: `Voix IA haute qualité avec articulation claire en ${languageName}`,
        music_elements: `Style ${style} avec accompagnement musical professionnel`,
        technical_specs: `Audio haute qualité Suno AI - Durée: ${durationFormatted} - Temps: ${totalTime}s`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur génération chanson Suno:', error);
    
    let userMessage = 'Erreur inconnue lors de la génération';
    let httpStatus = 500;
    
    if (error.message?.includes('Service Temporarily Unavailable') || error.message?.includes('503')) {
      userMessage = '🚫 Service Suno AI temporairement indisponible. Réessayez dans 5-10 minutes.';
      httpStatus = 503;
    } else if (error.message?.includes('Clé API Suno non configurée')) {
      userMessage = '🔑 Configuration manquante : Clé API Suno requise dans les secrets Supabase.';
      httpStatus = 500;
    } else if (error.message?.includes('Clé API Suno invalide')) {
      userMessage = '🔑 Clé API Suno invalide ou expirée. Vérifiez votre configuration dans les secrets Supabase.';
      httpStatus = 401;
    } else if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      userMessage = error.message || 'La génération prend trop de temps. Réessayez.';
      httpStatus = 408;
    } else if (error.message?.includes('Paramètres manquants')) {
      userMessage = error.message;
      httpStatus = 400;
    } else if (error.message?.includes('Aucune parole valide')) {
      userMessage = error.message;
      httpStatus = 400;
    } else if (error.message?.includes('Corps de requête vide')) {
      userMessage = 'Requête invalide : données manquantes.';
      httpStatus = 400;
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        status: 'error',
        error_code: error.code || httpStatus,
        details: '🎤 Problème avec la génération Suno AI',
        debug: {
          error_type: error.name,
          error_message: error.message,
          timestamp: new Date().toISOString(),
          api_used: 'Suno AI',
          base_url: 'https://apibox.erweima.ai',
          suggestion: httpStatus === 503 ? 'Attendez 5-10 minutes puis réessayez' : 
                     httpStatus === 401 ? 'Vérifiez votre clé API Suno dans les secrets Supabase' : 
                     httpStatus === 408 ? 'Réessayez dans quelques minutes' : 
                     'Vérifiez la configuration et réessayez'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: httpStatus
      }
    );
  }
});
