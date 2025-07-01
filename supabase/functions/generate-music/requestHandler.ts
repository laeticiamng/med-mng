
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
      console.error('❌ SUNO_API_KEY manquante');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration API manquante - Clé API Suno non configurée',
          status: 'error',
          error_code: 500
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log('✅ Clé API Suno configurée');
    
    // Configuration API - Utilisation de l'API Suno officielle
    const apiHeaders = {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Supabase-Edge-Function/1.0'
    };

    // Payload simplifié selon la documentation Suno
    const sunoPayload = {
      prompt: lyrics,
      tags: style,
      title: `Rang ${rang} - ${style}`,
      make_instrumental: false,
      wait_audio: true // Attendre la génération complète
    };

    console.log('🚀 Envoi vers Suno API:', JSON.stringify(sunoPayload, null, 2));

    // Tentative avec l'API officielle Suno
    let generateResponse;
    let apiUrl = 'https://studio-api.suno.ai/api/generate/v2/';
    
    try {
      generateResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(sunoPayload)
      });
    } catch (fetchError) {
      console.log('❌ Erreur avec API officielle, tentative avec API alternative...');
      
      // Fallback vers API alternative
      apiUrl = 'https://api.sunoai.ai/api/v1/gateway/generate/music';
      try {
        generateResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'api-key': SUNO_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            title: `Rang ${rang} - ${style}`,
            prompt: lyrics,
            style: style,
            instrumental: false
          })
        });
      } catch (secondError) {
        console.error('❌ Erreur avec les deux APIs:', secondError);
        throw new Error('Impossible de se connecter à l\'API Suno');
      }
    }

    console.log('📊 Statut de réponse:', generateResponse.status);
    console.log('📊 Headers de réponse:', Object.fromEntries(generateResponse.headers.entries()));
    
    const responseText = await generateResponse.text();
    console.log('📥 Réponse brute (premiers 500 chars):', responseText.substring(0, 500));

    if (!generateResponse.ok) {
      console.error('❌ Erreur API Suno:', generateResponse.status, responseText);
      
      let errorMessage = 'Erreur API Suno';
      if (generateResponse.status === 401) {
        errorMessage = 'Authentification échouée - Vérifiez votre clé API Suno';
      } else if (generateResponse.status === 429) {
        errorMessage = 'Limite de requêtes atteinte - Réessayez dans quelques minutes';
      } else if (generateResponse.status === 400) {
        errorMessage = 'Paramètres non valides - Vérifiez le format des paroles';
      } else if (generateResponse.status === 404) {
        errorMessage = 'Endpoint non trouvé - Service Suno temporairement indisponible';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: 'error',
          error_code: generateResponse.status,
          details: responseText.substring(0, 200),
          api_used: apiUrl
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
      
      // Si c'est du HTML, c'est probablement une page d'erreur
      if (responseText.includes('<!doctype html>') || responseText.includes('<html')) {
        return new Response(
          JSON.stringify({ 
            error: 'Service Suno indisponible - Page d\'erreur reçue au lieu de données',
            status: 'error',
            error_code: 503,
            details: 'L\'API a retourné du HTML au lieu de JSON',
            suggestion: 'Vérifiez votre clé API ou réessayez plus tard'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 503
          }
        );
      }
      
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

    console.log('📥 Réponse parsée:', JSON.stringify(generateData, null, 2));

    // Traitement de la réponse selon le format de l'API utilisée
    let audioUrl = null;
    let taskId = null;

    // Format de réponse API officielle
    if (generateData.clips && Array.isArray(generateData.clips)) {
      const clip = generateData.clips[0];
      audioUrl = clip?.audio_url;
      taskId = clip?.id;
    }
    // Format de réponse API alternative
    else if (generateData.data && generateData.data.audio_url) {
      audioUrl = generateData.data.audio_url;
      taskId = generateData.data.id;
    }
    // Format direct
    else if (generateData.audio_url) {
      audioUrl = generateData.audio_url;
      taskId = generateData.id;
    }
    // Format tableau direct
    else if (Array.isArray(generateData) && generateData.length > 0) {
      const firstResult = generateData[0];
      audioUrl = firstResult.audio_url;
      taskId = firstResult.id;
    }

    if (audioUrl) {
      console.log(`🎧 URL AUDIO TROUVÉE: ${audioUrl}`);
      return new Response(
        JSON.stringify({ 
          audioUrl,
          status: 'success',
          taskId,
          rang,
          style,
          duration,
          api_used: apiUrl
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Si pas d'URL audio directe, mais un ID de tâche pour polling
    if (taskId) {
      console.log(`🔄 Début du polling avec taskId: ${taskId}`);
      
      // Polling simple - 5 tentatives maximum
      for (let attempt = 1; attempt <= 5; attempt++) {
        console.log(`🔄 Polling ${attempt}/5 pour taskId: ${taskId}`);
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 secondes d'attente
        
        try {
          const statusUrl = apiUrl.includes('studio-api.suno.ai') 
            ? `https://studio-api.suno.ai/api/feed/?ids=${taskId}`
            : `https://api.sunoai.ai/api/v1/gateway/query?ids=${taskId}`;
            
          const statusResponse = await fetch(statusUrl, {
            method: 'GET',
            headers: apiHeaders
          });

          if (statusResponse.ok) {
            const statusText = await statusResponse.text();
            const statusData = JSON.parse(statusText);
            
            // Recherche de l'URL audio dans la réponse
            let foundAudioUrl = null;
            if (Array.isArray(statusData)) {
              const result = statusData.find(item => item.id === taskId);
              if (result && result.audio_url) {
                foundAudioUrl = result.audio_url;
              }
            } else if (statusData.audio_url) {
              foundAudioUrl = statusData.audio_url;
            }
            
            if (foundAudioUrl) {
              console.log('✅ Génération Suno réussie après polling!');
              return new Response(
                JSON.stringify({ 
                  audioUrl: foundAudioUrl,
                  status: 'success',
                  taskId,
                  rang,
                  style,
                  duration,
                  attempts: attempt,
                  api_used: apiUrl
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

    // Aucune URL audio trouvée
    return new Response(
      JSON.stringify({ 
        error: 'Aucune URL audio générée',
        status: 'error',
        error_code: 500,
        details: 'La génération n\'a pas produit d\'URL audio valide',
        taskId,
        api_used: apiUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );

  } catch (error) {
    console.error('❌ Erreur génération chanson Suno:', error);
    
    let errorMessage = 'Erreur interne du serveur';
    let errorCode = 500;
    
    if (error.message?.includes('fetch')) {
      errorMessage = 'Impossible de se connecter à l\'API Suno - Vérifiez votre connexion';
      errorCode = 503;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Délai d\'attente dépassé lors de la génération';
      errorCode = 408;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        status: 'error',
        error_code: errorCode,
        details: 'Erreur lors de la génération avec Suno API'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errorCode
      }
    );
  }
}
