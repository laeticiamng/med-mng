import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MusicStatusResponse {
  success: boolean;
  status: 'generating' | 'completed' | 'failed';
  taskId?: string;
  audioUrl?: string;
  streamUrl?: string;
  imageUrl?: string;
  metadata?: any;
  error?: string;
  progress?: number;
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

    // Extract taskId from request
    const url = new URL(req.url);
    const taskId = url.searchParams.get('taskId') || (await req.json()).taskId;
    
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

    // First check our database
    const { data: dbTrack, error: dbError } = await supabase
      .from('generated_music_tracks')
      .select('*')
      .or(`task_id.eq.${taskId},suno_track_id.eq.${taskId}`)
      .single();

    if (dbTrack && !dbError && dbTrack.generation_status === 'completed' && dbTrack.audio_url) {
      console.log('✅ Statut trouvé en BDD - Complété:', dbTrack.generation_status);
      
      const response: MusicStatusResponse = {
        success: true,
        status: 'completed',
        taskId: taskId,
        audioUrl: dbTrack.audio_url,
        streamUrl: dbTrack.metadata?.stream_url,
        imageUrl: dbTrack.metadata?.image_url,
        metadata: dbTrack.metadata
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If not completed in DB, check Suno API directly
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    
    if (!SUNO_API_KEY) {
      console.log('⚠️ Clé API Suno manquante, retour statut depuis DB seulement');
      
      const response: MusicStatusResponse = {
        success: true,
        status: dbTrack?.generation_status as any || 'generating',
        taskId: taskId,
        metadata: dbTrack?.metadata
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Suno API to get current status selon documentation officielle v1
    console.log('📡 Vérification statut via API Suno pour taskId:', taskId);
    
    const sunoResponse = await fetch(`https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`
      }
    });

    const sunoData = await sunoResponse.json();
    console.log('📊 Réponse statut Suno:', sunoData);

    if (!sunoResponse.ok || sunoData.code !== 200) {
      console.error('❌ Erreur API Suno pour statut:', sunoData);
      
      const response: MusicStatusResponse = {
        success: false,
        error: `Erreur API Suno ${sunoResponse.status}: ${sunoData.msg || 'Erreur inconnue'}`
      };

      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse Suno response according to official documentation
    const sunoTaskData = sunoData.data;
    let mappedStatus: 'generating' | 'completed' | 'failed' = 'generating';
    let audioUrl: string | undefined;
    let streamUrl: string | undefined;
    let imageUrl: string | undefined;

    // Map Suno status selon la documentation officielle
    switch (sunoTaskData.status) {
      case 'GENERATING':
      case 'PENDING':
        mappedStatus = 'generating';
        break;
      case 'SUCCESS':
        mappedStatus = 'completed';
        // Extract audio URLs from response.data array selon la doc
        if (sunoTaskData.response?.data && sunoTaskData.response.data.length > 0) {
          const firstTrack = sunoTaskData.response.data[0];
          audioUrl = firstTrack.audio_url;
          streamUrl = firstTrack.stream_url;
          imageUrl = firstTrack.image_url;
        }
        break;
      case 'FAILED':
        mappedStatus = 'failed';
        break;
      default:
        // Si le statut n'est pas reconnu, on considère comme en cours
        mappedStatus = 'generating';
    }

    // Update database if completed
    if (mappedStatus === 'completed' && audioUrl && dbTrack) {
      await supabase
        .from('generated_music_tracks')
        .update({
          generation_status: 'completed',
          audio_url: audioUrl,
          metadata: {
            ...dbTrack.metadata,
            stream_url: streamUrl,
            image_url: imageUrl,
            suno_response: sunoTaskData
          }
        })
        .eq('id', dbTrack.id);
      
      console.log('✅ Base de données mise à jour avec audio URL:', audioUrl);
    }

    const response: MusicStatusResponse = {
      success: true,
      status: mappedStatus,
      taskId: taskId,
      audioUrl: audioUrl,
      streamUrl: streamUrl,
      imageUrl: imageUrl,
      metadata: {
        ...dbTrack?.metadata,
        suno_status: sunoTaskData.response?.status || sunoTaskData.status,
        suno_response: sunoTaskData
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut:', error);
    
    const response: MusicStatusResponse = {
      success: false,
      error: error.message
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});