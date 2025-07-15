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
    console.log('🎵 Début génération musicale Suno API');
    
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

    // Limiter les longueurs selon la documentation Suno API
    const truncatedTitle = uniqueTitle.substring(0, 80);
    const truncatedStyle = style.substring(0, 200); // V3.5/V4 limit
    const truncatedPrompt = lyrics.substring(0, 3000); // V3.5/V4 limit pour mode custom

    // Payload selon l'API Suno officielle
    const sunoPayload = {
      prompt: truncatedPrompt,
      style: truncatedStyle,
      title: truncatedTitle,
      customMode: true,
      instrumental: false,
      model: "V4", // Utiliser V4 pour la meilleure qualité
      callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-music-callback`
    };

    console.log('🚀 Génération avec API Suno officielle');
    console.log('📤 Payload:', JSON.stringify(sunoPayload, null, 2));

    // Headers pour l'API Suno officielle
    const apiHeaders = {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json'
    };

    // Endpoint API Suno officielle selon la documentation
    const apiUrl = 'https://api.sunoapi.org/api/v1/generate';
    
    const generateResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify(sunoPayload)
    });

    console.log('📊 Statut réponse:', generateResponse.status);
    const responseText = await generateResponse.text();
    console.log('📥 Réponse brute:', responseText);

    // Gestion des erreurs selon la documentation Suno API
    if (generateResponse.status === 401) {
      return new Response(
        JSON.stringify({ 
          error: 'Clé API Suno invalide - Vérifiez votre clé sur https://sunoapi.org/api-key',
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
          error: 'Crédits Suno insuffisants - Rechargez vos crédits',
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
      console.error('❌ Erreur API Suno:', generateResponse.status, responseText);
      return new Response(
        JSON.stringify({ 
          error: `Erreur Suno API (${generateResponse.status}): ${responseText}`,
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

    // Vérifier le succès selon la structure API Suno officielle
    if (generateData.code === 200 && generateData.data && generateData.data.taskId) {
      const taskId = generateData.data.taskId;
      console.log(`🔄 Tâche créée avec succès, ID: ${taskId}`);
      
      // Commencer le polling pour récupérer l'audio généré
      return await pollForAudioCompletion(taskId, SUNO_API_KEY, rang, style, truncatedTitle);
    }

    // Si échec de création de tâche
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

async function pollForAudioCompletion(taskId: string, apiKey: string, rang: string, style: string, title: string) {
  console.log(`🔄 Polling pour la tâche: ${taskId}`);
  
  const maxAttempts = 40; // 4 minutes max (6s * 40)
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Tentative ${attempt}/${maxAttempts} pour tâche ${taskId}`);
    
    // Attendre avant de vérifier le statut (première tentative immédiate)
    if (attempt > 1) {
      await new Promise(resolve => setTimeout(resolve, 6000)); // 6 secondes
    }
    
    try {
      // Utiliser l'endpoint Get Music Generation Details selon la documentation
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
        
        // Vérifier la structure de réponse selon la documentation
        if (detailsData.code === 200 && detailsData.data && Array.isArray(detailsData.data)) {
          const tracks = detailsData.data;
          
          // Chercher un track avec audio_url (génération complète)
          const completedTrack = tracks.find(track => 
            track.audio_url && 
            track.audio_url.trim() !== ''
          );
          
          if (completedTrack) {
            console.log(`✅ Audio généré avec succès après ${attempt} tentatives!`);
            console.log(`🎧 URL audio: ${completedTrack.audio_url}`);
            
            return new Response(
              JSON.stringify({ 
                audioUrl: completedTrack.audio_url,
                status: 'success',
                trackId: completedTrack.id,
                rang: rang,
                style: style,
                title: title,
                duration: completedTrack.duration || null,
                provider: 'suno',
                attempts: attempt,
                model: completedTrack.model_name || 'V4',
                image_url: completedTrack.image_url || null,
                lyric: completedTrack.prompt || null,
                createTime: completedTrack.createTime || null
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              }
            );
          } else {
            console.log(`⏳ Audio pas encore prêt (tentative ${attempt})`);
            
            // Afficher le statut des tracks si disponible
            const trackStatuses = tracks.map(track => ({
              id: track.id,
              hasAudio: !!track.audio_url,
              title: track.title
            }));
            console.log(`📊 Statut des tracks:`, trackStatuses);
          }
        } else {
          console.log(`⚠️ Structure de réponse inattendue (tentative ${attempt}):`, detailsData);
        }
      } else {
        console.log(`⚠️ Erreur status API tentative ${attempt}:`, detailsResponse.status);
        const errorText = await detailsResponse.text();
        console.log(`⚠️ Réponse erreur:`, errorText);
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