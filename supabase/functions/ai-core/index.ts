/**
 * 🤖 AI-CORE - Routeur Edge Function pour tous les services IA principaux
 * 
 * Regroupe les fonctions :
 * - openai-chat → action: "chat"
 * - openai-image → action: "generate_image"
 * - chat-with-ai → action: "chat_simple"
 * - medical-chat-ai → action: "medical_chat"
 * - contextual-ai-chat → action: "contextual_chat"
 * - enhanced-contextual-chat → action: "enhanced_chat"
 * - ai-tutor → action: "tutor"
 * - ai-recommendations → action: "recommendations"
 * - generate-content → action: "generate_content"
 * - generate-qcm → action: "generate_qcm"
 * - generate-clinical-case → action: "generate_clinical_case"
 * - qcm-generator → action: "qcm_generator"
 * - content-ai-generator → action: "content_generator"
 * - translate → action: "translate"
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

type CoreAction = 
  | 'chat'
  | 'generate_image'
  | 'chat_simple'
  | 'medical_chat'
  | 'contextual_chat'
  | 'enhanced_chat'
  | 'tutor'
  | 'recommendations'
  | 'generate_content'
  | 'generate_qcm'
  | 'generate_clinical_case'
  | 'qcm_generator'
  | 'content_generator'
  | 'translate';

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const action: CoreAction = body.action;
    const payload = body.payload || body;

    // Get auth user
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    console.log(`🤖 AI-CORE [${action}] - User: ${userId || 'anonymous'}`);

    switch (action) {
      case 'chat':
        return await handleChat(payload);
      
      case 'generate_image':
        return await handleGenerateImage(payload);
      
      case 'chat_simple':
        return await handleChatSimple(payload);
      
      case 'medical_chat':
        return await handleMedicalChat(supabase, payload, userId);
      
      case 'contextual_chat':
        return await handleContextualChat(supabase, payload, userId);
      
      case 'enhanced_chat':
        return await handleEnhancedChat(supabase, payload, userId);
      
      case 'tutor':
        return await handleTutor(supabase, payload, userId);
      
      case 'recommendations':
        return await handleRecommendations(supabase, payload, userId);
      
      case 'generate_content':
        return await handleGenerateContent(payload);
      
      case 'generate_qcm':
        return await handleGenerateQCM(supabase, payload);
      
      case 'generate_clinical_case':
        return await handleGenerateClinicalCase(supabase, payload);
      
      case 'qcm_generator':
        return await handleQCMGenerator(supabase, payload);
      
      case 'content_generator':
        return await handleContentGenerator(payload);
      
      case 'translate':
        return await handleTranslate(payload);
      
      default:
        return new Response(JSON.stringify({
          error: 'Invalid action',
          available_actions: [
            'chat', 'generate_image', 'chat_simple', 'medical_chat',
            'contextual_chat', 'enhanced_chat', 'tutor', 'recommendations',
            'generate_content', 'generate_qcm', 'generate_clinical_case',
            'qcm_generator', 'content_generator', 'translate'
          ]
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('❌ AI-CORE Error:', error);
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
// OPENAI HELPERS
// ============================================================================

async function callOpenAI(endpoint: string, body: any) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleChat(payload: any) {
  const { model = 'gpt-4o-mini', messages, max_tokens = 1000, temperature = 0.7 } = payload;
  
  if (!messages || !Array.isArray(messages)) {
    throw new Error('messages array required');
  }

  const data = await callOpenAI('chat/completions', {
    model, messages, max_tokens, temperature
  });

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGenerateImage(payload: any) {
  const { prompt, size = '1024x1024', quality = 'standard', n = 1 } = payload;
  
  if (!prompt) throw new Error('prompt required');

  const data = await callOpenAI('images/generations', {
    model: 'dall-e-3',
    prompt,
    size,
    quality,
    n
  });

  return new Response(JSON.stringify({
    success: true,
    images: data.data?.map((img: any) => img.url) || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleChatSimple(payload: any) {
  const { messages, model = 'gpt-4o-mini' } = payload;
  
  if (!messages || !Array.isArray(messages)) {
    throw new Error('messages array required');
  }

  const data = await callOpenAI('chat/completions', {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 1000
  });

  const content = data.choices?.[0]?.message?.content || 'Aucune réponse générée.';

  return new Response(JSON.stringify({ content }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleMedicalChat(supabase: any, payload: any, userId: string | null) {
  const { messages, context, specialty } = payload;

  const systemPrompt = `Tu es un assistant médical expert${specialty ? ` en ${specialty}` : ''}.
Tu aides les étudiants en médecine à comprendre les concepts médicaux.
${context ? `Contexte: ${context}` : ''}
Réponds de manière précise, pédagogique et basée sur les données probantes.`;

  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  const data = await callOpenAI('chat/completions', {
    model: 'gpt-4o-mini',
    messages: fullMessages,
    temperature: 0.5,
    max_tokens: 2000
  });

  const content = data.choices?.[0]?.message?.content || '';

  // Log conversation if authenticated
  if (userId) {
    await supabase.from('ai_chat_history').insert({
      user_id: userId,
      messages: fullMessages,
      response: content,
      type: 'medical_chat'
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ 
    success: true, 
    content,
    usage: data.usage 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleContextualChat(supabase: any, payload: any, userId: string | null) {
  const { messages, itemCode, context } = payload;

  // Fetch item context if provided
  let itemContext = '';
  if (itemCode) {
    const { data: item } = await supabase
      .from('med_mng_items')
      .select('title, objectives, content')
      .eq('item_number', itemCode)
      .single();
    
    if (item) {
      itemContext = `Item ${itemCode}: ${item.title}\nObjectifs: ${item.objectives || ''}\nContenu: ${item.content?.substring(0, 500) || ''}`;
    }
  }

  const systemPrompt = `Tu es un tuteur médical intelligent.
${itemContext ? `Contexte de l'item:\n${itemContext}\n` : ''}
${context ? `Contexte additionnel: ${context}` : ''}
Réponds de manière précise et pédagogique.`;

  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  const data = await callOpenAI('chat/completions', {
    model: 'gpt-4o-mini',
    messages: fullMessages,
    temperature: 0.6,
    max_tokens: 2000
  });

  return new Response(JSON.stringify({ 
    success: true, 
    content: data.choices?.[0]?.message?.content || '' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleEnhancedChat(supabase: any, payload: any, userId: string | null) {
  // Enhanced version with more context and history
  return handleContextualChat(supabase, payload, userId);
}

async function handleTutor(supabase: any, payload: any, userId: string | null) {
  const { topic, difficulty = 'intermediate', mode = 'explain' } = payload;

  const modePrompts: Record<string, string> = {
    explain: 'Explique ce concept de manière claire et progressive.',
    quiz: 'Pose des questions pour tester la compréhension.',
    case: 'Présente un cas clinique pour illustrer.',
    summary: 'Fais un résumé structuré des points clés.'
  };

  const systemPrompt = `Tu es un tuteur médical expert.
Niveau de difficulté: ${difficulty}
Mode: ${modePrompts[mode] || modePrompts.explain}
Sujet: ${topic}`;

  const data = await callOpenAI('chat/completions', {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Aide-moi avec: ${topic}` }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return new Response(JSON.stringify({ 
    success: true, 
    content: data.choices?.[0]?.message?.content || '',
    mode,
    difficulty
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleRecommendations(supabase: any, payload: any, userId: string | null) {
  if (!userId) throw new Error('Authentication required');

  const { category, limit = 5 } = payload;

  // Get user's study history
  const { data: history } = await supabase
    .from('study_sessions')
    .select('item_code, score, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(20);

  // Generate recommendations based on history
  const weakItems = history?.filter((h: any) => h.score < 70) || [];
  
  const prompt = `Basé sur l'historique d'étude suivant:
${JSON.stringify(weakItems.slice(0, 5))}
Recommande ${limit} items à réviser en priorité pour un étudiant en médecine.
Retourne un JSON avec: { recommendations: [{ item_code, reason, priority }] }`;

  const data = await callOpenAI('chat/completions', {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 1000
  });

  const content = data.choices?.[0]?.message?.content || '{}';
  let recommendations = [];
  try {
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
    recommendations = parsed.recommendations || [];
  } catch {
    recommendations = [];
  }

  return new Response(JSON.stringify({ 
    success: true, 
    recommendations 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGenerateContent(payload: any) {
  const { prompt, format = 'text', item_code } = payload;

  const formatInstructions: Record<string, string> = {
    text: 'Génère du contenu textuel structuré.',
    quiz: 'Génère un quiz avec questions et réponses.',
    flashcard: 'Génère des flashcards (recto/verso).',
    summary: 'Génère un résumé concis.',
    novel: 'Génère un contenu narratif pédagogique.'
  };

  const systemPrompt = `Tu es un générateur de contenu pédagogique médical.
${formatInstructions[format] || formatInstructions.text}
${item_code ? `Pour l'item: ${item_code}` : ''}`;

  const data = await callOpenAI('chat/completions', {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 3000
  });

  return new Response(JSON.stringify({ 
    success: true, 
    content: data.choices?.[0]?.message?.content || '',
    format,
    item_code
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGenerateQCM(supabase: any, payload: any) {
  const { topic, difficulty = 'intermediate', count = 5, item_code } = payload;

  const prompt = `Génère ${count} QCM (Questions à Choix Multiples) sur: ${topic}
Niveau: ${difficulty}
${item_code ? `Item EDN: ${item_code}` : ''}

Format JSON:
{
  "questions": [
    {
      "question": "...",
      "choices": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "correct_answers": ["A", "C"],
      "explanation": "..."
    }
  ]
}`;

  const data = await callOpenAI('chat/completions', {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 3000
  });

  const content = data.choices?.[0]?.message?.content || '{}';
  let questions = [];
  try {
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
    questions = parsed.questions || [];
  } catch {
    questions = [];
  }

  // Save to DB
  if (questions.length > 0) {
    await supabase.from('generated_qcm').insert({
      topic,
      item_code,
      difficulty,
      questions,
      created_at: new Date().toISOString()
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ 
    success: true, 
    questions,
    count: questions.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGenerateClinicalCase(supabase: any, payload: any) {
  const { specialty, difficulty = 'intermediate', learning_objectives } = payload;

  const prompt = `Génère un cas clinique médical détaillé.
Spécialité: ${specialty}
Niveau: ${difficulty}
${learning_objectives ? `Objectifs pédagogiques: ${learning_objectives}` : ''}

Format JSON:
{
  "title": "...",
  "patient_presentation": "...",
  "steps": [
    {
      "step_number": 1,
      "description": "...",
      "question": "...",
      "expected_answer": "...",
      "explanation": "..."
    }
  ],
  "final_diagnosis": "...",
  "key_learning_points": ["...", "..."]
}`;

  const data = await callOpenAI('chat/completions', {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4000
  });

  const content = data.choices?.[0]?.message?.content || '{}';
  let clinicalCase = null;
  try {
    clinicalCase = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
  } catch {
    clinicalCase = { error: 'Parse error', raw: content };
  }

  // Save to DB
  if (clinicalCase && !clinicalCase.error) {
    await supabase.from('ai_clinical_cases').insert({
      specialty,
      difficulty,
      title: clinicalCase.title,
      patient_presentation: clinicalCase.patient_presentation,
      steps: clinicalCase.steps,
      learning_objectives: learning_objectives?.split(',') || [],
      created_at: new Date().toISOString()
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ 
    success: true, 
    clinical_case: clinicalCase
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleQCMGenerator(supabase: any, payload: any) {
  // Alias for generate_qcm with additional options
  return handleGenerateQCM(supabase, payload);
}

async function handleContentGenerator(payload: any) {
  // Alias for generate_content
  return handleGenerateContent(payload);
}

async function handleTranslate(payload: any) {
  const { text, source_lang = 'auto', target_lang = 'fr' } = payload;

  if (!text) throw new Error('text required');

  const prompt = `Traduis le texte suivant ${source_lang !== 'auto' ? `du ${source_lang}` : ''} vers le ${target_lang}:

"${text}"

Retourne uniquement la traduction, sans explications.`;

  const data = await callOpenAI('chat/completions', {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 2000
  });

  return new Response(JSON.stringify({ 
    success: true, 
    translation: data.choices?.[0]?.message?.content || '',
    source_lang,
    target_lang
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
