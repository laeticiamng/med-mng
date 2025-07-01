
import { corsHeaders } from './constants.ts';

export async function handleMusicGeneration(req: Request) {
  console.log('🎵 Début génération musicale avec Suno API');
  
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const body = await req.json();
    console.log('📥 Corps de la requête:', JSON.stringify(body, null, 2));

    const { lyrics, style, rang, duration, language = 'fr', fastMode = true } = body;

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
          error: 'CONFIGURATION REQUISE: La clé API Suno doit être configurée dans les secrets Supabase.',
          status: 'error',
          error_code: 500,
          action_required: 'configure_api_key'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log('✅ Clé API Suno configurée, longueur:', SUNO_API_KEY.length);
    
    // Configuration API - Utilisation de l'API Suno officielle
    const apiHeaders = {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Payload correct pour l'API Suno v3.5
    const sunoPayload = {
      prompt: lyrics,
      tags: style,
      title: `Rang ${rang} - ${style}`,
      make_instrumental: false,
      wait_audio: false
    };

    console.log('🚀 Tentative de génération avec API Suno v3.5');
    console.log('📤 Payload:', JSON.stringify(sunoPayload, null, 2));

    // Endpoint API Suno correct
    const apiUrl = 'https://studio-api.suno.ai/api/generate/v2/';
    
    const generateResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify(sunoPayload)
    });

    console.log('📊 Statut de réponse:', generateResponse.status);
    console.log('📊 Headers de réponse:', Object.fromEntries(generateResponse.headers.entries()));
    
    const responseText = await generateResponse.text();
    console.log('📥 Réponse brute complète:', responseText);

    // Gestion des erreurs d'authentification
    if (generateResponse.status === 401) {
      console.error('❌ ERREUR D\'AUTHENTIFICATION: Clé API Suno invalide');
      return new Response(
        JSON.stringify({ 
          error: 'CLEF API SUNO INVALIDE: Votre clé API Suno a expiré ou n\'est pas valide. Veuillez la renouveler.',
          status: 'error',
          error_code: 401,
          action_required: 'renew_api_key',
          details: 'Authentification échouée auprès de l\'API Suno'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    if (generateResponse.status === 429) {
      console.error('❌ LIMITE DE CRÉDITS ATTEINTE');
      return new Response(
        JSON.stringify({ 
          error: 'CRÉDITS SUNO ÉPUISÉS: Vous avez atteint la limite de votre quota Suno.',
          status: 'error',
          error_code: 429,
          action_required: 'recharge_credits'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      );
    }

    if (!generateResponse.ok) {
      console.error('❌ Erreur API Suno:', generateResponse.status, responseText);
      
      // Essayer l'API alternative si l'API principale échoue
      console.log('🔄 Tentative avec API alternative...');
      return await tryAlternativeAPI(lyrics, style, rang, SUNO_API_KEY);
    }

    // Vérifier si la réponse est du JSON valide
    let generateData;
    try {
      generateData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Réponse non-JSON reçue:', responseText.substring(0, 300));
      return new Response(
        JSON.stringify({ 
          error: 'Réponse API invalide - Format non JSON',
          status: 'error',
          error_code: 500,
          details: responseText.substring(0, 300)
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log('📥 Données parsées:', JSON.stringify(generateData, null, 2));

    // Traitement de la réponse selon le format Suno
    let audioUrl = null;
    let taskId = null;

    if (generateData.clips && Array.isArray(generateData.clips) && generateData.clips.length > 0) {
      const firstClip = generateData.clips[0];
      audioUrl = firstClip.audio_url;
      taskId = firstClip.id;
    } else if (generateData.audio_url) {
      audioUrl = generateData.audio_url;
      taskId = generateData.id;
    }

    if (audioUrl && audioUrl !== null && audioUrl !== '') {
      console.log(`🎧 URL AUDIO IMMÉDIATE: ${audioUrl}`);
      return new Response(
        JSON.stringify({ 
          audioUrl,
          status: 'success',
          taskId,
          rang,
          style,
          duration
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Si pas d'URL audio directe mais un taskId, démarrer le polling
    if (taskId) {
      console.log(`🔄 Démarrage polling pour taskId: ${taskId}`);
      return await pollForAudio(taskId, SUNO_API_KEY, rang, style, duration);
    }

    // Aucune URL audio trouvée
    return new Response(
      JSON.stringify({ 
        error: 'Génération échouée: Aucune URL audio produite',
        status: 'error',
        error_code: 500,
        details: 'La génération n\'a pas abouti'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );

  } catch (error) {
    console.error('❌ Erreur critique complète:', error);
    console.error('❌ Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: `Erreur serveur critique: ${error.message}`,
        status: 'error',
        error_code: 500,
        details: 'Erreur interne lors de la génération'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
}

async function tryAlternativeAPI(lyrics: string, style: string, rang: string, apiKey: string) {
  try {
    console.log('🔄 Utilisation de l\'API alternative Suno');
    
    const alternativePayload = {
      title: `Rang ${rang} - ${style}`,
      style: style,
      prompt: lyrics,
      model: 'chirp-v3-5',
      make_instrumental: false,
      wait_audio: false
    };

    const alternativeUrl = 'https://api.sunoaiapi.com/api/v1/gateway/generate/music';
    
    const response = await fetch(alternativeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(alternativePayload)
    });

    console.log('📊 Statut API alternative:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API alternative:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `Erreur des deux APIs Suno (${response.status}): ${errorText}`,
          status: 'error',
          error_code: response.status,
          details: 'Les APIs Suno principale et alternative ont échoué'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const data = await response.json();
    console.log('✅ Réponse API alternative:', data);

    if (data.data && data.data.length > 0) {
      const audioUrl = data.data[0].audio_url;
      if (audioUrl) {
        return new Response(
          JSON.stringify({ 
            audioUrl,
            status: 'success',
            taskId: data.data[0].id,
            rang,
            style
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        error: 'Aucune URL audio générée par l\'API alternative',
        status: 'error',
        error_code: 500
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );

  } catch (error) {
    console.error('❌ Erreur API alternative:', error);
    return new Response(
      JSON.stringify({ 
        error: `Erreur API alternative: ${error.message}`,
        status: 'error',
        error_code: 500
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
}

async function pollForAudio(taskId: string, apiKey: string, rang: string, style: string, duration?: number) {
  console.log(`🔄 Polling pour taskId: ${taskId}`);
  
  for (let attempt = 1; attempt <= 12; attempt++) {
    console.log(`🔄 Polling ${attempt}/12`);
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
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
        console.log(`📥 Réponse polling ${attempt}:`, statusData);
        
        if (statusData && statusData.length > 0) {
          const track = statusData.find(item => item.id === taskId);
          if (track && track.audio_url) {
            console.log(`✅ URL trouvée après ${attempt} tentatives:`, track.audio_url);
            return new Response(
              JSON.stringify({ 
                audioUrl: track.audio_url,
                status: 'success',
                taskId,
                rang,
                style,
                duration,
                attempts: attempt
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

  return new Response(
    JSON.stringify({ 
      error: 'Délai d\'attente dépassé pour la génération',
      status: 'error',
      error_code: 408,
      details: 'La génération prend plus de temps que prévu'
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 408
    }
  );
}
