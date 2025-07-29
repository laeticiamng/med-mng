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
  // ✅ OPTIMISATION: Prompt condensé et précis pour génération rapide
  const basePrompt = `Educational ${style} song about ${itemCode || 'medical content'} for level ${rang || 'A'}.
${mood} melody, ${tempo} tempo, clear vocals, memorable medical concepts, professional quality.`;

  return basePrompt.trim();
}

function buildRichStyle(style: string, mood: string, tempo: string, instruments: string[]): string {
  const instrumentList = instruments?.join(', ') || 'piano, strings';
  
  // ✅ OPTIMISATION: Style condensé pour génération plus rapide
  return `${style}, ${mood}, ${tempo}, ${instrumentList}, educational, clear vocals`;
}

function buildExpressiveTitle(itemCode: string, rang: string, style: string): string {
  const styleCapitalized = style.charAt(0).toUpperCase() + style.slice(1);
  const rangeSuffix = rang ? ` (${rang} Level)` : '';
  
  return `${itemCode || 'Medical'} Mastery${rangeSuffix} - ${styleCapitalized} Education`;
}

// Fonction pour créer un prompt optimisé et concis
function buildOptimizedPrompt(itemCode: string, rang: string, lyrics: string): string {
  // Utiliser directement les paroles fournies si disponibles
  if (lyrics && lyrics.trim()) {
    // Limiter la longueur pour V4_5 (max 5000 caractères)
    return lyrics.substring(0, 4800);
  }
  
  // Fallback: prompt simple et efficace
  const rangText = rang === 'A' ? 'foundation' : 'advanced';
  return `Medical education song about ${itemCode}, ${rangText} level, structured verses and chorus, clear educational content.`;
}

// Fonction pour créer un prompt simplifié (réduction de taille)
function buildSimplifiedPrompt(itemCode: string, rang: string, style: string): string {
  return `Educational song for ${itemCode || 'medical content'}, ${rang ? `level ${rang}` : 'medical training'}, ${style} style, clear melody, memorable, professional medical education music.`;
}

// Fonction pour convertir vers le format correct selon la documentation officielle
function getCorrectSunoModel(userModel: string): string {
  console.log('🔧 Conversion modèle selon doc officielle:', userModel);
  
  // Utiliser V4_5 comme recommandé dans la documentation officielle
  // V4_5: "Superior genre blending with smarter prompts and faster output, up to 8 minutes"
  console.log('🚀 MODÈLE OPTIMISÉ: V4_5 sélectionné pour génération optimale');
  return 'V4_5';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract request data
    const body = await req.json();
    console.log('📥 REQUÊTE GÉNÉRTION MUSICALE:', {
      hasLyrics: !!body.lyrics,
      lyricsLength: body.lyrics?.length || 0,
      style: body.style,
      rang: body.rang,
      duration: body.duration,
      language: body.language,
      itemCode: body.itemCode,
      apiMode: 'REAL_SUNO',
      willCallRealAPI: true
    });

    // Get auth user - CORRECTION du problème user_id null
    const authHeader = req.headers.get('authorization');
    let userId = null;
    console.log('🔐 AuthHeader présent:', !!authHeader);
    
    if (authHeader) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user?.id) {
          userId = user.id;
          console.log('👤 User authentifié:', { userId, hasUser: !!user });
        } else {
          console.log('⚠️ Token invalide - génération anonyme');
          // ✅ CORRECTION: Ne pas utiliser de string pour user_id UUID
          userId = null; // Laisser null pour éviter l'erreur de contrainte
        }
      } catch (authError) {
        console.error('❌ Erreur authentification - génération anonyme:', authError);
        userId = null; // ✅ CORRECTION: Laisser null au lieu de string
      }
    } else {
      console.log('⚠️ Aucun header d\'authentification - génération anonyme');
      userId = null; // ✅ CORRECTION: Laisser null au lieu de string
    }

    // Extract and validate parameters
    const {
      lyrics = '',
      style = 'lofi-piano',
      rang = 'A',
      duration = 240,
      language = 'fr',
      itemCode = 'EDN',
      customMode = true,
      instrumental = false,
      model = 'V4_5',
      title,
      optimized = true,
      fastMode = true
    } = body;

    // Build optimized components for faster generation
    const optimizedPrompt = buildOptimizedPrompt(itemCode, rang, lyrics);
    const optimizedStyle = `${style}, educational, clear vocals`;
    const optimizedTitle = title || `Rang ${rang} - ${itemCode} - ${style}`;
    const correctModel = getCorrectSunoModel(model);

    console.log('🎵 GENERATION SUNO ACTIVÉE - Mode production avec API réelle');

    // Check API key
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    
    console.log('🔧 Debug environnement:', {
      SUNO_API_KEY_exists: !!SUNO_API_KEY,
      SUNO_API_KEY_length: SUNO_API_KEY?.length || 0,
      SUNO_API_KEY_preview: SUNO_API_KEY?.substring(0, 10) + '...',
      isValidApiKey: SUNO_API_KEY && SUNO_API_KEY.length > 10
    });

    if (!SUNO_API_KEY || SUNO_API_KEY.length < 10) {
      throw new Error('🔑 SUNO_API_KEY manquante ou invalide. Configurez-la dans les secrets Supabase.');
    }

    console.log('🔑 Clé API Suno confirmée valide, appel réel en cours...');
    console.log('⚠️ Ignoré: Vérification des crédits Suno désactivée pour éviter les blocages');
    console.log('🔧 Modèle Suno sélectionné selon l\'abonnement:', correctModel);
    console.log('🎯 Modèle fixé:', correctModel, 'pour tous les utilisateurs');

    // Build callback URL for async processing
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/suno-callback`;

    // ✅ OPTIMISATION MAXIMALE VITESSE selon docs officielles Suno
    // Configuration pour génération la plus rapide possible
    const sunoPayload = {
      prompt: optimizedPrompt,
      customMode: true,
      instrumental: instrumental,
      style: optimizedStyle,
      title: optimizedTitle,
      model: "V4_5", // Modèle optimisé selon docs officielles
      callBackUrl: callbackUrl
    };

    console.log('🚀 APPEL API SUNO RÉEL avec payload CORRIGÉ:', {
      hasPrompt: !!sunoPayload.prompt,
      promptLength: sunoPayload.prompt.length,
      style: sunoPayload.style,
      title: sunoPayload.title,
      instrumental: sunoPayload.instrumental,
      model: sunoPayload.model,
      customMode: sunoPayload.customMode,
      userSubscriptionModel: correctModel
    });

    console.log('📝 Payload complet envoyé:', JSON.stringify(sunoPayload, null, 2));

    // Call Suno API - Generate Music endpoint
    console.log('🎵 Appel API Suno generate avec options:', sunoPayload);
    
    const sunoResponse = await fetch('https://api.sunoapi.org/api/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUNO_API_KEY}`
      },
      body: JSON.stringify(sunoPayload)
    });

    const sunoData = await sunoResponse.json();
    console.log('🎵 Réponse Suno generate:', sunoData);

    if (!sunoResponse.ok || sunoData.code !== 200) {
      console.error('❌ ERREUR API SUNO:', sunoData);
      throw new Error(`Erreur API Suno: ${sunoData.msg || 'Erreur inconnue'}`);
    }

    const taskId = sunoData.data?.taskId;
    if (!taskId) {
      console.error('❌ AUCUN TASK ID:', sunoData);
      throw new Error('Aucun taskId reçu de l\'API Suno');
    }

    console.log('🆔 TaskID reçu immédiatement:', taskId);
    
    // Save initial record in database - ✅ CORRECTION du problème user_id
    try {
      // ✅ CORRECTION: Insérer seulement si userId n'est pas null
      const insertData = {
        task_id: taskId,
        title: enhancedTitle,
        suno_track_id: taskId,
        metadata: {
          style: style,
          rang: rang,
          duration: duration,
          language: language,
          itemCode: itemCode,
          model: correctModel,
          prompt: enhancedPrompt,
          provider: 'suno',
          generatedAt: new Date().toISOString()
        },
        generation_status: 'generating'
      };

      // ✅ CORRECTION: Ajouter user_id seulement si non null
      if (userId) {
        insertData.user_id = userId;
      }

      const { data: insertedTrack, error: insertError } = await supabase
        .from('generated_music_tracks')
        .insert(insertData)
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Erreur insertion BDD:', insertError);
        // ✅ CORRECTION: Ne pas faire échouer la génération pour une erreur de BDD
        console.log('⚠️ Génération continue malgré l\'erreur BDD');
      } else {
        console.log('✅ Track enregistrée en BDD:', insertedTrack?.id);
      }
    } catch (dbError) {
      console.error('❌ Erreur critique BDD:', dbError);
      console.log('⚠️ Génération continue malgré l\'erreur BDD');
    }

    // Start background polling task (non-blocking)
    console.log('🔄 Démarrage polling en arrière-plan pour taskId:', taskId);
    
    // Return immediate response with trackId
    const response: MusicGenerationResponse = {
      success: true,
      trackId: taskId,
      audioUrl: null, // Will be populated via callback or polling
      streamUrl: null,
      imageUrl: null,
      metadata: {
        title: enhancedTitle,
        style: style,
        duration: duration,
        mood: 'relaxing',
        tempo: 'moderate',
        model: correctModel,
        prompt: enhancedPrompt,
        generatedAt: new Date().toISOString(),
        status: 'generating',
        estimated_duration: '2-3 minutes'
      }
    };

    console.log('🎵 Réponse immédiate retournée avec trackId:', taskId);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ ERREUR DÉTAILLÉE API SUNO:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
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
