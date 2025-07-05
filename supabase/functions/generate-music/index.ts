import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎵 Début génération musicale SunoAPI');
    
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const body = await req.json();
    console.log('📥 Requête reçue:', JSON.stringify(body, null, 2));

    const { lyrics, style, rang, itemCode, duration, language = 'fr' } = body;

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
      console.error('❌ SUNO_API_KEY manquante');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration requise: Clé API Suno manquante',
          status: 'error',
          error_code: 500
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Créer un titre unique basé sur l'item et le style
    const uniqueTitle = itemCode 
      ? `${itemCode} ${rang} - ${style}` 
      : `EDN ${rang} - ${style}`;

    // Limiter les longueurs selon la documentation SunoAPI
    const truncatedTitle = uniqueTitle.substring(0, 80);
    const truncatedStyle = style.substring(0, 200);
    const truncatedPrompt = lyrics.substring(0, 3000);

    // Payload pour l'API SunoAPI officielle
    const sunoPayload = {
      customMode: true,
      instrumental: false,
      prompt: truncatedPrompt,
      style: truncatedStyle,
      title: truncatedTitle,
      model_name: "chirp-v3-5"
    };

    console.log('🚀 Génération avec SunoAPI officielle');
    console.log('📤 Payload:', JSON.stringify(sunoPayload, null, 2));

    // Headers pour l'API SunoAPI
    const apiHeaders = {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Endpoint officiel SunoAPI
    const apiUrl = 'https://api.sunoapi.org/api/v1/generate';
    
    const generateResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify(sunoPayload)
    });

    console.log('📊 Statut réponse:', generateResponse.status);
    const responseText = await generateResponse.text();
    console.log('📥 Réponse brute:', responseText);

    // Gestion des erreurs spécifiques selon la documentation
    if (generateResponse.status === 401) {
      return new Response(
        JSON.stringify({ 
          error: 'Clé API SunoAPI invalide - Vérifiez votre clé sur https://sunoapi.org/api-key',
          status: 'error',
          error_code: 401
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    if (generateResponse.status === 429) {
      return new Response(
        JSON.stringify({ 
          error: 'Crédits SunoAPI insuffisants - Rechargez vos crédits',
          status: 'error',
          error_code: 429
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      );
    }

    if (generateResponse.status === 413) {
      return new Response(
        JSON.stringify({ 
          error: 'Prompt ou style trop long - Respectez les limites de caractères',
          status: 'error',
          error_code: 413
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 413
        }
      );
    }

    if (!generateResponse.ok) {
      console.error('❌ Erreur API SunoAPI:', generateResponse.status, responseText);
      return new Response(
        JSON.stringify({ 
          error: `Erreur SunoAPI (${generateResponse.status}): ${responseText}`,
          status: 'error',
          error_code: generateResponse.status
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Parser la réponse JSON
    let generateData;
    try {
      generateData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Réponse API invalide',
          status: 'error',
          error_code: 500
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log('✅ Données parsées:', JSON.stringify(generateData, null, 2));

    // Vérifier le succès de la génération selon la structure SunoAPI
    if (generateData.code === 200 && generateData.data && generateData.data.task_id) {
      const taskId = generateData.data.task_id;
      console.log(`🔄 Tâche créée avec succès, task_id: ${taskId}`);
      
      // Commencer le polling pour récupérer l'audio généré
      return await pollForAudio(taskId, SUNO_API_KEY, rang, style, truncatedTitle);
    }

    // Si pas de task_id, erreur
    return new Response(
      JSON.stringify({ 
        error: 'Échec de création de la tâche de génération',
        status: 'error',
        error_code: 500,
        details: generateData
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
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function pollForAudio(taskId: string, apiKey: string, rang: string, style: string, title: string) {
  console.log(`🔄 Polling pour task_id: ${taskId}`);
  
  const maxAttempts = 20; // 2 minutes max (6s * 20)
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Tentative ${attempt}/${maxAttempts}`);
    
    // Attendre avant de vérifier le statut
    await new Promise(resolve => setTimeout(resolve, 6000)); // 6 secondes
    
    try {
      // Utiliser l'endpoint de détails de SunoAPI
      const detailsUrl = `https://api.sunoapi.org/api/v1/music/${taskId}`;
      const detailsResponse = await fetch(detailsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        console.log(`📥 Détails tentative ${attempt}:`, JSON.stringify(detailsData, null, 2));
        
        if (detailsData.code === 200 && detailsData.data && Array.isArray(detailsData.data)) {
          // Chercher une piste avec audio_url
          const completedTrack = detailsData.data.find(track => 
            track.audio_url && track.audio_url.trim() !== ''
          );
          
          if (completedTrack) {
            console.log(`✅ Audio généré avec succès après ${attempt} tentatives!`);
            console.log(`🎧 URL audio: ${completedTrack.audio_url}`);
            
            return new Response(
              JSON.stringify({ 
                audioUrl: completedTrack.audio_url,
                streamUrl: completedTrack.stream_audio_url || completedTrack.audio_url,
                imageUrl: completedTrack.image_url,
                status: 'success',
                taskId: taskId,
                trackId: completedTrack.id,
                rang: rang,
                style: style,
                title: title,
                duration: completedTrack.duration,
                provider: 'sunoapi',
                attempts: attempt,
                model: completedTrack.model_name || 'chirp-v3-5'
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              }
            );
          } else {
            console.log(`⏳ Audio pas encore prêt (tentative ${attempt})`);
          }
        }
      } else {
        console.log(`⚠️ Erreur status API tentative ${attempt}:`, detailsResponse.status);
      }
    } catch (pollError) {
      console.log(`⚠️ Erreur polling tentative ${attempt}:`, pollError.message);
    }
  }

  // Timeout après toutes les tentatives
  console.log('⏰ Timeout - génération trop longue');
  return new Response(
    JSON.stringify({ 
      error: 'Délai d\'attente dépassé - La génération prend plus de temps que prévu',
      status: 'error',
      error_code: 408,
      taskId: taskId,
      message: 'Vérifiez le statut de votre tâche plus tard'
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 408
    }
  );
}