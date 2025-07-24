import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Route: GET /edn-fix/verify
    if (url.pathname === '/edn-fix/verify' && req.method === 'GET') {
      const { data: itemCount } = await supabase
        .from('edn_items_immersive')
        .select('item_code', { count: 'exact', head: true });

      const { data: competenceCount } = await supabase
        .from('oic_competences')
        .select('objectif_id', { count: 'exact', head: true });

      const { data: sampleItem } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, tableau_rang_a, tableau_rang_b')
        .eq('item_code', 'IC-1')
        .single();

      const hasRangA =
        sampleItem?.tableau_rang_a &&
        sampleItem.tableau_rang_a.sections &&
        sampleItem.tableau_rang_a.sections.length > 0;

      const hasRangB =
        sampleItem?.tableau_rang_b &&
        sampleItem.tableau_rang_b.sections &&
        sampleItem.tableau_rang_b.sections.length > 0;

      return new Response(
        JSON.stringify({
          status: 'ok',
          data: {
            total_items: itemCount,
            total_competences: competenceCount,
            sample_item: {
              code: sampleItem?.item_code,
              title: sampleItem?.title,
              has_rang_a: hasRangA,
              has_rang_b: hasRangB,
              rang_a_sections: hasRangA
                ? sampleItem.tableau_rang_a.sections.length
                : 0,
              rang_b_sections: hasRangB
                ? sampleItem.tableau_rang_b.sections.length
                : 0,
            },
            diagnosis: {
              items_present: itemCount > 0,
              competences_present: competenceCount > 0,
              data_integrated: hasRangA || hasRangB,
              issue:
                !hasRangA && !hasRangB
                  ? 'Tables not populated with OIC data'
                  : null,
            },
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Route: GET /edn-fix/items
    if (url.pathname === '/edn-fix/items' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select(
          `
          id,
          item_code,
          title,
          slug,
          description,
          tableau_rang_a,
          tableau_rang_b,
          song_lyrics,
          quiz_questions,
          immersive_scenes,
          created_at,
          updated_at
        `
        )
        .order('item_code');

      if (error) throw error;

      const enrichedData = await Promise.all(
        data.map(async (item) => {
          const { count: rangACount } = await supabase
            .from('oic_competences')
            .select('*', { count: 'exact', head: true })
            .eq(
              'item_parent',
              item.item_code.replace('IC-', '').padStart(3, '0')
            )
            .eq('rang', 'A');

          const { count: rangBCount } = await supabase
            .from('oic_competences')
            .select('*', { count: 'exact', head: true })
            .eq(
              'item_parent',
              item.item_code.replace('IC-', '').padStart(3, '0')
            )
            .eq('rang', 'B');

          return {
            ...item,
            competence_counts: {
              rang_a: rangACount || 0,
              rang_b: rangBCount || 0,
              total: (rangACount || 0) + (rangBCount || 0),
            },
          };
        })
      );

      return new Response(
        JSON.stringify({
          status: 'ok',
          data: enrichedData,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Route: GET /edn-fix/item/:code
    if (url.pathname.match(/^\/edn-fix\/item\/(.+)$/) && req.method === 'GET') {
      const itemCode = url.pathname.split('/').pop();

      const { data: item, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', itemCode)
        .single();

      if (error) throw error;

      if (!item.tableau_rang_a || !item.tableau_rang_a.sections?.length) {
        const itemNumber = itemCode!.replace('IC-', '').padStart(3, '0');

        const { data: competencesA } = await supabase
          .from('oic_competences')
          .select('*')
          .eq('item_parent', itemNumber)
          .eq('rang', 'A')
          .order('rubrique', { ascending: true })
          .order('ordre', { ascending: true });

        const { data: competencesB } = await supabase
          .from('oic_competences')
          .select('*')
          .eq('item_parent', itemNumber)
          .eq('rang', 'B')
          .order('rubrique', { ascending: true })
          .order('ordre', { ascending: true });

        item.tableau_rang_a = buildTableauFromCompetences(
          competencesA || [],
          'A',
          item.title
        );
        item.tableau_rang_b = buildTableauFromCompetences(
          competencesB || [],
          'B',
          item.title
        );

        await supabase
          .from('edn_items_immersive')
          .update({
            tableau_rang_a: item.tableau_rang_a,
            tableau_rang_b: item.tableau_rang_b,
          })
          .eq('item_code', itemCode);
      }

      return new Response(
        JSON.stringify({
          status: 'ok',
          data: item,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Route: POST /edn-fix/rebuild-all
    if (url.pathname === '/edn-fix/rebuild-all' && req.method === 'POST') {
      const { data: items } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title')
        .order('item_code');

      let processed = 0;
      let errors = 0;

      for (const item of items || []) {
        try {
          const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');

          const { data: competencesA } = await supabase
            .from('oic_competences')
            .select('*')
            .eq('item_parent', itemNumber)
            .eq('rang', 'A')
            .order('rubrique', { ascending: true })
            .order('ordre', { ascending: true });

          const { data: competencesB } = await supabase
            .from('oic_competences')
            .select('*')
            .eq('item_parent', itemNumber)
            .eq('rang', 'B')
            .order('rubrique', { ascending: true })
            .order('ordre', { ascending: true });

          const tableauA = buildTableauFromCompetences(
            competencesA || [],
            'A',
            item.title
          );
          const tableauB = buildTableauFromCompetences(
            competencesB || [],
            'B',
            item.title
          );

          await supabase
            .from('edn_items_immersive')
            .update({
              tableau_rang_a: tableauA,
              tableau_rang_b: tableauB,
            })
            .eq('item_code', item.item_code);

          processed++;
        } catch (error) {
          errors++;
          console.error(`Error processing ${item.item_code}:`, error);
        }
      }

      return new Response(
        JSON.stringify({
          status: 'ok',
          data: {
            total_items: items?.length || 0,
            processed,
            errors,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function buildTableauFromCompetences(
  competences: any[],
  rang: string,
  itemTitle: string
) {
  const byRubrique = competences.reduce(
    (acc, comp) => {
      const rubrique = comp.rubrique || 'Général';
      if (!acc[rubrique]) acc[rubrique] = [];
      acc[rubrique].push(comp);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const sections = Object.entries(byRubrique).map(([rubrique, comps]) => ({
    title: rubrique,
    content: comps
      .map(
        (c) =>
          `${c.intitule}${c.description ? ': ' + cleanDescription(c.description) : ''}`
      )
      .join('\n'),
    keywords: extractKeywords(comps),
  }));

  return {
    title: `${itemTitle} - Rang ${rang}`,
    sections,
  };
}

function cleanDescription(description: string): string {
  return description
    .replace(/^[-\*]\s*/, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[([^\|\]]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractKeywords(competences: any[]): string[] {
  const keywords = new Set<string>();

  competences.forEach((comp) => {
    const words = comp.intitule
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word: string) => word.length > 3);

    words.forEach((word: string) => keywords.add(word));
  });

  return Array.from(keywords).slice(0, 10);
}
