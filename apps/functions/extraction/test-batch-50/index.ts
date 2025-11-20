import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès test-batch-50 sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour test-batch-50');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      console.warn(`❌ Non-admin tentative test-batch-50 par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ test-batch-50 autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    logs.push("📦 ÉTAPE 3.3: Test batch 50 pages");
    logs.push("=" .repeat(50));
    
    // Récupérer la liste des IDs
    logs.push("1️⃣ Récupération liste des IDs...");
    const listUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie%3AObjectif_de_connaissance&cmlimit=100&format=json&origin=*';
    
    const listResponse = await fetch(listUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    });
    
    logs.push(`📊 Status liste: ${listResponse.status}`);
    
    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      logs.push(`❌ Erreur récupération liste: ${errorText.substring(0, 200)}`);
      throw new Error(`HTTP ${listResponse.status}`);
    }
    
    const listData = await listResponse.json();
    const allMembers = listData.query?.categorymembers || [];
    logs.push(`📋 ${allMembers.length} membres trouvés`);
    
    if (allMembers.length === 0) {
      logs.push("❌ Aucun membre trouvé dans la catégorie");
      return new Response(JSON.stringify({
        success: false,
        error: "Catégorie vide",
        logs: logs
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Filtrer les pages OIC
    const oicMembers = allMembers.filter((member: any) => 
      member.title && member.title.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/)
    );
    logs.push(`🎯 ${oicMembers.length} pages OIC identifiées`);
    
    if (oicMembers.length === 0) {
      logs.push("❌ Aucune page OIC trouvée");
      logs.push("📝 Premiers titres trouvés:");
      allMembers.slice(0, 5).forEach((member: any, i: number) => {
        logs.push(`   ${i+1}. ${member.title}`);
      });
      
      return new Response(JSON.stringify({
        success: false,
        error: "Aucune page OIC",
        logs: logs,
        sampleTitles: allMembers.slice(0, 5).map((m: any) => m.title)
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Prendre les 50 premiers IDs
    const first50Ids = oicMembers.slice(0, 50).map((member: any) => member.pageid);
    logs.push(`📦 Premier batch: ${first50Ids.length} IDs`);
    logs.push(`📦 IDs: ${first50Ids.join(', ')}`);
    
    // Récupérer le contenu du batch
    logs.push("\n2️⃣ Récupération contenu batch...");
    const contentUrl = new URL('https://livret.uness.fr/lisa/2025/api.php');
    contentUrl.searchParams.set('action', 'query');
    contentUrl.searchParams.set('prop', 'revisions');
    contentUrl.searchParams.set('rvprop', 'content|timestamp');
    contentUrl.searchParams.set('pageids', first50Ids.join('|'));
    contentUrl.searchParams.set('format', 'json');
    contentUrl.searchParams.set('formatversion', '2');
    contentUrl.searchParams.set('origin', '*');
    
    logs.push(`📡 URL: ${contentUrl.toString().substring(0, 200)}...`);
    
    const contentResponse = await fetch(contentUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    });
    
    logs.push(`📊 Status contenu: ${contentResponse.status}`);
    
    if (!contentResponse.ok) {
      const errorText = await contentResponse.text();
      logs.push(`❌ Erreur récupération contenu: ${errorText.substring(0, 200)}`);
      throw new Error(`HTTP ${contentResponse.status}`);
    }
    
    const contentData = await contentResponse.json();
    const pages = contentData.query?.pages || [];
    logs.push(`📄 ${pages.length} pages récupérées`);
    
    // Analyser le contenu
    logs.push("\n3️⃣ Analyse du contenu...");
    let validPages = 0;
    let emptyPages = 0;
    const samplePages: any[] = [];
    
    pages.forEach((page: any, index: number) => {
      if (index < 3) { // Logger seulement les 3 premières
        logs.push(`\n📋 Page ${index + 1}/${pages.length}: ${page.title}`);
        logs.push(`   ID: ${page.pageid}`);
        
        if (page.revisions?.[0]?.content) {
          const content = page.revisions[0].content;
          logs.push(`   ✅ Contenu: ${content.length} caractères`);
          logs.push(`   📄 Extrait: ${content.substring(0, 150)}...`);
          
          samplePages.push({
            pageid: page.pageid,
            title: page.title,
            contentLength: content.length,
            excerpt: content.substring(0, 150)
          });
          
          validPages++;
        } else {
          logs.push(`   ❌ Contenu vide`);
          emptyPages++;
        }
      } else {
        // Compter seulement
        if (page.revisions?.[0]?.content) {
          validPages++;
        } else {
          emptyPages++;
        }
      }
    });
    
    logs.push(`\n📊 RÉSUMÉ: ${validPages} pages avec contenu, ${emptyPages} pages vides`);
    
    logs.push("\n" + "=" .repeat(50));
    logs.push("📊 RÉSULTATS DIAGNOSTIC 3.3 TERMINÉ");
    logs.push("=" .repeat(50));
    
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        totalMembers: allMembers.length,
        oicMembers: oicMembers.length,
        batchSize: first50Ids.length,
        pagesReceived: pages.length,
        validPages: validPages,
        emptyPages: emptyPages
      },
      samplePages: samplePages,
      pageIds: first50Ids,
      logs: logs
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    logs.push(`💥 Erreur critique: ${error.message}`);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      logs: logs
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});