import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authentifier l'utilisateur
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { planId } = await req.json();
    console.log(`🎯 Activation simulation ${planId} pour user:`, user.id);

    // Définir les quotas selon le plan
    const quotas: Record<string, number> = {
      'standard': 30,
      'pro': 300,
      'premium': 3000
    };

    const monthlyQuota = quotas[planId] || 30;

    // 1. Désactiver les abonnements existants
    const { error: cancelError } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (cancelError) {
      console.error('❌ Erreur annulation:', cancelError);
    }

    // 2. Créer le nouvel abonnement
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        stripe_subscription_id: `sim_${planId}_${crypto.randomUUID()}`,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (subError) {
      console.error('❌ Erreur création subscription:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Mettre à jour le quota utilisateur
    console.log('📊 Mise à jour quota pour user:', user.id, 'plan:', planId, 'quota:', monthlyQuota);
    
    // D'abord vérifier si un quota existe déjà
    const { data: existingQuota } = await supabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let quotaError;
    
    if (existingQuota) {
      // Mettre à jour le quota existant
      const { error } = await supabase
        .from('user_quotas')
        .update({
          subscription_type: planId,
          monthly_music_quota: monthlyQuota,
          monthly_music_used: 0,
          quota_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      quotaError = error;
    } else {
      // Créer un nouveau quota
      const { error } = await supabase
        .from('user_quotas')
        .insert({
          user_id: user.id,
          subscription_type: planId,
          monthly_music_quota: monthlyQuota,
          monthly_music_used: 0,
          quota_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      quotaError = error;
    }

    if (quotaError) {
      console.error('❌ Erreur quota détaillée:', JSON.stringify(quotaError, null, 2));
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update quota',
          details: quotaError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Quota mis à jour avec succès');

    console.log(`✅ Simulation ${planId} activée avec succès`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        plan: planId,
        quota: monthlyQuota,
        message: `Plan ${planId} activé avec ${monthlyQuota} générations/mois`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('❌ Erreur:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});