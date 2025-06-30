
import { corsHeaders } from './constants.ts';
import { SunoApiClient } from './sunoClient.ts';

export async function handleMusicGeneration(req: Request) {
  console.log('🎵 Début génération musicale');
  
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
          error: 'Configuration API manquante',
          status: 'error',
          error_code: 500
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const client = new SunoApiClient(SUNO_API_KEY);
    
    // Préparer les données pour l'API Suno avec l'endpoint corrigé
    const sunoPayload = {
      prompt: lyrics,
      style: style,
      title: `Rang ${rang} - ${style}`,
      model: 'v3.5',
      instrumental: false,
      wait_audio: false
    };

    console.log('🚀 Envoi vers API Suno (endpoint corrigé):', JSON.stringify(sunoPayload, null, 2));

    // Utiliser l'endpoint correct de l'API Suno
    const generateResponse = await client.post<any>(
      'https://api.sunoaiapi.com/api/v1/gateway/generate/music',
      sunoPayload
    );

    console.log('📊 Réponse génération:', JSON.stringify(generateResponse, null, 2));

    // Vérifier si la réponse contient directement les données audio
    if (generateResponse.data && generateResponse.data.length > 0) {
      const audioData = generateResponse.data[0];
      const audioUrl = audioData.audio_url || audioData.stream_url || audioData.url;
      
      if (audioUrl) {
        console.log(`🎧 URL AUDIO DIRECTE: ${audioUrl}`);
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
    const taskId = generateResponse.task_id || generateResponse.data?.task_id;
    if (!taskId) {
      throw new Error('Pas de task_id ni de données audio dans la réponse API');
    }

    console.log(`🔄 Polling taskId: ${taskId}`);
    
    // Polling simplifié
    const maxAttempts = 20;
    const pollInterval = 3000; // 3 secondes
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Polling ${attempt}/${maxAttempts}`);
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      try {
        const statusResponse = await client.get<any>(
          'https://api.sunoaiapi.com/api/v1/gateway/query',
          { ids: taskId }
        );

        console.log(`📥 Réponse statut tentative ${attempt}:`, JSON.stringify(statusResponse, null, 2));

        if (statusResponse.data && statusResponse.data.length > 0) {
          const result = statusResponse.data[0];
          
          if (result.status === 'complete' && result.audio_url) {
            console.log('✅ Génération réussie!');
            
            return new Response(
              JSON.stringify({ 
                audioUrl: result.audio_url,
                status: 'success',
                taskId,
                sunoId: result.id,
                title: result.title,
                duration: result.duration
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              }
            );
          }
          
          if (result.status === 'processing' || result.status === 'queued') {
            console.log(`⏳ En cours: ${result.status}`);
            continue;
          }
          
          if (result.status === 'error' || result.status === 'failed') {
            throw new Error(`Génération échouée: ${result.error_message || 'Erreur inconnue'}`);
          }
        }
        
      } catch (pollError) {
        console.error(`❌ Erreur polling tentative ${attempt}:`, pollError);
        if (attempt === maxAttempts) {
          throw pollError;
        }
      }
    }

    // Timeout
    return new Response(
      JSON.stringify({ 
        status: 'timeout',
        message: 'La génération prend plus de temps que prévu',
        taskId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 202
      }
    );

  } catch (error) {
    console.error('❌ Erreur génération chanson Suno:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur',
        status: 'error',
        error_code: 500,
        details: 'Erreur lors de la génération avec Suno API'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
}
