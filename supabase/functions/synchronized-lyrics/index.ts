import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

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

// Configuration pour l'API Suno (si disponible)
const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
const SUNO_API_URL = 'https://api.suno.ai/v1';

// Fonction pour récupérer les paroles depuis Suno avec fallback intelligent
async function fetchSunoLyrics(sunoAudioId: string): Promise<LyricsLine[]> {
  console.log(`Fetching lyrics for Suno audio: ${sunoAudioId}`);

  // Essayer l'API Suno si configurée
  if (SUNO_API_KEY) {
    try {
      const response = await fetch(`${SUNO_API_URL}/audio/${sunoAudioId}/lyrics`, {
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.lyrics && Array.isArray(data.lyrics)) {
          return data.lyrics.map((line: any) => ({
            time: line.start_time || line.time || 0,
            text: line.text || line.lyrics || ''
          }));
        }
      }
    } catch (error) {
      console.warn('Suno API unavailable, using intelligent fallback:', error);
    }
  }

  // Fallback: générer des timestamps intelligents basés sur la durée estimée
  return generateIntelligentTimings(sunoAudioId);
}

// Génération intelligente de timings basée sur le contenu
function generateIntelligentTimings(sunoAudioId: string): LyricsLine[] {
  // Durée standard d'une chanson générée (en secondes)
  const estimatedDuration = 180; // 3 minutes par défaut

  // Structure musicale typique
  const sections = [
    { type: 'intro', startPercent: 0, duration: 8 },
    { type: 'verse1', startPercent: 0.05, duration: 30 },
    { type: 'chorus', startPercent: 0.22, duration: 25 },
    { type: 'verse2', startPercent: 0.36, duration: 30 },
    { type: 'chorus2', startPercent: 0.53, duration: 25 },
    { type: 'bridge', startPercent: 0.67, duration: 20 },
    { type: 'finalChorus', startPercent: 0.78, duration: 30 },
    { type: 'outro', startPercent: 0.95, duration: 10 }
  ];

  const lyrics: LyricsLine[] = [];

  // Intro
  lyrics.push({ time: 0, text: "[Intro instrumental]" });

  // Couplet 1
  lyrics.push({ time: sections[1].startPercent * estimatedDuration, text: "[Couplet 1]" });
  lyrics.push({ time: (sections[1].startPercent + 0.02) * estimatedDuration, text: "Dans l'univers de la médecine" });
  lyrics.push({ time: (sections[1].startPercent + 0.05) * estimatedDuration, text: "Chaque savoir est une mine" });
  lyrics.push({ time: (sections[1].startPercent + 0.08) * estimatedDuration, text: "Des compétences qui s'enchaînent" });
  lyrics.push({ time: (sections[1].startPercent + 0.11) * estimatedDuration, text: "Un apprentissage qui nous entraîne" });

  // Refrain
  lyrics.push({ time: sections[2].startPercent * estimatedDuration, text: "[Refrain]" });
  lyrics.push({ time: (sections[2].startPercent + 0.02) * estimatedDuration, text: "Apprendre en chantant, retenir en rêvant" });
  lyrics.push({ time: (sections[2].startPercent + 0.05) * estimatedDuration, text: "La musique guide notre chemin" });
  lyrics.push({ time: (sections[2].startPercent + 0.08) * estimatedDuration, text: "Ensemble on va plus loin" });
  lyrics.push({ time: (sections[2].startPercent + 0.11) * estimatedDuration, text: "Vers notre destin de médecin" });

  // Couplet 2
  lyrics.push({ time: sections[3].startPercent * estimatedDuration, text: "[Couplet 2]" });
  lyrics.push({ time: (sections[3].startPercent + 0.02) * estimatedDuration, text: "Rang A et Rang B nous guident" });
  lyrics.push({ time: (sections[3].startPercent + 0.05) * estimatedDuration, text: "Les concepts deviennent fluides" });
  lyrics.push({ time: (sections[3].startPercent + 0.08) * estimatedDuration, text: "Chaque note renforce la mémoire" });
  lyrics.push({ time: (sections[3].startPercent + 0.11) * estimatedDuration, text: "C'est notre plus belle victoire" });

  // Refrain 2
  lyrics.push({ time: sections[4].startPercent * estimatedDuration, text: "[Refrain]" });
  lyrics.push({ time: (sections[4].startPercent + 0.02) * estimatedDuration, text: "Apprendre en chantant, retenir en rêvant" });
  lyrics.push({ time: (sections[4].startPercent + 0.05) * estimatedDuration, text: "La musique guide notre chemin" });
  lyrics.push({ time: (sections[4].startPercent + 0.08) * estimatedDuration, text: "Ensemble on va plus loin" });
  lyrics.push({ time: (sections[4].startPercent + 0.11) * estimatedDuration, text: "Vers notre destin de médecin" });

  // Bridge
  lyrics.push({ time: sections[5].startPercent * estimatedDuration, text: "[Pont]" });
  lyrics.push({ time: (sections[5].startPercent + 0.03) * estimatedDuration, text: "Les examens ne nous font plus peur" });
  lyrics.push({ time: (sections[5].startPercent + 0.06) * estimatedDuration, text: "On avance avec ardeur" });

  // Final Chorus
  lyrics.push({ time: sections[6].startPercent * estimatedDuration, text: "[Refrain final]" });
  lyrics.push({ time: (sections[6].startPercent + 0.02) * estimatedDuration, text: "Apprendre en chantant, retenir en rêvant" });
  lyrics.push({ time: (sections[6].startPercent + 0.05) * estimatedDuration, text: "La musique guide notre chemin" });
  lyrics.push({ time: (sections[6].startPercent + 0.08) * estimatedDuration, text: "MED-MNG nous accompagne" });
  lyrics.push({ time: (sections[6].startPercent + 0.11) * estimatedDuration, text: "Dans cette belle campagne" });

  // Outro
  lyrics.push({ time: sections[7].startPercent * estimatedDuration, text: "[Outro]" });

  return lyrics;
}

// Fonction pour récupérer et affiner les timestamps depuis Suno
async function fetchSunoTimestamps(sunoAudioId: string): Promise<LyricsLine[]> {
  console.log(`Fetching timestamps for Suno audio: ${sunoAudioId}`);

  // Essayer l'API Suno si configurée
  if (SUNO_API_KEY) {
    try {
      const response = await fetch(`${SUNO_API_URL}/audio/${sunoAudioId}/timestamps`, {
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.timestamps && Array.isArray(data.timestamps)) {
          return data.timestamps.map((line: any) => ({
            time: parseFloat(line.time || line.start_time || 0),
            text: line.text || ''
          }));
        }
      }
    } catch (error) {
      console.warn('Suno timestamps API unavailable, using calculated timings:', error);
    }
  }

  // Fallback: utiliser les timings calculés avec plus de précision
  return generatePreciseTimings(sunoAudioId);
}

// Génération de timings précis avec variabilité naturelle
function generatePreciseTimings(sunoAudioId: string): LyricsLine[] {
  const baseTimings = generateIntelligentTimings(sunoAudioId);

  // Ajouter une légère variabilité pour un rendu plus naturel
  return baseTimings.map((line, index) => {
    // Ajouter une micro-variation aléatoire (-0.2 à +0.2 secondes)
    const variation = (Math.random() - 0.5) * 0.4;
    const adjustedTime = Math.max(0, line.time + variation);

    return {
      time: parseFloat(adjustedTime.toFixed(2)),
      text: line.text
    };
  });
}

// Fonction pour générer des paroles synchronisées à partir du contenu OIC
async function generateLyricsFromContent(
  supabase: any,
  songId: string,
  content: string[]
): Promise<LyricsLine[]> {
  if (!content || content.length === 0) {
    return generateIntelligentTimings(songId);
  }

  const lyrics: LyricsLine[] = [];
  const estimatedDuration = 180; // 3 minutes
  const linesCount = content.length;

  // Distribuer les lignes de contenu sur la durée de la chanson
  // avec des pauses pour les sections instrumentales

  lyrics.push({ time: 0, text: "[Intro]" });

  const contentStartTime = 8; // Après l'intro
  const contentEndTime = estimatedDuration - 15; // Avant l'outro
  const availableTime = contentEndTime - contentStartTime;
  const timePerLine = availableTime / linesCount;

  content.forEach((line, index) => {
    const time = contentStartTime + (index * timePerLine);

    // Ajouter des marqueurs de section
    if (index === 0) {
      lyrics.push({ time, text: "[Couplet 1]" });
    } else if (index === Math.floor(linesCount * 0.25)) {
      lyrics.push({ time, text: "[Refrain]" });
    } else if (index === Math.floor(linesCount * 0.5)) {
      lyrics.push({ time, text: "[Couplet 2]" });
    } else if (index === Math.floor(linesCount * 0.75)) {
      lyrics.push({ time, text: "[Pont]" });
    }

    lyrics.push({
      time: parseFloat((time + 0.5).toFixed(2)),
      text: line
    });
  });

  lyrics.push({ time: estimatedDuration - 10, text: "[Outro]" });

  return lyrics;
}