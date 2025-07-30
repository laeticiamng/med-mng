const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🔍 TEST API OIC DÉTAILLÉ');
  
  try {
    const response = await fetch(
      'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=100&format=json'
    );

    console.log(`📡 Status: ${response.status}`);
    const data = await response.json();
    const members = data.query?.categorymembers || [];
    
    console.log(`📊 Total pages: ${members.length}`);
    
    // Analyser les titres
    const oicPages = members.filter((page: any) => {
      if (!page.title) return false;
      return page.title.includes('OIC') || page.title.includes('Objectif');
    });
    
    console.log(`🎯 Pages OIC/Objectifs: ${oicPages.length}`);
    
    // Afficher les premiers titres
    members.slice(0, 10).forEach((page: any, i: number) => {
      console.log(`${i+1}. ${page.title}`);
    });

    return new Response(JSON.stringify({
      success: true,
      message: `API accessible - ${members.length} pages trouvées`,
      statistics: {
        total_pages: members.length,
        oic_pages: oicPages.length,
        sample_titles: members.slice(0, 5).map(p => p.title)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});