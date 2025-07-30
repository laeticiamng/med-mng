const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('✅ Fonction test simple démarrée');
  
  try {
    console.log('🔍 Test fetch vers API MediaWiki...');
    
    const response = await fetch(
      'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=100&format=json'
    );

    console.log(`📡 Réponse HTTP: ${response.status}`);
    
    const data = await response.json();
    const members = data.query?.categorymembers || [];
    
    console.log(`📊 Pages trouvées: ${members.length}`);
    
    // Chercher tous les patterns possibles d'OIC
    const oicPages = members.filter((page: any) => {
      if (!page.title) return false;
      const title = page.title.toLowerCase();
      return title.includes('oic') || 
             title.includes('objectif') ||
             title.match(/ic[_-]?\d+/i) ||
             title.match(/obj[_-]?\d+/i);
    });
    
    console.log(`🎯 Pages OIC/Objectifs trouvées: ${oicPages.length}`);
    
    // Afficher les premiers titres pour analyse
    console.log('📋 Premiers titres:');
    members.slice(0, 10).forEach((page: any) => {
      console.log(`  - ${page.title}`);
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Test API réussi',
      data: {
        total_pages_found: members.length,
        oic_pages_found: oicPages.length,
        api_status: response.status,
        sample_titles: members.slice(0, 5).map(p => p.title),
        oic_samples: oicPages.slice(0, 5).map(p => p.title)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});