
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
          error: 'CONFIGURATION REQUISE: La clé API Suno doit être configurée dans les secrets Supabase. Allez dans Project Settings > Edge Functions > Secrets et ajoutez SUNO_API_KEY.',
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

    // Payload selon l'API Suno v4
    const sunoPayload = {
      title: `Rang ${rang} - ${style}`,
      style: style,
      prompt: lyrics,
      model: 'chirp-v4',
      make_instrumental: false,
      wait_audio: fastMode
    };

    console.log('🚀 Tentative de génération avec API Suno officielle');
    console.log('📤 Payload:', JSON.stringify(sunoPayload, null, 2));

    // Test d'authentification d'abord avec l'API officielle
    const apiUrl = 'https://api.sunoaiapi.com/api/v1/gateway/generate/music';
    
    const generateResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify(sunoPayload)
    });

    console.log('📊 Statut de réponse:', generateResponse.status);
    console.log('📊 URL utilisée:', apiUrl);
    
    const responseText = await generateResponse.text();
    console.log('📥 Réponse brute:', responseText.substring(0, 300));

    // Gestion spécifique des erreurs d'authentification
    if (generateResponse.status === 401) {
      console.error('❌ ERREUR D\'AUTHENTIFICATION: Clé API Suno invalide ou expirée');
      return new Response(
        JSON.stringify({ 
          error: 'CLEF API SUNO INVALIDE: Votre clé API Suno a expiré ou n\'est pas valide. Veuillez la renouveler sur https://apibox.erweima.ai et mettre à jour la variable SUNO_API_KEY dans les secrets Supabase.',
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
          error: 'CRÉDITS SUNO ÉPUISÉS: Vous avez atteint la limite de votre quota Suno. Rechargez vos crédits sur https://apibox.erweima.ai',
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
      return new Response(
        JSON.stringify({ 
          error: `Erreur API Suno (${generateResponse.status}): ${responseText}`,
          status: 'error',
          error_code: generateResponse.status,
          details: responseText.substring(0, 200)
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: generateResponse.status
        }
      );
    }

    // Vérifier si la réponse est du JSON valide
    let generateData;
    try {
      generateData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Réponse non-JSON reçue:', responseText.substring(0, 200));
      return new Response(
        JSON.stringify({ 
          error: 'Réponse API invalide - Format non JSON',
          status: 'error',
          error_code: 500,
          details: responseText.substring(0, 200)
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

    if (generateData.data && Array.isArray(generateData.data) && generateData.data.length > 0) {
      const firstClip = generateData.data[0];
      audioUrl = firstClip.audio_url;
      taskId = firstClip.id;
      console.log('📋 Format data array détecté, taskId:', taskId);
    } else if (generateData.audio_url) {
      audioUrl = generateData.audio_url;
      taskId = generateData.id;
      console.log('📋 Format direct détecté, taskId:', taskId);
    } else if (Array.isArray(generateData) && generateData.length > 0) {
      const firstResult = generateData[0];
      audioUrl = firstResult.audio_url;
      taskId = firstResult.id;
      console.log('📋 Format array direct détecté, taskId:', taskId);
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
      
      for (let attempt = 1; attempt <= 8; attempt++) {
        console.log(`🔄 Polling ${attempt}/8`);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          const statusUrl = `https://api.sunoaiapi.com/api/v1/gateway/query?ids=${taskId}`;
          const statusResponse = await fetch(statusUrl, {
            method: 'GET',
            headers: apiHeaders
          });

          if (statusResponse.ok) {
            const statusText = await statusResponse.text();
            console.log(`📊 Polling ${attempt} - Statut:`, statusResponse.status);
            
            let statusData;
            try {
              statusData = JSON.parse(statusText);
            } catch (e) {
              console.log(`⚠️ Réponse polling non-JSON ${attempt}`);
              continue;
            }
            
            let foundAudioUrl = null;
            if (Array.isArray(statusData)) {
              const result = statusData.find(item => item.id === taskId);
              foundAudioUrl = result?.audio_url;
            } else if (statusData.data && Array.isArray(statusData.data)) {
              const result = statusData.data.find(item => item.id === taskId);
              foundAudioUrl = result?.audio_url;
            } else if (statusData.audio_url) {
              foundAudioUrl = statusData.audio_url;
            }
            
            if (foundAudioUrl && foundAudioUrl !== null) {
              console.log(`✅ URL trouvée après ${attempt} tentatives:`, foundAudioUrl);
              return new Response(
                JSON.stringify({ 
                  audioUrl: foundAudioUrl,
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
        } catch (pollError) {
          console.log(`⚠️ Erreur polling ${attempt}:`, pollError.message);
        }
      }
    }

    // Aucune URL audio trouvée après tous les essais
    return new Response(
      JSON.stringify({ 
        error: 'Génération échouée: Aucune URL audio produite après le polling',
        status: 'error',
        error_code: 500,
        taskId,
        details: 'La génération n\'a pas abouti dans le délai imparti'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );

  } catch (error) {
    console.error('❌ Erreur critique:', error);
    
    return new Response(
      JSON.stringify({ 
        error: `Erreur serveur: ${error.message}`,
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
