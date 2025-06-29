
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SunoApiClient } from './sunoClient.ts';

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

    const sunoClient = new SunoApiClient(SUNO_API_KEY);

    // Étape 1: Créer la tâche de génération
    const sunoRequest = {
      prompt: lyrics,
      style: style,
      title: `Rang ${rang} - ${style}`,
      model: "V4",
      custom_mode: true,
      instrumental: false,
      wait_audio: false, // Ne pas attendre dans la requête initiale
      callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-music/callback`
    };

    console.log('🎵 Envoi requête de génération à Suno API:', sunoRequest);

    try {
      const generateResponse = await sunoClient.post('https://apibox.erweima.ai/api/v1/generate', sunoRequest);
      console.log('✅ Réponse génération Suno reçue:', generateResponse);

      if (!generateResponse || !generateResponse.data || !generateResponse.data.taskId) {
        throw new Error('Réponse de génération invalide: taskId manquant');
      }

      const taskId = generateResponse.data.taskId;
      console.log('🎵 TaskId reçu:', taskId);

      // Étape 2: Attendre et récupérer l'audio généré avec un délai optimisé
      console.log('⏳ Attente de la génération audio (délai optimisé)...');
      
      let audioUrl = null;
      let attempts = 0;
      const maxAttempts = 12; // 12 tentatives = 2 minutes max
      const waitTime = 10000; // 10 secondes entre les tentatives
      
      while (!audioUrl && attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 Tentative ${attempts}/${maxAttempts} de récupération de l'audio...`);
        
        // Attendre entre les vérifications
        if (attempts > 1) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        try {
          const audioResponse = await sunoClient.get(`https://apibox.erweima.ai/api/v1/audio/${taskId}`);
          console.log(`📥 Réponse audio tentative ${attempts}:`, audioResponse);
          
          if (audioResponse && audioResponse.data && audioResponse.data.audio_url) {
            audioUrl = audioResponse.data.audio_url;
            console.log('🎵 URL audio trouvée:', audioUrl);
            break;
          }
          
          // Vérifier le statut de la tâche
          if (audioResponse && audioResponse.data && audioResponse.data.status) {
            console.log(`📊 Statut de la tâche: ${audioResponse.data.status}`);
            
            if (audioResponse.data.status === 'failed' || audioResponse.data.status === 'error') {
              throw new Error(`Génération échouée: ${audioResponse.data.error || 'Erreur inconnue'}`);
            }
            
            // Si la tâche est en cours, réduire le temps d'attente
            if (audioResponse.data.status === 'processing' || audioResponse.data.status === 'pending') {
              console.log('🔄 Tâche en cours de traitement, attente réduite...');
            }
          }
          
        } catch (audioError) {
          console.warn(`⚠️ Erreur lors de la vérification audio (tentative ${attempts}):`, audioError.message);
          
          // Si c'est une erreur 404, la tâche n'est peut-être pas encore prête
          if (audioError.message?.includes('404') || audioError.message?.includes('Not Found')) {
            console.log('📝 Task pas encore prête (404), continue...');
            continue;
          }
          
          // Pour les autres erreurs, continuer mais avec limite
          if (attempts < maxAttempts) {
            continue;
          } else {
            throw audioError;
          }
        }
      }

      if (!audioUrl) {
        console.warn('⚠️ Timeout: Génération Suno prend plus de 2 minutes');
        
        // Retourner une réponse avec le taskId pour permettre une vérification ultérieure
        const timeoutResponse = {
          status: 'timeout',
          message: 'La génération prend plus de temps que prévu. Veuillez réessayer dans quelques minutes.',
          taskId: taskId,
          rang,
          style,
          duration: duration,
          attempts: attempts,
          timeoutAfter: '2 minutes'
        };

        console.log('⏰ Retour de timeout avec taskId:', timeoutResponse);

        return new Response(
          JSON.stringify(timeoutResponse),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 408 // Request Timeout
          }
        );
      }

      const successResponse = {
        audioUrl: audioUrl,
        rang,
        style,
        duration: duration,
        durationFormatted: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
        generationTime: attempts * (waitTime / 1000), // Temps réel d'attente en secondes
        language: language,
        status: 'success',
        message: `✅ Musique générée avec succès pour le Rang ${rang}`,
        lyrics_integrated: true,
        vocals_included: true,
        lyrics_length: lyrics.length,
        taskId: taskId,
        attempts: attempts
      };

      console.log('✅ Retour de succès avec audio réel:', successResponse);

      return new Response(
        JSON.stringify(successResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (sunoError) {
      console.error('❌ Erreur appel Suno API:', sunoError);
      
      let errorMessage = sunoError.message || 'Erreur inconnue';
      let statusCode = 500;
      
      if (errorMessage.includes('taskId manquant')) {
        errorMessage = '🔧 Erreur Suno: Réponse de génération invalide';
        statusCode = 400;
      } else if (errorMessage.includes('Génération échouée')) {
        errorMessage = '🚫 Suno AI: Génération de musique échouée';
        statusCode = 400;
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = '🔑 Clé API Suno invalide ou expirée';
        statusCode = 401;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: 'error',
          error_code: statusCode,
          details: 'Erreur lors de la génération avec Suno API',
          debug: {
            error_type: sunoError.name,
            error_message: sunoError.message,
            timestamp: new Date().toISOString()
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: statusCode
        }
      );
    }

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
      userMessage = 'Génération Suno trop longue (>2min). Réessayez ou choisissez un style plus simple.';
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
        details: '🔍 Génération Suno optimisée avec délai de 2 minutes maximum',
        debug: {
          error_type: error.name,
          error_message: error.message,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: httpStatus
      }
    );
  }
});
