import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface EdnContext {
  item_code: string;
  title: string;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  quiz_questions?: any;
  scene_immersive?: any;
  relevance_score: number;
  source: 'edn_local';
}

interface WebFallbackResult {
  content: string;
  source: 'web_fallback';
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('💬 ENHANCED CHAT IA CONTEXTUEL - Point IX');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Authentication required
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { 
      message, 
      conversation_history = [],
      context_items = [],
      enable_web_fallback = true // Permettre le fallback web par défaut
    } = await req.json();

    if (!message || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('💬 Question utilisateur:', message);

    // 1. RECHERCHE PRIORITAIRE DANS LA BASE EDN/COURS
    const ednContext = await searchEdnKnowledgeBase(supabase, message, context_items);
    console.log(`📚 Contexte EDN trouvé: ${ednContext.length} items`);

    let finalResponse = '';
    let responseSource = 'edn_local';
    let suggestions: any[] = [];
    let webFallbackUsed = false;

    // 2. SI CONTEXTE EDN SUFFISANT -> RÉPONSE DIRECTE
    if (ednContext.length > 0 && ednContext[0].relevance_score >= 0.8) {
      console.log('✅ Contexte EDN suffisant, génération réponse directe');
      
      const systemPrompt = buildEdnContextualPrompt(ednContext);
      finalResponse = await generateOpenAIResponse(systemPrompt, conversation_history, message);
      
      // Générer des suggestions contextuelles
      suggestions = generateContextualSuggestions(ednContext);
      
    } else if (enable_web_fallback) {
      // 3. FALLBACK WEB SI NOTION NON TROUVÉE DANS EDN
      console.log('🌐 Contexte EDN insuffisant, activation fallback web');
      
      const webResult = await performWebFallback(message);
      if (webResult && webResult.confidence > 0.6) {
        const systemPrompt = buildWebFallbackPrompt(webResult, ednContext);
        finalResponse = await generateOpenAIResponse(systemPrompt, conversation_history, message);
        responseSource = 'web_fallback';
        webFallbackUsed = true;
      } else {
        // Réponse basée sur le contexte EDN limité disponible
        const systemPrompt = buildLimitedEdnPrompt(ednContext);
        finalResponse = await generateOpenAIResponse(systemPrompt, conversation_history, message);
      }
    } else {
      // Réponse basée uniquement sur EDN (mode strict)
      const systemPrompt = buildLimitedEdnPrompt(ednContext);
      finalResponse = await generateOpenAIResponse(systemPrompt, conversation_history, message);
    }

    // 4. LOGGING POUR MONITORING QUALITÉ
    await logChatInteraction(supabase, {
      user_id: user.id,
      question: message,
      response: finalResponse,
      edn_context: ednContext,
      web_fallback_used: webFallbackUsed,
      response_source: responseSource,
      conversation_id: `enhanced_chat_${user.id}_${Date.now()}`
    });

    console.log(`✅ Réponse générée (source: ${responseSource})`);

    return new Response(JSON.stringify({
      success: true,
      response: finalResponse,
      source: responseSource,
      context: {
        edn_items_found: ednContext.length,
        web_fallback_used: webFallbackUsed,
        items: ednContext.map(c => ({
          item_code: c.item_code,
          title: c.title,
          relevance: c.relevance_score
        }))
      },
      suggestions,
      conversation_id: `enhanced_chat_${user.id}_${Date.now()}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur enhanced chat:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Enhanced chat failed',
      source: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function searchEdnKnowledgeBase(
  supabase: any, 
  query: string, 
  contextItems: string[] = []
): Promise<EdnContext[]> {
  try {
    const searchTerms = extractMedicalKeywords(query);
    
    let baseQuery = supabase
      .from('edn_items_immersive')
      .select('item_code, title, tableau_rang_a, tableau_rang_b, quiz_questions, scene_immersive');

    // Prioriser les items spécifiques si fournis
    if (contextItems.length > 0) {
      baseQuery = baseQuery.in('item_code', contextItems);
    } else {
      // Recherche multi-critères
      const searchConditions = [
        ...searchTerms.map(term => `title.ilike.%${term}%`),
        ...searchTerms.map(term => `item_code.ilike.%${term}%`)
      ];
      
      if (searchConditions.length > 0) {
        baseQuery = baseQuery.or(searchConditions.join(','));
      }
    }

    const { data: ednItems, error } = await baseQuery.limit(5);

    if (error) {
      console.error('Erreur recherche EDN:', error);
      return [];
    }

    if (!ednItems || ednItems.length === 0) {
      // Recherche élargie dans les situations ECOS
      const { data: ecosItems, error: ecosError } = await supabase
        .from('ecos_situations_complete')
        .select('situation_number, title, content')
        .or(`title.ilike.%${query}%,content::text.ilike.%${query}%`)
        .limit(2);

      if (!ecosError && ecosItems?.length > 0) {
        return ecosItems.map((item: any) => ({
          item_code: `ECOS-${item.situation_number}`,
          title: item.title,
          tableau_rang_a: { content: item.content },
          relevance_score: 0.7,
          source: 'edn_local' as const
        }));
      }

      return [];
    }

    // Calculer les scores de pertinence
    return ednItems.map((item: any) => ({
      ...item,
      relevance_score: calculateRelevanceScore(item, query, searchTerms),
      source: 'edn_local' as const
    })).sort((a, b) => b.relevance_score - a.relevance_score);

  } catch (error) {
    console.error('Erreur searchEdnKnowledgeBase:', error);
    return [];
  }
}

async function performWebFallback(query: string): Promise<WebFallbackResult | null> {
  try {
    console.log('🌐 Activation fallback web pour:', query);
    
    // Simuler une recherche web (en production, utiliser une vraie API de recherche)
    // Ici on peut intégrer avec des APIs comme Perplexity, Bing, ou Google Custom Search
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) return null;

    // Utiliser OpenAI pour générer une réponse web générale
    const webSystemPrompt = `Tu es un assistant médical qui utilise tes connaissances générales.
Réponds à la question médicale suivante en utilisant tes connaissances de base.
Indique clairement que cette réponse est basée sur des connaissances générales et non sur la base EDN locale.
Question: ${query}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: webSystemPrompt }],
        max_tokens: 800,
        temperature: 0.6
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (content) {
      return {
        content,
        source: 'web_fallback' as const,
        confidence: 0.7 // Confiance modérée pour le fallback web
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur web fallback:', error);
    return null;
  }
}

function generateContextualSuggestions(ednContext: EdnContext[]): any[] {
  const suggestions = [];

  if (ednContext.length > 0) {
    const mainItem = ednContext[0];
    
    // Suggestions de quiz
    if (mainItem.quiz_questions) {
      suggestions.push({
        type: 'quiz',
        title: `Quiz sur ${mainItem.item_code}`,
        description: 'Testez vos connaissances sur cet item',
        action: 'start_quiz',
        item_code: mainItem.item_code
      });
    }

    // Suggestions de musique
    suggestions.push({
      type: 'music',
      title: `Musique pour ${mainItem.item_code}`,
      description: 'Écoutez la chanson éducative pour cet item',
      action: 'play_music',
      item_code: mainItem.item_code
    });

    // Suggestions de BD/contenu immersif
    if (mainItem.scene_immersive) {
      suggestions.push({
        type: 'immersive',
        title: `Expérience immersive ${mainItem.item_code}`,
        description: 'Explorez le contenu interactif',
        action: 'start_immersive',
        item_code: mainItem.item_code
      });
    }

    // Suggestions d'items liés
    const relatedItems = ednContext.slice(1, 3);
    relatedItems.forEach(item => {
      suggestions.push({
        type: 'related_item',
        title: `Explorer ${item.item_code}`,
        description: item.title,
        action: 'explore_item',
        item_code: item.item_code
      });
    });
  }

  return suggestions.slice(0, 4); // Limiter à 4 suggestions
}

async function generateOpenAIResponse(
  systemPrompt: string, 
  conversationHistory: ChatMessage[], 
  userMessage: string
): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-8), // Garder 8 derniers messages
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';
}

function buildEdnContextualPrompt(ednContext: EdnContext[]): string {
  const contextText = ednContext.map(item => {
    let content = `**${item.item_code} - ${item.title}**\n`;
    
    if (item.tableau_rang_a) {
      content += `\nRang A: ${formatTableauContent(item.tableau_rang_a)}`;
    }
    
    if (item.tableau_rang_b) {
      content += `\nRang B: ${formatTableauContent(item.tableau_rang_b)}`;
    }
    
    return content;
  }).join('\n\n---\n\n');

  return `Tu es un assistant IA expert en médecine EDN.

**CONTEXTE EDN LOCAL PRIORITAIRE:**
${contextText}

**INSTRUCTIONS:**
1. Base tes réponses EXCLUSIVEMENT sur le contexte EDN ci-dessus
2. Mentionne toujours la source ("Selon l'item IC-123...")
3. Sois précis et pédagogique
4. Structure clairement tes réponses
5. Indique [SOURCE: EDN] à la fin de ta réponse`;
}

function buildWebFallbackPrompt(webResult: WebFallbackResult, ednContext: EdnContext[]): string {
  return `Tu es un assistant IA médical utilisant des sources complémentaires.

**CONTEXTE WEB (fallback):**
${webResult.content}

${ednContext.length > 0 ? `**CONTEXTE EDN LIMITÉ:**
${ednContext.map(item => `${item.item_code}: ${item.title}`).join('\n')}` : ''}

**INSTRUCTIONS:**
1. Base ta réponse sur les informations web fournies
2. Mentionne que cette réponse utilise des connaissances générales
3. Recommande de vérifier avec les référentiels EDN officiels
4. Indique [SOURCE: WEB] à la fin de ta réponse`;
}

function buildLimitedEdnPrompt(ednContext: EdnContext[]): string {
  return `Tu es un assistant IA spécialisé en médecine EDN.

${ednContext.length > 0 ? `**CONTEXTE EDN LIMITÉ:**
${ednContext.map(item => `${item.item_code}: ${item.title}`).join('\n')}` : ''}

**INSTRUCTIONS:**
1. Si le contexte EDN est insuffisant, dis-le clairement
2. Propose de reformuler la question ou d'être plus spécifique
3. Suggère de consulter les référentiels EDN complets
4. Indique [SOURCE: EDN_LIMITÉ] à la fin de ta réponse`;
}

async function logChatInteraction(supabase: any, params: any) {
  try {
    const { error } = await supabase
      .from('enhanced_chat_logs')
      .insert({
        user_id: params.user_id,
        question: params.question,
        response: params.response,
        edn_context_items: params.edn_context.map((c: any) => c.item_code),
        web_fallback_used: params.web_fallback_used,
        response_source: params.response_source,
        conversation_id: params.conversation_id,
        response_quality_score: null, // À remplir via feedback utilisateur
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur logging chat:', error);
    }
  } catch (error) {
    console.error('Erreur logChatInteraction:', error);
  }
}

function extractMedicalKeywords(query: string): string[] {
  const medicalKeywords = [
    'diagnostic', 'traitement', 'symptôme', 'pathologie', 'maladie',
    'patient', 'clinique', 'thérapie', 'examen', 'urgence',
    'médecine', 'médical', 'santé', 'soin', 'hospitalier'
  ];

  const queryWords = query.toLowerCase().split(/\s+/);
  const found = queryWords.filter(word => 
    word.length > 3 && (
      medicalKeywords.includes(word) || 
      /^(cardio|neuro|gastro|pneumo|dermato|ophtal)/i.test(word)
    )
  );

  const additionalTerms = queryWords.filter(word => 
    word.length > 4 && !found.includes(word)
  );

  return [...found, ...additionalTerms.slice(0, 3)];
}

function calculateRelevanceScore(item: any, query: string, keywords: string[]): number {
  let score = 0;
  const title = item.title.toLowerCase();
  const queryLower = query.toLowerCase();

  if (title.includes(queryLower)) score += 1.0;

  keywords.forEach(keyword => {
    if (title.includes(keyword)) score += 0.5;
  });

  if (item.tableau_rang_a) score += 0.2;
  if (item.tableau_rang_b) score += 0.2;

  const itemCodeMatch = queryLower.match(/ic[- ]?(\d+)/);
  if (itemCodeMatch && item.item_code.includes(itemCodeMatch[1])) {
    score += 2.0;
  }

  return Math.min(score, 3.0);
}

function formatTableauContent(tableau: any): string {
  if (!tableau || typeof tableau !== 'object') return '';
  
  let formatted = '';
  
  if (tableau.title) {
    formatted += `${tableau.title}\n`;
  }
  
  if (tableau.sections && Array.isArray(tableau.sections)) {
    tableau.sections.forEach((section: any) => {
      if (section.title) {
        formatted += `• ${section.title}\n`;
      }
      if (section.content) {
        formatted += `  ${section.content}\n`;
      }
    });
  }
  
  return formatted;
}