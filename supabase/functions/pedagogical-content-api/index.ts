import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // GET /pedagogical-content/:itemCode - Get all content for an item
    if (req.method === 'GET' && path.startsWith('/pedagogical-content/')) {
      const itemCode = path.split('/')[2];
      
      if (!itemCode) {
        return new Response(JSON.stringify({ error: 'Item code required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: content, error } = await supabase
        .from('med_mng_content_ai')
        .select('*')
        .eq('item_id', itemCode);

      if (error) {
        console.error('Error fetching content:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Organize content by type
      const organizedContent = {
        bande_dessinee: content.find(c => c.content_type === 'comic')?.content || null,
        roman: content.find(c => c.content_type === 'novel')?.content || null,
        poeme: content.find(c => c.content_type === 'poem')?.content || null,
        metadata: {
          total_contents: content.length,
          last_generated: content.length > 0 ? Math.max(...content.map(c => new Date(c.created_at).getTime())) : null,
          generation_stats: {
            comic: content.filter(c => c.content_type === 'comic').length,
            novel: content.filter(c => c.content_type === 'novel').length,
            poem: content.filter(c => c.content_type === 'poem').length,
          }
        }
      };

      return new Response(JSON.stringify(organizedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /generate-missing-content - Generate missing content types
    if (req.method === 'POST' && path === '/generate-missing-content') {
      const { itemCode } = await req.json();

      if (!itemCode) {
        return new Response(JSON.stringify({ error: 'Item code required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check existing content
      const { data: existing } = await supabase
        .from('med_mng_content_ai')
        .select('content_type')
        .eq('item_id', itemCode);

      const existingTypes = existing?.map(c => c.content_type) || [];
      const missingTypes = ['comic', 'novel', 'poem'].filter(type => !existingTypes.includes(type));

      const results = [];

      // Generate missing content types
      for (const contentType of missingTypes) {
        try {
          const { data, error } = await supabase.functions.invoke('content-ai-generator', {
            body: {
              item_id: itemCode,
              content_type: contentType,
              regenerate: false
            }
          });

          if (error) {
            console.error(`Error generating ${contentType}:`, error);
            results.push({ type: contentType, success: false, error: error.message });
          } else {
            results.push({ type: contentType, success: true, data });
          }
        } catch (err) {
          console.error(`Exception generating ${contentType}:`, err);
          results.push({ type: contentType, success: false, error: err.message });
        }
      }

      return new Response(JSON.stringify({
        generated: results,
        missing_count: missingTypes.length,
        success_count: results.filter(r => r.success).length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /content-analytics - Get content generation analytics
    if (req.method === 'GET' && path === '/content-analytics') {
      const { data: contentStats, error } = await supabase
        .from('med_mng_content_ai')
        .select('content_type, status, created_at, item_id');

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const analytics = {
        total_content: contentStats?.length || 0,
        by_type: {
          comic: contentStats?.filter(c => c.content_type === 'comic').length || 0,
          novel: contentStats?.filter(c => c.content_type === 'novel').length || 0,
          poem: contentStats?.filter(c => c.content_type === 'poem').length || 0,
        },
        by_status: {
          completed: contentStats?.filter(c => c.status === 'completed').length || 0,
          generating: contentStats?.filter(c => c.status === 'generating').length || 0,
          error: contentStats?.filter(c => c.status === 'error').length || 0,
        },
        recent_generations: contentStats
          ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          ?.slice(0, 10) || [],
        unique_items: [...new Set(contentStats?.map(c => c.item_id) || [])].length
      };

      return new Response(JSON.stringify(analytics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pedagogical-content-api:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});