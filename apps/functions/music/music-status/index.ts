
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../_shared/cors.ts';

import { getErrorMessage } from '../../_shared/error-utils.ts';
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ: Authentification JWT obligatoire
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès music-status sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour music-status');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ music-status autorisé pour user ${user.id}`);

    // Code original de la fonction
    
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

  } catch (error: unknown) {
    console.error('❌ Erreur lors de la vérification du statut:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: getErrorMessage(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
