
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
    
    // Préparer les données pour l'API Suno
    const sunoPayload = {
      prompt: lyrics,
      style: style,
      title: `Rang ${rang} - ${style}`,
      model: 'V4',
      instrumental: false,
      customMode: true,
      callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-music/callback`
    };

    console.log('🚀 Envoi vers API Suno:', JSON.stringify(sunoPayload, null, 2));

    // Envoyer la requête de génération
    const generateResponse = await client.post<any>(
      'https://apibox.erweima.ai/api/v1/generate/music-generation',
      sunoPayload
    );

    console.log('📊 Réponse génération:', JSON.stringify(generateResponse, null, 2));

    if (generateResponse.code !== 200) {
      throw new Error(`Erreur API Suno: ${generateResponse.msg || 'Erreur inconnue'}`);
    }

    const taskId = generateResponse.data?.taskId;
    if (!taskId) {
      throw new Error('TaskId manquant dans la réponse API');
    }

    console.log(`🔄 Polling taskId: ${taskId}`);
    
    // Polling avec logique améliorée
    const maxAttempts = 24;
    const pollInterval = 2000; // 2 secondes
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 RAPIDE ⚡ Tentative ${attempt}/${maxAttempts} (${Math.round(attempt/maxAttempts*100)}%) - Interval: ${pollInterval}ms`);
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      try {
        const statusResponse = await client.get<any>(
          'https://apibox.erweima.ai/api/v1/generate/record-info',
          { taskId }
        );

        console.log(`📥 Réponse statut tentative ${attempt}:`, JSON.stringify(statusResponse, null, 2));

        if (statusResponse.code !== 200) {
          console.warn(`⚠️ Erreur statut API (tentative ${attempt}):`, statusResponse.msg);
          continue;
        }

        const status = statusResponse.data?.status;
        console.log(`📊 Statut: ${status}`);

        // Gérer les différents statuts
        if (status === 'TEXT_SUCCESS' || status === 'SUCCESS') {
          console.log('✅ Génération réussie!');
          
          const sunoData = statusResponse.data?.response?.sunoData;
          if (!sunoData || sunoData.length === 0) {
            throw new Error('Aucune donnée audio dans la réponse');
          }

          // Prendre le premier élément audio
          const audioData = sunoData[0];
          const audioUrl = audioData.streamAudioUrl || audioData.audioUrl || audioData.sourceStreamAudioUrl;
          
          if (!audioUrl) {
            throw new Error('Aucune URL audio trouvée dans la réponse');
          }

          console.log(`🎧 URL AUDIO FINALE: ${audioUrl}`);

          return new Response(
            JSON.stringify({ 
              audioUrl,
              status: 'success',
              taskId,
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
        
        if (status === 'PROCESSING' || status === 'PENDING' || status === 'QUEUED') {
          console.log(`⏳ En cours de traitement... (${status})`);
          continue;
        }
        
        if (status === 'FAILED' || status === 'ERROR') {
          const errorMsg = statusResponse.data?.errorMessage || 'Génération échouée';
          throw new Error(`Échec de génération: ${errorMsg}`);
        }

        // Statut inconnu mais pas d'erreur explicite
        console.warn(`⚠️ Statut inconnu: ${status}, on continue...`);
        
      } catch (pollError) {
        console.error(`❌ Erreur polling tentative ${attempt}:`, pollError);
        if (attempt === maxAttempts) {
          throw pollError;
        }
        continue;
      }
    }

    // Si on arrive ici, c'est un timeout
    console.log('⏰ Timeout après 24 tentatives optimisées');
    
    return new Response(
      JSON.stringify({ 
        status: 'timeout',
        message: 'La génération prend plus de temps que prévu. Veuillez réessayer dans quelques minutes.',
        taskId,
        rang,
        style,
        duration,
        attempts: maxAttempts,
        timeoutAfter: '3 minutes',
        progress: 100
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 202
      }
    );

  } catch (error) {
    console.error('❌ Erreur génération chanson Suno:', error);
    
    let errorMessage = 'Erreur interne du serveur';
    let statusCode = 500;
    
    if (error.message?.includes('taskId')) {
      errorMessage = 'Erreur de communication avec l\'API Suno';
      statusCode = 502;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Timeout de génération - Réessayez dans quelques minutes';
      statusCode = 408;
    } else if (error.message?.includes('API')) {
      errorMessage = error.message;
      statusCode = 502;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        status: 'error',
        error_code: statusCode,
        details: 'Erreur lors de la génération avec Suno API',
        debug: {
          error_type: error.name,
          error_message: error.message,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode
      }
    );
  }
}
