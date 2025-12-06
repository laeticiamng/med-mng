/**
 * 🎵 Generate Music - Edge Function principale
 * 
 * Endpoint pour générer de la musique via l'API Suno
 * Version refactorisée et modulaire
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { SunoAPIClient, getCorrectSunoModel, SunoGenerationOptions } from '../_shared/suno-api-client.ts';
import { 
  buildRichEducationalPrompt, 
  buildRichStyle, 
  buildExpressiveTitle 
} from '../_shared/prompt-builders.ts';
import { 
  insertMusicTrack, 
  insertGenerationMetric, 
  getAuthenticatedUser,
  MusicTrackInsertData
} from '../_shared/music-database.ts';

// Interfaces de requête/réponse
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
    status?: string;
    estimated_duration?: string;
  };
  error?: string;
}

/**
 * Handler principal
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract request data
    const body: MusicGenerationRequest = await req.json();
    console.log('📥 REQUÊTE GÉNÉRATION MUSICALE:', {
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

    // Get authenticated user
    const authHeader = req.headers.get('authorization');
    const { userId, isAuthenticated } = await getAuthenticatedUser(supabase, authHeader);

    // Extract and validate parameters with defaults
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

    // Build enhanced components
    const enhancedPrompt = lyrics || buildRichEducationalPrompt(
      itemCode, 
      rang, 
      style, 
      'relaxing', 
      'moderate'
    );
    const enhancedStyle = buildRichStyle(
      style, 
      'relaxing', 
      'moderate', 
      ['piano', 'strings']
    );
    const enhancedTitle = title || buildExpressiveTitle(itemCode, rang, style);
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
    console.log('🎯 Modèle fixé:', correctModel, 'pour tous les utilisateurs');

    // Initialize Suno API client
    const sunoClient = new SunoAPIClient(SUNO_API_KEY);

    // Build callback URL for async processing
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/suno-callback`;

    // Prepare Suno payload with optimizations
    const sunoPayload: SunoGenerationOptions = {
      prompt: enhancedPrompt,
      customMode: true,
      instrumental: instrumental,
      style: enhancedStyle,
      title: enhancedTitle,
      model: correctModel,
      callBackUrl: callbackUrl,
      fastMode: true,
      priority: "high",
      streamingEnabled: true,
      optimizeForSpeed: true
    };

    console.log('🚀 APPEL API SUNO RÉEL avec payload:', {
      hasPrompt: !!sunoPayload.prompt,
      promptLength: sunoPayload.prompt.length,
      style: sunoPayload.style,
      title: sunoPayload.title,
      instrumental: sunoPayload.instrumental,
      model: sunoPayload.model,
      customMode: sunoPayload.customMode
    });

    // Call Suno API to generate music (returns taskId immediately)
    const taskId = await sunoClient.generateMusic(sunoPayload);
    console.log('🆔 TaskID reçu immédiatement:', taskId);

    const apiResponseTime = Date.now() - startTime;

    // Save initial record in database (non-blocking)
    const trackData: MusicTrackInsertData = {
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

    // Add user_id only if authenticated
    if (userId) {
      trackData.user_id = userId;
    }

    // Insert track (non-blocking, won't fail generation)
    const dbResult = await insertMusicTrack(supabase, trackData);
    if (!dbResult.success) {
      console.log('⚠️ Génération continue malgré l\'erreur BDD');
    }

    // Insert generation metric (non-blocking)
    await insertGenerationMetric(supabase, {
      track_id: taskId,
      user_id: userId || undefined,
      content_type: itemCode.toLowerCase(),
      item_code: itemCode,
      rang: rang,
      style: style,
      status: 'initiated',
      api_response_time_ms: apiResponseTime
    });

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
    console.log('⏱️ Temps de réponse API:', apiResponseTime, 'ms');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ ERREUR DÉTAILLÉE:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
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
