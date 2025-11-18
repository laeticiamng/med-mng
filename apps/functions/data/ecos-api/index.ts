import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour ecos-api
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase si nécessaire
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ ecos-api autorisé pour user ${user.id}`);

    // Code original de la fonction
    
    const url = new URL(req.url);
    const path = url.pathname;

    // GET /ecos-situations - Get all ECOS situations with pagination
    if (req.method === 'GET' && path === '/ecos-situations') {
      const searchParams = url.searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search') || '';
      const competences = searchParams.get('competences') || '';
      
      const offset = (page - 1) * limit;

      let query = supabase
        .from('ecos_situations_uness')
        .select('*', { count: 'exact' });

      // Filtrer par recherche textuelle
      if (search) {
        query = query.or(`intitule_sd.ilike.%${search}%, contenu_complet_html.ilike.%${search}%`);
      }

      // Filtrer par compétences
      if (competences) {
        query = query.contains('competences_associees', [competences]);
      }

      const { data: situations, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('sd_id', { ascending: true });

      if (error) {
        console.error('Error fetching ECOS situations:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        situations,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /ecos-situations/:id - Get single ECOS situation
    if (req.method === 'GET' && path.startsWith('/ecos-situations/')) {
      const situationId = parseInt(path.split('/')[2]);

      if (!situationId || isNaN(situationId)) {
        return new Response(JSON.stringify({ error: 'ID de situation invalide' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: situation, error } = await supabase
        .from('ecos_situations_uness')
        .select('*')
        .eq('sd_id', situationId)
        .single();

      if (error) {
        console.error('Error fetching ECOS situation:', error);
        return new Response(JSON.stringify({ error: 'Situation non trouvée' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(situation), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /ecos-competences - Get all competences for filtering
    if (req.method === 'GET' && path === '/ecos-competences') {
      const { data: situations } = await supabase
        .from('ecos_situations_uness')
        .select('competences_associees');

      const allCompetences = new Set();
      situations?.forEach(situation => {
        situation.competences_associees?.forEach(comp => allCompetences.add(comp));
      });

      return new Response(JSON.stringify({
        competences: Array.from(allCompetences).sort()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /ecos-analytics - Get ECOS analytics
    if (req.method === 'GET' && path === '/ecos-analytics') {
      const { data: situations } = await supabase
        .from('ecos_situations_uness')
        .select('sd_id, intitule_sd, competences_associees, created_at');

      if (!situations) {
        return new Response(JSON.stringify({ error: 'Impossible de récupérer les données' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Analyser les compétences
      const competenceStats = new Map();
      let totalCompetences = 0;

      situations.forEach(situation => {
        if (situation.competences_associees) {
          situation.competences_associees.forEach(comp => {
            competenceStats.set(comp, (competenceStats.get(comp) || 0) + 1);
            totalCompetences++;
          });
        }
      });

      // Top 10 compétences
      const topCompetences = Array.from(competenceStats.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([competence, count]) => ({ competence, count }));

      // Statistiques générales
      const analytics = {
        total_situations: situations.length,
        total_competences: competenceStats.size,
        avg_competences_per_situation: totalCompetences / situations.length,
        top_competences: topCompetences,
        distribution_by_competences: {
          with_competences: situations.filter(s => s.competences_associees?.length > 0).length,
          without_competences: situations.filter(s => !s.competences_associees || s.competences_associees.length === 0).length
        },
        recent_additions: situations
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(s => ({
            sd_id: s.sd_id,
            intitule_sd: s.intitule_sd,
            created_at: s.created_at
          }))
      };

      return new Response(JSON.stringify(analytics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /ecos-search-advanced - Advanced search with multiple criteria
    if (req.method === 'POST' && path === '/ecos-search-advanced') {
      const { 
        keywords, 
        competences, 
        dateRange, 
        contentType,
        page = 1,
        limit = 20 
      } = await req.json();

      const offset = (page - 1) * limit;
      let query = supabase
        .from('ecos_situations_uness')
        .select('*', { count: 'exact' });

      // Recherche par mots-clés
      if (keywords && keywords.length > 0) {
        const keywordFilters = keywords.map(keyword => 
          `intitule_sd.ilike.%${keyword}%, contenu_complet_html.ilike.%${keyword}%`
        ).join(',');
        query = query.or(keywordFilters);
      }

      // Filtrage par compétences
      if (competences && competences.length > 0) {
        query = query.overlaps('competences_associees', competences);
      }

      // Filtrage par date
      if (dateRange?.start) {
        query = query.gte('created_at', dateRange.start);
      }
      if (dateRange?.end) {
        query = query.lte('created_at', dateRange.end);
      }

      const { data: results, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('sd_id', { ascending: true });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        results,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        },
        search_criteria: {
          keywords,
          competences,
          dateRange,
          contentType
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Route non trouvée' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ecos-api:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});