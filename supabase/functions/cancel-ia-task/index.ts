import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { taskId, provider = 'local', reason = 'user_cancel' } = await req.json();

    if (!taskId) {
      return new Response(
        JSON.stringify({ error: 'taskId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const { data } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = data.user?.id ?? null;
    }

    let cancelled = false;
    let message = '';

    try {
      if (provider === 'suno') {
        const apiKey = Deno.env.get('SUNO_API_KEY');
        if (apiKey) {
          const resp = await fetch(`https://api.suno.ai/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          cancelled = resp.ok;
          message = await resp.text();
        }
      } else if (provider === 'openai') {
        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (apiKey) {
          const resp = await fetch(`https://api.openai.com/v1/jobs/${taskId}/cancel`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          });
          cancelled = resp.ok;
          message = await resp.text();
        }
      } else {
        cancelled = true;
        message = 'Task marked as cancelled';
      }
    } catch (err) {
      message = err.message;
      cancelled = false;
    }

    if (cancelled && userId) {
      await supabase.rpc('med_mng_increment_quota');
    }

    await supabase.from('ia_task_cancellations').insert({
      task_id: taskId,
      user_id: userId,
      provider,
      reason,
      success: cancelled,
    });

    return new Response(
      JSON.stringify({ status: cancelled ? 'cancelled' : 'failed', message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

