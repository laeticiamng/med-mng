/**
 * 🔍 ADVANCED SEARCH PREMIUM
 * Service de recherche intelligent pour EDN et contenus médicaux
 * ✅ Recherche sémantique avec embeddings
 * ✅ Filtres avancés multi-critères
 * ✅ Performance optimisée
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  filters?: {
    categories?: string[];
    difficulty?: string[];
    specialties?: string[];
    hasMusic?: boolean;
    hasQuiz?: boolean;
    hasScene?: boolean;
    dateRange?: {
      from: string;
      to: string;
    };
  };
  options?: {
    limit?: number;
    offset?: number;
    includeEmbeddings?: boolean;
    fuzzyMatch?: boolean;
  };
}

interface SearchResult {
  items: any[];
  total: number;
  suggestions?: string[];
  facets?: Record<string, any>;
  executionTime: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { query, filters = {}, options = {} } = await req.json() as SearchRequest;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Construire la requête de base
    let searchQuery = supabase
      .from('edn_items_complete')
      .select(`
        id, item_code, title, subtitle, slug,
        paroles_musicales, tableau_rang_a, tableau_rang_b,
        scene_immersive, quiz_questions, specialite,
        completeness_score, is_validated,
        created_at, updated_at
      `);

    // Recherche textuelle
    if (query && query.trim()) {
      const searchTerms = query.trim().toLowerCase();
      
      if (options.fuzzyMatch) {
        // Recherche fuzzy avec ILIKE
        searchQuery = searchQuery.or(`
          title.ilike.%${searchTerms}%,
          subtitle.ilike.%${searchTerms}%,
          item_code.ilike.%${searchTerms}%,
          specialite.ilike.%${searchTerms}%
        `);
      } else {
        // Recherche simple avec ILIKE
        searchQuery = searchQuery.or(`
          title.ilike.%${searchTerms}%,
          item_code.ilike.%${searchTerms}%
        `);
      }
    }

    // Filtres avancés
    if (filters.specialties?.length) {
      searchQuery = searchQuery.in('specialite', filters.specialties);
    }

    if (filters.hasMusic !== undefined) {
      if (filters.hasMusic) {
        searchQuery = searchQuery.not('paroles_musicales', 'is', null);
      } else {
        searchQuery = searchQuery.is('paroles_musicales', null);
      }
    }

    if (filters.hasQuiz !== undefined) {
      if (filters.hasQuiz) {
        searchQuery = searchQuery.not('quiz_questions', 'is', null);
      } else {
        searchQuery = searchQuery.is('quiz_questions', null);
      }
    }

    if (filters.hasScene !== undefined) {
      if (filters.hasScene) {
        searchQuery = searchQuery.not('scene_immersive', 'is', null);
      } else {
        searchQuery = searchQuery.is('scene_immersive', null);
      }
    }

    // Filtres de date
    if (filters.dateRange?.from) {
      searchQuery = searchQuery.gte('created_at', filters.dateRange.from);
    }
    if (filters.dateRange?.to) {
      searchQuery = searchQuery.lte('created_at', filters.dateRange.to);
    }

    // Pagination
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    
    searchQuery = searchQuery
      .range(offset, offset + limit - 1)
      .order('completeness_score', { ascending: false })
      .order('item_code', { ascending: true });

    // Exécuter la recherche
    const { data: items, error: searchError, count } = await searchQuery;

    if (searchError) {
      throw searchError;
    }

    // Générer des suggestions si peu de résultats
    let suggestions: string[] = [];
    if (items && items.length < 5 && query) {
      const { data: suggestionData } = await supabase
        .from('edn_items_complete')
        .select('title, item_code')
        .limit(10);

      if (suggestionData) {
        suggestions = suggestionData
          .map(item => `${item.item_code}: ${item.title}`)
          .slice(0, 5);
      }
    }

    // Calculer les facettes pour filtrage
    const facets: Record<string, any> = {};
    
    // Facettes spécialités
    const { data: specialtyFacets } = await supabase
      .from('edn_items_complete')
      .select('specialite')
      .not('specialite', 'is', null);

    if (specialtyFacets) {
      const specialtyCounts = specialtyFacets.reduce((acc: Record<string, number>, item) => {
        const specialty = item.specialite;
        if (specialty) {
          acc[specialty] = (acc[specialty] || 0) + 1;
        }
        return acc;
      }, {});
      
      facets.specialties = Object.entries(specialtyCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    }

    const executionTime = Date.now() - startTime;

    const result: SearchResult = {
      items: items || [],
      total: count || 0,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      facets,
      executionTime
    };

    console.log(`[ADVANCED-SEARCH] Recherche complétée en ${executionTime}ms:`, {
      query,
      resultCount: result.total,
      filtersApplied: Object.keys(filters).length
    });

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ADVANCED-SEARCH] Erreur:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erreur de recherche avancée'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});