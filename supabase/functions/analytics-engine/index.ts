import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

type DashboardPayload = {
  generated_at: string;
  timeframe: string;
  event_breakdown: Array<{ event_type: string; count: number }>;
  top_frictions: Array<{
    event_type: string;
    count: number;
    last_occurrence: string | null;
    sample_metadata: Record<string, unknown> | null;
  }>;
  top_contents: Array<{
    content_ref: string | null;
    event_type: string;
    count: number;
  }>;
  timeseries: Array<{
    bucket: string;
    event_type: string;
    count: number;
  }>;
};

function errorResponse(status: number, message: string) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return errorResponse(405, 'Method not allowed');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase configuration');
    return errorResponse(500, 'Configuration error');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    let timeframe: string | undefined;

    if (req.method === 'POST') {
      try {
        const bodyText = req.body ? await req.text() : undefined;
        const body = bodyText ? JSON.parse(bodyText) : {};
        timeframe = typeof body?.timeframe === 'string' ? body.timeframe : undefined;
      } catch (error) {
        console.warn('analytics-engine invalid body', error);
      }
    }

    if (!timeframe) {
      const url = new URL(req.url);
      timeframe = url.searchParams.get('timeframe') ?? undefined;
    }

    const resolvedTimeframe = timeframe ?? '7d';

    const { data, error } = await supabase.rpc('get_analytics_dashboard', {
      p_timeframe: resolvedTimeframe,
    });

    if (error) {
      console.error('get_analytics_dashboard failed', error);
      return errorResponse(500, 'Failed to compute analytics dashboard');
    }

    const payload = data as DashboardPayload | null;

    return new Response(
      JSON.stringify({
        success: true,
        timeframe: resolvedTimeframe,
        generated_at: payload?.generated_at ?? new Date().toISOString(),
        metrics: payload,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('analytics-engine error', error);
    return errorResponse(400, 'Invalid analytics request');
  }
});
