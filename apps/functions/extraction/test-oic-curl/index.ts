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
      console.warn('❌ Tentative accès test-oic-curl sans authentification');
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
      console.warn('❌ Token invalide pour test-oic-curl');
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
      console.warn(`❌ Non-admin tentative test-oic-curl par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ test-oic-curl autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    logs.push("🧪 ÉTAPE 3.1: Test API MediaWiki (anonyme)");
    logs.push("=" .repeat(50));
    
    // Test 1: API siteinfo
    logs.push("1️⃣ Test curl API siteinfo...");
    const siteinfoUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&meta=siteinfo&format=json&origin=*';
    logs.push(`URL: ${siteinfoUrl}`);
    
    const siteinfoResponse = await fetch(siteinfoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    });
    
    logs.push(`Status: ${siteinfoResponse.status} ${siteinfoResponse.statusText}`);
    logs.push(`Headers: ${JSON.stringify(Object.fromEntries(siteinfoResponse.headers.entries()))}`);
    
    if (siteinfoResponse.status === 200) {
      const siteinfoText = await siteinfoResponse.text();
      logs.push(`✅ Réponse OK - ${siteinfoText.length} caractères`);
      logs.push(`📄 Contenu (500 premiers chars): ${siteinfoText.substring(0, 500)}`);
      
      try {
        const siteinfoJson = JSON.parse(siteinfoText);
        if (siteinfoJson.query?.general) {
          logs.push("✅ API PUBLIQUE confirmée - JSON valide avec données");
        } else {
          logs.push("⚠️  JSON sans données attendues");
        }
      } catch (e) {
        logs.push("❌ Réponse non-JSON");
      }
    } else if (siteinfoResponse.status === 302) {
      logs.push("🔐 REDIRECTION CAS détectée - API protégée");
      logs.push(`📍 Location: ${siteinfoResponse.headers.get('location')}`);
    } else if (siteinfoResponse.status === 403) {
      logs.push("🚫 ACCÈS INTERDIT - API protégée");
    } else {
      const siteinfoText = await siteinfoResponse.text();
      logs.push(`❌ Erreur HTTP ${siteinfoResponse.status}: ${siteinfoText.substring(0, 200)}`);
    }
    
    // Test 2: Category members
    logs.push("\n2️⃣ Test catégorie membres...");
    const categoryUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie%3AObjectif_de_connaissance&cmlimit=5&format=json&origin=*';
    logs.push(`URL: ${categoryUrl}`);
    
    const categoryResponse = await fetch(categoryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    });
    
    logs.push(`Status: ${categoryResponse.status} ${categoryResponse.statusText}`);
    
    if (categoryResponse.ok) {
      const categoryData = await categoryResponse.json();
      logs.push(`📄 Réponse JSON (tronquée): ${JSON.stringify(categoryData).substring(0, 500)}...`);
      
      const members = categoryData.query?.categorymembers || [];
      logs.push(`📊 Membres trouvés: ${members.length}`);
      
      if (members.length > 0) {
        logs.push("✅ CATÉGORIE TROUVÉE - Premiers membres:");
        members.slice(0, 3).forEach((member: any, i: number) => {
          logs.push(`   ${i+1}. "${member.title}" (ID: ${member.pageid})`);
        });
        
        if (categoryData.continue?.cmcontinue) {
          logs.push(`📄 Pagination disponible: ${categoryData.continue.cmcontinue}`);
        }
      } else {
        logs.push("❌ CATÉGORIE VIDE - Aucun membre trouvé");
        logs.push("🔍 Possible problème de nom de catégorie");
      }
    } else {
      const categoryText = await categoryResponse.text();
      logs.push(`❌ Erreur: ${categoryText.substring(0, 500)}`);
    }
    
    // Test 3: Premier contenu de page si possible
    if (categoryResponse.ok) {
      const categoryData = await categoryResponse.json();
      const members = categoryData.query?.categorymembers || [];
      
      if (members.length > 0) {
        const firstPageId = members[0].pageid;
        logs.push(`\n3️⃣ Test contenu première page (ID: ${firstPageId})`);
        
        const contentUrl = `https://livret.uness.fr/lisa/2025/api.php?action=query&prop=revisions&rvprop=content&pageids=${firstPageId}&format=json&formatversion=2&origin=*`;
        logs.push(`URL: ${contentUrl}`);
        
        const contentResponse = await fetch(contentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
            'Accept': 'application/json'
          }
        });
        
        logs.push(`Status: ${contentResponse.status}`);
        
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          const page = contentData.query?.pages?.[0];
          
          if (page?.revisions?.[0]?.content) {
            const content = page.revisions[0].content;
            logs.push(`✅ CONTENU RÉCUPÉRÉ - ${content.length} caractères`);
            logs.push(`📄 Titre: "${page.title}"`);
            logs.push(`📄 Contenu (200 premiers chars): ${content.substring(0, 200)}...`);
          } else {
            logs.push("❌ Contenu vide ou inaccessible");
            logs.push(`📄 Réponse: ${JSON.stringify(contentData).substring(0, 300)}`);
          }
        } else {
          const contentText = await contentResponse.text();
          logs.push(`❌ Erreur: ${contentText.substring(0, 300)}`);
        }
      }
    }
    
    logs.push("\n" + "=" .repeat(50));
    logs.push("📊 RÉSULTATS DIAGNOSTIC 3.1 TERMINÉ");
    logs.push("=" .repeat(50));
    
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
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