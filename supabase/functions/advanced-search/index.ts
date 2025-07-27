import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchRequest {
  query: string;
  filters?: {
    category?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    author?: string;
    tags?: string[];
    rating?: number;
    duration?: {
      min: number;
      max: number;
    };
  };
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'date' | 'rating' | 'popularity';
    sortOrder?: 'asc' | 'desc';
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { query, filters = {}, options = {} }: SearchRequest = await req.json();

    console.log('🔍 Advanced search for:', query, 'with filters:', filters);

    const {
      limit = 20,
      offset = 0,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = options;

    // Recherche dans multiple tables selon les catégories
    const results = [];
    
    // 1. Rechercher dans EDN items si pas de catégorie spécifiée ou si category = 'edn'
    if (!filters.category || filters.category === 'edn') {
      const { data: ednItems } = await supabase
        .from('edn_items_immersive')
        .select('id, title, item_code, slug, created_at')
        .or(`title.ilike.%${query}%, item_code.ilike.%${query}%`)
        .limit(limit);

      if (ednItems) {
        ednItems.forEach(item => {
          results.push({
            id: item.id,
            title: item.title,
            description: `Item EDN ${item.item_code}`,
            category: 'edn',
            tags: ['edn', 'medical'],
            createdAt: new Date(item.created_at),
            url: `/edn/${item.slug}`,
            relevanceScore: calculateRelevanceScore(query, item.title)
          });
        });
      }
    }

    // 2. Rechercher dans les musiques si pas de catégorie ou category = 'music'
    if (!filters.category || filters.category === 'music') {
      const { data: songs } = await supabase
        .from('emotionscare_songs')
        .select('id, title, meta, created_at')
        .ilike('title', `%${query}%`)
        .limit(limit);

      if (songs) {
        songs.forEach(song => {
          results.push({
            id: song.id,
            title: song.title,
            description: 'Musique générée EmotionsCare',
            category: 'music',
            tags: ['music', 'emotionscare'],
            duration: song.meta?.duration || 240,
            createdAt: new Date(song.created_at),
            url: `/music/${song.id}`,
            relevanceScore: calculateRelevanceScore(query, song.title)
          });
        });
      }
    }

    // 3. Rechercher dans les articles/posts
    if (!filters.category || filters.category === 'article') {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, content, user_id, date')
        .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
        .limit(limit);

      if (posts) {
        posts.forEach(post => {
          results.push({
            id: post.id,
            title: post.title,
            description: post.content?.substring(0, 150) + '...',
            category: 'article',
            author: 'User',
            tags: ['article', 'community'],
            createdAt: new Date(post.date),
            url: `/posts/${post.id}`,
            relevanceScore: calculateRelevanceScore(query, post.title + ' ' + post.content)
          });
        });
      }
    }

    // Appliquer les filtres
    let filteredResults = results;

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filteredResults = filteredResults.filter(item => 
        item.createdAt >= start && item.createdAt <= end
      );
    }

    if (filters.rating) {
      filteredResults = filteredResults.filter(item => 
        (item.rating || 0) >= filters.rating!
      );
    }

    if (filters.duration) {
      filteredResults = filteredResults.filter(item => 
        item.duration && 
        item.duration >= filters.duration!.min && 
        item.duration <= filters.duration!.max
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredResults = filteredResults.filter(item =>
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Trier les résultats
    filteredResults.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return sortOrder === 'desc' ? b.relevanceScore - a.relevanceScore : a.relevanceScore - b.relevanceScore;
        case 'date':
          return sortOrder === 'desc' ? 
            b.createdAt.getTime() - a.createdAt.getTime() :
            a.createdAt.getTime() - b.createdAt.getTime();
        case 'rating':
          return sortOrder === 'desc' ? (b.rating || 0) - (a.rating || 0) : (a.rating || 0) - (b.rating || 0);
        default:
          return 0;
      }
    });

    // Paginer
    const paginatedResults = filteredResults.slice(offset, offset + limit);

    // Logger la recherche pour analytics
    const { error: logError } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: null, // Anonyme
        activity_type: 'search',
        activity_details: {
          query,
          filters,
          options,
          results_count: paginatedResults.length,
          total_results: filteredResults.length
        }
      });

    if (logError) {
      console.warn('⚠️ Failed to log search:', logError);
    }

    return new Response(
      JSON.stringify({
        results: paginatedResults,
        totalCount: filteredResults.length,
        query,
        filters,
        options
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Search error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Search failed',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})

// Calculer le score de pertinence simple
function calculateRelevanceScore(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  let score = 0;
  
  // Correspondance exacte
  if (textLower.includes(queryLower)) {
    score += 100;
  }
  
  // Correspondance de mots individuels
  const queryWords = queryLower.split(' ');
  const textWords = textLower.split(' ');
  
  queryWords.forEach(queryWord => {
    textWords.forEach(textWord => {
      if (textWord.includes(queryWord)) {
        score += 10;
      }
    });
  });
  
  return score;
}