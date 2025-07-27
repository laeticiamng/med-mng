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
    let taskId = url.searchParams.get('taskId');
    
    // Si pas de taskId dans l'URL, essayer de le récupérer du body
    if (!taskId && req.method === 'POST') {
      try {
        const body = await req.json();
        taskId = body.taskId;
      } catch (e) {
        // Ignore JSON parsing errors
      }
    }
    
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

    // Call Suno API to get current status
    // CORRECTION 1: Utiliser l'endpoint correct selon la documentation
    console.log('📡 Vérification statut via API Suno pour taskId:', taskId);
    
    // CORRECTION 2: Essayer plusieurs endpoints possibles selon différentes implémentations
    let sunoResponse;
    let sunoData;
    
    // Essayer d'abord l'endpoint principal (selon sunoapi.org)
    try {
      sunoResponse = await fetch(`https://api.sunoapi.org/api/v1/music/fetch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId: taskId
        })
      });
      
      sunoData = await sunoResponse.json();
      console.log('📊 Réponse statut Suno (v1/music/fetch):', sunoData);
      
    } catch (error) {
      console.log('⚠️ Erreur avec v1/music/fetch, essai endpoint alternatif');
      
      // CORRECTION 3: Essayer un endpoint alternatif
      try {
        sunoResponse = await fetch(`https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUNO_API_KEY}`
          }
        });
        
        sunoData = await sunoResponse.json();
        console.log('📊 Réponse statut Suno (v1/generate/record-info):', sunoData);
        
      } catch (error2) {
        console.error('❌ Erreur avec tous les endpoints Suno:', error2);
        
        const response: MusicStatusResponse = {
          success: false,
          error: `Erreur de connexion à l'API Suno: ${error2.message}`
        };

        return new Response(JSON.stringify(response), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // CORRECTION 4: Gérer différents formats de réponse selon l'API utilisée
    if (!sunoResponse.ok) {
      console.error('❌ Erreur API Suno pour statut:', sunoData);
      
      const response: MusicStatusResponse = {
        success: false,
        error: `Erreur API Suno ${sunoResponse.status}: ${sunoData?.message || sunoData?.msg || 'Erreur inconnue'}`
      };

      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CORRECTION 5: Parser la réponse selon le format correct
    let mappedStatus: 'generating' | 'completed' | 'failed' = 'generating';
    let audioUrl: string | undefined;
    let streamUrl: string | undefined;
    let imageUrl: string | undefined;
    let sunoTaskData: any;

    // Gérer les différents formats de réponse
    if (sunoData.code === 200 && sunoData.data) {
      // Format sunoapi.org
      sunoTaskData = sunoData.data;
      
      // Map status selon la documentation
      switch (sunoTaskData.status) {
        case 'processing':
        case 'pending':
        case 'GENERATING':
        case 'PENDING':
          mappedStatus = 'generating';
          break;
        case 'completed':
        case 'SUCCESS':
          mappedStatus = 'completed';
          // CORRECTION 6: Extraire les URLs selon la structure correcte
          if (sunoTaskData.output && sunoTaskData.output.clips) {
            const clips = Object.values(sunoTaskData.output.clips);
            if (clips.length > 0) {
              const firstClip = clips[0] as any;
              audioUrl = firstClip.audio_url;
              streamUrl = firstClip.stream_url;
              imageUrl = firstClip.image_url || firstClip.image_large_url;
            }
          }
          break;
        case 'failed':
        case 'FAILED':
          mappedStatus = 'failed';
          break;
        default:
          mappedStatus = 'generating';
      }
    } else if (sunoData.data && Array.isArray(sunoData.data)) {
      // Format alternatif
      sunoTaskData = sunoData.data[0] || sunoData;
      
      if (sunoTaskData.audio_url) {
        mappedStatus = 'completed';
        audioUrl = sunoTaskData.audio_url;
        streamUrl = sunoTaskData.stream_url;
        imageUrl = sunoTaskData.image_url;
      } else {
        mappedStatus = 'generating';
      }
    } else {
      // Format de réponse non reconnu
      console.log('⚠️ Format de réponse Suno non reconnu:', sunoData);
      mappedStatus = 'generating';
      sunoTaskData = sunoData;
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
        suno_status: sunoTaskData?.status,
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