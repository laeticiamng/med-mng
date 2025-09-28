import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'run-audit';

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log(`🔍 Items Completeness API: ${req.method} - Action: ${action}`);

    // GET /items-completeness-api?action=run-audit (ou par défaut)
    if (req.method === 'GET' && action === 'run-audit') {
      console.log('🔍 Starting automated completeness audit...');

      const { data: auditResult, error } = await supabase.rpc('run_automated_completeness_audit');

      if (error) {
        console.error('❌ Error running completeness audit:', error);
        throw error;
      }

      console.log('✅ Completeness audit completed successfully');
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Audit de complétude terminé avec succès',
        data: auditResult
      }), {
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /items-completeness-api?action=get-reports&limit=10
    if (req.method === 'GET' && action === 'get-reports') {
      const limit = parseInt(url.searchParams.get('limit') || '10');
      console.log(`📊 Fetching ${limit} latest completeness reports...`);

      const { data: reports, error } = await supabase
        .from('items_completeness_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching reports:', error);
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        data: reports,
        count: reports.length
      }), {
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /items-completeness-api?action=get-alerts&resolved=false
    if (req.method === 'GET' && action === 'get-alerts') {
      const resolved = url.searchParams.get('resolved') === 'true';
      const severity = url.searchParams.get('severity');
      console.log(`🚨 Fetching alerts (resolved: ${resolved}, severity: ${severity})...`);

      let query = supabase
        .from('completeness_alerts')
        .select('*')
        .eq('resolved', resolved)
        .order('created_at', { ascending: false });

      if (severity) {
        query = query.eq('severity', severity);
      }

      const { data: alerts, error } = await query.limit(100);

      if (error) {
        console.error('❌ Error fetching alerts:', error);
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        data: alerts,
        count: alerts.length
      }), {
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /items-completeness-api?action=get-item-status&item_code=IC-1
    if (req.method === 'GET' && action === 'get-item-status') {
      const itemCode = url.searchParams.get('item_code');
      
      if (!itemCode) {
        return new Response(JSON.stringify({
          success: false,
          error: 'item_code parameter is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`📋 Fetching status for item: ${itemCode}`);

      // Get item details
      const { data: item, error: itemError } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', itemCode)
        .single();

      if (itemError || !item) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Item not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Calculate completeness score
      const { data: score, error: scoreError } = await supabase.rpc('calculate_item_completeness_score', {
        p_item_code: itemCode,
        p_tableau_a: item.tableau_rang_a,
        p_tableau_b: item.tableau_rang_b,
        p_quiz_questions: item.quiz_questions,
        p_paroles_musicales: item.paroles_musicales,
        p_scene_immersive: item.scene_immersive
      });

      if (scoreError) {
        console.error('❌ Error calculating score:', scoreError);
        throw scoreError;
      }

      // Get alerts for this item
      const { data: alerts, error: alertsError } = await supabase.rpc('generate_completeness_alerts', {
        p_item_code: itemCode,
        p_tableau_a: item.tableau_rang_a,
        p_tableau_b: item.tableau_rang_b,
        p_quiz_questions: item.quiz_questions,
        p_paroles_musicales: item.paroles_musicales,
        p_scene_immersive: item.scene_immersive
      });

      if (alertsError) {
        console.error('❌ Error generating alerts:', alertsError);
        throw alertsError;
      }

      const result = {
        item_code: itemCode,
        completeness_score: score,
        tableau_a_present: !!item.tableau_rang_a,
        tableau_b_present: !!item.tableau_rang_b,
        quiz_present: !!item.quiz_questions,
        alerts: alerts || [],
        status: score >= 80 ? 'complete' : score >= 50 ? 'incomplete' : 'critical'
      };

      return new Response(JSON.stringify({
        success: true,
        data: result
      }), {
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /items-completeness-api?action=resolve-alert
    if (req.method === 'POST' && action === 'resolve-alert') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Missing authorization header');
      }

      // Set auth header for user verification
      const supabaseAuth = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication failed');
      }

      const { alert_id } = await req.json();

      if (!alert_id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'alert_id is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`✅ Resolving alert: ${alert_id} by user: ${user.id}`);

      const { data, error } = await supabase
        .from('completeness_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id
        })
        .eq('id', alert_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error resolving alert:', error);
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Alerte résolue avec succès',
        data
      }), {
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Default response for unknown actions
    return new Response(JSON.stringify({
      success: false,
      error: 'Action not supported',
      available_actions: [
        'run-audit',
        'get-reports', 
        'get-alerts',
        'get-item-status',
        'resolve-alert'
      ]
    }), {
      status: 400,
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in items-completeness-api:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Une erreur interne est survenue'
    }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
    });
  }
});