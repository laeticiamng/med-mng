import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('Non autorisé');
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'generate_recommendations': {
        // Récupérer l'historique d'écoute
        const { data: listeningHistory } = await supabase
          .from('med_mng_listening_events')
          .select(`
            song_id,
            event_type,
            timestamp,
            med_mng_songs!inner(title, artist, genre, mood, tags)
          `)
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(50);

        // Récupérer les préférences utilisateur
        const { data: preferences } = await supabase
          .from('med_mng_user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Analyser les patterns avec OpenAI
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              {
                role: 'system',
                content: `Tu es un expert en recommandations musicales pour la médecine. Analyse l'historique d'écoute et les préférences pour recommander des chansons médicales pertinentes.
                
                Historique d'écoute: ${JSON.stringify(listeningHistory?.slice(0, 20))}
                Préférences: ${JSON.stringify(preferences)}
                
                Réponds UNIQUEMENT avec un JSON contenant:
                {
                  "recommendations": [
                    {
                      "reason": "raison de la recommandation",
                      "genre": "genre recommandé",
                      "mood": "humeur recommandée", 
                      "specialty": "spécialité médicale",
                      "confidence": 0.8
                    }
                  ],
                  "listening_pattern": "description du pattern d'écoute",
                  "suggestions": ["suggestion 1", "suggestion 2"]
                }`
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          }),
        });

        const aiData = await openAIResponse.json();
        const analysis = JSON.parse(aiData.choices[0].message.content);

        // Sauvegarder les recommandations
        const recommendationsToSave = analysis.recommendations.map((rec: any) => ({
          user_id: user.id,
          recommendation_type: 'ai_generated',
          content: rec,
          confidence_score: rec.confidence,
          reason: rec.reason
        }));

        await supabase
          .from('med_mng_recommendations')
          .upsert(recommendationsToSave);

        return new Response(JSON.stringify(analysis), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_personalized_playlist': {
        const { specialty, mood, study_context } = params;

        // Récupérer les chansons correspondantes
        let query = supabase
          .from('med_mng_songs')
          .select('*');

        if (specialty) query = query.eq('specialty', specialty);
        if (mood) query = query.eq('mood', mood);

        const { data: songs } = await query.limit(20);

        // Analyser avec IA pour personnaliser l'ordre
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              {
                role: 'system',
                content: `Ordonne cette liste de chansons médicales pour optimiser l'apprentissage selon le contexte: ${study_context}
                
                Chansons: ${JSON.stringify(songs)}
                
                Réponds avec un JSON: {"ordered_songs": [liste des IDs dans l'ordre optimal], "reasoning": "explication"}`
              }
            ],
            temperature: 0.3,
            max_tokens: 800
          }),
        });

        const aiData = await openAIResponse.json();
        const result = JSON.parse(aiData.choices[0].message.content);

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error('Action non supportée');
    }

  } catch (error) {
    console.error('Erreur AI recommendations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});