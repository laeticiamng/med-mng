import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 TEST EXTRACTION OIC SIMPLIFIÉ');
  console.log('===============================');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Test simple de l'API publique
    console.log('🔍 Test d\'accès à l\'API MediaWiki...');
    
    const response = await fetch(
      'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=10&format=json'
    );

    console.log(`📡 Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Données reçues:', JSON.stringify(data, null, 2));

    // Compter les pages OIC
    const members = data.query?.categorymembers || [];
    const oicPages = members.filter((page: any) => 
      page.title.match(/OIC[_-]\d{3}[_-]\d{2}[_-][AB][_-]\d{2}/i)
    );

    console.log(`🎯 Pages OIC trouvées: ${oicPages.length}/${members.length}`);

    // Test d'une page spécifique
    if (oicPages.length > 0) {
      const firstPage = oicPages[0];
      console.log(`📄 Test extraction page: ${firstPage.title}`);
      
      const pageResponse = await fetch(
        `https://livret.uness.fr/lisa/2025/api.php?action=query&prop=revisions&rvprop=content&pageids=${firstPage.pageid}&format=json`
      );

      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        console.log('✅ Contenu de page récupéré avec succès');
      } else {
        console.log('❌ Échec récupération contenu page');
      }
    }

    const report = {
      success: true,
      message: 'Test API MediaWiki réussi',
      statistics: {
        total_pages: members.length,
        oic_pages_found: oicPages.length,
        api_accessible: response.ok,
        test_date: new Date().toISOString()
      },
      sample_pages: oicPages.slice(0, 3).map((p: any) => ({
        title: p.title,
        pageid: p.pageid
      }))
    };

    console.log('🎉 TEST TERMINÉ AVEC SUCCÈS !');
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Erreur:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Erreur lors du test API MediaWiki'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});