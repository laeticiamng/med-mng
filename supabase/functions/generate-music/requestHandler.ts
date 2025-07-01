
import { corsHeaders } from './constants.ts';
import { SunoApiClient } from './sunoClient.ts';

export async function handleMusicGeneration(req: Request) {
  console.log('🎵 Début génération musicale avec SunoAI API');
  
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

    console.log('✅ Clé API SunoAI configurée, longueur:', SUNO_API_KEY.length);
    const client = new SunoApiClient(SUNO_API_KEY);
    
    // Format correct pour SunoAI API
    const sunoPayload = {
      custom_mode: false,
      input: {
        lyrics: lyrics,
        tags: style,
        title: `Rang ${rang} - ${style}`,
        mv: "chirp-v3-5"
      }
    };

    console.log('🚀 Envoi vers SunoAI API:', JSON.stringify(sunoPayload, null, 2));

    // Utiliser l'endpoint correct de SunoAI API
    const generateResponse = await client.post<any>(
      'https://api.sunoaiapi.com/api/v1/gateway/generate/music',
      sunoPayload
    );

    console.log('📊 Réponse génération complète:', JSON.stringify(generateResponse, null, 2));

    // Vérifier si la réponse contient directement les données audio
    if (generateResponse.data && generateResponse.data.length > 0) {
      const audioData = generateResponse.data[0];
      const audioUrl = audioData.audio_url || audioData.stream_url || audioData.url;
      
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

    // Si pas de données directes, vérifier s'il y a un task_id pour le polling
    const taskId = generateResponse.task_id || generateResponse.data?.task_id || generateResponse.id;
    
    if (!taskId) {
      console.error('❌ Pas de task_id dans la réponse:', generateResponse);
      return new Response(
        JSON.stringify({ 
          error: 'Réponse API SunoAI invalide - pas de task_id',
          status: 'error',
          error_code: 500,
          details: generateResponse
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log(`🔄 Début du polling avec taskId: ${taskId}`);
    
    // Polling optimisé pour SunoAI API
    const maxAttempts = 15;
    const pollInterval = 5000; // 5 secondes
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Polling ${attempt}/${maxAttempts} pour taskId: ${taskId}`);
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      try {
        const statusResponse = await client.get<any>(
          'https://api.sunoaiapi.com/api/v1/gateway/query',
          { ids: taskId }
        );

        console.log(`📥 Réponse statut tentative ${attempt}:`, JSON.stringify(statusResponse, null, 2));

        if (statusResponse.data && statusResponse.data.length > 0) {
          const result = statusResponse.data[0];
          
          // Vérifier les statuts de succès pour SunoAI API
          if (result.status === 'complete' && result.audio_url) {
            console.log('✅ Génération SunoAI réussie!');
            
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
          
          if (result.status === 'processing' || result.status === 'queued' || result.status === 'running') {
            console.log(`⏳ En cours SunoAI: ${result.status} (tentative ${attempt})`);
            continue;
          }
          
          if (result.status === 'error' || result.status === 'failed') {
            const errorMsg = result.error_message || result.message || 'Erreur SunoAI inconnue';
            console.error(`❌ Génération SunoAI échouée: ${errorMsg}`);
            throw new Error(`Génération SunoAI échouée: ${errorMsg}`);
          }
          
          console.log(`ℹ️ Statut SunoAI inconnu: ${result.status}, continuation...`);
        } else {
          console.log(`⚠️ Pas de données dans la réponse de polling SunoAI ${attempt}`);
        }
        
      } catch (pollError) {
        console.error(`❌ Erreur polling SunoAI tentative ${attempt}:`, pollError);
        if (attempt === maxAttempts) {
          throw new Error(`Échec du polling SunoAI après ${maxAttempts} tentatives: ${pollError.message}`);
        }
      }
    }

    // Timeout après toutes les tentatives
    console.log('⏰ Timeout atteint pour la génération SunoAI');
    return new Response(
      JSON.stringify({ 
        status: 'timeout',
        message: `La génération SunoAI prend plus de temps que prévu (${maxAttempts * pollInterval / 1000}s)`,
        taskId,
        suggestion: 'Vous pouvez réessayer dans quelques minutes'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 202
      }
    );

  } catch (error) {
    console.error('❌ Erreur génération chanson SunoAI:', error);
    
    let errorMessage = 'Erreur interne du serveur SunoAI';
    let errorCode = 500;
    
    if (error.message?.includes('401')) {
      errorMessage = 'Clé API SunoAI invalide ou expirée';
      errorCode = 401;
    } else if (error.message?.includes('429')) {
      errorMessage = 'Limite de taux API SunoAI atteinte, réessayez plus tard';
      errorCode = 429;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Délai d\'attente dépassé lors de la génération SunoAI';
      errorCode = 408;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        status: 'error',
        error_code: errorCode,
        details: 'Erreur lors de la génération avec SunoAI API'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errorCode
      }
    );
  }
}
