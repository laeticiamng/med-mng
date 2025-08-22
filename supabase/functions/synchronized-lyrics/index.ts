import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
};

interface LyricsLine {
  time: number;
  text: string;
}

// Cache mémoire simple pour éviter de surcharger l'API Suno
// Stocke les paroles/timestamps par identifiant audio
const lyricsCache = new Map<string, { lines: LyricsLine[]; timestamp: number }>();
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes

interface LyricsRequest {
  action: 'get' | 'save' | 'generate_from_suno' | 'sync_timestamps';
  songId: string;
  lyrics?: LyricsLine[];
  source?: 'suno' | 'manual' | 'ai_generated';
  sunoAudioId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const requestData: LyricsRequest = await req.json();
    
    switch (requestData.action) {
      case 'get':
        return await getSynchronizedLyrics(supabase, requestData);
      
      case 'save':
        return await saveSynchronizedLyrics(supabase, requestData);
      
      case 'generate_from_suno':
        return await generateLyricsFromSuno(supabase, requestData);
      
      case 'sync_timestamps':
        return await syncTimestampsWithSuno(supabase, requestData);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in synchronized-lyrics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function getSynchronizedLyrics(supabase: any, request: LyricsRequest) {
  const { songId } = request;
  
  if (!songId) {
    throw new Error('Song ID is required');
  }

  const { data, error } = await supabase
    .from('med_mng_synchronized_lyrics')
    .select('*')
    .eq('song_id', songId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    throw error;
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      lyrics: data || null 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function saveSynchronizedLyrics(supabase: any, request: LyricsRequest) {
  const { songId, lyrics, source = 'manual' } = request;
  
  if (!songId || !lyrics) {
    throw new Error('Song ID and lyrics are required');
  }

  const { data, error } = await supabase
    .from('med_mng_synchronized_lyrics')
    .upsert({
      song_id: songId,
      lyrics_data: lyrics,
      source
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ 
      success: true, 
      lyrics: data 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function generateLyricsFromSuno(supabase: any, request: LyricsRequest) {
  const { songId, sunoAudioId } = request;
  
  if (!songId || !sunoAudioId) {
    throw new Error('Song ID and Suno Audio ID are required');
  }

  try {
    // Récupérer les paroles depuis Suno
    const lyrics = await fetchSunoLyrics(sunoAudioId);
    
    if (lyrics.length > 0) {
      const { data, error } = await supabase
        .from('med_mng_synchronized_lyrics')
        .upsert({
          song_id: songId,
          lyrics_data: lyrics,
          source: 'suno'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          lyrics: data 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      throw new Error('No lyrics found for this Suno audio');
    }

  } catch (error) {
    console.error('Error fetching Suno lyrics:', error);
    throw new Error('Failed to generate lyrics from Suno');
  }
}

async function syncTimestampsWithSuno(supabase: any, request: LyricsRequest) {
  const { songId, sunoAudioId } = request;
  
  if (!songId || !sunoAudioId) {
    throw new Error('Song ID and Suno Audio ID are required');
  }

  try {
    // Récupérer les timestamps depuis Suno
    const timestamps = await fetchSunoTimestamps(sunoAudioId);
    
    if (timestamps.length > 0) {
      const { data, error } = await supabase
        .from('med_mng_synchronized_lyrics')
        .update({
          lyrics_data: timestamps,
          source: 'suno'
        })
        .eq('song_id', songId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          lyrics: data 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      throw new Error('No timestamps available for this Suno audio');
    }

  } catch (error) {
    console.error('Error syncing Suno timestamps:', error);
    throw new Error('Failed to sync timestamps with Suno');
  }
}

// Récupération réelle des paroles depuis l'API Suno avec cache
async function fetchSunoLyrics(sunoAudioId: string): Promise<LyricsLine[]> {
  const cached = lyricsCache.get(sunoAudioId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.lines;
  }

  const apiKey = Deno.env.get('SUNO_API_KEY');
  if (!apiKey) {
    throw new Error('SUNO_API_KEY not configured');
  }

  console.log(`Fetching lyrics for Suno audio: ${sunoAudioId}`);

  const response = await fetch(`https://api.suno.ai/v1/audio/${sunoAudioId}/lyrics`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Suno lyrics API error: ${response.status}`);
  }

  const sunoData = await response.json();
  let lines: LyricsLine[] = [];

  if (Array.isArray(sunoData.segments)) {
    lines = sunoData.segments.map((seg: any) => ({
      time: seg.start,
      text: seg.text
    }));
  } else if (typeof sunoData.text === 'string') {
    const rawLines = sunoData.text.split('\n').filter((l: string) => l.trim().length > 0);
    lines = rawLines.map((line: string, index: number) => ({
      time: index * 4,
      text: line.trim()
    }));
  }

  lyricsCache.set(sunoAudioId, { lines, timestamp: Date.now() });
  return lines;
}

// Les timestamps sont fournis par l'endpoint de paroles
// Cette fonction retourne simplement les mêmes données
async function fetchSunoTimestamps(sunoAudioId: string): Promise<LyricsLine[]> {
  return fetchSunoLyrics(sunoAudioId);
}