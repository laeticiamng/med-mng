import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompletionRequest {
  action: 'start' | 'status' | 'test_auth';
  batch_size?: number;
  min_chars?: number;
  concurrency?: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const casUsername = Deno.env.get('CAS_USERNAME');
    const casPassword = Deno.env.get('CAS_PASSWORD');

    if (!casUsername || !casPassword) {
      return new Response(
        JSON.stringify({ error: 'CAS credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, batch_size = 50, min_chars = 200, concurrency = 3 }: CompletionRequest = 
      await req.json().catch(() => ({ action: 'status' }));

    console.log(`🚀 Action: ${action}, batch: ${batch_size}, concurrency: ${concurrency}`);

    if (action === 'test_auth') {
      return await testCASAuth(casUsername, casPassword);
    }

    if (action === 'start') {
      return await startCompletion(supabase, batch_size, min_chars, concurrency, casUsername, casPassword);
    }

    // Default: status
    return await getStatus(supabase);

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function testCASAuth(username: string, password: string) {
  try {
    console.log('🔐 Test CAS authentication...');
    
    // Étape 1: Visiter une page protégée pour obtenir une redirection CAS
    const protectedResponse = await fetch('https://livret.uness.fr/lisa/2025/', {
      method: 'GET',
      redirect: 'manual'
    });

    console.log(`📍 Protected page status: ${protectedResponse.status}`);
    
    if (protectedResponse.status === 302 || protectedResponse.status === 301) {
      const location = protectedResponse.headers.get('location');
      console.log(`🔄 Redirected to: ${location}`);
      
      if (location?.includes('auth.uness.fr')) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'CAS redirection detected', 
            redirectUrl: location 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'No CAS redirection detected',
        status: protectedResponse.status 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ CAS test error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function startCompletion(
  supabase: any, 
  batchSize: number, 
  minChars: number, 
  concurrency: number,
  username: string,
  password: string
) {
  try {
    // Récupérer les items à compléter
    const { data: items, error } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, url_source, description')
      .or('description.is.null,description.eq.')
      .limit(batchSize);

    if (error) throw error;

    console.log(`📦 Items à traiter: ${items?.length || 0}`);

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Aucun item à compléter', 
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Traitement basique sans Puppeteer pour l'instant
    let processed = 0;
    for (const item of items.slice(0, Math.min(5, items.length))) {
      try {
        // Marquer comme en cours de traitement
        await supabase
          .from('backup_oic_competences')
          .update({ 
            completion_status: 'processing',
            completion_updated_at: new Date().toISOString()
          })
          .eq('objectif_id', item.objectif_id);
        
        processed++;
      } catch (itemError) {
        console.error(`❌ Error processing item ${item.objectif_id}:`, itemError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Traitement démarré pour ${processed} items`,
        processed,
        total: items.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Completion error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getStatus(supabase: any) {
  try {
    const { data: stats, error } = await supabase
      .from('backup_oic_competences')
      .select('completion_status')
      .not('completion_status', 'is', null);

    if (error) throw error;

    const statusCounts = stats?.reduce((acc: any, item: any) => {
      acc[item.completion_status] = (acc[item.completion_status] || 0) + 1;
      return acc;
    }, {}) || {};

    const { data: emptyCount, error: emptyError } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id', { count: 'exact', head: true })
      .or('description.is.null,description.eq.');

    if (emptyError) throw emptyError;

    return new Response(
      JSON.stringify({ 
        success: true,
        status: statusCounts,
        empty_descriptions: emptyCount || 0,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Status error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}