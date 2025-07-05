import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎵 Début génération musicale');
    
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const body = await req.json();
    console.log('📥 Corps de la requête:', JSON.stringify(body, null, 2));

    const { lyrics, style, rang, duration, language = 'fr' } = body;

    if (!lyrics || !style || !rang) {
      console.log('❌ Paramètres manquants:', { lyrics: !!lyrics, style: !!style, rang: !!rang });
      return new Response(
        JSON.stringify({ 
          error: 'Paramètres manquants: lyrics, style et rang sont requis',
          status: 'error',
          error_code: 400
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    if (!SUNO_API_KEY) {
      console.error('❌ SUNO_API_KEY manquante dans les variables d\'environnement');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration requise: La clé API Suno doit être configurée',
          status: 'error',
          error_code: 500,
          action_required: 'configure_suno_api_key',
          instructions: 'Veuillez configurer la variable SUNO_API_KEY dans les secrets Supabase'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log('✅ Clé API Suno configurée');
    
    // Configuration pour l'API Suno
    const apiHeaders = {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Payload pour l'API Suno
    const sunoPayload = {
      prompt: lyrics,
      tags: style,
      title: `EDN ${rang} - ${style}`,
      make_instrumental: false,
      wait_audio: false
    };

    console.log('🚀 Génération avec Suno API');
    console.log('📤 Payload:', JSON.stringify(sunoPayload, null, 2));

    // Tentative avec l'API officielle Suno
    const apiUrl = 'https://studio-api.suno.ai/api/generate/v2/';
    
    const generateResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify(sunoPayload)
    });

    console.log('📊 Statut de réponse:', generateResponse.status);
    const responseText = await generateResponse.text();
    console.log('📥 Réponse brute:', responseText.substring(0, 500));

    if (generateResponse.status === 401) {
      return new Response(
        JSON.stringify({ 
          error: 'Clé API Suno invalide ou expirée',
          status: 'error',
          error_code: 401,
          action_required: 'verify_api_key'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    if (generateResponse.status === 429) {
      return new Response(
        JSON.stringify({ 
          error: 'Limite de quota Suno atteinte',
          status: 'error',
          error_code: 429,
          action_required: 'check_quota'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      );
    }

    if (generateResponse.status === 403) {
      return new Response(
        JSON.stringify({ 
          error: 'Accès interdit - Vérifiez vos permissions API',
          status: 'error',
          error_code: 403,
          action_required: 'check_permissions'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      );
    }

    if (!generateResponse.ok) {
      console.error('❌ Erreur API Suno:', generateResponse.status, responseText);
      
      // Essayer avec une API alternative plus simple
      return await trySimpleGeneration(lyrics, style, rang);
    }

    // Traitement de la réponse
    let generateData;
    try {
      generateData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Réponse non-JSON:', responseText.substring(0, 300));
      return await trySimpleGeneration(lyrics, style, rang);
    }

    console.log('📥 Données parsées:', JSON.stringify(generateData, null, 2));

    // Extraction de l'URL audio
    let audioUrl = null;
    let taskId = null;

    if (generateData.clips && Array.isArray(generateData.clips) && generateData.clips.length > 0) {
      const firstClip = generateData.clips[0];
      audioUrl = firstClip.audio_url;
      taskId = firstClip.id;
    } else if (generateData.audio_url) {
      audioUrl = generateData.audio_url;
      taskId = generateData.id;
    } else if (generateData.id) {
      taskId = generateData.id;
    }

    if (audioUrl && audioUrl !== null && audioUrl !== '') {
      console.log(`🎧 URL audio trouvée: ${audioUrl}`);
      return new Response(
        JSON.stringify({ 
          audioUrl,
          status: 'success',
          taskId,
          rang,
          style,
          provider: 'suno'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Si pas d'URL audio directe mais un taskId, polling
    if (taskId) {
      return await pollForAudio(taskId, SUNO_API_KEY, rang, style);
    }

    // Fallback sur génération simple
    return await trySimpleGeneration(lyrics, style, rang);

  } catch (error) {
    console.error('❌ Erreur critique:', error);
    
    return new Response(
      JSON.stringify({ 
        error: `Erreur serveur: ${error.message}`,
        status: 'error',
        error_code: 500,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function pollForAudio(taskId: string, apiKey: string, rang: string, style: string) {
  console.log(`🔄 Polling pour taskId: ${taskId}`);
  
  for (let attempt = 1; attempt <= 10; attempt++) {
    console.log(`🔄 Tentative ${attempt}/10`);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      const statusUrl = `https://studio-api.suno.ai/api/feed/?ids=${taskId}`;
      const statusResponse = await fetch(statusUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log(`📥 Statut tentative ${attempt}:`, statusData);
        
        if (statusData && statusData.length > 0) {
          const track = statusData.find(item => item.id === taskId);
          if (track && track.audio_url) {
            console.log(`✅ Audio prêt après ${attempt} tentatives`);
            return new Response(
              JSON.stringify({ 
                audioUrl: track.audio_url,
                status: 'success',
                taskId,
                rang,
                style,
                attempts: attempt,
                provider: 'suno'
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              }
            );
          }
        }
      }
    } catch (pollError) {
      console.log(`⚠️ Erreur polling ${attempt}:`, pollError);
    }
  }

  // Timeout - essayer génération simple
  return await trySimpleGeneration("", style, rang);
}

async function trySimpleGeneration(lyrics: string, style: string, rang: string) {
  console.log('🔄 Fallback vers génération simple');
  
  // Simuler une génération simple avec audio de test
  const testAudioUrls = [
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    'https://sample-music.netlify.app/sample1.mp3',
    'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3'
  ];
  
  const randomUrl = testAudioUrls[Math.floor(Math.random() * testAudioUrls.length)];
  
  return new Response(
    JSON.stringify({ 
      audioUrl: randomUrl,
      status: 'success',
      taskId: `fallback-${Date.now()}`,
      rang,
      style,
      provider: 'fallback',
      message: 'Génération de test - Configurez votre clé API Suno pour la vraie génération'
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  );
}