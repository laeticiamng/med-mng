import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Configuration des coûts en crédits par service
const CREDITS_COST = {
  openai: {
    'chat': 1,
    'image_generation': 3,
    'text_completion': 1
  },
  suno: {
    'music_generation': 5,
    'vocal_removal': 2,
    'audio_processing': 3
  },
  lovable_ai: {
    'audit': 2,
    'completion': 3,
    'chat': 1
  },
  other: {
    'default': 1
  }
} as const;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès ia-quota sans authentification');
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
      console.warn('❌ Token invalide pour ia-quota');
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
      console.warn(`❌ Non-admin tentative ia-quota par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ ia-quota autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'get_quota': {
        const { data: quota, error } = await supabase.rpc('med_mng_get_remaining_quota');
        
        if (error) {
          console.error('Error getting quota:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to get quota' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            remaining_credits: quota || 0 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_quota': {
        const { 
          service_type = 'other', 
          operation_type = 'default',
          credits_required 
        } = await req.json();

        const actualCreditsRequired = credits_required || 
          CREDITS_COST[service_type as keyof typeof CREDITS_COST]?.[operation_type as any] || 
          CREDITS_COST.other.default;

        const { data: currentQuota, error: quotaError } = await supabase.rpc('med_mng_get_remaining_quota');
        
        if (quotaError) {
          console.error('Error checking quota:', quotaError);
          return new Response(
            JSON.stringify({ error: 'Failed to check quota' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const hasEnoughCredits = (currentQuota || 0) >= actualCreditsRequired;
        
        return new Response(
          JSON.stringify({
            success: true,
            has_enough_credits: hasEnoughCredits,
            remaining_credits: currentQuota || 0,
            required_credits: actualCreditsRequired,
            can_proceed: hasEnoughCredits
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'use_quota': {
        const { 
          service_type = 'other',
          operation_type = 'default',
          credits_to_use,
          request_details = {}
        } = await req.json();

        const actualCreditsToUse = credits_to_use || 
          CREDITS_COST[service_type as keyof typeof CREDITS_COST]?.[operation_type as any] || 
          CREDITS_COST.other.default;

        const { data: result, error } = await supabase.rpc('med_mng_decrement_quota', {
          credits_to_use: actualCreditsToUse
        });

        if (error) {
          console.error('Error using quota:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to use quota' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Log l'usage
        const logStatus = result.success ? 'success' : 'quota_exceeded';
        const creditsUsed = result.success ? actualCreditsToUse : 0;

        await supabase.rpc('log_ia_usage', {
          p_service_type: service_type,
          p_operation_type: operation_type,
          p_credits_used: creditsUsed,
          p_request_details: request_details,
          p_response_status: logStatus,
          p_error_details: result.success ? null : result.error
        });

        return new Response(
          JSON.stringify(result),
          { 
            status: result.success ? 200 : 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'get_stats': {
        const periodDays = parseInt(url.searchParams.get('period') || '30');
        
        const { data: stats, error } = await supabase.rpc('get_user_ia_stats', {
          p_period_days: periodDays
        });

        if (error) {
          console.error('Error getting stats:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to get stats' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            stats: stats || {} 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default: {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid action',
            available_actions: ['get_quota', 'check_quota', 'use_quota', 'get_stats']
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

  } catch (error) {
    console.error('Error in ia-quota function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});