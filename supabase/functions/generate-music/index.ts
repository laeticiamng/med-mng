
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MusicGenerator } from './musicGeneration.ts';

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

    // Récupération de la clé API depuis les secrets Supabase
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    if (!SUNO_API_KEY) {
      console.error('❌ SUNO_API_KEY manquante dans les secrets Supabase');
      throw new Error('Clé API Suno non configurée dans les secrets Supabase. Veuillez ajouter SUNO_API_KEY dans les paramètres des fonctions.');
    }

    console.log('🔑 SUNO_API_KEY trouvée, longueur:', SUNO_API_KEY.length);
    console.log('🔑 Premiers caractères de la clé:', SUNO_API_KEY.substring(0, 8) + '...');

    // Test simple de l'API Suno avec différents endpoints possibles
    console.log('🔍 Test de connectivité API Suno...');
    
    const testEndpoints = [
      'https://api.suno.ai/v1/generate',
      'https://api.suno.ai/generate',
      'https://api.suno.ai/v1/songs',
      'https://api.suno.ai/songs',
      'https://api.suno.ai/health',
      'https://api.suno.ai/',
      'https://suno.ai/api/v1/generate',
      'https://suno.ai/api/generate'
    ];

    let workingEndpoint = null;
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`🔍 Test endpoint: ${endpoint}`);
        const testResponse = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUNO_API_KEY}`,
            'Accept': 'application/json',
            'User-Agent': 'Supabase-Edge-Function'
          }
        });
        
        console.log(`📊 ${endpoint} - Status: ${testResponse.status} ${testResponse.statusText}`);
        
        if (testResponse.status < 500) { // Accepter même les 4xx car cela signifie que l'endpoint existe
          workingEndpoint = endpoint;
          console.log(`✅ Endpoint trouvé: ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Erreur: ${error.message}`);
      }
    }

    if (!workingEndpoint) {
      throw new Error('❌ Aucun endpoint Suno valide trouvé. Vérifiez l\'URL de base de l\'API Suno.');
    }

    // Pour l'instant, retourner une réponse de test avec des informations de diagnostic
    const diagnosticInfo = {
      audioUrl: "https://example.com/test-audio.mp3", // URL de test
      rang,
      style,
      duration: duration,
      durationFormatted: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      generationTime: 5,
      language: language,
      status: 'test_success',
      message: `🔍 Test de diagnostic pour le Rang ${rang}`,
      lyrics_integrated: true,
      vocals_included: true,
      lyrics_length: lyrics.length,
      note: `🔍 Mode diagnostic - Endpoint trouvé: ${workingEndpoint}`,
      api_key_length: SUNO_API_KEY.length,
      api_key_prefix: SUNO_API_KEY.substring(0, 8) + '...',
      tested_endpoints: testEndpoints.length,
      working_endpoint: workingEndpoint
    };

    console.log('🔍 Retour d\'informations de diagnostic:', diagnosticInfo);

    return new Response(
      JSON.stringify(diagnosticInfo),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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
        details: '🔍 Diagnostic de l\'API Suno en cours',
        debug: {
          error_type: error.name,
          error_message: error.message,
          timestamp: new Date().toISOString(),
          api_tested: 'Différents endpoints Suno testés',
          suggestion: 'Vérifiez les logs pour plus de détails sur les endpoints testés'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: httpStatus
      }
    );
  }
});
