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
      'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=10&format=json'
    );

    console.log(`📡 Réponse HTTP: ${response.status}`);
    
    const data = await response.json();
    const members = data.query?.categorymembers || [];
    
    console.log(`📊 Pages trouvées: ${members.length}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Test API réussi',
      data: {
        pages_found: members.length,
        api_status: response.status,
        sample_pages: members.slice(0, 3)
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