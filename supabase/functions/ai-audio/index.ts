/**
 * 🎵 AI-AUDIO - Routeur Edge Function pour tous les services audio/musique
 * 
 * Regroupe les fonctions :
 * - generate-music → action: "generate_music"
 * - music-status → action: "get_status"
 * - suno-callback → action: "callback"
 * - suno-extend-music → action: "extend"
 * - suno-generate-lyrics → action: "generate_lyrics"
 * - suno-upload-cover → action: "upload_cover"
 * - suno-credits → action: "get_credits"
 * - suno-audio-processing → action: "process_audio"
 * - secure-audio-stream → action: "stream"
 * - generate-voice → action: "generate_voice"
 * - lyrics-sync-manager → action: "sync_lyrics"
 * - playlist-manager → action: "manage_playlist"
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { 
  SunoAPIClient, 
  getCorrectSunoModel, 
  getModelLimits,
  type SunoGenerationOptions,
  type SunoModel,
  type VocalGender
} from '../_shared/suno-api-client.ts';
import { 
  buildRichEducationalPrompt, 
  buildRichStyle, 
  buildExpressiveTitle 
} from '../_shared/prompt-builders.ts';
import { 
  insertMusicTrack, 
  insertGenerationMetric, 
  getAuthenticatedUser,
  updateTrackStatus,
  type MusicTrackInsertData
} from '../_shared/music-database.ts';

// Types
type AudioAction = 
  | 'generate_music'
  | 'get_status'
  | 'callback'
  | 'extend'
  | 'generate_lyrics'
  | 'upload_cover'
  | 'get_credits'
  | 'process_audio'
  | 'stream'
  | 'generate_voice'
  | 'sync_lyrics'
  | 'manage_playlist';

interface AudioRequest {
  action: AudioAction;
  payload?: any;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('authorization');
    const { userId, isAuthenticated } = await getAuthenticatedUser(supabase, authHeader);

    const body = await req.json();
    const action: AudioAction = body.action;
    const payload = body.payload || body;

    console.log(`🎵 AI-AUDIO [${action}] - User: ${userId || 'anonymous'}`);

    switch (action) {
      case 'generate_music':
        return await handleGenerateMusic(supabase, payload, userId, startTime);
      
      case 'get_status':
        return await handleGetStatus(supabase, payload);
      
      case 'extend':
        return await handleExtend(payload);
      
      case 'generate_lyrics':
        return await handleGenerateLyrics(payload);
      
      case 'get_credits':
        return await handleGetCredits();
      
      case 'process_audio':
        return await handleProcessAudio(payload);
      
      case 'generate_voice':
        return await handleGenerateVoice(supabase, payload, userId);
      
      case 'callback':
        return await handleCallback(supabase, payload);
      
      case 'stream':
        return await handleStream(supabase, payload, userId);
      
      case 'sync_lyrics':
        return await handleSyncLyrics(supabase, payload);
      
      case 'manage_playlist':
        return await handleManagePlaylist(supabase, payload, userId);
      
      default:
        return new Response(JSON.stringify({
          error: 'Invalid action',
          available_actions: [
            'generate_music', 'get_status', 'extend', 'generate_lyrics',
            'get_credits', 'process_audio', 'generate_voice', 'callback',
            'stream', 'sync_lyrics', 'manage_playlist'
          ]
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('❌ AI-AUDIO Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleGenerateMusic(supabase: any, payload: any, userId: string | null, startTime: number) {
  const {
    lyrics = '',
    style = 'lofi-piano',
    rang = 'A',
    duration = 240,
    language = 'fr',
    itemCode = 'EDN',
    customMode = true,
    instrumental = false,
    model = 'V4_5ALL',
    title,
    personaId,
    negativeTags,
    vocalGender,
    styleWeight,
    weirdnessConstraint,
    audioWeight
  } = payload;

  const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
  if (!SUNO_API_KEY || SUNO_API_KEY.length < 10) {
    throw new Error('SUNO_API_KEY manquante ou invalide');
  }

  const correctModel = getCorrectSunoModel(model);
  const modelLimits = getModelLimits(correctModel);
  
  let enhancedPrompt = lyrics || buildRichEducationalPrompt(itemCode, rang, style, 'relaxing', 'moderate');
  const maxPromptLength = customMode ? modelLimits.promptMax : 500;
  if (enhancedPrompt.length > maxPromptLength) {
    enhancedPrompt = enhancedPrompt.substring(0, maxPromptLength - 3) + '...';
  }

  let enhancedStyle = buildRichStyle(style, 'relaxing', 'moderate', ['piano', 'strings']);
  if (enhancedStyle.length > modelLimits.styleMax) {
    enhancedStyle = enhancedStyle.substring(0, modelLimits.styleMax - 3) + '...';
  }

  let enhancedTitle = title || buildExpressiveTitle(itemCode, rang, style);
  if (enhancedTitle.length > modelLimits.titleMax) {
    enhancedTitle = enhancedTitle.substring(0, modelLimits.titleMax - 3) + '...';
  }

  const sunoClient = new SunoAPIClient(SUNO_API_KEY);
  const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-audio`;

  const sunoPayload: SunoGenerationOptions = {
    customMode,
    instrumental,
    model: correctModel,
    callBackUrl: callbackUrl,
    prompt: enhancedPrompt,
    style: enhancedStyle,
    title: enhancedTitle,
    ...(personaId && { personaId }),
    ...(negativeTags && { negativeTags }),
    ...(vocalGender && { vocalGender }),
    ...(typeof styleWeight === 'number' && { styleWeight }),
    ...(typeof weirdnessConstraint === 'number' && { weirdnessConstraint }),
    ...(typeof audioWeight === 'number' && { audioWeight })
  };

  const taskId = await sunoClient.generateMusic(sunoPayload);
  const apiResponseTime = Date.now() - startTime;

  const trackData: MusicTrackInsertData = {
    task_id: taskId,
    title: enhancedTitle,
    suno_track_id: taskId,
    metadata: {
      style, rang, duration, language, itemCode,
      model: correctModel, prompt: enhancedPrompt,
      provider: 'suno', generatedAt: new Date().toISOString()
    },
    generation_status: 'generating'
  };
  if (userId) trackData.user_id = userId;

  await insertMusicTrack(supabase, trackData);
  await insertGenerationMetric(supabase, {
    track_id: taskId, user_id: userId || undefined,
    content_type: itemCode.toLowerCase(), item_code: itemCode,
    rang, style, status: 'initiated', api_response_time_ms: apiResponseTime
  });

  return new Response(JSON.stringify({
    success: true,
    trackId: taskId,
    metadata: {
      title: enhancedTitle, style, duration,
      mood: 'relaxing', tempo: 'moderate',
      model: correctModel, prompt: enhancedPrompt,
      generatedAt: new Date().toISOString(),
      status: 'generating',
      estimated_duration: '2-3 minutes'
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGetStatus(supabase: any, payload: any) {
  const { taskId } = payload;
  if (!taskId) {
    return new Response(JSON.stringify({ success: false, error: 'taskId required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Check DB first
  const { data: dbTrack } = await supabase
    .from('generated_music_tracks')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dbTrack?.generation_status === 'completed' && dbTrack?.audio_url) {
    return new Response(JSON.stringify({
      success: true, status: 'completed', taskId,
      audioUrl: dbTrack.audio_url,
      streamUrl: dbTrack.stream_url || dbTrack.metadata?.stream_url,
      imageUrl: dbTrack.image_url || dbTrack.metadata?.image_url,
      metadata: { ...dbTrack.metadata, duration: dbTrack.duration }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (dbTrack?.generation_status === 'failed') {
    return new Response(JSON.stringify({
      success: true, status: 'failed', taskId,
      error: dbTrack.metadata?.error || 'Génération échouée'
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Check Suno API
  const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
  if (!SUNO_API_KEY) {
    return new Response(JSON.stringify({ success: true, status: 'generating', taskId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const sunoResponse = await fetch(`https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`, {
    headers: { 'Authorization': `Bearer ${SUNO_API_KEY}` }
  });

  if (!sunoResponse.ok) {
    return new Response(JSON.stringify({ success: true, status: 'generating', taskId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const sunoData = await sunoResponse.json();
  let mappedStatus: 'generating' | 'completed' | 'failed' = 'generating';
  let audioUrl: string | undefined;
  let streamUrl: string | undefined;
  let imageUrl: string | undefined;

  if (sunoData.code === 200 && sunoData.data) {
    const taskData = sunoData.data;
    if (taskData.status === 'SUCCESS' || taskData.status === 'FIRST_SUCCESS') {
      mappedStatus = 'completed';
      if (taskData.response?.sunoData?.[0]) {
        const track = taskData.response.sunoData[0];
        audioUrl = track.audioUrl;
        streamUrl = track.streamAudioUrl;
        imageUrl = track.imageUrl;
      }
    } else if (['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'SENSITIVE_WORD_ERROR'].includes(taskData.status)) {
      mappedStatus = 'failed';
    }
  }

  if (mappedStatus === 'completed' && audioUrl) {
    await supabase.from('generated_music_tracks').update({
      audio_url: audioUrl, stream_url: streamUrl, image_url: imageUrl,
      generation_status: 'completed', updated_at: new Date().toISOString()
    }).eq('task_id', taskId);
  }

  return new Response(JSON.stringify({
    success: true, status: mappedStatus, taskId, audioUrl, streamUrl, imageUrl
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function handleExtend(payload: any) {
  const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
  if (!SUNO_API_KEY) throw new Error('SUNO_API_KEY missing');

  const { audioId, prompt, continueAt, model = 'V4_5' } = payload;
  if (!audioId) throw new Error('audioId required');

  const response = await fetch('https://api.sunoapi.org/api/v1/extend', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audioId,
      prompt: prompt || '',
      continueAt: continueAt || 0,
      model,
      defaultParamFlag: false
    })
  });

  const data = await response.json();
  if (data.code !== 200) throw new Error(data.msg || 'Extend failed');

  return new Response(JSON.stringify({ success: true, taskId: data.data?.taskId }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGenerateLyrics(payload: any) {
  const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
  if (!SUNO_API_KEY) throw new Error('SUNO_API_KEY missing');

  const { prompt } = payload;
  if (!prompt) throw new Error('prompt required');

  const response = await fetch('https://api.sunoapi.org/api/v1/lyrics/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();
  return new Response(JSON.stringify({ success: true, taskId: data.data?.taskId, lyrics: data.data?.lyrics }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGetCredits() {
  const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
  if (!SUNO_API_KEY) {
    return new Response(JSON.stringify({ credits: -1 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch('https://api.sunoapi.org/api/v1/get-credits', {
      headers: { 'Authorization': `Bearer ${SUNO_API_KEY}` }
    });
    const data = await response.json();
    return new Response(JSON.stringify({
      credits: data.data?.credits || 0,
      plan: data.data?.plan,
      used: data.data?.used,
      total: data.data?.total
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ credits: -1 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleProcessAudio(payload: any) {
  const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
  if (!SUNO_API_KEY) throw new Error('SUNO_API_KEY missing');

  const { operation, taskId, audioId, audioUrl } = payload;

  if (operation === 'extract_vocals') {
    if (!taskId || !audioId) throw new Error('taskId and audioId required');
    const response = await fetch('https://api.sunoapi.org/api/v1/vocal-removal', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ taskId, audioId })
    });
    const data = await response.json();
    return new Response(JSON.stringify(data.data || data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (operation === 'convert_wav') {
    if (!audioUrl) throw new Error('audioUrl required');
    const response = await fetch('https://api.sunoapi.org/api/v1/wav', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ audioUrl })
    });
    const data = await response.json();
    return new Response(JSON.stringify(data.data || data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  throw new Error('Invalid operation. Use: extract_vocals, convert_wav');
}

async function handleGenerateVoice(supabase: any, payload: any, userId: string | null) {
  const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!elevenLabsApiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  const {
    text,
    voiceId = '9BWtsMINqrJLrRacOk9x',
    model = 'eleven_multilingual_v2',
    settings = { stability: 0.5, similarityBoost: 0.75, style: 0.0, useSpeakerBoost: true }
  } = payload;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': elevenLabsApiKey
    },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: {
        stability: settings.stability,
        similarity_boost: settings.similarityBoost,
        style: settings.style,
        use_speaker_boost: settings.useSpeakerBoost
      }
    })
  });

  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);

  const audioBuffer = await response.arrayBuffer();
  const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

  return new Response(JSON.stringify({
    success: true,
    audioBase64,
    metadata: { voiceId, model, generatedAt: new Date().toISOString() }
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function handleCallback(supabase: any, payload: any) {
  // Simplified callback handler - main logic preserved
  console.log('🔔 Callback received:', JSON.stringify(payload, null, 2));
  
  if (payload.code === 200 && payload.data) {
    const { callbackType, data: tracks, task_id } = payload.data;
    
    if ((callbackType === 'complete' || callbackType === 'first') && tracks?.length > 0) {
      const trackWithAudio = tracks.find((t: any) => t.audio_url || t.source_audio_url);
      
      if (trackWithAudio) {
        await supabase.from('generated_music_tracks').update({
          audio_url: trackWithAudio.audio_url || trackWithAudio.source_audio_url,
          stream_url: trackWithAudio.stream_audio_url,
          image_url: trackWithAudio.image_url,
          generation_status: 'completed',
          updated_at: new Date().toISOString()
        }).eq('task_id', task_id);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleStream(supabase: any, payload: any, userId: string | null) {
  const { audioUrl, trackId } = payload;
  if (!audioUrl) throw new Error('audioUrl required');

  // Log access
  if (trackId) {
    await supabase.from('audio_access_logs').insert({
      track_id: trackId,
      user_id: userId,
      access_type: 'stream',
      accessed_at: new Date().toISOString()
    }).catch(() => {}); // Non-blocking
  }

  return new Response(JSON.stringify({
    success: true,
    streamUrl: audioUrl,
    signedUrl: audioUrl // Could add signing logic here
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function handleSyncLyrics(supabase: any, payload: any) {
  const { trackId, lyrics, timestamps } = payload;
  
  if (!trackId) throw new Error('trackId required');

  const { error } = await supabase.from('synchronized_lyrics').upsert({
    track_id: trackId,
    lyrics,
    timestamps,
    updated_at: new Date().toISOString()
  }, { onConflict: 'track_id' });

  if (error) throw error;

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleManagePlaylist(supabase: any, payload: any, userId: string | null) {
  if (!userId) throw new Error('Authentication required');

  const { operation, playlistId, name, trackIds } = payload;

  switch (operation) {
    case 'create': {
      const { data, error } = await supabase.from('playlists').insert({
        name,
        user_id: userId,
        track_ids: trackIds || []
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, playlist: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    case 'add_tracks': {
      const { data: existing } = await supabase.from('playlists')
        .select('track_ids').eq('id', playlistId).single();
      const newTracks = [...(existing?.track_ids || []), ...(trackIds || [])];
      const { error } = await supabase.from('playlists')
        .update({ track_ids: newTracks }).eq('id', playlistId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    case 'list': {
      const { data, error } = await supabase.from('playlists')
        .select('*').eq('user_id', userId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, playlists: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    default:
      throw new Error('Invalid operation: use create, add_tracks, or list');
  }
}
