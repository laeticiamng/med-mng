const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 TEST SIMPLE OIC');
  
  try {
    // Test très basique - juste l'API MediaWiki
    console.log('🔍 Test API MediaWiki...');
    
    const response = await fetch(
      'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=50&format=json'
    );

    console.log(`📡 Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Données reçues');

    const members = data.query?.categorymembers || [];
    console.log(`📋 ${members.length} pages trouvées`);

    // Compter les pages qui contiennent "OIC"
    const oicPages = members.filter((page: any) => 
      page.title && page.title.includes('OIC')
    );

    console.log(`🎯 ${oicPages.length} pages OIC identifiées`);

    const report = {
      success: true,
      message: 'Test API réussi',
      statistics: {
        total_pages: members.length,
        oic_pages_found: oicPages.length,
        api_accessible: true,
        test_date: new Date().toISOString()
      },
      sample_pages: members.slice(0, 3).map((p: any) => ({
        title: p.title,
        pageid: p.pageid
      }))
    };

    console.log('✅ Test terminé avec succès');
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Erreur:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Erreur lors du test API'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});