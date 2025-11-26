/**
 * 📊 Music Metrics - Edge Function
 * 
 * Endpoint pour récupérer les métriques de génération musicale
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../_shared/cors.ts';

import { getErrorMessage } from '../../_shared/error-utils.ts';
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès music-metrics sans authentification');
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
      console.warn('❌ Token invalide pour music-metrics');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      console.warn(`❌ Non-admin tentative music-metrics par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ music-metrics autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
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

  } catch (error: unknown) {
    console.error('Error fetching metrics:', error);
    return new Response(
      JSON.stringify({ success: false, error: getErrorMessage(error) }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
