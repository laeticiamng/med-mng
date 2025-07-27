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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const taskId = url.pathname.split('/').pop();

    if (!taskId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'TaskID manquant'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔍 Vérification statut pour taskId:', taskId);

    // Chercher dans la base de données d'abord
    const { data: dbTrack, error: dbError } = await supabase
      .from('generated_music_tracks')
      .select('*')
      .eq('metadata->>task_id', taskId)
      .single();

    if (dbTrack && !dbError) {
      console.log('✅ Track trouvé en BDD:', dbTrack.generation_status);
      
      const response: MusicStatusResponse = {
        success: true,
        status: dbTrack.generation_status as 'generating' | 'completed' | 'failed',
        taskId: taskId,
        audioUrl: dbTrack.audio_url,
        streamUrl: dbTrack.metadata?.stream_url,
        imageUrl: dbTrack.metadata?.image_url,
        metadata: dbTrack.metadata,
        progress: dbTrack.generation_status === 'completed' ? 100 : 
                 dbTrack.generation_status === 'failed' ? 0 : 75
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Si pas trouvé en BDD, vérifier avec l'API Suno directement
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    
    if (SUNO_API_KEY) {
      console.log('🔄 Vérification directe avec API Suno...');
      
      const response = await fetch(`https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`, {
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Statut Suno reçu:', result);

        if (result.code === 200) {
          const sunoStatus = result.data.status;
          let mappedStatus: 'generating' | 'completed' | 'failed';
          let progress = 0;

          switch (sunoStatus) {
            case 'SUCCESS':
            case 'COMPLETE':
              mappedStatus = 'completed';
              progress = 100;
              break;
            case 'FAILED':
            case 'ERROR':
              mappedStatus = 'failed';
              progress = 0;
              break;
            default:
              mappedStatus = 'generating';
              progress = sunoStatus === 'PENDING' ? 25 : 
                       sunoStatus === 'PROCESSING' ? 50 : 75;
          }

          const statusResponse: MusicStatusResponse = {
            success: true,
            status: mappedStatus,
            taskId: taskId,
            progress: progress,
            metadata: {
              suno_status: sunoStatus,
              last_checked: new Date().toISOString()
            }
          };

          // Si completed, extraire les URLs
          if (mappedStatus === 'completed' && result.data.response?.data?.[0]) {
            const track = result.data.response.data[0];
            statusResponse.audioUrl = track.audio_url;
            statusResponse.streamUrl = track.stream_audio_url;
            statusResponse.imageUrl = track.image_url;
            statusResponse.metadata = {
              ...statusResponse.metadata,
              title: track.title,
              duration: track.duration,
              style: track.style
            };
          }

          return new Response(JSON.stringify(statusResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // Statut par défaut si rien trouvé
    const defaultResponse: MusicStatusResponse = {
      success: true,
      status: 'generating',
      taskId: taskId,
      progress: 50,
      metadata: {
        message: 'Génération en cours...',
        estimated_completion: '1-2 minutes restantes'
      }
    };

    return new Response(JSON.stringify(defaultResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erreur vérification statut:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});