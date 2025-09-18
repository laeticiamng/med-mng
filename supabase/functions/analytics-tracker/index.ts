import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type CanonicalEventType =
  | 'generate_start'
  | 'generate_success'
  | 'generate_fail'
  | 'lyrics_timecode_done'
  | 'play'
  | 'seek_segment'
  | 'study_start'
  | 'study_end'
  | 'sync_success'
  | 'sync_fail';

interface TrackingPayload {
  eventType: CanonicalEventType;
  metadata?: Record<string, unknown>;
  userId: string;
  sessionId?: string;
  contentRef?: string | null;
}

const ALLOWED_EVENTS = new Set<CanonicalEventType>([
  'generate_start',
  'generate_success',
  'generate_fail',
  'lyrics_timecode_done',
  'play',
  'seek_segment',
  'study_start',
  'study_end',
  'sync_success',
  'sync_fail',
]);

type Json = Record<string, unknown> | null;

function toJson(value: unknown): Json {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'object') {
    return { value };
  }

  try {
    // Ensure serialisable metadata
    JSON.stringify(value);
    return value as Record<string, unknown>;
  } catch (_error) {
    return { value: String(value) };
  }
}

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

  if (req.method !== 'POST') {
    return errorResponse(405, 'Method not allowed');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase configuration');
    return errorResponse(500, 'Configuration error');
  }

  try {
    const payload = await req.json() as TrackingPayload;

    if (!payload?.userId) {
      return errorResponse(400, 'userId is required');
    }

    if (!payload?.eventType || !ALLOWED_EVENTS.has(payload.eventType)) {
      return errorResponse(400, 'Unsupported eventType');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase.rpc('log_analytics_event', {
      p_user_id: payload.userId,
      p_event_type: payload.eventType,
      p_metadata: toJson(payload.metadata) ?? {},
      p_content_ref: payload.contentRef ?? null,
      p_session_id: payload.sessionId ?? null,
    });

    if (error) {
      console.error('Failed to log analytics event', error);
      return errorResponse(500, 'Failed to persist analytics event');
    }

    const tracked = Boolean(data);

    return new Response(
      JSON.stringify({
        success: true,
        tracked,
        eventId: data,
        eventType: payload.eventType,
      }),
      {
        status: tracked ? 201 : 202,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('analytics-tracker error', error);
    return errorResponse(400, 'Invalid analytics payload');
  }
});
