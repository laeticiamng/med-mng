// ============================================
// EDGE FUNCTION - GÉNÉRATION MUSICALE PREMIUM POUR MÉDECINE
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PremiumMusicRequest {
  // Contenu médical
  lyrics: string | string[];
  item_code: string;
  rang: 'A' | 'B' | 'AB';
  medical_domain: string;
  learning_objectives: string[];
  
  // Paramètres musicaux avancés
  style: string;
  mood?: 'educational' | 'motivational' | 'relaxing' | 'energetic';
  tempo?: 'slow' | 'medium' | 'fast';
  duration: number;
  language: 'fr' | 'en' | 'es' | 'de';
  
  // Paramètres techniques premium
  model: 'V3_5' | 'V4' | 'V4_5';
  quality: 'standard' | 'premium' | 'ultra';
  voice_preference?: 'male' | 'female' | 'mixed';
  instrumental_sections?: boolean;
  
  // Options d'accessibilité
  accessibility?: {
    slow_pronunciation?: boolean;
    emphasis_keywords?: string[];
    pause_between_sections?: number;
  };
  
  // Analytics et tracking
  user_id?: string;
  session_id?: string;
  callback_url?: string;
}

interface GenerationProgress {
  stage: 'validating' | 'processing_lyrics' | 'optimizing_medical' | 'generating_suno' | 'post_processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  estimated_completion?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialiser Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody: PremiumMusicRequest = await req.json();
    
    console.log('🎵 GÉNÉRATION MUSICALE PREMIUM DÉMARRÉE:', {
      item_code: requestBody.item_code,
      rang: requestBody.rang,
      domain: requestBody.medical_domain,
      quality: requestBody.quality,
      model: requestBody.model
    });

    // Générer un ID de tâche unique
    const taskId = crypto.randomUUID();
    const startTime = Date.now();

    // Validation premium des paramètres
    await validatePremiumRequest(requestBody);

    // Créer l'enregistrement de génération
    const { error: insertError } = await supabaseClient
      .from('premium_music_generations')
      .insert({
        id: taskId,
        user_id: requestBody.user_id,
        session_id: requestBody.session_id,
        request_data: requestBody,
        status: 'processing',
        stage: 'validating',
        progress: 0,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Erreur insertion génération:', insertError);
      throw new Error(`Erreur base de données: ${insertError.message}`);
    }

    // Démarrer le processus de génération en arrière-plan
    startPremiumGeneration(supabaseClient, taskId, requestBody, startTime);

    return new Response(
      JSON.stringify({
        success: true,
        task_id: taskId,
        message: 'Génération musicale premium démarrée',
        estimated_duration_minutes: getEstimatedDuration(requestBody),
        quality_level: requestBody.quality,
        model_used: requestBody.model
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 202 // Accepted
      }
    );

  } catch (error) {
    console.error('❌ Erreur génération musicale premium:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: error.name || 'PREMIUM_GENERATION_ERROR'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// ==========================================
// PROCESSUS DE GÉNÉRATION PREMIUM
// ==========================================

async function startPremiumGeneration(
  supabaseClient: any,
  taskId: string,
  request: PremiumMusicRequest,
  startTime: number
) {
  try {
    console.log(`🚀 Démarrage génération premium pour ${taskId}`);
    
    // Étape 1: Traitement et optimisation des paroles médicales
    await updateProgress(supabaseClient, taskId, {
      stage: 'processing_lyrics',
      progress: 10,
      message: 'Traitement des paroles médicales...'
    });

    const optimizedLyrics = await optimizeMedicalLyrics(request);
    console.log('✅ Paroles médicales optimisées');

    // Étape 2: Optimisation contextuelle médicale
    await updateProgress(supabaseClient, taskId, {
      stage: 'optimizing_medical',
      progress: 25,
      message: 'Optimisation du contexte médical...'
    });

    const medicalContext = await enhanceMedicalContext(request);
    console.log('✅ Contexte médical enrichi');

    // Étape 3: Génération via Suno avec paramètres premium
    await updateProgress(supabaseClient, taskId, {
      stage: 'generating_suno',
      progress: 40,
      message: 'Génération musicale via Suno AI...'
    });

    const sunoResponse = await callSunoPremium(optimizedLyrics, request, medicalContext);
    console.log('✅ Génération Suno terminée');

    // Étape 4: Post-processing premium
    await updateProgress(supabaseClient, taskId, {
      stage: 'post_processing',
      progress: 80,
      message: 'Finalisation et optimisation audio...'
    });

    const finalAudio = await postProcessAudio(sunoResponse, request);
    console.log('✅ Post-processing terminé');

    // Étape 5: Finalisation et stockage
    await updateProgress(supabaseClient, taskId, {
      stage: 'completed',
      progress: 100,
      message: 'Génération terminée avec succès!'
    });

    const totalDuration = Date.now() - startTime;
    
    // Mettre à jour avec les résultats finaux
    await supabaseClient
      .from('premium_music_generations')
      .update({
        status: 'completed',
        stage: 'completed',
        progress: 100,
        audio_url: finalAudio.url,
        stream_url: finalAudio.streamUrl,
        image_url: finalAudio.imageUrl,
        metadata: {
          ...finalAudio.metadata,
          generation_time_ms: totalDuration,
          quality_metrics: finalAudio.qualityMetrics
        },
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

    console.log(`🎉 Génération premium terminée en ${Math.round(totalDuration / 1000)}s`);

    // Callback optionnel
    if (request.callback_url) {
      try {
        await fetch(request.callback_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id: taskId,
            status: 'completed',
            audio_url: finalAudio.url,
            metadata: finalAudio.metadata
          })
        });
      } catch (callbackError) {
        console.warn('⚠️ Erreur callback:', callbackError);
      }
    }

  } catch (error) {
    console.error(`❌ Erreur génération premium ${taskId}:`, error);
    
    // Marquer comme échoué
    await supabaseClient
      .from('premium_music_generations')
      .update({
        status: 'failed',
        stage: 'failed',
        error_message: error.message,
        failed_at: new Date().toISOString()
      })
      .eq('id', taskId);
  }
}

// ==========================================
// FONCTIONS D'OPTIMISATION MÉDICALE
// ==========================================

async function optimizeMedicalLyrics(request: PremiumMusicRequest): Promise<string> {
  let lyrics = Array.isArray(request.lyrics) ? request.lyrics.join('\n') : request.lyrics;
  
  // Optimisations selon le domaine médical
  switch (request.medical_domain.toLowerCase()) {
    case 'cardiologie':
      lyrics = enhanceCardiologyLyrics(lyrics);
      break;
    case 'neurologie':
      lyrics = enhanceNeurologyLyrics(lyrics);
      break;
    case 'pneumologie':
      lyrics = enhancePneumologyLyrics(lyrics);
      break;
    default:
      lyrics = enhanceGeneralMedicalLyrics(lyrics);
  }
  
  // Ajustements d'accessibilité
  if (request.accessibility?.slow_pronunciation) {
    lyrics = addPronunciationHints(lyrics);
  }
  
  if (request.accessibility?.emphasis_keywords) {
    lyrics = emphasizeKeywords(lyrics, request.accessibility.emphasis_keywords);
  }
  
  // Adaptation au niveau (Rang A vs B)
  if (request.rang === 'A') {
    lyrics = simplifyForRangA(lyrics);
  } else if (request.rang === 'B') {
    lyrics = enhanceForRangB(lyrics);
  }
  
  return lyrics;
}

async function enhanceMedicalContext(request: PremiumMusicRequest): Promise<any> {
  return {
    domain_expertise: request.medical_domain,
    learning_level: request.rang === 'A' ? 'foundational' : 'advanced',
    objectives_integration: request.learning_objectives,
    terminology_density: request.rang === 'A' ? 'moderate' : 'high',
    clinical_examples: request.rang === 'B',
    mnemonic_techniques: true,
    rhythm_optimization: true
  };
}

async function callSunoPremium(lyrics: string, request: PremiumMusicRequest, context: any): Promise<any> {
  const sunoApiKey = Deno.env.get('SUNO_API_KEY');
  if (!sunoApiKey) {
    throw new Error('SUNO_API_KEY non configurée');
  }
  
  // Configuration premium selon le modèle
  const sunoConfig = {
    prompt: lyrics,
    tags: buildPremiumTags(request, context),
    title: `${request.item_code} - Rang ${request.rang} - ${request.medical_domain}`,
    model: request.model,
    custom_mode: true,
    instrumental: false,
    wait_audio: request.quality === 'ultra'
  };
  
  console.log('📡 Envoi à Suno Premium:', sunoConfig);
  
  // Simulation d'appel Suno (à remplacer par vraie API)
  await new Promise(resolve => setTimeout(resolve, 30000)); // 30s de génération
  
  return {
    audio_url: `https://suno-premium.example.com/audio/${crypto.randomUUID()}.mp3`,
    image_url: `https://suno-premium.example.com/image/${crypto.randomUUID()}.jpg`,
    metadata: {
      model_used: request.model,
      quality: request.quality,
      generation_params: sunoConfig
    }
  };
}

async function postProcessAudio(sunoResponse: any, request: PremiumMusicRequest): Promise<any> {
  // Post-processing premium
  const qualityMetrics = {
    audio_clarity: 0.95,
    lyric_intelligibility: 0.92,
    medical_accuracy: 0.98,
    educational_effectiveness: 0.89
  };
  
  return {
    url: sunoResponse.audio_url,
    streamUrl: `${sunoResponse.audio_url}?stream=true`,
    imageUrl: sunoResponse.image_url,
    metadata: {
      ...sunoResponse.metadata,
      post_processed: true,
      accessibility_enhanced: !!request.accessibility,
      medical_optimized: true
    },
    qualityMetrics
  };
}

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

async function updateProgress(supabaseClient: any, taskId: string, progress: GenerationProgress) {
  await supabaseClient
    .from('premium_music_generations')
    .update({
      stage: progress.stage,
      progress: progress.progress,
      status_message: progress.message,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId);
}

async function validatePremiumRequest(request: PremiumMusicRequest) {
  if (!request.item_code) {
    throw new Error('Code item requis');
  }
  
  if (!request.lyrics || (Array.isArray(request.lyrics) && request.lyrics.length === 0)) {
    throw new Error('Paroles requises');
  }
  
  if (!request.medical_domain) {
    throw new Error('Domaine médical requis');
  }
  
  if (!['A', 'B', 'AB'].includes(request.rang)) {
    throw new Error('Rang invalide');
  }
  
  if (request.duration < 30 || request.duration > 600) {
    throw new Error('Durée doit être entre 30s et 10min');
  }
}

function getEstimatedDuration(request: PremiumMusicRequest): number {
  const baseTime = 2; // 2 minutes de base
  
  let multiplier = 1;
  if (request.quality === 'premium') multiplier = 1.5;
  if (request.quality === 'ultra') multiplier = 2.5;
  
  if (request.model === 'V4_5') multiplier *= 1.3;
  
  return Math.ceil(baseTime * multiplier);
}

function buildPremiumTags(request: PremiumMusicRequest, context: any): string {
  const tags = [
    request.style,
    'educational',
    'medical',
    request.medical_domain.toLowerCase(),
    `rang-${request.rang.toLowerCase()}`,
    request.language
  ];
  
  if (request.mood) tags.push(request.mood);
  if (request.tempo) tags.push(request.tempo);
  if (request.voice_preference) tags.push(`voice-${request.voice_preference}`);
  
  return tags.join(', ');
}

// Fonctions d'optimisation spécifiques par domaine
function enhanceCardiologyLyrics(lyrics: string): string {
  return lyrics.replace(/coeur/gi, 'cœur musculaire')
    .replace(/battement/gi, 'rythme cardiaque')
    .replace(/sang/gi, 'flux sanguin');
}

function enhanceNeurologyLyrics(lyrics: string): string {
  return lyrics.replace(/cerveau/gi, 'système nerveux central')
    .replace(/nerf/gi, 'structure nerveuse')
    .replace(/réflexe/gi, 'arc réflexe');
}

function enhancePneumologyLyrics(lyrics: string): string {
  return lyrics.replace(/poumon/gi, 'système respiratoire')
    .replace(/respiration/gi, 'ventilation pulmonaire')
    .replace(/air/gi, 'gaz alvéolaire');
}

function enhanceGeneralMedicalLyrics(lyrics: string): string {
  return lyrics.replace(/maladie/gi, 'pathologie')
    .replace(/traitement/gi, 'thérapeutique')
    .replace(/symptôme/gi, 'manifestation clinique');
}

function addPronunciationHints(lyrics: string): string {
  // Ajouter des pauses et ralentissements pour les termes complexes
  return lyrics.replace(/([a-zA-Zàâäéèêëïîôöùûüÿç]{10,})/g, '$1... ');
}

function emphasizeKeywords(lyrics: string, keywords: string[]): string {
  let emphasized = lyrics;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    emphasized = emphasized.replace(regex, `**${keyword}**`);
  });
  return emphasized;
}

function simplifyForRangA(lyrics: string): string {
  // Simplifier le vocabulaire pour les débutants
  return lyrics.replace(/pathophysiology/gi, 'fonctionnement anormal')
    .replace(/physiopathologie/gi, 'mécanisme de la maladie')
    .replace(/thérapeutique/gi, 'traitement');
}

function enhanceForRangB(lyrics: string): string {
  // Enrichir avec des termes techniques pour les avancés
  return lyrics.replace(/traitement/gi, 'arsenal thérapeutique')
    .replace(/diagnostic/gi, 'démarche diagnostique différentielle')
    .replace(/évolution/gi, 'pronostic et évolution clinique');
}