import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎵 SUNO API OFFICIELLE - Début');
    
    const requestBody = await req.json();
    console.log('🎵 Requête reçue:', requestBody);

    // Gérer les différents types de requêtes
    if (requestBody.action === 'status') {
      // Requête de statut
      const { audioId } = requestBody;
      
      if (!audioId) {
        throw new Error('audioId manquant pour vérifier le statut');
      }

      console.log('🔍 Vérification statut taskId:', audioId);
      
      const sunoApiKey = Deno.env.get('SUNO_API_KEY');
      if (!sunoApiKey) {
        throw new Error('SUNO_API_KEY non configurée');
      }

      // Appel API officielle Suno pour le statut
      const statusResponse = await fetch(`https://api.sunoapi.org/api/v1/generate/record-info?taskId=${audioId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sunoApiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Suno Status API Error: ${statusResponse.status} ${statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();
      console.log('📊 Statut reçu:', statusData);

      return new Response(JSON.stringify(statusData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (requestBody.action === 'convert_to_wav') {
      // Conversion WAV
      const { audioId } = requestBody;
      
      if (!audioId) {
        throw new Error('audioId manquant pour conversion WAV');
      }

      console.log('🎵 Conversion WAV pour audioId:', audioId);
      
      const sunoApiKey = Deno.env.get('SUNO_API_KEY');
      if (!sunoApiKey) {
        throw new Error('SUNO_API_KEY non configurée');
      }

      // Appel API Suno pour conversion WAV
      const wavResponse = await fetch('https://api.sunoapi.org/api/v1/audio/convert-wav', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sunoApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ audioId })
      });

      if (!wavResponse.ok) {
        throw new Error(`WAV conversion failed: ${wavResponse.status} ${wavResponse.statusText}`);
      }

      const wavData = await wavResponse.json();
      console.log('✅ Conversion WAV réussie:', wavData);

      return new Response(JSON.stringify(wavData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (requestBody.action === 'remove_vocals') {
      // Suppression des voix
      const { audioId, output_format } = requestBody;
      
      if (!audioId) {
        throw new Error('audioId manquant pour suppression des voix');
      }

      console.log('🎤 Suppression voix pour audioId:', audioId);
      
      const sunoApiKey = Deno.env.get('SUNO_API_KEY');
      if (!sunoApiKey) {
        throw new Error('SUNO_API_KEY non configurée');
      }

      // Appel API Suno pour suppression des voix
      const vocalResponse = await fetch('https://api.sunoapi.org/api/v1/audio/remove-vocals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sunoApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          audioId,
          output_format: output_format || 'mp3'
        })
      });

      if (!vocalResponse.ok) {
        throw new Error(`Vocal removal failed: ${vocalResponse.status} ${vocalResponse.statusText}`);
      }

      const vocalData = await vocalResponse.json();
      console.log('✅ Suppression voix réussie:', vocalData);

      return new Response(JSON.stringify(vocalData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (requestBody.action === 'generate_video') {
      // Génération vidéo
      const { audioId, visual_style, resolution, color_scheme, include_lyrics, output_format } = requestBody;
      
      if (!audioId) {
        throw new Error('audioId manquant pour génération vidéo');
      }

      console.log('🎬 Génération vidéo pour audioId:', audioId);
      
      const sunoApiKey = Deno.env.get('SUNO_API_KEY');
      if (!sunoApiKey) {
        throw new Error('SUNO_API_KEY non configurée');
      }

      // Appel API Suno pour génération vidéo
      const videoResponse = await fetch('https://api.sunoapi.org/api/v1/video/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sunoApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          audioId,
          visual_style: visual_style || 'waveform',
          resolution: resolution || '1080p',
          color_scheme: color_scheme || ['#1e40af', '#3b82f6', '#60a5fa'],
          include_lyrics: include_lyrics !== false,
          output_format: output_format || 'mp4'
        })
      });

      if (!videoResponse.ok) {
        throw new Error(`Video generation failed: ${videoResponse.status} ${videoResponse.statusText}`);
      }

      const videoData = await videoResponse.json();
      console.log('✅ Génération vidéo réussie:', videoData);

      return new Response(JSON.stringify(videoData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // Requête de génération
      const { paroles, style, rang, duration = 120, customMode = true, instrumental = false, model = "V3_5" } = requestBody;
      
      // Validation
      if (!paroles || paroles.length === 0) {
        throw new Error('Paroles manquantes');
      }

      console.log('🎵 Paramètres génération:', { 
        parolesCount: paroles.length, 
        style, 
        rang, 
        duration,
        customMode,
        instrumental,
        model
      });

      // Format des paroles selon l'API officielle
      const prompt = `[Verse 1]
${paroles.slice(0, 4).join('\n')}

[Chorus]
EDN Formation médicale - Rang ${rang}
Excellence et compétence garanties

[Verse 2]
${paroles.slice(4, 8).join('\n')}

[Outro]
Compétences médicales acquises
Formation de qualité professionnelle`;

      console.log('🎵 Prompt formaté (longueur:', prompt.length, ')');

      const sunoApiKey = Deno.env.get('SUNO_API_KEY');
      if (!sunoApiKey) {
        throw new Error('SUNO_API_KEY non configurée');
      }

      // Configuration selon l'API officielle Suno
      const sunoPayload = {
        prompt: prompt,
        style: style || 'educational, upbeat, modern',
        title: `EDN Rang ${rang} - Formation Médicale`,
        customMode: customMode,
        instrumental: instrumental,
        model: model,
        callBackUrl: `https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/suno-callback`
      };

      console.log('🚀 Appel API Suno officielle...');

      // Appel réel à l'API Suno officielle
      const sunoResponse = await fetch('https://api.sunoapi.org/api/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sunoApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(sunoPayload)
      });

      if (!sunoResponse.ok) {
        const errorText = await sunoResponse.text();
        console.error('❌ Erreur API Suno:', errorText);
        throw new Error(`Suno API Error: ${sunoResponse.status} - ${errorText}`);
      }

      const sunoData = await sunoResponse.json();
      console.log('✅ Réponse Suno:', sunoData);

      // Vérifier la structure de réponse selon la doc officielle
      if (sunoData.code !== 200) {
        throw new Error(`Suno API Error: ${sunoData.msg || 'Erreur inconnue'}`);
      }

      const taskId = sunoData.data?.taskId;
      if (!taskId) {
        throw new Error('TaskId manquant dans la réponse Suno');
      }

      console.log('✅ TaskId généré:', taskId);

      // Réponse standardisée
      return new Response(JSON.stringify({
        success: true,
        trackId: taskId,
        status: 'generating',
        message: 'Génération musicale démarrée avec succès',
        estimated_completion: new Date(Date.now() + (duration * 1000)).toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Erreur fonction Suno:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erreur génération musicale',
      details: 'Vérifiez les paramètres et la configuration API'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});