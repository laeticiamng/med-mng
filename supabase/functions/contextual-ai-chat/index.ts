import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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
  relevance_score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('💬 CHAT IA CONTEXTUEL EDN - Début');
    
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
      context_items = [] // Items EDN spécifiques à utiliser comme contexte
    } = await req.json();

    if (!message || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('💬 Question utilisateur:', message);

    // 1. RECHERCHE CONTEXTUELLE DANS LA BASE EDN
    const ednContext = await searchEdnKnowledgeBase(supabase, message, context_items);
    console.log(`📚 Contexte EDN trouvé: ${ednContext.length} items`);

    // 2. CONSTRUIRE LE PROMPT AVEC CONTEXTE PRIORITAIRE EDN
    const systemPrompt = buildContextualSystemPrompt(ednContext);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversation_history.slice(-10), // Garder 10 derniers messages pour contexte
      { role: 'user', content: message }
    ];

    console.log('🧠 Génération réponse OpenAI avec contexte EDN...');

    // 3. APPEL OPENAI AVEC CONTEXTE EDN
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error(`OpenAI API Error: ${openaiResponse.status} - ${errorText}`);
      throw new Error(`OpenAI request failed: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';

    // 4. LOGGER LA CONVERSATION POUR ANALYTICS
    await supabase.rpc('log_chat_interaction', {
      user_id: user.id,
      question: message,
      response: aiResponse,
      context_used: ednContext.map(c => ({
        item_code: c.item_code,
        relevance_score: c.relevance_score,
        source: 'edn_local'
      })),
      tokens_used: openaiData.usage?.total_tokens || 0
    });

    console.log('✅ Réponse IA générée avec contexte EDN');

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse,
      context: {
        edn_items_used: ednContext.length,
        items: ednContext.map(c => ({
          item_code: c.item_code,
          title: c.title,
          relevance: c.relevance_score
        })),
        source_priority: 'edn_local',
        tokens_used: openaiData.usage?.total_tokens || 0
      },
      conversation_id: `chat_${user.id}_${Date.now()}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur chat IA contextuel:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'AI chat failed',
      details: 'Please try again or rephrase your question'
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
    // Mots-clés pour la recherche
    const searchTerms = extractMedicalKeywords(query);
    
    let baseQuery = supabase
      .from('edn_items_immersive')
      .select('item_code, title, tableau_rang_a, tableau_rang_b');

    // Si des items spécifiques sont demandés, les prioriser
    if (contextItems.length > 0) {
      baseQuery = baseQuery.in('item_code', contextItems);
    } else {
      // Recherche par mots-clés dans le titre
      baseQuery = baseQuery.or(
        searchTerms.map(term => `title.ilike.%${term}%`).join(',')
      );
    }

    const { data: ednItems, error } = await baseQuery.limit(5);

    if (error) {
      console.error('Erreur recherche EDN:', error);
      return [];
    }

    if (!ednItems || ednItems.length === 0) {
      console.log('Aucun item EDN trouvé, recherche élargie...');
      
      // Recherche élargie si aucun résultat spécifique
      const { data: fallbackItems, error: fallbackError } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, tableau_rang_a, tableau_rang_b')
        .limit(3);

      if (fallbackError) return [];
      return (fallbackItems || []).map((item: any) => ({
        ...item,
        relevance_score: 0.3 // Score faible pour contexte général
      }));
    }

    // Calculer un score de pertinence basique
    return ednItems.map((item: any) => ({
      ...item,
      relevance_score: calculateRelevanceScore(item, query, searchTerms)
    })).sort((a, b) => b.relevance_score - a.relevance_score);

  } catch (error) {
    console.error('Erreur searchEdnKnowledgeBase:', error);
    return [];
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

  // Ajouter tous les mots de plus de 4 caractères comme potentiels termes médicaux
  const additionalTerms = queryWords.filter(word => 
    word.length > 4 && !found.includes(word)
  );

  return [...found, ...additionalTerms.slice(0, 3)];
}

function calculateRelevanceScore(item: any, query: string, keywords: string[]): number {
  let score = 0;
  const title = item.title.toLowerCase();
  const queryLower = query.toLowerCase();

  // Score basé sur la correspondance directe dans le titre
  if (title.includes(queryLower)) score += 1.0;

  // Score basé sur les mots-clés médicaux
  keywords.forEach(keyword => {
    if (title.includes(keyword)) score += 0.5;
  });

  // Score basé sur la présence de contenu structuré
  if (item.tableau_rang_a) score += 0.2;
  if (item.tableau_rang_b) score += 0.2;

  // Score basé sur le code item si mentionné dans la question
  const itemCodeMatch = queryLower.match(/ic[- ]?(\d+)/);
  if (itemCodeMatch && item.item_code.includes(itemCodeMatch[1])) {
    score += 2.0; // Score très élevé pour correspondance exacte de code
  }

  return Math.min(score, 3.0); // Cap à 3.0
}

function buildContextualSystemPrompt(ednContext: EdnContext[]): string {
  if (ednContext.length === 0) {
    return `Tu es un assistant IA spécialisé en médecine et formation médicale.
Tu réponds aux questions sur les items EDN avec précision et pédagogie.
Si tu n'as pas d'information spécifique dans la base de connaissance EDN, indique-le clairement.`;
  }

  const contextText = ednContext.map(item => {
    let content = `**${item.item_code} - ${item.title}**\n`;
    
    if (item.tableau_rang_a) {
      content += `\nRang A (Connaissances fondamentales):\n`;
      content += formatTableauContent(item.tableau_rang_a);
    }
    
    if (item.tableau_rang_b) {
      content += `\nRang B (Expertise clinique):\n`;
      content += formatTableauContent(item.tableau_rang_b);
    }
    
    return content;
  }).join('\n\n---\n\n');

  return `Tu es un assistant IA spécialisé en médecine et formation médicale EDN.

**CONTEXTE EDN PRIORITAIRE** (utilise TOUJOURS ces informations en priorité) :

${contextText}

**INSTRUCTIONS** :
1. Base tes réponses en PRIORITÉ sur le contexte EDN fourni ci-dessus
2. Sois précis, pédagogique et utilise la terminologie médicale appropriée
3. Si la question dépasse le contexte EDN fourni, indique-le clairement
4. Structure tes réponses de manière claire avec des sections si nécessaire
5. Cite les items EDN pertinents (ex: "Selon l'item IC-123...")`;
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
        formatted += `\n• ${section.title}\n`;
      }
      if (section.content) {
        formatted += `  ${section.content}\n`;
      }
      if (section.concepts && Array.isArray(section.concepts)) {
        section.concepts.forEach((concept: any) => {
          if (concept.concept) {
            formatted += `  - ${concept.concept}\n`;
          }
        });
      }
    });
  }
  
  return formatted;
}