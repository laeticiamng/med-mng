import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GENERATION_COSTS = {
  'qcm': 5 // 5 crédits par QCM généré
};

serve(async (req) => {
  console.log('🎯 QCM Generator called:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authentification utilisateur
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { item_id, type, difficulty = 5 } = await req.json();

    if (!item_id || !type) {
      return new Response(JSON.stringify({ error: 'item_id et type requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📚 Génération QCM pour ${item_id}, type: ${type}, difficulté: ${difficulty}`);

    // Vérifier et décrémenter les crédits
    const { data: quotaData, error: quotaError } = await supabase.rpc('med_mng_decrement_quota', {
      p_user_id: user.id,
      p_credits_required: GENERATION_COSTS.qcm
    });

    if (quotaError || !quotaData) {
      console.error('❌ Quota insuffisant:', quotaError);
      return new Response(JSON.stringify({ 
        error: 'Crédits insuffisants', 
        credits_required: GENERATION_COSTS.qcm 
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Récupérer les données de l'item
    const { data: itemData, error: itemError } = await supabase
      .from('edn_items_immersive')
      .select('item_code, title, tableau_rang_a, tableau_rang_b')
      .eq('item_code', item_id)
      .single();

    if (itemError || !itemData) {
      console.error('❌ Item non trouvé:', itemError);
      // Rollback des crédits
      await supabase.rpc('med_mng_refund_credits', {
        p_user_id: user.id,
        p_credits: GENERATION_COSTS.qcm
      });
      return new Response(JSON.stringify({ error: 'Item non trouvé' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sélectionner le contenu selon le type
    let contentData;
    switch (type) {
      case 'rang_a':
        contentData = itemData.tableau_rang_a;
        break;
      case 'rang_b':
        contentData = itemData.tableau_rang_b;
        break;
      case 'mix':
        contentData = {
          rang_a: itemData.tableau_rang_a,
          rang_b: itemData.tableau_rang_b
        };
        break;
      default:
        return new Response(JSON.stringify({ error: 'Type invalide: rang_a, rang_b ou mix' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Générer les questions avec IA (OpenAI)
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('❌ OpenAI key manquante');
      await supabase.rpc('med_mng_refund_credits', {
        p_user_id: user.id,
        p_credits: GENERATION_COSTS.qcm
      });
      return new Response(JSON.stringify({ error: 'Configuration IA manquante' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const prompt = `Génère un QCM de ${difficulty} questions sur le sujet médical "${itemData.title}" (${item_id}).

Contenu source (${type}):
${JSON.stringify(contentData, null, 2)}

Instructions:
- ${difficulty} questions de difficulté progressive
- 4 options par question (A, B, C, D)
- 1 seule bonne réponse par question
- Explication détaillée pour chaque réponse
- Focus sur les éléments cliniques essentiels
- Questions type ECN/EDN

Format de réponse JSON strict:
{
  "questions": [
    {
      "id": 1,
      "question": "Question précise et claire",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correct_answer": 1,
      "explanation": "Explication détaillée de la bonne réponse",
      "difficulty": "facile|moyen|difficile"
    }
  ]
}`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un expert en médecine spécialisé dans la création de QCM pour l\'EDN. Réponds uniquement en JSON valide.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('❌ Erreur OpenAI:', await openAIResponse.text());
      await supabase.rpc('med_mng_refund_credits', {
        p_user_id: user.id,
        p_credits: GENERATION_COSTS.qcm
      });
      return new Response(JSON.stringify({ error: 'Erreur génération IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiResult = await openAIResponse.json();
    const generatedContent = JSON.parse(aiResult.choices[0].message.content);

    // Sauvegarder la session QCM
    const { data: qcmSession, error: qcmError } = await supabase
      .from('med_mng_qcm_sessions')
      .insert({
        user_id: user.id,
        item_id: item_id,
        type: type,
        questions: generatedContent.questions,
        answers: [], // Réponses vides au départ
        score: 0,
        errors: []
      })
      .select()
      .single();

    if (qcmError) {
      console.error('❌ Erreur sauvegarde QCM:', qcmError);
      await supabase.rpc('med_mng_refund_credits', {
        p_user_id: user.id,
        p_credits: GENERATION_COSTS.qcm
      });
      return new Response(JSON.stringify({ error: 'Erreur sauvegarde' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Logger l'usage
    await supabase.rpc('log_ia_usage', {
      p_user_id: user.id,
      p_service: 'qcm_generation',
      p_credits_used: GENERATION_COSTS.qcm,
      p_item_id: item_id,
      p_metadata: {
        type: type,
        difficulty: difficulty,
        questions_count: generatedContent.questions.length
      }
    });

    console.log(`✅ QCM généré avec succès: ${qcmSession.id}`);

    return new Response(JSON.stringify({
      success: true,
      session_id: qcmSession.id,
      questions: generatedContent.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty
        // Note: pas la réponse correcte ni l'explication lors de la génération
      })),
      credits_used: GENERATION_COSTS.qcm
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur QCM Generator:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur interne serveur',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});