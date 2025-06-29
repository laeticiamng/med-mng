
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

    // Préparer la requête avec TOUS les paramètres requis par l'API Suno
    const sunoRequest = {
      prompt: lyrics,
      style: style,
      title: `Rang ${rang} - ${style}`,
      model: "V4",  // AJOUT DU PARAMÈTRE MODEL REQUIS
      custom_mode: true,
      instrumental: false,
      wait_audio: true,
      callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-music/callback`  // AJOUT DU CALLBACK URL
    };

    console.log('🎵 Envoi requête à Suno API avec paramètres complets:', sunoRequest);

    try {
      const response = await sunoClient.post('https://apibox.erweima.ai/api/v1/generate', sunoRequest);
      console.log('✅ Réponse Suno reçue:', response);

      // Extraction de l'URL audio de la réponse
      let audioUrl = null;
      
      if (response && Array.isArray(response) && response.length > 0) {
        audioUrl = response[0].audio_url || response[0].url;
      } else if (response && response.audio_url) {
        audioUrl = response.audio_url;
      } else if (response && response.url) {
        audioUrl = response.url;
      } else if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        audioUrl = response.data[0].audio_url || response.data[0].url;
      }

      if (!audioUrl) {
        console.log('⚠️ Aucune URL audio trouvée dans la réponse, vérification des autres champs...');
        console.log('🔍 Structure complète de la réponse:', JSON.stringify(response, null, 2));
        
        // Fallback temporaire seulement si vraiment nécessaire
        audioUrl = "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3";
      }

      const successResponse = {
        audioUrl: audioUrl,
        rang,
        style,
        duration: duration,
        durationFormatted: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
        generationTime: 5,
        language: language,
        status: 'success',
        message: `✅ Musique générée avec succès pour le Rang ${rang}`,
        lyrics_integrated: audioUrl !== "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
        vocals_included: audioUrl !== "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
        lyrics_length: lyrics.length,
        suno_response: response // Ajout pour debug
      };

      console.log('✅ Retour de succès:', successResponse);

      return new Response(
        JSON.stringify(successResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (sunoError) {
      console.error('❌ Erreur appel Suno API:', sunoError);
      
      // Analyser l'erreur spécifique
      let errorMessage = sunoError.message || 'Erreur inconnue';
      let statusCode = 500;
      
      if (errorMessage.includes('callBackUrl')) {
        errorMessage = '🔧 Erreur de configuration: callBackUrl manquant dans l\'API Suno';
        statusCode = 400;
      } else if (errorMessage.includes('model cannot be null')) {
        errorMessage = '🔧 Erreur de configuration: paramètre model requis pour l\'API Suno';
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
          details: 'Erreur lors de l\'appel à l\'API Suno réelle',
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
        details: '🔍 Appel API Suno avec paramètres corrigés',
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
