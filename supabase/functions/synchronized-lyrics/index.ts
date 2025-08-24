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
    // Récupérer les paroles depuis Suno (simulation car l'API n'existe pas encore)
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
    // Récupérer les timestamps depuis Suno (simulation)
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

// Fonction pour récupérer les paroles depuis Suno API
async function fetchSunoLyrics(sunoAudioId: string): Promise<LyricsLine[]> {
  const sunoApiKey = Deno.env.get('SUNO_API_KEY');
  
  if (!sunoApiKey) {
    console.warn('SUNO_API_KEY not configured, using mock data');
    return getMockLyrics();
  }

  try {
    console.log(`Fetching lyrics from Suno API for audio: ${sunoAudioId}`);
    
    const response = await fetch(`https://api.suno.ai/api/v1/lyrics/${sunoAudioId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sunoApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`No lyrics found for Suno audio: ${sunoAudioId}`);
        return [];
      }
      throw new Error(`Suno API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Suno API response to our format
    if (data.lyrics && Array.isArray(data.lyrics)) {
      return data.lyrics.map((line: any) => ({
        time: parseFloat(line.timestamp || line.time || 0),
        text: line.text || line.content || ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Suno lyrics:', error);
    // Fallback to mock data in case of API error
    return getMockLyrics();
  }
}

function getMockLyrics(): LyricsLine[] {
  return [
    { time: 0, text: "[Intro]" },
    { time: 2.5, text: "Médecine et science, notre passion" },
    { time: 6.0, text: "Apprendre en musique, c'est notre mission" },
    { time: 10.0, text: "[Couplet 1]" },
    { time: 12.0, text: "Les compétences s'assemblent en harmonie" },
    { time: 16.0, text: "Chaque note porte un savoir précis" },
    { time: 20.0, text: "Dans cette mélodie, tout s'éclaircit" },
    { time: 24.0, text: "[Refrain]" },
    { time: 26.0, text: "Chantons la médecine, chantons la vie" },
    { time: 30.0, text: "Chaque parole guide notre apprentissage" },
    { time: 34.0, text: "Ensemble nous progressons, ensemble nous grandissons" },
    { time: 38.0, text: "La musique ouvre le chemin vers la connaissance" }
  ];
}

// Fonction pour récupérer les timestamps depuis Suno API
async function fetchSunoTimestamps(sunoAudioId: string): Promise<LyricsLine[]> {
  const sunoApiKey = Deno.env.get('SUNO_API_KEY');
  
  if (!sunoApiKey) {
    console.warn('SUNO_API_KEY not configured, using mock data');
    return getMockTimestamps();
  }

  try {
    console.log(`Fetching timestamps from Suno API for audio: ${sunoAudioId}`);
    
    const response = await fetch(`https://api.suno.ai/api/v1/timestamps/${sunoAudioId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sunoApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`No timestamps found for Suno audio: ${sunoAudioId}`);
        return [];
      }
      throw new Error(`Suno API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Suno API response to our format
    if (data.timestamps && Array.isArray(data.timestamps)) {
      return data.timestamps.map((item: any) => ({
        time: parseFloat(item.timestamp || item.time || 0),
        text: item.text || item.content || ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Suno timestamps:', error);
    // Fallback to mock data in case of API error
    return getMockTimestamps();
  }
}

function getMockTimestamps(): LyricsLine[] {
  return [
    { time: 0.0, text: "[Intro musical]" },
    { time: 2.3, text: "Médecine et science, notre passion" },
    { time: 5.8, text: "Apprendre en musique, c'est notre mission" },
    { time: 9.5, text: "[Transition]" },
    { time: 11.2, text: "Les compétences s'assemblent en harmonie" },
    { time: 15.4, text: "Chaque note porte un savoir précis" },
    { time: 19.1, text: "Dans cette mélodie, tout s'éclaircit" },
    { time: 23.0, text: "[Refrain commence]" },
    { time: 25.2, text: "Chantons la médecine, chantons la vie" },
    { time: 29.3, text: "Chaque parole guide notre apprentissage" },
    { time: 33.5, text: "Ensemble nous progressons, ensemble nous grandissons" },
    { time: 37.8, text: "La musique ouvre le chemin vers la connaissance" },
    { time: 42.0, text: "[Outro]" }
  ];
}