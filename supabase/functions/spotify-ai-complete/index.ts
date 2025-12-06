import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

const GENERATION_TIMEOUTS = {
  queue_timeout: 300, // 5 minutes
  generation_timeout: 900, // 15 minutes
  warning_threshold: 120 // 2 minutes
} as const;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎵 SPOTIFY IA - Génération Musicale Complète');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const url = new URL(req.url);
    const endpoint = url.pathname.split('/').pop();

    switch (endpoint) {
      case 'generate':
        return await handleGeneration(req, supabase);
      case 'status':
        return await handleStatus(req, supabase);
      case 'stream':
        return await handleStream(req, supabase);
      case 'admin-logs':
        return await handleAdminLogs(req, supabase);
      default:
        return new Response(JSON.stringify({ error: 'Endpoint non trouvé' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('❌ Erreur Spotify IA:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleGeneration(req: Request, supabase: any) {
  // Authentification
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { 
    item_code, 
    type, // 'rang_a', 'rang_b', 'mix'
    paroles, 
    style = 'educational, medical',
    add_to_playlist_id = null,
    duration = 180,
    priority = 'normal' // 'low', 'normal', 'high'
  } = await req.json();

  // Validation
  if (!item_code || !type || !paroles || paroles.length === 0) {
    return new Response(JSON.stringify({ 
      error: 'Paramètres manquants',
      required: ['item_code', 'type', 'paroles'] 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const creditsRequired = getGenerationCost(type, priority);

  // Vérifier quota
  const { data: quotaResult, error: quotaError } = await supabase.rpc('med_mng_decrement_quota', {
    credits_to_use: creditsRequired
  });

  if (quotaError || !quotaResult?.success) {
    return new Response(JSON.stringify({
      error: 'Quota insuffisant',
      details: quotaResult?.error || 'Veuillez upgrader votre plan',
      credits_required: creditsRequired,
      credits_remaining: quotaResult?.remaining_credits || 0
    }), {
      status: 402,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Créer le log de génération
  const { data: generationLog, error: logError } = await supabase
    .from('med_mng_music_generation_logs')
    .insert({
      user_id: user.id,
      item_code,
      generation_type: type,
      generation_status: 'starting',
      prompt_used: formatSunoPrompt(paroles, type, item_code),
      style_tags: style,
      credits_consumed: creditsRequired,
      request_ip: req.headers.get('x-forwarded-for') || '0.0.0.0',
      user_agent: req.headers.get('user-agent') || 'unknown',
      request_metadata: {
        priority,
        duration,
        add_to_playlist_id
      }
    })
    .select()
    .single();

  if (logError) {
    console.error('❌ Erreur création log:', logError);
    throw new Error('Erreur initialisation génération');
  }

  console.log(`🎵 Génération démarrée: ${generationLog.id} pour ${item_code} (${type})`);

  // Appel Suno (simulé pour cette démo)
  const sunoTaskId = `suno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Mettre à jour le log avec l'ID Suno
  await supabase
    .from('med_mng_music_generation_logs')
    .update({
      suno_task_id: sunoTaskId,
      generation_status: 'queued'
    })
    .eq('id', generationLog.id);

  // Démarrer le monitoring en arrière-plan
  scheduleGenerationMonitoring(supabase, generationLog.id, sunoTaskId);

  return new Response(JSON.stringify({
    success: true,
    generation_id: generationLog.id,
    suno_task_id: sunoTaskId,
    status: 'queued',
    estimated_completion: new Date(Date.now() + 45000).toISOString(),
    credits_used: creditsRequired,
    message: '🎵 Votre musique arrive ! Génération en cours...',
    feedback: {
      title: 'Génération en Cours',
      message: 'Votre chanson médicale est en cours de création. C\'est normal que cela prenne quelques minutes pour un résultat de qualité.',
      eta: '30-60 secondes'
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleStatus(req: Request, supabase: any) {
  const url = new URL(req.url);
  const generationId = url.searchParams.get('id');
  const sunoTaskId = url.searchParams.get('suno_id');

  if (!generationId && !sunoTaskId) {
    return new Response(JSON.stringify({ error: 'ID requis' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let query = supabase.from('med_mng_music_generation_logs').select('*');
  
  if (generationId) {
    query = query.eq('id', generationId);
  } else {
    query = query.eq('suno_task_id', sunoTaskId);
  }

  const { data: log, error } = await query.single();

  if (error || !log) {
    return new Response(JSON.stringify({ error: 'Génération non trouvée' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Calculer des métriques temps réel
  const elapsedTime = log.completed_at 
    ? new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()
    : Date.now() - new Date(log.started_at).getTime();

  const status = {
    id: log.id,
    suno_task_id: log.suno_task_id,
    status: log.generation_status,
    progress: getProgressPercentage(log.generation_status, elapsedTime),
    elapsed_time_ms: elapsedTime,
    estimated_remaining_ms: estimateRemainingTime(log.generation_status, elapsedTime),
    song_id: log.song_id,
    audio_url: log.audio_url,
    error_message: log.error_message,
    feedback: getStatusFeedback(log.generation_status, elapsedTime)
  };

  return new Response(JSON.stringify(status), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleStream(req: Request, supabase: any) {
  const url = new URL(req.url);
  const songId = url.searchParams.get('song_id');
  const userId = url.searchParams.get('user_id');

  if (!songId) {
    return new Response(JSON.stringify({ error: 'song_id requis' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log(`🎧 Demande streaming: ${songId} pour user: ${userId}`);

  // Vérifier l'accès à la chanson
  const { data: song, error: songError } = await supabase
    .from('med_mng_songs')
    .select('*')
    .eq('id', songId)
    .single();

  if (songError || !song) {
    return new Response(JSON.stringify({ error: 'Chanson non trouvée' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Créer une session d'écoute
  if (userId) {
    await supabase
      .from('med_mng_listening_sessions')
      .insert({
        user_id: userId,
        song_id: songId,
        session_start: new Date().toISOString(),
        playback_source: 'library',
        device_type: 'web',
        browser_info: {
          user_agent: req.headers.get('user-agent')
        }
      });
  }

  // Générer URL sécurisée temporaire (expiration 1h)
  const secureUrl = generateSecureStreamingUrl(songId, userId);
  
  return new Response(JSON.stringify({
    success: true,
    streaming_url: secureUrl,
    expires_at: new Date(Date.now() + 3600000).toISOString(), // 1h
    song_info: {
      id: song.id,
      title: song.title,
      duration: song.meta?.duration || 180,
      lyrics_available: !!song.synchronized_lyrics
    },
    anti_download: true,
    streaming_only: true
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAdminLogs(req: Request, supabase: any) {
  const url = new URL(req.url);
  const timeframe = url.searchParams.get('timeframe') || '24h';
  const status = url.searchParams.get('status');
  const itemCode = url.searchParams.get('item_code');

  let query = supabase
    .from('med_mng_music_generation_logs')
    .select(`
      *,
      med_mng_songs(id, title, audio_url)
    `)
    .order('started_at', { ascending: false });

  // Filtres temporels
  const timeframeMappings: { [key: string]: string } = {
    '1h': '1 hour',
    '24h': '24 hours',
    '7d': '7 days',
    '30d': '30 days'
  };

  const period = timeframeMappings[timeframe] || '24 hours';
  query = query.gte('started_at', `now() - interval '${period}'`);

  if (status) {
    query = query.eq('generation_status', status);
  }

  if (itemCode) {
    query = query.eq('item_code', itemCode);
  }

  const { data: logs, error } = await query.limit(1000);

  if (error) {
    return new Response(JSON.stringify({ error: 'Erreur récupération logs' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Calculer des statistiques
  const stats = calculateGenerationStats(logs);

  return new Response(JSON.stringify({
    success: true,
    timeframe,
    logs,
    stats,
    alerts: await getActiveAlerts(supabase)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Fonctions utilitaires
function getGenerationCost(type: string, priority: string): number {
  const baseCosts = { rang_a: 3, rang_b: 5, mix: 7 };
  const priorityMultipliers = { low: 0.8, normal: 1, high: 1.5 };
  
  return Math.round((baseCosts[type as keyof typeof baseCosts] || 5) * 
                   (priorityMultipliers[priority as keyof typeof priorityMultipliers] || 1));
}

function formatSunoPrompt(paroles: string[], type: string, itemCode: string): string {
  const typeLabels = {
    'rang_a': 'Fondamentaux',
    'rang_b': 'Expertise',
    'mix': 'Formation complète'
  };

  return `[Verse 1]
${paroles.slice(0, 4).join('\n')}

[Chorus]
${itemCode} - ${typeLabels[type as keyof typeof typeLabels]}
Excellence médicale en action
Formation EDN de qualité

[Verse 2]
${paroles.slice(4, 8).join('\n')}

[Outro]
Compétences maîtrisées avec succès
Prêt pour la pratique clinique`;
}

function getProgressPercentage(status: string, elapsedMs: number): number {
  const statusProgress = {
    starting: 5,
    queued: 15,
    generating: Math.min(85, 15 + (elapsedMs / 60000) * 35), // Progression basée sur le temps
    completed: 100,
    failed: 0,
    timeout: 0
  };

  return Math.round(statusProgress[status as keyof typeof statusProgress] || 0);
}

function estimateRemainingTime(status: string, elapsedMs: number): number {
  if (status === 'completed' || status === 'failed') return 0;
  
  const averageGenerationTime = 45000; // 45 secondes
  return Math.max(0, averageGenerationTime - elapsedMs);
}

function getStatusFeedback(status: string, elapsedMs: number): any {
  const feedbacks = {
    starting: {
      title: 'Initialisation',
      message: 'Préparation de votre génération musicale...',
      icon: '⚡'
    },
    queued: {
      title: 'En File d\'Attente',
      message: 'Votre demande est dans la queue de génération Suno.',
      icon: '⏳'
    },
    generating: {
      title: 'Création en Cours',
      message: elapsedMs > 60000 
        ? 'Génération en cours - La qualité nécessite du temps !' 
        : 'Création de votre chanson médicale personnalisée...',
      icon: '🎵'
    },
    completed: {
      title: 'Prêt à Écouter !',
      message: 'Votre chanson est prête ! Ajoutée automatiquement à votre bibliothèque.',
      icon: '✅'
    },
    failed: {
      title: 'Erreur de Génération',
      message: 'Une erreur est survenue. Vos crédits ont été remboursés.',
      icon: '❌'
    }
  };

  return feedbacks[status as keyof typeof feedbacks] || feedbacks.starting;
}

function generateSecureStreamingUrl(songId: string, userId?: string): string {
  // En production, utiliser une vraie signature cryptographique
  const timestamp = Date.now();
  const signature = btoa(`${songId}-${userId}-${timestamp}`);
  
  return `https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/secure-audio-stream?id=${songId}&user=${userId}&sig=${signature}&expires=${timestamp + 3600000}`;
}

function calculateGenerationStats(logs: any[]): any {
  const total = logs.length;
  const completed = logs.filter(l => l.generation_status === 'completed').length;
  const failed = logs.filter(l => l.generation_status === 'failed').length;
  const avgDuration = logs
    .filter(l => l.generation_duration_seconds)
    .reduce((acc, l) => acc + l.generation_duration_seconds, 0) / 
    (logs.filter(l => l.generation_duration_seconds).length || 1);

  return {
    total_generations: total,
    success_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    failure_rate: total > 0 ? Math.round((failed / total) * 100) : 0,
    avg_generation_time_seconds: Math.round(avgDuration),
    slow_generations: logs.filter(l => l.generation_duration_seconds > 120).length,
    by_type: logs.reduce((acc, l) => {
      acc[l.generation_type] = (acc[l.generation_type] || 0) + 1;
      return acc;
    }, {}),
    total_credits_consumed: logs.reduce((acc, l) => acc + (l.credits_consumed || 0), 0)
  };
}

async function getActiveAlerts(supabase: any): Promise<any[]> {
  const { data: alerts } = await supabase
    .from('med_mng_generation_alerts')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(50);

  return alerts || [];
}

async function scheduleGenerationMonitoring(supabase: any, generationId: string, sunoTaskId: string) {
  // Simulation du monitoring - en production, utiliser un worker/cron job
  setTimeout(async () => {
    try {
      // Simuler la completion
      const { error } = await supabase
        .from('med_mng_music_generation_logs')
        .update({
          generation_status: 'completed',
          completed_at: new Date().toISOString(),
          generation_duration_seconds: 42,
          success: true,
          audio_url: 'https://demo-music-url.com/generated.mp3'
        })
        .eq('id', generationId);

      if (error) {
        console.error('❌ Erreur update status:', error);
      } else {
        console.log(`✅ Génération complétée: ${generationId}`);
      }
    } catch (error) {
      console.error('❌ Erreur monitoring:', error);
    }
  }, 42000); // 42 secondes simulées
}