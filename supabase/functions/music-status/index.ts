
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

    // Vérifier d'abord en BDD
    const { data: dbTrack } = await supabase
      .from('generated_music_tracks')
      .select('*')
      .eq('task_id', taskId)
      .single();

    if (dbTrack?.generation_status === 'completed' && dbTrack?.audio_url) {
      console.log('✅ Statut trouvé en BDD - Complété');
      
      return new Response(JSON.stringify({
        success: true,
        status: 'completed',
        taskId: taskId,
        audioUrl: dbTrack.audio_url,
        streamUrl: dbTrack.metadata?.stream_url,
        imageUrl: dbTrack.metadata?.image_url,
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
    
    // Utiliser l'endpoint de statut correct avec la méthode GET
    const sunoResponse = await fetch(`https://api.sunoapi.org/api/v1/music/${taskId}`, {
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

    // Parser la réponse selon le format réel de l'API
    if (sunoData.code === 200 && sunoData.data) {
      const taskData = sunoData.data;
      
      if (taskData.status === 'completed' || taskData.status === 'SUCCESS') {
        mappedStatus = 'completed';
        
        // Extraire les URLs des clips générés
        if (taskData.clips && taskData.clips.length > 0) {
          const firstClip = taskData.clips[0];
          audioUrl = firstClip.audio_url;
          streamUrl = firstClip.stream_url;
          imageUrl = firstClip.image_url;
        }
      } else if (taskData.status === 'failed' || taskData.status === 'FAILED') {
        mappedStatus = 'failed';
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
