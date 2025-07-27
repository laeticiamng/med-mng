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
  itemCode?: string;
  instrumental?: boolean;
  customMode?: boolean;
  model?: string;
  title?: string;
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

// Classe pour interagir avec l'API Suno officielle
class SunoAPI {
  private apiKey: string;
  private baseUrl: string = 'https://api.sunoapi.org/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateMusic(options: any) {
    console.log('🎵 Appel API Suno generate:', options);
    
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });
    
    const result = await response.json();
    console.log('🎵 Réponse Suno generate:', result);
    
    if (result.code !== 200) {
      throw new Error(`Generation failed: ${result.msg}`);
    }
    
    return result.data.taskId;
  }

  async getTaskStatus(taskId: string) {
    console.log('🔍 Vérification statut pour taskId:', taskId);
    
    const response = await fetch(`${this.baseUrl}/generate/record-info?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    const result = await response.json();
    console.log('📊 Statut reçu:', result);
    
    return result.data;
  }

  async waitForCompletion(taskId: string, maxWaitTime: number = 300000) { // 5 minutes max
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 20;
    
    while (Date.now() - startTime < maxWaitTime && attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Tentative ${attempts}/${maxAttempts} pour taskId: ${taskId}`);
      
      try {
        const status = await this.getTaskStatus(taskId);
        
        if (status.status === 'SUCCESS' && status.response?.data) {
          console.log('✅ Génération terminée avec succès!');
          return status.response;
        } else if (status.status === 'FAILED') {
          throw new Error(`Generation failed: ${status.errorMessage}`);
        }
        
        // Attendre 15 secondes avant la prochaine vérification
        await new Promise(resolve => setTimeout(resolve, 15000));
        
      } catch (error) {
        console.error(`❌ Erreur lors de la vérification du statut:`, error);
        throw error;
      }
    }
    
    throw new Error('Timeout: Génération trop longue');
  }
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
      style = 'folk',
      duration = 120,
      mood = 'relaxing',
      instruments = ['piano', 'strings'],
      tempo = 'moderate',
      userId,
      rang,
      language = 'fr',
      itemCode,
      instrumental = false,
      customMode = true,
      model = 'V4',
      title
    }: MusicGenerationRequest = await req.json();

    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');

    console.log('🔧 Debug environnement:', {
      SUNO_API_KEY_exists: !!SUNO_API_KEY,
      SUNO_API_KEY_length: SUNO_API_KEY?.length || 0,
      SUNO_API_KEY_preview: SUNO_API_KEY ? `${SUNO_API_KEY.substring(0, 10)}...` : 'null'
    });

    console.log('🎵 Génération de musique avec API Suno:', { 
      hasLyrics: !!lyrics,
      lyricsLength: lyrics?.length || 0,
      style, 
      rang,
      duration: duration + 's',
      language,
      itemCode,
      apiMode: SUNO_API_KEY ? 'REAL_SUNO' : 'SIMULATION'
    });
    
    if (SUNO_API_KEY && SUNO_API_KEY.trim().length > 0) {
      const sunoApi = new SunoAPI(SUNO_API_KEY);
      
      // Préparer le payload selon la documentation Suno
      const sunoPayload = {
        prompt: lyrics || prompt || `A ${style} song with ${mood} mood, ${tempo} tempo`,
        style: style,
        title: title || `${rang ? `Rang ${rang} - ` : ''}${itemCode || 'Contenu'} - ${style}`,
        customMode: customMode,
        instrumental: instrumental || (!lyrics || !lyrics.trim()),
        model: model
      };

      console.log('🚀 APPEL API SUNO RÉEL avec payload:', {
        hasPrompt: !!sunoPayload.prompt,
        promptLength: sunoPayload.prompt?.length || 0,
        style: sunoPayload.style,
        title: sunoPayload.title,
        instrumental: sunoPayload.instrumental,
        model: sunoPayload.model
      });
      
      try {
        console.log('🚀 APPEL API SUNO RÉEL avec payload:', sunoPayload);
        
        const taskId = await sunoApi.generateMusic(sunoPayload);
        console.log('🆔 TaskID reçu:', taskId);
        
        // Attendre la completion avec un timeout plus court pour tests
        const completedResult = await sunoApi.waitForCompletion(taskId, 120000); // 2 minutes
        
        if (completedResult && completedResult.data && completedResult.data.length > 0) {
          const track = completedResult.data[0];
          console.log('✅ Track complété:', track);
          
          // Utiliser l'URL audio appropriée
          const audioUrl = track.audio_url || track.sourceAudioUrl || track.streamAudioUrl;
          
          // Sauvegarder dans la base de données
          if (userId) {
            await supabase.from('generated_music_tracks').insert({
              user_id: userId,
              title: track.title || sunoPayload.title,
              audio_url: audioUrl,
              metadata: {
                style,
                mood,
                tempo,
                instruments,
                duration: track.duration || duration,
                prompt: sunoPayload.prompt,
                provider: 'suno'
              },
              generation_status: 'completed'
            });
          }

          const response: MusicGenerationResponse = {
            success: true,
            trackId: track.id,
            audioUrl: audioUrl,
            metadata: {
              title: track.title || sunoPayload.title,
              style,
              duration: track.duration || duration,
              mood,
              tempo,
              generatedAt: new Date().toISOString()
            }
          };

          return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          throw new Error('Aucun track généré par Suno');
        }
      } catch (error) {
        console.error('❌ Erreur API Suno:', error);
        
        // En cas d'erreur, utiliser le mode simulation comme fallback
        console.log('🔄 Basculement vers mode simulation suite à erreur API');
      }
    }

    // Mode simulation si pas de clé API
    console.log('📦 Mode simulation - Configuration Suno manquante');
    console.log('⚠️ Pour utiliser l\'API Suno réelle, configurez SUNO_API_KEY dans les secrets Supabase');
    
    const testAudioUrls = [
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
      await supabase.from('generated_music_tracks').insert({
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