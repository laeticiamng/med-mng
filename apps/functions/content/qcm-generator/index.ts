import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // POST /generate-qcm - Generate QCM questions for an item
    if (req.method === 'POST' && path === '/generate-qcm') {
      const { item_code, session_type, question_count = 10 } = await req.json();

      if (!item_code || !session_type) {
        return new Response(JSON.stringify({ error: 'Item code et type de session requis' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get item data
      const { data: itemData } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', item_code)
        .single();

      if (!itemData) {
        return new Response(JSON.stringify({ error: 'Item non trouvé' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate QCM using OpenAI
      const prompt = `Génère ${question_count} questions QCM pour l'item médical ${item_code} - ${itemData.title}.

Type de session: ${session_type}
${session_type === 'rang_a' ? 'Focus sur les connaissances de base (Rang A)' : 
  session_type === 'rang_b' ? 'Focus sur les connaissances approfondies (Rang B)' : 
  'Mix des connaissances Rang A et B'}

Contenu à couvrir:
${session_type === 'rang_a' || session_type === 'mixed' ? JSON.stringify(itemData.tableau_rang_a) : ''}
${session_type === 'rang_b' || session_type === 'mixed' ? JSON.stringify(itemData.tableau_rang_b) : ''}

Format de réponse JSON:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Explication détaillée",
      "medical_concept": "Concept médical principal",
      "difficulty": "facile|moyen|difficile",
      "rang": "A|B"
    }
  ]
}

Critères:
- Questions précises et cliniquement pertinentes
- 4 options par question (A, B, C, D)
- Explications pédagogiques détaillées
- Concepts médicaux clairs
- Niveau de difficulté adapté au rang`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: 'Tu es un expert en pédagogie médicale spécialisé dans la création de QCM EDN de haute qualité.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur OpenAI');
      }

      const aiResponse = await response.json();
      const generatedContent = JSON.parse(aiResponse.choices[0].message.content);

      return new Response(JSON.stringify({
        success: true,
        item_code,
        session_type,
        questions: generatedContent.questions,
        generated_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /start-qcm-session - Start a new QCM session
    if (req.method === 'POST' && path === '/start-qcm-session') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { item_code, session_type, questions } = await req.json();

      // Get user
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create session
      const { data: session, error } = await supabase
        .from('qcm_sessions')
        .insert({
          item_code,
          session_type,
          total_questions: questions.length,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        session_id: session.id,
        questions
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /submit-qcm-response - Submit a QCM response
    if (req.method === 'POST' && path === '/submit-qcm-response') {
      const { session_id, question_id, question_text, user_answer, correct_answer, response_time, explanation, medical_concept } = await req.json();

      const is_correct = user_answer === correct_answer;

      const { error } = await supabase
        .from('qcm_responses')
        .insert({
          session_id,
          question_id,
          question_text,
          user_answer,
          correct_answer,
          is_correct,
          explanation,
          medical_concept,
          response_time_seconds: response_time
        });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        is_correct,
        explanation
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /complete-qcm-session - Complete QCM session and calculate score
    if (req.method === 'POST' && path === '/complete-qcm-session') {
      const { session_id } = await req.json();

      // Get all responses for this session
      const { data: responses } = await supabase
        .from('qcm_responses')
        .select('*')
        .eq('session_id', session_id);

      if (!responses) {
        return new Response(JSON.stringify({ error: 'Session non trouvée' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const correct_answers = responses.filter(r => r.is_correct).length;
      const incorrect_answers = responses.length - correct_answers;
      const score = (correct_answers / responses.length) * 100;

      // Update session
      const { data: session, error } = await supabase
        .from('qcm_sessions')
        .update({
          score,
          correct_answers,
          incorrect_answers,
          completed_at: new Date().toISOString()
        })
        .eq('id', session_id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get incorrect answers for error song generation
      const incorrectAnswers = responses.filter(r => !r.is_correct);

      return new Response(JSON.stringify({
        success: true,
        session,
        score,
        correct_answers,
        incorrect_answers,
        total_questions: responses.length,
        incorrect_responses: incorrectAnswers,
        can_generate_error_song: incorrectAnswers.length > 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /generate-error-song - Generate song from QCM errors
    if (req.method === 'POST' && path === '/generate-error-song') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { session_id, incorrect_responses } = await req.json();

      if (!incorrect_responses || incorrect_responses.length === 0) {
        return new Response(JSON.stringify({ error: 'Aucune erreur à analyser' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get user and session info
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      const { data: session } = await supabase
        .from('qcm_sessions')
        .select('*')
        .eq('id', session_id)
        .single();

      if (!session || !user) {
        return new Response(JSON.stringify({ error: 'Session ou utilisateur non trouvé' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create prompt for error song
      const errorConcepts = incorrect_responses.map(r => ({
        concept: r.medical_concept,
        question: r.question_text,
        correct_answer: r.correct_answer,
        user_answer: r.user_answer,
        explanation: r.explanation
      }));

      const songPrompt = `Crée une chanson pédagogique pour mémoriser les erreurs du QCM sur l'item ${session.item_code}.

Erreurs à corriger:
${errorConcepts.map((error, i) => `
${i + 1}. Concept: ${error.concept}
Question: ${error.question}
Bonne réponse: ${error.correct_answer}
Réponse donnée: ${error.user_answer}
Explication: ${error.explanation}
`).join('\n')}

Style musical: Pédagogique et mémorable
Objectif: Aider à retenir les bonnes réponses
Ton: Positif et encourageant

Format de réponse JSON:
{
  "title": "Titre de la chanson",
  "lyrics": {
    "verses": [
      {"text": "Couplet 1", "medical_focus": "concept médical"},
      {"text": "Refrain", "medical_focus": "message principal"}
    ]
  },
  "style": "pop éducatif",
  "tempo": "modéré",
  "key_concepts": ["concept1", "concept2"]
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: 'Tu es un compositeur spécialisé dans les chansons pédagogiques médicales.' },
            { role: 'user', content: songPrompt }
          ],
          temperature: 0.8,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur OpenAI pour génération chanson');
      }

      const aiResponse = await response.json();
      const songData = JSON.parse(aiResponse.choices[0].message.content);

      // Save error song to database
      const { data: errorSong, error } = await supabase
        .from('error_songs')
        .insert({
          user_id: user.id,
          session_id,
          song_title: songData.title,
          lyrics: songData.lyrics,
          generation_prompt: songPrompt,
          errors_analyzed: errorConcepts,
          generation_status: 'completed'
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        error_song: errorSong,
        song_data: songData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /user-qcm-history - Get user's QCM history
    if (req.method === 'GET' && path === '/user-qcm-history') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: sessions, error } = await supabase
        .from('qcm_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        sessions
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Route non trouvée' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in qcm-generator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});