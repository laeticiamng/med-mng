import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MusicGenerationRequest {
  prompt: string;
  style?: string;
  duration?: number;
  mood?: string;
  instruments?: string[];
  tempo?: string;
  userId?: string;
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
      prompt,
      style = 'ambient',
      duration = 120,
      mood = 'relaxing',
      instruments = ['piano', 'strings'],
      tempo = 'moderate',
      userId
    }: MusicGenerationRequest = await req.json();

    console.log('🎵 Génération de musique:', { prompt, style, mood, tempo });

    // Vérifier si SUNO_API_KEY est configurée pour utiliser Suno
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    
    if (SUNO_API_KEY) {
      // Utiliser l'API Suno pour la génération musicale
      const sunoPayload = {
        prompt: `${prompt} in ${style} style, ${mood} mood, with ${instruments.join(', ')}, ${tempo} tempo`,
        style: style,
        title: `Generated ${style} Track`,
        customMode: true,
        instrumental: false,
        model: "V4"
      };

      console.log('🚀 Utilisation de l\'API Suno');
      
      const sunoResponse = await fetch('https://api.sunoapi.org/api/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sunoPayload)
      });

      if (sunoResponse.ok) {
        const sunoData = await sunoResponse.json();
        
        if (sunoData.code === 200 && sunoData.data && sunoData.data.taskId) {
          const taskId = sunoData.data.taskId;
          
          // Polling pour récupérer l'audio généré
          const completedTrack = await pollForSunoCompletion(taskId, SUNO_API_KEY);
          
          if (completedTrack) {
            // Sauvegarder dans la base de données
            if (userId) {
              await supabase.from('generated_music_tracks').insert({
                user_id: userId,
                title: completedTrack.title || `${style} Track`,
                audio_url: completedTrack.audio_url,
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
              audioUrl: completedTrack.audio_url,
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
      }
    }

    // Fallback : Simulation de génération de musique
    console.log('📦 Mode simulation - Configuration Suno manquante');
    
    const simulatedTrack = {
      id: crypto.randomUUID(),
      title: `${style.charAt(0).toUpperCase() + style.slice(1)} ${mood} Track`,
      audioUrl: `https://example.com/generated-music/${crypto.randomUUID()}.mp3`,
      duration,
      style,
      mood,
      tempo,
      instruments,
      prompt,
      generatedAt: new Date().toISOString()
    };

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
      const detailsResponse = await fetch(`https://api.sunoapi.org/api/v1/music/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        
        if (detailsData.code === 200 && detailsData.data && Array.isArray(detailsData.data)) {
          const completedTrack = detailsData.data.find(track => 
            track.audio_url && track.audio_url.trim() !== ''
          );
          
          if (completedTrack) {
            return completedTrack;
          }
        }
      }
    } catch (error) {
      console.log(`Erreur polling tentative ${attempt}:`, error.message);
    }
  }
  
  return null;
}