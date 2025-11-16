/**
 * 📊 Music Metrics - Edge Function
 * 
 * Endpoint pour récupérer les métriques de génération musicale
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'global';

    let data: any = null;

    switch (type) {
      case 'global':
        // Métriques globales
        const { data: globalData, error: globalError } = await supabase
          .rpc('get_global_music_stats');
        
        if (globalError) throw globalError;
        data = globalData;
        break;

      case 'content-type':
        // Métriques par type de contenu
        const { data: contentData, error: contentError } = await supabase
          .rpc('get_music_stats_by_content_type');
        
        if (contentError) throw contentError;
        data = contentData;
        break;

      case 'style':
        // Métriques par style
        const { data: styleData, error: styleError } = await supabase
          .rpc('get_music_stats_by_style');
        
        if (styleError) throw styleError;
        data = styleData;
        break;

      case 'daily':
        // Métriques quotidiennes
        const { data: dailyData, error: dailyError } = await supabase
          .rpc('get_music_stats_daily');
        
        if (dailyError) throw dailyError;
        data = dailyData;
        break;

      case 'user':
        // Métriques utilisateur
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
          throw new Error('Non authentifié');
        }

        const { data: userData, error: userError } = await supabase
          .rpc('get_user_generation_stats');
        
        if (userError) throw userError;
        data = userData;
        break;

      default:
        throw new Error('Type de métrique invalide');
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
