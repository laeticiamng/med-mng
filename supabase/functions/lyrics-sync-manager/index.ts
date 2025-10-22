import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const securityHeaders = {
  'Content-Security-Policy': "default-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};

interface TimestampedLyric {
  timestamp: number; // en millisecondes
  text: string;
  type: 'verse' | 'chorus' | 'bridge' | 'outro';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const songId = url.searchParams.get('song_id');
    const format = url.searchParams.get('format') || 'json'; // json, lrc, srt

    if (!songId) {
      return new Response(JSON.stringify({ error: 'song_id parameter required' }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Authentication required
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Vérifier que l'utilisateur a accès à ce morceau
    const { data: userSong, error: accessError } = await supabase
      .from('med_mng_user_songs')
      .select(`
        song_id,
        med_mng_songs (
          id,
          title,
          suno_audio_id,
          meta,
          lyrics
        )
      `)
      .eq('user_id', user.id)
      .eq('song_id', songId)
      .single();

    if (accessError || !userSong) {
      return new Response(JSON.stringify({ error: 'Song not found in your library' }), {
        status: 404,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    const song = userSong.med_mng_songs;

    // Vérifier si les paroles sont déjà en cache
    let lyrics = song.lyrics;

    if (!lyrics || !lyrics.timestamped_lyrics) {
      console.log('Paroles non cachées, récupération depuis Suno...');
      
      // Récupérer les paroles depuis Suno API
      const sunoApiKey = Deno.env.get('SUNO_API_KEY');
      if (!sunoApiKey) {
        throw new Error('Suno API key not configured');
      }

      try {
        const sunoResponse = await fetch(`https://api.suno.ai/v1/audio/${song.suno_audio_id}/lyrics`, {
          headers: {
            'Authorization': `Bearer ${sunoApiKey}`
          }
        });

        if (!sunoResponse.ok) {
          console.error(`Suno lyrics API error: ${sunoResponse.status}`);
          throw new Error('Failed to fetch lyrics from Suno');
        }

        const sunoLyrics = await sunoResponse.json();
        
        // Convertir les paroles Suno au format standardisé
        const timestampedLyrics = convertSunoLyricsToTimestamped(sunoLyrics, song.meta?.paroles);
        
        // Mettre en cache les paroles dans la base
        lyrics = {
          raw_lyrics: sunoLyrics,
          timestamped_lyrics: timestampedLyrics,
          generated_at: new Date().toISOString(),
          source: 'suno_api'
        };

        await supabase
          .from('med_mng_songs')
          .update({ lyrics })
          .eq('id', songId);

        console.log('Paroles mises en cache');

      } catch (sunoError) {
        console.error('Erreur récupération paroles Suno:', sunoError);
        
        // Fallback : générer des paroles basiques depuis les métadonnées
        if (song.meta?.paroles) {
          lyrics = {
            timestamped_lyrics: generateBasicTimestampedLyrics(song.meta.paroles, song.meta?.duration || 180),
            source: 'meta_fallback',
            generated_at: new Date().toISOString()
          };
        } else {
          return new Response(JSON.stringify({ 
            error: 'Lyrics not available for this song' 
          }), {
            status: 404,
            headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // Logger l'accès aux paroles
    await supabase.rpc('log_lyrics_access', {
      user_id: user.id,
      song_id: songId,
      format: format,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

    // Formater la réponse selon le format demandé
    if (format === 'lrc') {
      const lrcContent = convertToLRC(lyrics.timestamped_lyrics, song.title);
      return new Response(lrcContent, {
        headers: { 
          ...corsHeaders, 
          ...securityHeaders,
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'inline; filename="lyrics.lrc"'
        }
      });
    }

    if (format === 'srt') {
      const srtContent = convertToSRT(lyrics.timestamped_lyrics);
      return new Response(srtContent, {
        headers: { 
          ...corsHeaders, 
          ...securityHeaders,
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'inline; filename="lyrics.srt"'
        }
      });
    }

    // Format JSON par défaut
    return new Response(JSON.stringify({
      success: true,
      song: {
        id: song.id,
        title: song.title,
        duration: song.meta?.duration || 0
      },
      lyrics: {
        timestamped: lyrics.timestamped_lyrics,
        source: lyrics.source,
        generated_at: lyrics.generated_at
      },
      formats_available: ['json', 'lrc', 'srt']
    }), {
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Lyrics sync manager error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function convertSunoLyricsToTimestamped(sunoLyrics: any, metaParoles?: string[]): TimestampedLyric[] {
  // Si Suno retourne des timestamps, les utiliser
  if (sunoLyrics.segments && Array.isArray(sunoLyrics.segments)) {
    return sunoLyrics.segments.map((segment: any) => ({
      timestamp: Math.round(segment.start * 1000), // Convertir secondes en ms
      text: segment.text,
      type: detectLyricType(segment.text)
    }));
  }

  // Sinon, utiliser les paroles des métadonnées avec timing estimé
  if (metaParoles && Array.isArray(metaParoles)) {
    return generateBasicTimestampedLyrics(metaParoles, 180);
  }

  // Fallback avec paroles brutes de Suno
  if (sunoLyrics.text) {
    const lines = sunoLyrics.text.split('\n').filter((line: string) => line.trim());
    return generateBasicTimestampedLyrics(lines, 180);
  }

  return [];
}

function generateBasicTimestampedLyrics(paroles: string[], duration: number): TimestampedLyric[] {
  const timestamped: TimestampedLyric[] = [];
  const intervalMs = (duration * 1000) / paroles.length;

  paroles.forEach((line, index) => {
    if (line.trim()) {
      timestamped.push({
        timestamp: Math.round(index * intervalMs),
        text: line.trim(),
        type: detectLyricType(line)
      });
    }
  });

  return timestamped;
}

function detectLyricType(text: string): 'verse' | 'chorus' | 'bridge' | 'outro' {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('chorus') || textLower.includes('refrain')) return 'chorus';
  if (textLower.includes('bridge') || textLower.includes('pont')) return 'bridge';
  if (textLower.includes('outro') || textLower.includes('fin')) return 'outro';
  
  return 'verse';
}

function convertToLRC(lyrics: TimestampedLyric[], title: string): string {
  let lrc = `[ti:${title}]\n[ar:MedMng AI]\n[al:Formation Médicale]\n\n`;
  
  lyrics.forEach(lyric => {
    const minutes = Math.floor(lyric.timestamp / 60000);
    const seconds = Math.floor((lyric.timestamp % 60000) / 1000);
    const centiseconds = Math.floor((lyric.timestamp % 1000) / 10);
    
    lrc += `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}]${lyric.text}\n`;
  });
  
  return lrc;
}

function convertToSRT(lyrics: TimestampedLyric[]): string {
  let srt = '';
  
  lyrics.forEach((lyric, index) => {
    const startTime = formatSRTTime(lyric.timestamp);
    const endTime = formatSRTTime(lyric.timestamp + 3000); // 3 secondes par défaut
    
    srt += `${index + 1}\n${startTime} --> ${endTime}\n${lyric.text}\n\n`;
  });
  
  return srt;
}

function formatSRTTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}