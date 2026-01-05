
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface MusicStatusResponse {
  success: boolean;
  status: 'generating' | 'completed' | 'failed';
  taskId?: string;
  audioUrl?: string;
  streamUrl?: string;
  imageUrl?: string;
  metadata?: any;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { taskId } = await req.json();
    
    if (!taskId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'TaskId is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🔍 Vérification statut pour taskId:', taskId);

    // Définir un timeout pour cette requête
    const startTime = Date.now();
    // Vérifier d'abord en BDD (le callback peut avoir déjà mis à jour)
    const { data: dbTrack, error: dbError } = await supabase
      .from('generated_music_tracks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    const dbQueryTime = Date.now() - startTime;
    console.log(`📊 Requête BDD: ${dbQueryTime}ms`);

    if (dbError) {
      console.error('⚠️ Erreur lecture BDD:', dbError);
    }

    // Vérifier si on a un track complété en BDD
    if (dbTrack?.generation_status === 'completed' && dbTrack?.audio_url) {
      console.log('✅ Statut trouvé en BDD - Complété');
      
      return new Response(JSON.stringify({
        success: true,
        status: 'completed',
        taskId: taskId,
        audioUrl: dbTrack.audio_url,
        streamUrl: dbTrack.stream_url || dbTrack.metadata?.stream_url,
        imageUrl: dbTrack.image_url || dbTrack.metadata?.image_url,
        metadata: {
          ...dbTrack.metadata,
          duration: dbTrack.duration
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Si le statut est 'failed', le retourner immédiatement
    if (dbTrack?.generation_status === 'failed') {
      console.log('❌ Statut trouvé en BDD - Échoué');
      return new Response(JSON.stringify({
        success: true,
        status: 'failed',
        taskId: taskId,
        error: dbTrack.metadata?.error || 'Génération échouée',
        metadata: dbTrack.metadata
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Vérifier via l'API Suno directement
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    
    if (!SUNO_API_KEY) {
      console.log('⚠️ Clé API Suno manquante');
      return new Response(JSON.stringify({
        success: true,
        status: 'generating',
        taskId: taskId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📡 Vérification via API Suno pour taskId:', taskId);
    
    // ✅ CORRECTION: Utiliser le même endpoint que dans generate-music
    const sunoResponse = await fetch(`https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!sunoResponse.ok) {
      console.error('❌ Erreur API Suno:', sunoResponse.status, sunoResponse.statusText);
      
      // Si 404, c'est que le task n'existe pas
      if (sunoResponse.status === 404) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Track not found in Suno API',
          status: 'failed'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({
        success: false,
        error: `Erreur API Suno: ${sunoResponse.status}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sunoData = await sunoResponse.json();
    console.log('📊 Réponse API Suno:', sunoData);

    let mappedStatus: 'generating' | 'completed' | 'failed' = 'generating';
    let audioUrl: string | undefined;
    let streamUrl: string | undefined;
    let imageUrl: string | undefined;

    // ✅ CORRECTION: Parser selon le format /generate/record-info (comme dans generate-music)
    if (sunoData.code === 200 && sunoData.data) {
      const taskData = sunoData.data;
      
      if (taskData.status === 'SUCCESS' || taskData.status === 'COMPLETE') {
        mappedStatus = 'completed';
        
        // Extraire les URLs depuis response.data
        if (taskData.response?.data && taskData.response.data.length > 0) {
          const firstTrack = taskData.response.data[0];
          audioUrl = firstTrack.audio_url;
          streamUrl = firstTrack.video_url; // API Suno utilise video_url pour le stream
          imageUrl = firstTrack.image_url;
        }
      } else if (taskData.status === 'FAILED' || taskData.status === 'ERROR') {
        mappedStatus = 'failed';
      } else {
        // Statuts en cours: PENDING, PROCESSING, RUNNING
        mappedStatus = 'generating';
      }
    }

    return new Response(JSON.stringify({
      success: true,
      status: mappedStatus,
      taskId: taskId,
      audioUrl: audioUrl,
      streamUrl: streamUrl,
      imageUrl: imageUrl,
      metadata: sunoData.data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
