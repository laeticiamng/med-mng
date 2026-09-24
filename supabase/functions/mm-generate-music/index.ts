/**
 * 🎵 Generate Music - Edge Function principale
 * 
 * Endpoint pour générer de la musique via l'API Suno
 * Documentation: https://docs.sunoapi.org/suno-api/generate-music
 * 
 * Modèles disponibles:
 * - V5: Expression musicale supérieure, génération plus rapide
 * - V4_5PLUS: Son plus riche, nouvelles façons de créer, max 8 min
 * - V4_5ALL: Meilleure structure de chanson, max 8 min
 * - V4_5: Meilleur mélange de genres, jusqu'à 8 min
 * - V4: Meilleure qualité audio, jusqu'à 4 min
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { 
  SunoAPIClient, 
  getCorrectSunoModel, 
  getModelLimits,
  type SunoGenerationOptions,
  type SunoModel,
  type VocalGender
} from '../_shared/suno-api-client.ts';
import { 
  buildRichEducationalPrompt, 
  buildRichStyle, 
  buildExpressiveTitle 
} from '../_shared/prompt-builders.ts';
import { 
  insertMusicTrack, 
  insertGenerationMetric, 
  getAuthenticatedUser,
  type MusicTrackInsertData
} from '../_shared/music-database.ts';

// Interface de requête avec tous les nouveaux paramètres Suno
interface MusicGenerationRequest {
  // Paramètres de base
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
  itemCode?: string;
  title?: string;

  // Paramètres Suno requis
  customMode?: boolean;
  instrumental?: boolean;
  model?: SunoModel;

  // Nouveaux paramètres Suno V4.5+
  personaId?: string;
  negativeTags?: string;
  vocalGender?: VocalGender;
  styleWeight?: number;
  weirdnessConstraint?: number;
  audioWeight?: number;

  // Legacy (gardés pour compatibilité)
  fastMode?: boolean;
  optimized?: boolean;
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
    vocalGender?: string;
    negativeTags?: string;
  };
  error?: string;
}

/** Modèle Suno unique, imposé côté serveur (le client ne choisit pas). */
const MODELE_IMPOSE: SunoModel = 'V4_5ALL';

/** Générations audio par mois incluses dans MED MNG Premium (= src/config/offre.ts). */
const QUOTA_MENSUEL_PREMIUM = 30;

interface RefusGeneration { status: number; code: string; message: string }

/**
 * Vérifie qu'un utilisateur peut lancer une génération :
 *  - connecté ;
 *  - abonnement MED MNG Premium actif (user_subscriptions, status active/trialing,
 *    période non échue) — les administrateurs (user_roles) sont exemptés ;
 *  - moins de QUOTA_MENSUEL_PREMIUM générations ce mois-ci.
 *
 * Le décompte lit generated_music_tracks, la table réellement écrite par
 * cette fonction (insertMusicTrack) puis mise à jour par mm-suno-callback :
 * une ligne « principale » par génération (suno_track_id = task_id) ; le
 * callback ajoute des lignes par piste (suno_track_id ≠ task_id) qui ne sont
 * pas comptées. Les générations échouées ne sont pas décomptées.
 * (med_mng_songs n'est alimentée qu'à la fin par le callback : inutilisable
 * pour un quota, une génération en cours n'y figurant pas.)
 */
async function verifierDroitGeneration(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string | null,
): Promise<RefusGeneration | null> {
  if (!userId) {
    return { status: 401, code: 'AUTH_REQUISE', message: 'Veuillez vous connecter pour générer une chanson.' };
  }

  const { data: role } = await supabase
    .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
  if (role) return null;

  const { data: abonnements, error: errAbo } = await supabase
    .from('user_subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing']);
  if (errAbo) {
    console.error('❌ Lecture abonnement impossible:', errAbo.message);
    return { status: 503, code: 'VERIFICATION_IMPOSSIBLE', message: 'Service momentanément indisponible, réessayez plus tard.' };
  }
  const actif = (abonnements ?? []).some(
    (a: { current_period_end: string | null }) =>
      !a.current_period_end || new Date(a.current_period_end).getTime() > Date.now(),
  );
  if (!actif) {
    return {
      status: 402,
      code: 'PREMIUM_REQUIS',
      message: 'La génération audio est incluse dans MED MNG Premium (69 €/an ou 9,90 €/mois).',
    };
  }

  const maintenant = new Date();
  const debutMois = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), 1)).toISOString();
  const { data: pistes, error: errPistes } = await supabase
    .from('generated_music_tracks')
    .select('task_id, suno_track_id, generation_status')
    .eq('user_id', userId)
    .gte('created_at', debutMois)
    .limit(1000);
  if (errPistes) {
    console.error('❌ Lecture du quota impossible:', errPistes.message);
    return { status: 503, code: 'VERIFICATION_IMPOSSIBLE', message: 'Service momentanément indisponible, réessayez plus tard.' };
  }
  const utilisees = new Set(
    (pistes ?? [])
      .filter((p: { task_id: string | null; suno_track_id: string | null; generation_status: string | null }) =>
        p.task_id && p.suno_track_id === p.task_id && p.generation_status !== 'failed')
      .map((p: { task_id: string }) => p.task_id),
  ).size;

  if (utilisees >= QUOTA_MENSUEL_PREMIUM) {
    return {
      status: 429,
      code: 'QUOTA_ATTEINT',
      message: `Vous avez utilisé vos ${QUOTA_MENSUEL_PREMIUM} générations audio de ce mois. Le compteur repart le 1er du mois prochain.`,
    };
  }
  return null;
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
      model: body.model,
      customMode: body.customMode,
      instrumental: body.instrumental,
      vocalGender: body.vocalGender,
      negativeTags: body.negativeTags,
      styleWeight: body.styleWeight,
      weirdnessConstraint: body.weirdnessConstraint,
      apiMode: 'REAL_SUNO'
    });

    // Get authenticated user
    const authHeader = req.headers.get('authorization');
    const { userId } = await getAuthenticatedUser(supabase, authHeader);

    // Contrôle serveur : abonnement MED MNG Premium actif + quota mensuel.
    // (Le front ne fait pas foi : ce contrôle est le seul qui compte.)
    const refus = await verifierDroitGeneration(supabase, userId);
    if (refus) {
      return new Response(JSON.stringify({ success: false, error: refus.message, code: refus.code }), {
        status: refus.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      title,
      // Nouveaux paramètres V4.5+
      personaId,
      negativeTags,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      audioWeight
    } = body;

    // Modèle imposé côté serveur : la valeur envoyée par le client est ignorée.
    if (body.model && body.model !== MODELE_IMPOSE) {
      console.log(`ℹ️ Modèle demandé ${body.model} ignoré, modèle imposé ${MODELE_IMPOSE}`);
    }
    const correctModel = getCorrectSunoModel(MODELE_IMPOSE);
    const modelLimits = getModelLimits(correctModel);

    // Build enhanced components (avec respect des limites)
    let enhancedPrompt = lyrics || buildRichEducationalPrompt(
      itemCode, 
      rang, 
      style, 
      'relaxing', 
      'moderate'
    );

    // Tronquer le prompt si nécessaire
    const maxPromptLength = customMode ? modelLimits.promptMax : 500;
    if (enhancedPrompt.length > maxPromptLength) {
      console.log(`⚠️ Prompt tronqué: ${enhancedPrompt.length} -> ${maxPromptLength} chars`);
      enhancedPrompt = enhancedPrompt.substring(0, maxPromptLength - 3) + '...';
    }

    let enhancedStyle = buildRichStyle(
      style, 
      'relaxing', 
      'moderate', 
      ['piano', 'strings']
    );
    // Tronquer le style si nécessaire
    if (enhancedStyle.length > modelLimits.styleMax) {
      console.log(`⚠️ Style tronqué: ${enhancedStyle.length} -> ${modelLimits.styleMax} chars`);
      enhancedStyle = enhancedStyle.substring(0, modelLimits.styleMax - 3) + '...';
    }

    let enhancedTitle = title || buildExpressiveTitle(itemCode, rang, style);
    // Tronquer le titre si nécessaire
    if (enhancedTitle.length > modelLimits.titleMax) {
      console.log(`⚠️ Titre tronqué: ${enhancedTitle.length} -> ${modelLimits.titleMax} chars`);
      enhancedTitle = enhancedTitle.substring(0, modelLimits.titleMax - 3) + '...';
    }

    console.log('🎵 GENERATION SUNO ACTIVÉE - Mode production');
    console.log(`🎯 Modèle sélectionné: ${correctModel} (limites: prompt=${modelLimits.promptMax}, style=${modelLimits.styleMax}, title=${modelLimits.titleMax})`);

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

    // Initialize Suno API client
    const sunoClient = new SunoAPIClient(SUNO_API_KEY);

    // Build callback URL for async processing
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/mm-suno-callback`;

    // Prepare Suno payload avec tous les nouveaux paramètres
    const sunoPayload: SunoGenerationOptions = {
      // Paramètres requis
      customMode: customMode,
      instrumental: instrumental,
      model: correctModel,
      callBackUrl: callbackUrl,

      // Paramètres conditionnels
      prompt: enhancedPrompt,
      style: enhancedStyle,
      title: enhancedTitle,

      // Nouveaux paramètres V4.5+ (optionnels)
      ...(personaId && { personaId }),
      ...(negativeTags && { negativeTags }),
      ...(vocalGender && { vocalGender }),
      ...(typeof styleWeight === 'number' && { styleWeight }),
      ...(typeof weirdnessConstraint === 'number' && { weirdnessConstraint }),
      ...(typeof audioWeight === 'number' && { audioWeight })
    };

    console.log('🚀 APPEL API SUNO RÉEL avec payload:', {
      customMode: sunoPayload.customMode,
      instrumental: sunoPayload.instrumental,
      model: sunoPayload.model,
      hasPrompt: !!sunoPayload.prompt,
      promptLength: sunoPayload.prompt?.length || 0,
      style: sunoPayload.style,
      styleLength: sunoPayload.style?.length || 0,
      title: sunoPayload.title,
      titleLength: sunoPayload.title?.length || 0,
      vocalGender: sunoPayload.vocalGender,
      negativeTags: sunoPayload.negativeTags,
      styleWeight: sunoPayload.styleWeight,
      weirdnessConstraint: sunoPayload.weirdnessConstraint
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
        generatedAt: new Date().toISOString(),
        // Nouveaux champs
        vocalGender: vocalGender,
        negativeTags: negativeTags,
        styleWeight: styleWeight,
        weirdnessConstraint: weirdnessConstraint,
        audioWeight: audioWeight,
        personaId: personaId
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
      audioUrl: undefined,
      streamUrl: undefined,
      imageUrl: undefined,
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
        estimated_duration: '2-3 minutes',
        vocalGender: vocalGender,
        negativeTags: negativeTags
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
    
    // Jamais de message technique brut côté utilisateur.
    const errorResponse: MusicGenerationResponse = {
      success: false,
      error: 'Service momentanément indisponible, réessayez plus tard.'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
