
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

    console.log('✅ Clé API Suno configurée, longueur:', SUNO_API_KEY.length);
    
    // Configuration API optimisée
    const apiHeaders = {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Payload optimisé selon la documentation
    const sunoPayload = {
      prompt: lyrics,
      tags: style,
      title: `Rang ${rang} - ${style}`,
      make_instrumental: false,
      wait_audio: false
    };

    console.log('🚀 Envoi vers Suno API:', JSON.stringify(sunoPayload, null, 2));

    // Appel API principal
    const generateResponse = await fetch(
      'https://suno-api.netfly.app/api/generate',
      {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(sunoPayload)
      }
    );

    console.log('📊 Statut de réponse:', generateResponse.status);
    const responseText = await generateResponse.text();
    console.log('📥 Réponse brute:', responseText);

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
          details: responseText
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: generateResponse.status
        }
      );
    }

    let generateData;
    try {
      generateData = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Erreur parsing JSON:', e);
      return new Response(
        JSON.stringify({ 
          error: 'Réponse API invalide',
          status: 'error',
          error_code: 500,
          details: responseText
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log('📥 Réponse génération complète:', JSON.stringify(generateData, null, 2));

    // Vérifier si la réponse contient directement les données audio
    if (generateData && Array.isArray(generateData) && generateData.length > 0) {
      const audioData = generateData[0];
      const audioUrl = audioData.audio_url || audioData.url;
      
      if (audioUrl) {
        console.log(`🎧 URL AUDIO DIRECTE TROUVÉE: ${audioUrl}`);
        return new Response(
          JSON.stringify({ 
            audioUrl,
            status: 'success',
            sunoId: audioData.id,
            title: audioData.title,
            duration: audioData.duration
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    // Si pas de données directes, vérifier s'il y a un ID pour le polling
    const taskId = generateData?.id || generateData?.[0]?.id;
    
    if (!taskId) {
      console.error('❌ Pas d\'ID dans la réponse:', generateData);
      return new Response(
        JSON.stringify({ 
          error: 'Réponse API Suno invalide - pas d\'ID de tâche',
          status: 'error',
          error_code: 500,
          details: generateData
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log(`🔄 Début du polling avec taskId: ${taskId}`);
    
    // Polling optimisé
    const maxAttempts = 15;
    const pollInterval = 3000; // 3 secondes
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Polling ${attempt}/${maxAttempts} pour taskId: ${taskId}`);
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      try {
        const statusResponse = await fetch(
          `https://suno-api.netfly.app/api/get?ids=${taskId}`,
          { 
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${SUNO_API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        if (!statusResponse.ok) {
          console.error(`❌ Erreur polling ${attempt}:`, statusResponse.status);
          continue;
        }

        const statusText = await statusResponse.text();
        const statusData = JSON.parse(statusText);
        console.log(`📥 Réponse statut tentative ${attempt}:`, JSON.stringify(statusData, null, 2));

        if (statusData && Array.isArray(statusData) && statusData.length > 0) {
          const result = statusData[0];
          
          // Vérifier les statuts de succès
          if (result.status === 'complete' && result.audio_url) {
            console.log('✅ Génération Suno réussie!');
            
            return new Response(
              JSON.stringify({ 
                audioUrl: result.audio_url,
                status: 'success',
                taskId,
                sunoId: result.id,
                title: result.title,
                duration: result.duration,
                attempt: attempt
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              }
            );
          }
          
          if (result.status === 'streaming' || result.status === 'submitted' || result.status === 'queued') {
            console.log(`⏳ En cours: ${result.status} (tentative ${attempt})`);
            continue;
          }
          
          if (result.status === 'error' || result.status === 'failed') {
            const errorMsg = result.error_message || result.message || 'Erreur Suno inconnue';
            console.error(`❌ Génération échouée: ${errorMsg}`);
            throw new Error(`Génération échouée: ${errorMsg}`);
          }
          
          console.log(`ℹ️ Statut inconnu: ${result.status}, continuation...`);
        } else {
          console.log(`⚠️ Pas de données dans la réponse de polling ${attempt}`);
        }
        
      } catch (pollError) {
        console.error(`❌ Erreur polling tentative ${attempt}:`, pollError);
        if (attempt === maxAttempts) {
          throw new Error(`Échec du polling après ${maxAttempts} tentatives: ${pollError.message}`);
        }
      }
    }

    // Timeout après toutes les tentatives
    console.log('⏰ Timeout atteint pour la génération');
    return new Response(
      JSON.stringify({ 
        status: 'timeout',
        message: `La génération prend plus de temps que prévu (${maxAttempts * pollInterval / 1000}s)`,
        taskId,
        suggestion: 'Vous pouvez réessayer dans quelques minutes'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 202
      }
    );

  } catch (error) {
    console.error('❌ Erreur génération chanson Suno:', error);
    
    let errorMessage = 'Erreur interne du serveur';
    let errorCode = 500;
    
    if (error.message?.includes('401')) {
      errorMessage = 'Clé API Suno invalide ou expirée';
      errorCode = 401;
    } else if (error.message?.includes('429')) {
      errorMessage = 'Limite de requêtes atteinte - Réessayez plus tard';
      errorCode = 429;
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
