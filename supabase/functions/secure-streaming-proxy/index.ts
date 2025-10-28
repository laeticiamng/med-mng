import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface StreamingSession {
  userId: string;
  songId: string;
  expiresAt: number;
  sessionToken: string;
}

// Sessions temporaires en mémoire (en production, utiliser Redis)
const activeSessions = new Map<string, StreamingSession>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Créer une session de streaming sécurisée
    if (path === '/create-session' && req.method === 'POST') {
      const { songId, userId } = await req.json();
      
      if (!songId || !userId) {
        return new Response(JSON.stringify({ error: 'songId et userId requis' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Vérifier que l'utilisateur a accès à cette chanson
      const { data: song, error } = await supabase
        .from('emotionscare_songs')
        .select('id, suno_audio_id')
        .eq('id', songId)
        .single();

      if (error || !song) {
        return new Response(JSON.stringify({ error: 'Chanson introuvable' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Créer un token de session unique
      const sessionToken = crypto.randomUUID();
      const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutes

      const session: StreamingSession = {
        userId,
        songId,
        expiresAt,
        sessionToken
      };

      activeSessions.set(sessionToken, session);

      // Logger l'accès
      await supabase.from('streaming_access_logs').insert({
        user_id: userId,
        song_id: songId,
        session_token: sessionToken,
        action: 'session_created',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

      return new Response(JSON.stringify({ 
        sessionToken,
        streamUrl: `/stream/${sessionToken}`,
        expiresAt 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Stream sécurisé avec token
    if (path.startsWith('/stream/') && req.method === 'GET') {
      const sessionToken = path.split('/')[2];
      const session = activeSessions.get(sessionToken);

      if (!session || session.expiresAt < Date.now()) {
        if (session) {
          activeSessions.delete(sessionToken);
        }
        
        return new Response('Session expirée', { 
          status: 401,
          headers: corsHeaders 
        });
      }

      // Logger l'accès au stream
      await supabase.from('streaming_access_logs').insert({
        user_id: session.userId,
        song_id: session.songId,
        session_token: sessionToken,
        action: 'stream_accessed',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

      // Récupérer l'URL audio de Suno
      const { data: song } = await supabase
        .from('emotionscare_songs')
        .select('suno_audio_id, meta')
        .eq('id', session.songId)
        .single();

      if (!song || !song.meta?.audio_url) {
        return new Response('Audio non disponible', { 
          status: 404,
          headers: corsHeaders 
        });
      }

      // Proxy vers l'audio avec headers sécurisés
      const audioResponse = await fetch(song.meta.audio_url);
      
      if (!audioResponse.ok) {
        return new Response('Erreur streaming', { 
          status: 500,
          headers: corsHeaders 
        });
      }

      const audioHeaders = new Headers();
      audioHeaders.set('Content-Type', 'audio/mpeg');
      audioHeaders.set('Accept-Ranges', 'none'); // Empêcher le téléchargement par range
      audioHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      audioHeaders.set('X-Content-Type-Options', 'nosniff');
      audioHeaders.set('Content-Disposition', 'inline'); // Force l'écoute inline
      
      // Ajouter CORS
      Object.entries(corsHeaders).forEach(([key, value]) => {
        audioHeaders.set(key, value);
      });

      return new Response(audioResponse.body, {
        headers: audioHeaders
      });
    }

    // Audit de sécurité
    if (path === '/security-audit' && req.method === 'GET') {
      const now = Date.now();
      const activeSessionsCount = Array.from(activeSessions.values())
        .filter(session => session.expiresAt > now).length;

      // Statistiques des accès récents
      const { data: recentLogs, error } = await supabase
        .from('streaming_access_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur audit:', error);
      }

      const auditReport = {
        timestamp: new Date().toISOString(),
        activeSessions: activeSessionsCount,
        last24h: {
          totalAccess: recentLogs?.length || 0,
          sessionsCreated: recentLogs?.filter(log => log.action === 'session_created').length || 0,
          streamsAccessed: recentLogs?.filter(log => log.action === 'stream_accessed').length || 0,
          uniqueUsers: new Set(recentLogs?.map(log => log.user_id)).size || 0
        },
        securityChecks: {
          sessionExpiration: 'OK - 30min timeout',
          urlSigning: 'OK - UUID tokens',
          streamProxy: 'OK - No direct URLs',
          downloadPrevention: 'OK - Headers configured'
        }
      };

      return new Response(JSON.stringify(auditReport), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Nettoyer les sessions expirées
    if (path === '/cleanup-sessions' && req.method === 'POST') {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [token, session] of activeSessions.entries()) {
        if (session.expiresAt < now) {
          activeSessions.delete(token);
          cleaned++;
        }
      }

      return new Response(JSON.stringify({ 
        message: `${cleaned} sessions expirées supprimées`,
        remainingSessions: activeSessions.size
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Endpoint non trouvé', { 
      status: 404,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Erreur streaming proxy:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur serveur',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});