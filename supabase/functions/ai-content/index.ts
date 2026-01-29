/**
 * 📚 AI-CONTENT - Routeur Edge Function pour génération de contenu pédagogique
 * 
 * Regroupe les fonctions :
 * - generate-comic-images → action: "comic_image"
 * - generate-lyrics-from-oic → action: "lyrics"
 * - generate-missing-content → action: "missing_content"
 * - regenerate-all-oic-content → action: "regenerate_all"
 * - regenerate-oic-with-ai-check → action: "regenerate_checked"
 * - pedagogical-content-api → action: "pedagogical_*"
 * - content-master-api → action: "master_*"
 * - study-planner → action: "planner_*"
 * - items-completeness-* → action: "completeness_*"
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

type ContentAction = 
  | 'comic_image'
  | 'lyrics'
  | 'missing_content'
  | 'regenerate_all'
  | 'regenerate_checked'
  | 'pedagogical_get'
  | 'pedagogical_create'
  | 'pedagogical_update'
  | 'master_items'
  | 'master_content'
  | 'planner_create'
  | 'planner_get'
  | 'planner_update'
  | 'completeness_check'
  | 'completeness_report';

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
    const action: ContentAction = body.action;
    const payload = body.payload || body;

    // Get auth user
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    console.log(`📚 AI-CONTENT [${action}] - User: ${userId || 'anonymous'}`);

    switch (action) {
      // === COMIC & VISUAL ===
      case 'comic_image':
        return await handleComicImage(payload);

      // === LYRICS ===
      case 'lyrics':
        return await handleLyrics(supabase, payload);

      // === CONTENT GENERATION ===
      case 'missing_content':
        return await handleMissingContent(supabase, payload);
      
      case 'regenerate_all':
        return await handleRegenerateAll(supabase, payload);
      
      case 'regenerate_checked':
        return await handleRegenerateChecked(supabase, payload);

      // === PEDAGOGICAL CONTENT ===
      case 'pedagogical_get':
        return await handlePedagogicalGet(supabase, payload);
      
      case 'pedagogical_create':
        return await handlePedagogicalCreate(supabase, payload);
      
      case 'pedagogical_update':
        return await handlePedagogicalUpdate(supabase, payload);

      // === MASTER CONTENT ===
      case 'master_items':
        return await handleMasterItems(supabase, payload);
      
      case 'master_content':
        return await handleMasterContent(supabase, payload);

      // === STUDY PLANNER ===
      case 'planner_create':
        return await handlePlannerCreate(supabase, payload, userId);
      
      case 'planner_get':
        return await handlePlannerGet(supabase, payload, userId);
      
      case 'planner_update':
        return await handlePlannerUpdate(supabase, payload, userId);

      // === COMPLETENESS ===
      case 'completeness_check':
        return await handleCompletenessCheck(supabase, payload);
      
      case 'completeness_report':
        return await handleCompletenessReport(supabase, payload);

      default:
        return new Response(JSON.stringify({
          error: 'Invalid action',
          available_actions: [
            'comic_image', 'lyrics', 'missing_content', 'regenerate_all',
            'regenerate_checked', 'pedagogical_get', 'pedagogical_create',
            'pedagogical_update', 'master_items', 'master_content',
            'planner_create', 'planner_get', 'planner_update',
            'completeness_check', 'completeness_report'
          ]
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('❌ AI-CONTENT Error:', error);
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
// COMIC & VISUAL HANDLERS
// ============================================================================

async function handleComicImage(payload: any) {
  const { scene_description, style = "medical comic book illustration", item_code } = payload;

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) throw new Error('OPENAI_API_KEY not configured');

  const enhancedPrompt = `${scene_description}. 
Style: ${style}, clean medical illustration, professional healthcare setting, 
bright and welcoming atmosphere, detailed character expressions, 
high quality digital art, educational and approachable visual style.
Ultra high resolution.`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd'
    })
  });

  if (!response.ok) throw new Error(`OpenAI Image API error: ${response.status}`);

  const data = await response.json();
  const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json;

  return new Response(JSON.stringify({ 
    success: true,
    imageUrl,
    prompt: enhancedPrompt,
    item_code
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// LYRICS HANDLERS
// ============================================================================

async function handleLyrics(supabase: any, payload: any) {
  const { item_code, rang = 'A', style = 'educational rap', mood = 'upbeat' } = payload;

  // Get item content if available
  let itemContent = '';
  if (item_code) {
    const { data: item } = await supabase
      .from('med_mng_items')
      .select('title, objectives, content')
      .eq('item_number', item_code)
      .single();
    
    if (item) {
      itemContent = `${item.title}\n${item.objectives || ''}\n${item.content || ''}`;
    }
  }

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) throw new Error('OPENAI_API_KEY not configured');

  const prompt = `Tu es un auteur-compositeur de rap éducatif médical style NEKFEU.
Génère des paroles mémorables pour l'item médical: ${item_code}
Rang: ${rang}
Style: ${style}
Mood: ${mood}

Contenu à mémoriser:
${itemContent.substring(0, 2000)}

Règles:
- Paroles en français
- Rimes riches et flow naturel
- Intègre les concepts médicaux clés
- Structure: couplet, refrain, couplet, refrain, outro
- Maximum 400 mots`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1500
    })
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

  const data = await response.json();
  const lyrics = data.choices?.[0]?.message?.content || '';

  return new Response(JSON.stringify({ 
    success: true,
    lyrics,
    item_code,
    rang,
    style
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// CONTENT GENERATION HANDLERS
// ============================================================================

async function handleMissingContent(supabase: any, payload: any) {
  const { content_types = ['quiz', 'flashcards', 'summary'], item_codes } = payload;

  const results: any[] = [];

  for (const itemCode of (item_codes || [])) {
    for (const contentType of content_types) {
      // Check if content exists
      const { data: existing } = await supabase
        .from('ai_generated_content')
        .select('id')
        .eq('identifier', itemCode)
        .eq('content_type', contentType)
        .maybeSingle();

      if (!existing) {
        results.push({
          item_code: itemCode,
          content_type: contentType,
          status: 'missing'
        });
      }
    }
  }

  return new Response(JSON.stringify({ 
    success: true,
    missing_content: results,
    count: results.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleRegenerateAll(supabase: any, payload: any) {
  const { item_codes, content_types = ['quiz', 'summary'] } = payload;

  // This would trigger regeneration for all specified items
  // For now, return a job ID for async processing
  const jobId = crypto.randomUUID();

  await supabase.from('content_generation_jobs').insert({
    id: jobId,
    item_codes,
    content_types,
    status: 'pending',
    created_at: new Date().toISOString()
  }).catch(() => {});

  return new Response(JSON.stringify({ 
    success: true,
    job_id: jobId,
    status: 'queued',
    items_count: item_codes?.length || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleRegenerateChecked(supabase: any, payload: any) {
  const { item_code, content_type } = payload;

  // Get existing content and regenerate with quality check
  const { data: existing } = await supabase
    .from('ai_generated_content')
    .select('*')
    .eq('identifier', item_code)
    .eq('content_type', content_type)
    .single();

  // For now, mark as needing regeneration
  const { error } = await supabase
    .from('ai_generated_content')
    .update({
      needs_regeneration: true,
      last_check: new Date().toISOString()
    })
    .eq('id', existing?.id);

  return new Response(JSON.stringify({ 
    success: true,
    item_code,
    content_type,
    status: error ? 'error' : 'marked_for_regeneration'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// PEDAGOGICAL CONTENT HANDLERS
// ============================================================================

async function handlePedagogicalGet(supabase: any, payload: any) {
  const { item_code, content_type, page = 1, limit = 20 } = payload;

  let query = supabase.from('ai_generated_content').select('*');

  if (item_code) query = query.eq('identifier', item_code);
  if (content_type) query = query.eq('content_type', content_type);

  const { data, error } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return new Response(JSON.stringify({ 
    success: true,
    content: data || [],
    page,
    limit
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handlePedagogicalCreate(supabase: any, payload: any) {
  const { identifier, content_type, title, content } = payload;

  const { data, error } = await supabase
    .from('ai_generated_content')
    .insert({
      identifier,
      content_type,
      title,
      content,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ 
    success: true,
    content: data
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handlePedagogicalUpdate(supabase: any, payload: any) {
  const { id, title, content } = payload;

  const { data, error } = await supabase
    .from('ai_generated_content')
    .update({
      title,
      content,
      last_updated: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ 
    success: true,
    content: data
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// MASTER CONTENT HANDLERS
// ============================================================================

async function handleMasterItems(supabase: any, payload: any) {
  const { specialty, rang, search, page = 1, limit = 50 } = payload;

  let query = supabase.from('med_mng_items').select('*');

  if (specialty) query = query.eq('specialty', specialty);
  if (rang) query = query.eq('rang', rang);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order('item_number');

  if (error) throw error;

  return new Response(JSON.stringify({ 
    success: true,
    items: data || [],
    page,
    limit
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleMasterContent(supabase: any, payload: any) {
  const { item_id, include_generated = true } = payload;

  const { data: item, error } = await supabase
    .from('med_mng_items')
    .select('*')
    .eq('id', item_id)
    .single();

  if (error) throw error;

  let generated = null;
  if (include_generated && item?.item_number) {
    const { data } = await supabase
      .from('ai_generated_content')
      .select('*')
      .eq('identifier', item.item_number);
    generated = data;
  }

  return new Response(JSON.stringify({ 
    success: true,
    item,
    generated_content: generated
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// STUDY PLANNER HANDLERS
// ============================================================================

async function handlePlannerCreate(supabase: any, payload: any, userId: string | null) {
  if (!userId) throw new Error('Authentication required');

  const { name, target_date, items, daily_goal_minutes = 60 } = payload;

  const { data, error } = await supabase
    .from('study_plans')
    .insert({
      user_id: userId,
      name,
      target_date,
      items,
      daily_goal_minutes,
      status: 'active',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ 
    success: true,
    plan: data
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handlePlannerGet(supabase: any, payload: any, userId: string | null) {
  if (!userId) throw new Error('Authentication required');

  const { plan_id } = payload;

  let query = supabase.from('study_plans').select('*').eq('user_id', userId);
  
  if (plan_id) {
    query = query.eq('id', plan_id).single();
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  return new Response(JSON.stringify({ 
    success: true,
    plans: plan_id ? undefined : data,
    plan: plan_id ? data : undefined
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handlePlannerUpdate(supabase: any, payload: any, userId: string | null) {
  if (!userId) throw new Error('Authentication required');

  const { plan_id, updates } = payload;

  const { data, error } = await supabase
    .from('study_plans')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', plan_id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ 
    success: true,
    plan: data
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// COMPLETENESS HANDLERS
// ============================================================================

async function handleCompletenessCheck(supabase: any, payload: any) {
  const { item_codes } = payload;

  const results: any[] = [];

  for (const itemCode of (item_codes || [])) {
    const { data: content } = await supabase
      .from('ai_generated_content')
      .select('content_type')
      .eq('identifier', itemCode);

    const existingTypes = content?.map((c: any) => c.content_type) || [];
    const requiredTypes = ['quiz', 'summary', 'flashcards', 'clinical_case'];
    const missingTypes = requiredTypes.filter(t => !existingTypes.includes(t));

    results.push({
      item_code: itemCode,
      existing: existingTypes,
      missing: missingTypes,
      completeness: Math.round((existingTypes.length / requiredTypes.length) * 100)
    });
  }

  return new Response(JSON.stringify({ 
    success: true,
    completeness: results
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleCompletenessReport(supabase: any, payload: any) {
  const { specialty } = payload;

  // Get all items
  let itemsQuery = supabase.from('med_mng_items').select('item_number');
  if (specialty) itemsQuery = itemsQuery.eq('specialty', specialty);
  
  const { data: items } = await itemsQuery;
  const itemCodes = items?.map((i: any) => i.item_number) || [];

  // Get content counts
  const { data: content } = await supabase
    .from('ai_generated_content')
    .select('identifier, content_type')
    .in('identifier', itemCodes);

  const contentByItem: Record<string, string[]> = {};
  content?.forEach((c: any) => {
    if (!contentByItem[c.identifier]) contentByItem[c.identifier] = [];
    contentByItem[c.identifier].push(c.content_type);
  });

  const requiredTypes = ['quiz', 'summary', 'flashcards'];
  let totalComplete = 0;
  let totalPartial = 0;
  let totalEmpty = 0;

  itemCodes.forEach((code: string) => {
    const types = contentByItem[code] || [];
    if (types.length === 0) totalEmpty++;
    else if (types.length >= requiredTypes.length) totalComplete++;
    else totalPartial++;
  });

  return new Response(JSON.stringify({ 
    success: true,
    report: {
      total_items: itemCodes.length,
      complete: totalComplete,
      partial: totalPartial,
      empty: totalEmpty,
      overall_completeness: Math.round((totalComplete / itemCodes.length) * 100)
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
