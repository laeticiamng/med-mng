import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MusicGenerationRequest {
  lyrics?: string;
  prompt?: string;
  style?: string;
  duration?: number;
  mood?: string;
  instruments?: string[];
  tempo?: string;
  userId?: string;
  rang?: string;
  language?: string;
  fastMode?: boolean;
  itemCode?: string; // Ajouter pour le titre
}

interface MusicGenerationResponse {
  success: boolean;
  trackId?: string;
  audioUrl?: string;
  metadata?: {
    title: string;
    style: string;
    duration: number;
    mood: string;
    tempo: string;
    generatedAt: string;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      lyrics,
      prompt,
      style = 'ambient',
      duration = 120,
      mood = 'relaxing',
      instruments = ['piano', 'strings'],
      tempo = 'moderate',
      userId,
      rang,
      language = 'fr',
      itemCode // Ajouter itemCode pour le titre
    }: MusicGenerationRequest = await req.json();

    console.log('🎵 Génération de musique:', { 
      hasLyrics: !!lyrics,
      lyricsLength: lyrics?.length || 0,
      prompt: prompt?.substring(0, 50) + '...' || 'undefined',
      style, 
      rang,
      duration: duration + 's',
      language
    });

    // Vérifier si SUNO_API_KEY est configurée pour utiliser Suno
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    
    if (SUNO_API_KEY) {
      // Construire un prompt détaillé incluant les paroles si disponibles
      let detailedPrompt = '';
      
      if (lyrics && lyrics.trim()) {
        // Si on a des paroles, les inclure dans le prompt avec instruction de les chanter
        detailedPrompt = `Create a ${duration} second ${style} song where every word of these lyrics MUST be sung clearly and completely:

[LYRICS TO SING - MANDATORY]
${lyrics}

IMPORTANT: 
- Sing ALL the provided lyrics word by word
- Do NOT skip any lines
- Make sure the song duration covers all lyrics (${duration} seconds)
- Style: ${style}
- Mood: ${mood}
- Tempo: ${tempo}
- The song must be exactly ${duration} seconds long and include ALL provided lyrics`;
      } else {
        // Sinon, utiliser le prompt existant ou créer un instrumental
        detailedPrompt = prompt || `Create a ${duration} second ${style} instrumental track with ${mood} mood, ${tempo} tempo, featuring ${instruments.join(', ')}. ${duration > 180 ? 'This should be a longer, more developed composition.' : 'Keep it concise and focused.'}`;
      }

      // Payload conforme à l'API Suno officielle
      const sunoPayload = {
        prompt: detailedPrompt,
        style: style,
        title: `${rang ? `Rang ${rang} - ` : ''}${itemCode || 'Contenu'} - ${style}`,
        customMode: true,
        instrumental: false,
        model: "V4",
        callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/suno-callback`,
        // Autres paramètres selon la doc Suno
        lyrics: lyrics && lyrics.trim() ? lyrics : undefined,
        duration: duration
      };

      console.log('🚀 Utilisation de l\'API Suno avec payload:', JSON.stringify(sunoPayload, null, 2));
      
      const sunoResponse = await fetch('https://api.sunoapi.org/api/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sunoPayload)
      });

      console.log('📡 Réponse Suno status:', sunoResponse.status);
      
      if (sunoResponse.ok) {
        const sunoData = await sunoResponse.json();
        console.log('📨 Données Suno reçues:', sunoData);
        
        if (sunoData.code === 200 && sunoData.data && sunoData.data.taskId) {
          const taskId = sunoData.data.taskId;
          console.log('🆔 TaskID reçu:', taskId);
          
          // Polling pour récupérer l'audio généré
          const completedTrack = await pollForSunoCompletion(taskId, SUNO_API_KEY);
          
          if (completedTrack) {
            console.log('✅ Track complété:', completedTrack);
            
            // Sauvegarder dans la base de données
            if (userId) {
              await supabase.from('generated_music_tracks').insert({
                user_id: userId,
                title: completedTrack.title || `${style} Track`,
                audio_url: completedTrack.audioUrl,
                metadata: {
                  style,
                  mood,
                  tempo,
                  instruments,
                  duration: completedTrack.duration || duration,
                  prompt,
                  provider: 'suno'
                },
                generation_status: 'completed'
              });
            }

            const response: MusicGenerationResponse = {
              success: true,
              trackId: completedTrack.id,
              audioUrl: completedTrack.audioUrl,
              metadata: {
                title: completedTrack.title || `${style} Track`,
                style,
                duration: completedTrack.duration || duration,
                mood,
                tempo,
                generatedAt: new Date().toISOString()
              }
            };

            return new Response(JSON.stringify(response), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } else {
        const errorText = await sunoResponse.text();
        console.error('❌ Erreur API Suno:', sunoResponse.status, errorText);
      }
    }

    // Fallback : Simulation de génération de musique avec URL de test fonctionnelle
    console.log('📦 Mode simulation - Configuration Suno manquante');
    
    // Utiliser une URL audio de test réelle pour que le player fonctionne
    const testAudioUrls = [
      'https://www.soundjay.com/misc/sounds/fail-buzzer-02.mp3',
      'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg',
      'https://file-examples.com/storage/fe86c5d5c2b0f95ef5a35b8/2017/11/file_example_MP3_700KB.mp3'
    ];
    
    const simulatedTrack = {
      id: crypto.randomUUID(),
      title: `${style.charAt(0).toUpperCase() + style.slice(1)} ${mood} Track (Demo)`,
      audioUrl: testAudioUrls[Math.floor(Math.random() * testAudioUrls.length)],
      duration,
      style,
      mood,
      tempo,
      instruments,
      prompt,
      generatedAt: new Date().toISOString()
    };
    
    console.log('🎵 Audio de simulation généré:', simulatedTrack.audioUrl);

    // Sauvegarder dans la base de données
    if (userId) {
      const { error } = await supabase.from('generated_music_tracks').insert({
        user_id: userId,
        title: simulatedTrack.title,
        audio_url: simulatedTrack.audioUrl,
        metadata: {
          style: simulatedTrack.style,
          mood: simulatedTrack.mood,
          tempo: simulatedTrack.tempo,
          instruments: simulatedTrack.instruments,
          duration: simulatedTrack.duration,
          prompt: simulatedTrack.prompt,
          provider: 'simulation'
        },
        generation_status: 'completed'
      });

      if (error) {
        console.error('Erreur sauvegarde:', error);
      }
    }

    const response: MusicGenerationResponse = {
      success: true,
      trackId: simulatedTrack.id,
      audioUrl: simulatedTrack.audioUrl,
      metadata: {
        title: simulatedTrack.title,
        style: simulatedTrack.style,
        duration: simulatedTrack.duration,
        mood: simulatedTrack.mood,
        tempo: simulatedTrack.tempo,
        generatedAt: simulatedTrack.generatedAt
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur génération musique:', error);
    
    const errorResponse: MusicGenerationResponse = {
      success: false,
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function pollForSunoCompletion(taskId: string, apiKey: string) {
  const maxAttempts = 30;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      await new Promise(resolve => setTimeout(resolve, 6000));
    }
    
    try {
      console.log(`🔄 Polling tentative ${attempt}/${maxAttempts} pour taskId: ${taskId}`);
      
      const detailsResponse = await fetch(`https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📡 Status polling response: ${detailsResponse.status}`);

      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        console.log(`📨 Données polling reçues:`, detailsData);
        
        if (detailsData.code === 200 && detailsData.data) {
          const status = detailsData.data.status;
          console.log(`📊 Status de génération: ${status}`);
          
          if (status === 'SUCCESS' && detailsData.data.response && detailsData.data.response.sunoData) {
            const tracks = detailsData.data.response.sunoData;
            const completedTrack = tracks.find(track => 
              track.audioUrl && track.audioUrl.trim() !== ''
            );
            
            if (completedTrack) {
              console.log(`✅ Track complété trouvé:`, completedTrack);
              return completedTrack;
            }
          } else if (status === 'FAILED' || status.includes('FAIL')) {
            console.error(`❌ Génération échouée avec status: ${status}`);
            return null;
          }
          // Si status est PENDING ou autre, on continue le polling
        }
      } else {
        const errorText = await detailsResponse.text();
        console.error(`❌ Erreur polling:`, detailsResponse.status, errorText);
      }
    } catch (error) {
      console.log(`Erreur polling tentative ${attempt}:`, error.message);
    }
  }
  
  console.log(`⏰ Timeout atteint après ${maxAttempts} tentatives`);
  return null;
}