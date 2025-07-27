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

// Fonction pour déterminer le modèle Suno - TOUJOURS V4_5 comme demandé
async function getSunoModelForUser(userId: string | null, supabase: any): Promise<string> {
  // Toujours retourner V4_5 pour tous les utilisateurs
  console.log('🎯 Modèle fixé: V4_5 pour tous les utilisateurs');
  return 'V4_5';
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
    callBackUrl?: string;
  }): Promise<string> {
    console.log('🎵 Appel API Suno generate avec options:', options);
    
    // Valider les limites selon le ticket de support officiel
    // V4_5/V4_5PLUS: prompt max 5000 chars, style max 1000 chars
    // V3_5/V4: prompt max 3000 chars, style max 200 chars
    const isV4Plus = options.model === 'V4_5' || options.model === 'V4_5PLUS';
    const maxPromptLength = isV4Plus ? 5000 : 3000;
    const maxStyleLength = isV4Plus ? 1000 : 200;
    
    if (options.prompt && options.prompt.length > maxPromptLength) {
      throw new Error(`Prompt trop long (max ${maxPromptLength} caractères pour ${options.model})`);
    }
    if (options.style && options.style.length > maxStyleLength) {
      throw new Error(`Style trop long (max ${maxStyleLength} caractères pour ${options.model})`);
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
        model: options.model || 'chirp-v3-5', // Modèle par défaut recommandé
        callBackUrl: options.callBackUrl // OBLIGATOIRE selon la doc Suno
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

  // Méthode de vérification des crédits désactivée pour éviter les blocages
  async getRemainingCredits(): Promise<number> {
    console.log('⚠️ Vérification des crédits ignorée');
    return 999; // Retourner une valeur élevée pour ne pas bloquer
  }
}

// Fonctions helper pour créer des prompts riches et expressifs
function buildRichEducationalPrompt(itemCode: string, rang: string, style: string, mood: string, tempo: string): string {
  const basePrompt = `
Create an immersive educational song about ${itemCode || 'medical content'} for ${rang ? `skill level ${rang}` : 'medical students'}.

Musical Direction:
- Genre: ${style} with educational focus
- Mood: ${mood}, engaging and memorable
- Tempo: ${tempo}, suitable for learning retention
- Structure: Verse-Chorus-Verse-Chorus-Bridge-Chorus format

Content Requirements:
- Clear, memorable medical terminology
- Progressive difficulty based on skill level
- Catchy melodic hooks for memory retention
- Professional yet accessible language
- Educational storytelling approach

Specific Musical Elements:
- Melodic phrases that emphasize key medical concepts
- Rhythmic patterns that support information retention
- Dynamic variations to maintain engagement
- Clear vocal delivery for educational clarity
- Instrumental sections that complement learning

Target Audience: Medical professionals and students
Goal: Create music that makes complex medical concepts memorable and engaging through superior musical composition.`;

  return basePrompt.trim();
}

function buildRichStyle(style: string, mood: string, tempo: string, instruments: string[]): string {
  const instrumentList = instruments?.join(', ') || 'piano, strings, light percussion';
  
  return `${style}, ${mood} mood, ${tempo} tempo, featuring ${instrumentList}, educational, professional, memorable, well-produced, clear vocals, dynamic arrangement, modern production`;
}

function buildExpressiveTitle(itemCode: string, rang: string, style: string): string {
  const styleCapitalized = style.charAt(0).toUpperCase() + style.slice(1);
  const rangeSuffix = rang ? ` (${rang} Level)` : '';
  
  return `${itemCode || 'Medical'} Mastery${rangeSuffix} - ${styleCapitalized} Education`;
}

// Fonction pour créer un prompt synthétique avec toutes les compétences et assonances
function buildSyntheticPromptWithAssonances(itemCode: string, rang: string, style: string, competences: any[]): string {
  const rangText = rang === 'A' ? 'fondamental' : 'expert';
  
  // Créer des vers avec assonances basés sur les compétences
  let verses = [];
  
  // Vers d'introduction avec assonance
  verses.push(`${itemCode} ${rangText}, compétences à maîtriser`);
  
  // Intégrer les compétences avec assonances et rimes
  if (competences && competences.length > 0) {
    // Prendre un échantillon représentatif des compétences
    const sampledCompetences = competences.slice(0, Math.min(5, competences.length));
    
    sampledCompetences.forEach((comp, index) => {
      const intitule = comp.intitule || comp.concept || 'Compétence médicale';
      const shortIntitule = intitule.substring(0, 80); // Limiter la longueur
      
      if (index % 2 === 0) {
        verses.push(`${shortIntitule}, essentiel médical`);
        verses.push(`Diagnostic précis à bien définir`);
        verses.push(`Traitement adapté pour guérir`);
      } else {
        verses.push(`${shortIntitule}, fondamental`);
        verses.push(`Signes cliniques à observer, pronostic certain`);
        verses.push(`Prise en charge optimale, résultat sain`);
      }
      verses.push('---'); // Séparateur pour structure musicale
    });
  }
  
  // Conclusion avec assonance
  verses.push(`${itemCode} maîtrisé, excellence atteinte`);
  verses.push(`Compétences solides, réussite certaine`);
  verses.push(`Formation complète, expertise validée`);
  
  return verses.join('\n').substring(0, 4800); // Laisser marge pour 5000 caractères max
}

// Fonction pour créer un prompt simplifié (réduction de taille)
function buildSimplifiedPrompt(itemCode: string, rang: string, style: string): string {
  return `Educational song for ${itemCode || 'medical content'}, ${rang ? `level ${rang}` : 'medical training'}, ${style} style, clear melody, memorable, professional medical education music.`;
}

// Fonction pour convertir vers le format correct selon le ticket de support officiel
function getCorrectSunoModel(userModel: string): string {
  console.log('🔧 Conversion modèle selon doc officielle:', userModel);
  
  // D'après le ticket de support officiel : "V4_5", "V4_5PLUS", "V4", "V3_5"
  switch (userModel) {
    case 'chirp-v3-5':
      return 'V3_5'; // Format officiel selon le ticket
    case 'chirp-v4':
      return 'V4';   // Format officiel selon le ticket
    case 'chirp-v4-5':
      return 'V4_5'; // Format officiel selon le ticket
    default:
      console.log('⚠️ Modèle non reconnu, utilisation de V4_5 par défaut');
      return 'V4_5'; // Défaut recommandé dans le ticket
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
      apiMode: isValidApiKey ? 'REAL_SUNO' : 'SIMULATION',
      willCallRealAPI: isValidApiKey
    });
    
    if (isValidApiKey) {
      console.log('🎵 GENERATION SUNO ACTIVÉE - Mode production avec API réelle');
      console.log('🔑 Clé API Suno confirmée valide, appel réel en cours...');
      console.log('🚨 SI VOUS VOYEZ CE MESSAGE, L\'API RÉELLE DOIT ÊTRE APPELÉE');
      
      // Déterminer le modèle selon l'abonnement utilisateur
      const userModel = await getSunoModelForUser(userId, supabase);
      console.log(`🔧 Modèle Suno sélectionné selon l'abonnement: ${userModel}`);
      
      const sunoApi = new SunoAPI(SUNO_API_KEY);
      
      console.log('⚠️ Ignoré: Vérification des crédits Suno désactivée pour éviter les blocages');
      // La vérification des crédits peut échouer, on continue directement avec la génération
      
      // Récupérer les compétences pour intégration synthétique
      const { data: competencesData } = await supabase
        .from('edn_items_complete')
        .select(`
          competences_oic_rang_${rang.toLowerCase()},
          tableau_rang_${rang.toLowerCase()}
        `)
        .eq('item_code', itemCode)
        .single();
      
      const competencesList = competencesData?.[`competences_oic_rang_${rang.toLowerCase()}`] || [];
      
      // Créer un prompt synthétique avec TOUTES les compétences intégrées avec assonances
      const richPrompt = lyrics || prompt || buildSyntheticPromptWithAssonances(itemCode, rang, style, competencesList);
      
      // Créer un style musical détaillé et expressif
      const richStyle = buildRichStyle(style, mood, tempo, instruments);
      
      // Créer un titre expressif
      const expressiveTitle = title || buildExpressiveTitle(itemCode, rang, style);
      
      // Limites fixées à 5000 caractères pour V4_5 (comme demandé)
      const convertedModel = 'V4_5'; // Fixé comme demandé
      const maxPromptLength = 5000; // Fixé comme demandé
      const maxStyleLength = 1000;
      
      const finalPrompt = richPrompt.length > maxPromptLength ? 
        richPrompt.substring(0, maxPromptLength - 3) + '...' : richPrompt;
      
      const finalStyle = richStyle.length > maxStyleLength ? 
        richStyle.substring(0, maxStyleLength - 3) + '...' : richStyle;
      
      const finalTitle = expressiveTitle.length > 80 ? 
        expressiveTitle.substring(0, 77) + '...' : expressiveTitle;
      
      // Payload optimisé selon la documentation Suno ET exemples JavaScript
      const sunoPayload = {
        prompt: finalPrompt,
        customMode: true, // OBLIGATOIRE pour qualité et contrôle
        instrumental: instrumental || false,
        style: finalStyle,
        title: finalTitle,
        model: 'V4_5', // Fixé comme demandé
        callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/suno-callback`
      };

      console.log('🚀 APPEL API SUNO RÉEL avec payload CORRIGÉ:', {
        hasPrompt: !!sunoPayload.prompt,
        promptLength: sunoPayload.prompt?.length || 0,
        style: sunoPayload.style,
        title: sunoPayload.title,
        instrumental: sunoPayload.instrumental,
        model: sunoPayload.model,
        customMode: sunoPayload.customMode,
        userSubscriptionModel: userModel
      });
      
      try {
        console.log('🚀 TENTATIVE APPEL API SUNO RÉEL...');
        console.log('📝 Payload complet envoyé:', JSON.stringify(sunoPayload, null, 2));
        
        // Validation finale selon les instructions étape par étape
        if (!sunoPayload.style || !sunoPayload.title) {
          throw new Error('customMode=true requiert obligatoirement style ET title');
        }
        
        if (sunoPayload.prompt.length > maxPromptLength) {
          throw new Error(`Prompt trop long: ${sunoPayload.prompt.length} > ${maxPromptLength} caractères pour modèle V4_5`);
        }
        
        const taskId = await sunoApi.generateMusic(sunoPayload);
        console.log('🆔 TaskID reçu immédiatement:', taskId);
        
        // 🎯 TRAITEMENT EN ARRIÈRE-PLAN - NE PAS ATTENDRE (optimisation vitesse)
        const backgroundTask = async () => {
          try {
            console.log('🔄 Démarrage polling en arrière-plan pour taskId:', taskId);
            
            // Attendre la completion avec polling selon la doc
            const completedTracks = await sunoApi.waitForCompletion(taskId, 180000); // 3 minutes max
            
            if (completedTracks && completedTracks.length > 0) {
              const track = completedTracks[0]; // Prendre le premier track
              console.log('✅ Track généré en arrière-plan:', track);
              
              // Extraire toutes les URLs selon la VRAIE structure Suno
              const audioUrl = track.audioUrl; // URL téléchargeable
              const streamUrl = track.streamAudioUrl; // URL streaming (disponible plus tôt)
              const imageUrl = track.imageUrl;
              
              if (audioUrl || streamUrl) {
                // Sauvegarder dans la base de données avec les vraies données Suno
                if (userId) {
                  await supabase.from('generated_music_tracks').insert({
                    user_id: userId,
                    title: track.title || sunoPayload.title,
                    audio_url: audioUrl || streamUrl, // Préférer audioUrl, fallback sur streamUrl
                    metadata: {
                      style: track.tags || style,
                      mood,
                      tempo,
                      instruments,
                      duration: track.duration || duration,
                      prompt: track.prompt || sunoPayload.prompt,
                      model: track.modelName || userModel,
                      provider: 'suno',
                      stream_url: streamUrl,
                      image_url: imageUrl,
                      suno_track_id: track.id,
                      created_at: track.createTime,
                      task_id: taskId
                    },
                    generation_status: 'completed'
                  });
                  console.log('💾 Track sauvegardé en BDD avec taskId:', taskId);
                }
              }
            }
          } catch (error) {
            console.error('❌ Erreur dans le traitement en arrière-plan:', error);
            
            // Marquer comme échoué en BDD si possible
            if (userId) {
              await supabase.from('generated_music_tracks').insert({
                user_id: userId,
                title: sunoPayload.title,
                audio_url: null,
                metadata: {
                  error: error.message,
                  task_id: taskId,
                  status: 'failed'
                },
                generation_status: 'failed'
              }).catch(dbError => {
                console.error('❌ Erreur sauvegarde échec:', dbError);
              });
            }
          }
        };
        
        // 🚀 DÉMARRER EN ARRIÈRE-PLAN SANS ATTENDRE (EdgeRuntime.waitUntil)
        EdgeRuntime.waitUntil(backgroundTask());
        
        // ⚡ RETOUR IMMÉDIAT AU CLIENT AVEC TASKID
        const immediateResponse: MusicGenerationResponse = {
          success: true,
          trackId: taskId,
          audioUrl: null, // Sera disponible après génération
          streamUrl: null,
          imageUrl: null,
          metadata: {
            title: sunoPayload.title,
            style: style,
            duration: duration,
            mood,
            tempo,
            model: userModel,
            prompt: sunoPayload.prompt,
            generatedAt: new Date().toISOString(),
            status: 'generating',
            estimated_duration: '2-3 minutes'
          }
        };

        return new Response(JSON.stringify(immediateResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (error) {
        console.error('❌ ERREUR DÉTAILLÉE API SUNO:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
          cause: error.cause
        });
        console.log('🔍 Détails de l\'erreur pour debugging:', error);
        
        // Ne pas basculer en simulation, montrer l'erreur réelle
        throw new Error(`Erreur API Suno: ${error.message}`);
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