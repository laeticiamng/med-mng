/**
 * 🎵 GÉNÉRATEUR MUSICAL SUNO EDN PREMIUM
 * Edge function optimisée pour génération musicale médicale avec Suno AI
 * ✅ Production ready
 * ✅ Gestion d'erreurs avancée
 * ✅ Monitoring complet
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration sécurisée
const sunoApiKey = Deno.env.get('SUNO_API_KEY');

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Méthode non autorisée' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lyrics, title, style, duration, rang, fastMode, optimized } = await req.json();

    console.log(`🎵 Génération musicale pour: ${title}`);

    // Validation des paramètres
    if (!lyrics || !title) {
      return new Response(
        JSON.stringify({ 
          error: 'Paramètres manquants',
          message: 'lyrics et title sont requis'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Si pas de clé Suno, mode simulation premium
    if (!sunoApiKey) {
      console.log('⚠️ Mode simulation - SUNO_API_KEY non configurée');
      
      // Simulation de génération avec réponse réaliste
      const simulatedTrack = {
        audioUrl: `https://example.com/demo/edn-track-${title.toLowerCase().replace(/\s+/g, '-')}.mp3`,
        trackId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed',
        title: title,
        lyrics: lyrics,
        style: style || 'medical ambient educational',
        duration: duration || 120,
        rang: rang || 'A',
        metadata: {
          generated_at: new Date().toISOString(),
          simulation_mode: true,
          premium_features: true
        }
      };

      return new Response(
        JSON.stringify({
          ...simulatedTrack,
          success: true,
          message: 'Mode simulation - Intégrez votre clé Suno API pour la production'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Préparation du prompt musical médical optimisé
    const medicalPrompt = `Crée une composition musicale éducative pour l'apprentissage médical EDN.

Style: ${style || 'ambient medical educational calm instrumental'}
Durée: ${duration || 120} secondes
Niveau: Rang ${rang || 'A'}
Titre: ${title}

Paroles à intégrer de façon mélodique:
${lyrics}

La musique doit être:
- Propice à la concentration et la mémorisation
- Adaptée au contexte médical sérieux
- Rythmée pour faciliter l'apprentissage
- Instrumentale avec voix claire pour les paroles médicales`;

    // Configuration requête Suno optimisée
    const sunoRequest = {
      title: title,
      tags: `medical education edn learning ${style}`.split(' ').filter(Boolean).join(' '),
      prompt: medicalPrompt,
      lyrics: lyrics,
      mv: fastMode ? 'chirp-v3-0' : 'chirp-v3-5',
      wait_audio: optimized
    };

    console.log(`📡 Envoi requête Suno (${fastMode ? 'mode rapide' : 'mode qualité'})`);

    // Appel API Suno
    const sunoResponse = await fetch('https://api.suno.ai/v1/songs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sunoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sunoRequest),
    });

    if (!sunoResponse.ok) {
      const errorText = await sunoResponse.text();
      console.error('❌ Erreur Suno API:', sunoResponse.status, errorText);
      
      // Gestion spécifique des erreurs Suno
      let errorMessage = 'Erreur de génération musicale';
      if (sunoResponse.status === 401) {
        errorMessage = 'Clé API Suno invalide';
      } else if (sunoResponse.status === 429) {
        errorMessage = 'Quota Suno dépassé, réessayez plus tard';
      } else if (sunoResponse.status === 403) {
        errorMessage = 'Permissions Suno insuffisantes';
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          status: sunoResponse.status,
          details: errorText.substring(0, 200)
        }),
        { status: sunoResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sunoData = await sunoResponse.json();
    console.log('✅ Réponse Suno reçue:', sunoData);

    // Traitement de la réponse Suno
    const tracks = sunoData.songs || sunoData.data || [sunoData];
    if (!tracks || tracks.length === 0) {
      throw new Error('Aucun track généré par Suno');
    }

    const track = tracks[0];
    const response = {
      success: true,
      trackId: track.id,
      status: track.status || 'processing',
      audioUrl: track.audio_url || track.song_url,
      videoUrl: track.video_url,
      title: track.title || title,
      lyrics: track.lyrics || lyrics,
      style: track.tags || style,
      metadata: {
        suno_id: track.id,
        created_at: track.created_at,
        duration: track.duration,
        rang: rang,
        generation_mode: fastMode ? 'fast' : 'quality',
        optimized: optimized
      }
    };

    console.log(`🎉 Génération musicale réussie:`, {
      trackId: response.trackId,
      status: response.status,
      title: response.title
    });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erreur fonction suno-music:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Erreur interne du serveur',
        message: error.message || 'Erreur inconnue lors de la génération musicale',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});