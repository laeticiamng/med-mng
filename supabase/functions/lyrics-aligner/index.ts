import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, User } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

type AlignAction = 'align';

type AlignRequest = {
  action: AlignAction;
  trackId: string;
  lyrics?: string | Array<{ text: string; role?: string; start_ms?: number; end_ms?: number }>;
  metadata?: Record<string, unknown>;
};

type LyricsSegment = {
  idx: number;
  start_ms: number;
  end_ms: number;
  text: string;
  role?: string | null;
};

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const securityHeaders: Record<string, string> = {
  'Content-Security-Policy': "default-src 'none'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return responseWithError('Missing authorization header', 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables');
      return responseWithError('Configuration error', 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: authHeader,
          apikey: serviceRoleKey,
        },
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error('Unable to retrieve user context', userError);
      return responseWithError('Unauthorized', 401);
    }
    const user = userData.user;

    const payload: AlignRequest = await req.json();
    if (payload.action !== 'align') {
      return responseWithError('Unsupported action', 400);
    }

    if (!payload.trackId) {
      return responseWithError('trackId is required', 400);
    }

    const { data: song, error: songError } = await supabase
      .from('med_mng_songs')
      .select('id, created_by, user_id, meta, lyrics')
      .eq('id', payload.trackId)
      .single();

    if (songError || !song) {
      console.error('Song lookup failed', songError);
      return responseWithError('Track not found', 404);
    }

    if (!ownsSong(user, song)) {
      return responseWithError('Forbidden', 403);
    }

    const rawLines = normaliseLyricsInput(payload.lyrics, song.lyrics, song.meta);
    if (rawLines.length === 0) {
      return responseWithError('No lyrics available to align', 400);
    }

    const runStart = performance.now();
    const totalDurationMs = inferDurationMs(rawLines, song.meta);
    const segments = buildSegments(rawLines, totalDurationMs);
    const runDuration = Math.round(performance.now() - runStart);

    const confidence = estimateConfidence(rawLines);

    const { error: rpcError } = await supabase.rpc('replace_lyrics_segments', {
      p_track_id: payload.trackId,
      p_segments: segments,
      p_log: {
        duration_ms: runDuration,
        segment_count: segments.length,
        method: payload.metadata?.aligner ?? 'heuristic_v1',
        confidence,
        notes: payload.metadata?.notes ?? null,
        metadata: {
          total_duration_ms: totalDurationMs,
          total_words: rawLines.reduce((sum, line) => sum + line.wordCount, 0),
          heuristic: 'word_weighted_even_distribution',
          provided_timestamps: rawLines.filter((line) => typeof line.start_ms === 'number').length,
        },
        created_by: user.id,
      },
    });

    if (rpcError) {
      console.error('replace_lyrics_segments failed', rpcError);
      return responseWithError('Failed to persist aligned lyrics', 500);
    }

    const { error: analyticsError } = await supabase.rpc('log_analytics_event', {
      p_user_id: user.id,
      p_event_type: 'lyrics_timecode_done',
      p_metadata: {
        track_id: payload.trackId,
        segment_count: segments.length,
        alignment_ms: runDuration,
        duration_ms: totalDurationMs,
        confidence,
      },
      p_content_ref: payload.trackId,
      p_session_id: typeof payload.metadata?.sessionId === 'string' ? payload.metadata.sessionId : null,
    });

    if (analyticsError) {
      console.warn('log_analytics_event failed for lyrics alignment', analyticsError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        segments,
        meta: {
          duration_ms: totalDurationMs,
          alignment_ms: runDuration,
          confidence,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          ...securityHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('lyrics-aligner error', error);
    return responseWithError('Unexpected error', 500);
  }
});

function responseWithError(message: string, status: number) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: {
        ...corsHeaders,
        ...securityHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}

interface NormalisedLine {
  text: string;
  role?: string | null;
  start_ms?: number;
  end_ms?: number;
  wordCount: number;
}

function normaliseLyricsInput(
  payloadLyrics: AlignRequest['lyrics'],
  songLyrics: unknown,
  songMeta: unknown,
): NormalisedLine[] {
  if (Array.isArray(payloadLyrics)) {
    return payloadLyrics
      .map((line) => toNormalisedLine(line.text, line.role, line.start_ms, line.end_ms))
      .filter((line) => line.text.length > 0);
  }

  if (typeof payloadLyrics === 'string') {
    return textToLines(payloadLyrics);
  }

  if (typeof songLyrics === 'string') {
    return textToLines(songLyrics);
  }

  if (Array.isArray((songLyrics as any)?.lines)) {
    const lines = (songLyrics as any).lines as Array<{ text: string; role?: string }>;
    return lines.map((line) => toNormalisedLine(line.text, line.role)).filter((line) => line.text.length > 0);
  }

  if (typeof (songLyrics as any)?.text === 'string') {
    return textToLines((songLyrics as any).text);
  }

  if (typeof (songMeta as any)?.lyrics === 'string') {
    return textToLines((songMeta as any).lyrics);
  }

  if (Array.isArray((songMeta as any)?.lyrics)) {
    return ((songMeta as any).lyrics as Array<string>)
      .map((text) => toNormalisedLine(text))
      .filter((line) => line.text.length > 0);
  }

  return [];
}

function toNormalisedLine(
  text: string,
  role?: string | null,
  start_ms?: number,
  end_ms?: number,
): NormalisedLine {
  const trimmed = text?.trim() ?? '';
  const resolvedRole = role ?? detectRoleFromText(trimmed);
  const safeStart = typeof start_ms === 'number' && Number.isFinite(start_ms) ? Math.max(0, Math.round(start_ms)) : undefined;
  const safeEnd = typeof end_ms === 'number' && Number.isFinite(end_ms) ? Math.max(0, Math.round(end_ms)) : undefined;
  const words = trimmed.split(/\s+/).filter(Boolean);
  return {
    text: trimmed,
    role: resolvedRole,
    start_ms: safeStart,
    end_ms: safeEnd,
    wordCount: words.length || 4,
  };
}

function textToLines(text: string): NormalisedLine[] {
  return text
    .split(/\r?\n+/)
    .map((line) => toNormalisedLine(line))
    .filter((line) => line.text.length > 0);
}

function detectRoleFromText(text: string): string | null {
  if (!text) return null;
  const lowered = text.toLowerCase();
  if (/\bintro\b/.test(lowered)) return 'intro';
  if (/\boutro\b/.test(lowered)) return 'outro';
  if (/\b(refrain|chorus)\b/.test(lowered)) return 'chorus';
  if (/\bcouplet\b/.test(lowered)) return 'verse';
  if (/\bbridge\b/.test(lowered)) return 'bridge';
  if (/^\[[^\]]+\]$/.test(text.trim())) {
    return 'marker';
  }
  return null;
}

function inferDurationMs(lines: NormalisedLine[], songMeta: unknown): number {
  const meta = songMeta as Record<string, unknown> | null | undefined;
  const candidates: number[] = [];

  const pushCandidate = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 1000) {
      candidates.push(Math.round(value));
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed) && parsed > 1) {
        candidates.push(Math.round(parsed * (parsed > 1000 ? 1 : 1000)));
      }
    }
  };

  if (meta) {
    pushCandidate(meta.duration_ms);
    pushCandidate(meta.durationMs);
    pushCandidate(meta.duration);
    pushCandidate(meta.total_duration_ms);
  }

  const providedStarts = lines
    .map((line) => line.end_ms ?? line.start_ms)
    .filter((value): value is number => typeof value === 'number');
  if (providedStarts.length > 0) {
    candidates.push(Math.max(...providedStarts));
  }

  const estimatedByWords = lines.reduce((sum, line) => sum + line.wordCount * 420, 0);
  candidates.push(Math.max(estimatedByWords, lines.length * 1500));

  return Math.max(90000, Math.min(Math.max(...candidates), 420000));
}

function buildSegments(lines: NormalisedLine[], totalDurationMs: number): LyricsSegment[] {
  const sanitized = lines.map((line, index) => ({ ...line, idx: index })).filter((line) => line.text.length > 0);
  const explicitStarts = sanitized.filter((line) => typeof line.start_ms === 'number');
  const totalWords = sanitized.reduce((sum, line) => sum + line.wordCount, 0) || sanitized.length * 4;

  let cursor = 0;
  const fallbackStep = Math.max(1500, Math.round(totalDurationMs / Math.max(1, sanitized.length)));

  return sanitized.map((line, index) => {
    const wordsWeight = line.wordCount / totalWords;
    const weightedStep = Math.max(1200, Math.round(totalDurationMs * wordsWeight));

    let start = line.start_ms ?? cursor;
    if (index === 0 && start > 5000) {
      start = 0;
    }

    let end = line.end_ms;
    if (typeof end !== 'number') {
      const estimated = start + (explicitStarts.length > 0 ? fallbackStep : weightedStep);
      const safeRemaining = totalDurationMs - start;
      end = index === sanitized.length - 1
        ? Math.max(start + 800, totalDurationMs)
        : Math.min(Math.max(start + 800, estimated), start + safeRemaining);
    }

    if (end <= start) {
      end = start + 900;
    }

    cursor = Math.max(end, start + 900);

    return {
      idx: line.idx,
      start_ms: Math.round(start),
      end_ms: Math.round(Math.min(end, totalDurationMs)),
      text: line.text,
      role: line.role ?? null,
    } satisfies LyricsSegment;
  });
}

function estimateConfidence(lines: NormalisedLine[]): number {
  const withTimestamps = lines.filter((line) => typeof line.start_ms === 'number' || typeof line.end_ms === 'number');
  if (withTimestamps.length >= Math.floor(lines.length * 0.6)) {
    return 0.92;
  }
  if (withTimestamps.length >= Math.floor(lines.length * 0.3)) {
    return 0.82;
  }
  return 0.68;
}

function ownsSong(user: User, song: { created_by: string | null; user_id: string | null }): boolean {
  return Boolean(song.created_by && song.created_by === user.id) || Boolean(song.user_id && song.user_id === user.id);
}
