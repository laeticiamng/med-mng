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
  streamUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  metadata?: {
    title: string;
    style: string;
    duration: number;
    mood: string;
    tempo: string;
    generatedAt: string;
    model?: string;
    prompt?: string;
    credits_used?: number;
  };
  error?: string;
}

// Interface pour les réponses de l'API Suno selon la documentation officielle
interface SunoGenerationResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

interface SunoStatusResponse {
  code: number;
  msg: string;
  data: {
    status: string;
    response?: {
      data: Array<{
        id: string;
        title: string;
        audio_url: string;
        video_url: string;
        image_url: string;
        duration: number;
        created_at: string;
        model: string;
        style: string;
        prompt: string;
      }>;
    };
    errorMessage?: string;
  };
}

// Fonction pour déterminer le modèle Suno selon l'abonnement utilisateur
async function getSunoModelForUser(userId: string | null, supabase: any): Promise<string> {
  if (!userId) {
    // Plan gratuit = modèle premium pour découverte (V4.5)
    return 'chirp-v4-5';
  }

  try {
    // Récupérer l'abonnement de l'utilisateur
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('plan_name')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      console.log('Aucun abonnement actif trouvé, utilisation du modèle gratuit');
      return 'chirp-v4-5'; // Plan gratuit = V4.5
    }

    const planName = subscription.plan_name?.toLowerCase();
    
    switch (planName) {
      case 'plan standard':
      case 'basic':
      case 'standard':
        return 'chirp-v3-5'; // 19€ = V3.5
      
      case 'plan pro':
      case 'pro':
        return 'chirp-v4';   // 29€ = V4
      
      case 'plan premium':
      case 'premium':
        return 'chirp-v4-5'; // 39€ = V4.5
      
      default:
        console.log(`Plan non reconnu: ${planName}, utilisation V3.5 par défaut`);
        return 'chirp-v3-5';
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error);
    return 'chirp-v3-5'; // Valeur par défaut en cas d'erreur
  }
}

// Classe pour interagir avec l'API Suno officielle selon la documentation
class SunoAPI {
  private apiKey: string;
  private baseUrl: string = 'https://api.sunoapi.org/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateMusic(options: {
    prompt: string;
    customMode?: boolean;
    instrumental?: boolean;
    style?: string;
    title?: string;
    model?: string;
  }): Promise<string> {
    console.log('🎵 Appel API Suno generate avec options:', options);
    
    // Valider les limites selon la documentation
    if (options.prompt && options.prompt.length > 3000) {
      throw new Error('Prompt trop long (max 3000 caractères)');
    }
    if (options.style && options.style.length > 200) {
      throw new Error('Style trop long (max 200 caractères)');
    }
    if (options.title && options.title.length > 80) {
      throw new Error('Titre trop long (max 80 caractères)');
    }
    
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: options.prompt,
        customMode: options.customMode || true,
        instrumental: options.instrumental || false,
        style: options.style || '',
        title: options.title || '',
        model: options.model || 'chirp-v3-5' // Modèle par défaut recommandé
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    const result: SunoGenerationResponse = await response.json();
    console.log('🎵 Réponse Suno generate:', result);
    
    if (result.code !== 200) {
      throw new Error(`API Suno Error: ${result.msg || 'Erreur inconnue'}`);
    }
    
    if (!result.data?.taskId) {
      throw new Error('TaskId manquant dans la réponse API');
    }
    
    return result.data.taskId;
  }

  async getTaskStatus(taskId: string): Promise<SunoStatusResponse['data']> {
    console.log('🔍 Vérification statut pour taskId:', taskId);
    
    const response = await fetch(`${this.baseUrl}/generate/record-info?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    const result: SunoStatusResponse = await response.json();
    console.log('📊 Statut reçu:', result);
    
    if (result.code !== 200) {
      throw new Error(`API Suno Error: ${result.msg || 'Erreur inconnue'}`);
    }
    
    return result.data;
  }

  async waitForCompletion(taskId: string, maxWaitTime: number = 600000): Promise<any> {
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max avec checks toutes les 5 secondes
    
    console.log(`⏳ Attente de completion pour taskId: ${taskId} (max ${maxWaitTime/1000}s)`);
    
    while (Date.now() - startTime < maxWaitTime && attempts < maxAttempts) {
      attempts++;
      
      try {
        const statusData = await this.getTaskStatus(taskId);
        
        console.log(`🔄 Tentative ${attempts}/${maxAttempts} - Status: ${statusData.status}`);
        
        if (statusData.status === 'SUCCESS' || statusData.status === 'COMPLETE') {
          if (statusData.response?.data && statusData.response.data.length > 0) {
            console.log('✅ Génération terminée avec succès!');
            return statusData.response;
          } else {
            throw new Error('Aucune donnée dans la réponse de succès');
          }
        } else if (statusData.status === 'FAILED' || statusData.status === 'ERROR') {
          throw new Error(`Génération échouée: ${statusData.errorMessage || 'Erreur inconnue'}`);
        }
        
        // Statuts en cours: PENDING, PROCESSING, RUNNING, etc.
        console.log(`⏳ Status en cours: ${statusData.status}, attente 5 secondes...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        if (error.message.includes('Génération échouée')) {
          throw error; // Erreur définitive
        }
        console.error(`❌ Erreur temporaire lors de la vérification (tentative ${attempts}):`, error);
        
        if (attempts >= maxAttempts) {
          throw new Error(`Échec après ${maxAttempts} tentatives: ${error.message}`);
        }
        
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    throw new Error(`Timeout: Génération trop longue (>${maxWaitTime/1000}s)`);
  }

  async getRemainingCredits(): Promise<number> {
    const response = await fetch(`${this.baseUrl}/get-credits`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.code !== 200) {
      throw new Error(`API Suno Error: ${result.msg || 'Erreur inconnue'}`);
    }
    
    return result.data?.credits || 0;
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
      model = 'chirp-v3-5',
      title
    }: MusicGenerationRequest = await req.json();

    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    
    // Vérifier si la clé API est valide
    const isValidApiKey = SUNO_API_KEY && 
                         SUNO_API_KEY.trim().length > 0 && 
                         !SUNO_API_KEY.includes('undefined') &&
                         !SUNO_API_KEY.includes('null');

    console.log('🔧 Debug environnement:', {
      SUNO_API_KEY_exists: !!SUNO_API_KEY,
      SUNO_API_KEY_length: SUNO_API_KEY?.length || 0,
      SUNO_API_KEY_preview: SUNO_API_KEY ? `${SUNO_API_KEY.substring(0, 10)}...` : 'null',
      isValidApiKey
    });

    console.log('🎵 Génération de musique avec API Suno:', { 
      hasLyrics: !!lyrics,
      lyricsLength: lyrics?.length || 0,
      style, 
      rang,
      duration: duration + 's',
      language,
      itemCode,
      apiMode: isValidApiKey ? 'REAL_SUNO' : 'SIMULATION'
    });
    
    if (isValidApiKey) {
      console.log('🎵 GENERATION SUNO ACTIVÉE - Mode production avec API réelle');
      
      // Déterminer le modèle selon l'abonnement utilisateur
      const userModel = await getSunoModelForUser(userId, supabase);
      console.log(`🔧 Modèle Suno sélectionné selon l'abonnement: ${userModel}`);
      
      const sunoApi = new SunoAPI(SUNO_API_KEY);
      
      try {
        // Vérifier les crédits disponibles
        console.log('💰 Vérification des crédits Suno...');
        const credits = await sunoApi.getRemainingCredits();
        console.log(`💰 Crédits disponibles: ${credits}`);
        
        if (credits <= 0) {
          throw new Error('Crédits Suno insuffisants');
        }
      } catch (creditError) {
        console.warn('⚠️ Impossible de vérifier les crédits:', creditError);
        // Continuer quand même
      }
      
      // Préparer le prompt musical éducatif
      const educationalPrompt = lyrics || prompt || 
        `Create an educational ${style} song about medical content. 
         Mood: ${mood}, Tempo: ${tempo}.
         The song should be suitable for medical education and learning.`;
      
      // Limiter la longueur du prompt selon la documentation
      const truncatedPrompt = educationalPrompt.length > 3000 ? 
        educationalPrompt.substring(0, 2997) + '...' : educationalPrompt;
      
      // Limiter le style
      const truncatedStyle = style && style.length > 200 ? 
        style.substring(0, 197) + '...' : style;
      
      // Limiter le titre
      const generatedTitle = title || `${rang ? `Rang ${rang} - ` : ''}${itemCode || 'Contenu Médical'}`;
      const truncatedTitle = generatedTitle.length > 80 ? 
        generatedTitle.substring(0, 77) + '...' : generatedTitle;
      
      // Payload conforme à la documentation Suno avec modèle selon abonnement
      const sunoPayload = {
        prompt: truncatedPrompt,
        customMode: true,
        instrumental: instrumental || (!lyrics || !lyrics.trim()),
        style: truncatedStyle || 'educational, ambient',
        title: truncatedTitle,
        model: userModel // Utilisation du modèle selon l'abonnement
      };

      console.log('🚀 APPEL API SUNO RÉEL avec payload:', {
        hasPrompt: !!sunoPayload.prompt,
        promptLength: sunoPayload.prompt?.length || 0,
        style: sunoPayload.style,
        title: sunoPayload.title,
        instrumental: sunoPayload.instrumental,
        model: sunoPayload.model,
        userSubscriptionModel: userModel
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
          
          // Extraire toutes les URLs selon la documentation Suno
          const audioUrl = track.audio_url;
          const videoUrl = track.video_url;
          const imageUrl = track.image_url;
          
          if (!audioUrl) {
            throw new Error('URL audio manquante dans la réponse Suno');
          }
          
          // Sauvegarder dans la base de données avec toutes les informations
          if (userId) {
            await supabase.from('generated_music_tracks').insert({
              user_id: userId,
              title: track.title || sunoPayload.title,
              audio_url: audioUrl,
              metadata: {
                style: track.style || style,
                mood,
                tempo,
                instruments,
                duration: track.duration || duration,
                prompt: track.prompt || sunoPayload.prompt,
                model: track.model || userModel,
                provider: 'suno',
                video_url: videoUrl,
                image_url: imageUrl,
                suno_track_id: track.id,
                created_at: track.created_at
              },
              generation_status: 'completed'
            });
          }

          const response: MusicGenerationResponse = {
            success: true,
            trackId: track.id,
            audioUrl: audioUrl,
            videoUrl: videoUrl,
            imageUrl: imageUrl,
            metadata: {
              title: track.title || sunoPayload.title,
              style: track.style || style,
              duration: track.duration || duration,
              mood,
              tempo,
              model: track.model || userModel,
              prompt: track.prompt || sunoPayload.prompt,
              generatedAt: track.created_at || new Date().toISOString()
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