import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../../_shared/cors.ts';

import { getErrorMessage } from '../../_shared/error-utils.ts';
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ: Authentification JWT obligatoire
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès suno-music-optimized sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour suno-music-optimized');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ suno-music-optimized autorisé pour user ${user.id}`);

    // Code original de la fonction
    
    console.log('🎵 GÉNÉRATION SUNO OPTIMISÉE - Début');
    
    const { paroles, style, rang, duration = 120 } = await req.json();
    
    // Validation rapide
    if (!paroles || paroles.length === 0) {
      throw new Error('Paroles manquantes');
    }

    console.log('🎵 Paramètres:', { 
      parolesCount: paroles.length, 
      style, 
      rang, 
      duration 
    });

    // Format optimisé pour Suno
    const prompt = `[Verse 1]
${paroles.slice(0, 4).join('\n')}

[Chorus]
EDN Formation - Rang ${rang}
Excellence médicale garantie

[Verse 2]
${paroles.slice(4, 8).join('\n')}

[Outro]
Compétences acquises avec succès
Formation médicale de qualité`;

    console.log('🎵 Prompt formaté (longueur:', prompt.length, ')');

    // Configuration optimisée Suno
    const sunoPayload = {
      prompt: prompt,
      make_instrumental: false,
      wait_audio: false, // Mode asynchrone plus rapide
      model: 'chirp-v3-0', // Version rapide
      tags: style || 'educational, upbeat',
      title: `EDN Rang ${rang} - Formation Médicale`
    };

    // Simulation de génération musicale rapide (remplacer par vraie API Suno)
    console.log('🚀 Démarrage génération Suno...');
    
    // Pour test - remplacer par l'appel réel à Suno
    const simulatedResponse = {
      id: `suno_${Date.now()}`,
      status: 'queued',
      audio_url: null,
      estimated_wait_time: 30
    };

    // En production, décommenter ceci:
    /*
    const sunoResponse = await fetch('https://api.suno.ai/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUNO_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sunoPayload)
    });

    if (!sunoResponse.ok) {
      throw new Error(`Suno API Error: ${sunoResponse.status}`);
    }

    const sunoData = await sunoResponse.json();
    */

    console.log('✅ Génération démarrée:', simulatedResponse.id);

    // Réponse immédiate pour éviter les timeouts
    return new Response(JSON.stringify({
      success: true,
      id: simulatedResponse.id,
      status: 'generating',
      message: 'Génération musicale démarrée en mode optimisé',
      estimated_completion: new Date(Date.now() + (duration * 1000)).toISOString(),
      // URL de démo pour test
      audio_url: 'https://www.soundjay.com/misc/beep-07a.wav'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('❌ Erreur génération Suno optimisée:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: getErrorMessage(error) || 'Erreur génération musicale',
      details: 'Vérifiez les paramètres et réessayez'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});