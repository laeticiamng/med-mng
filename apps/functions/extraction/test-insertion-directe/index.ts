import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès test-insertion-directe sans authentification');
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
      console.warn('❌ Token invalide pour test-insertion-directe');
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
      console.warn(`❌ Non-admin tentative test-insertion-directe par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ test-insertion-directe autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    logs.push("🔧 TEST INSERTION DIRECTE AVEC SERVICE_ROLE")
    logs.push("=" .repeat(60))
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Client avec permissions complètes
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
    
    // 1. Vérifier l'état actuel
    logs.push("1️⃣ Vérification count initial...")
    const { count: countBefore, error: countError } = await supabase
      .from('oic_competences')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      logs.push(`❌ Erreur count: ${countError.message}`)
    } else {
      logs.push(`📊 Count initial: ${countBefore || 0}`)
    }
    
    // 2. Test API MediaWiki
    logs.push("\n2️⃣ Test récupération API MediaWiki...")
    const apiUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie%3AObjectif_de_connaissance&cmlimit=5&format=json&origin=*'
    
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    })
    
    logs.push(`📊 Status API: ${apiResponse.status}`)
    
    if (!apiResponse.ok) {
      logs.push(`❌ API inaccessible: ${apiResponse.status}`)
      return new Response(JSON.stringify({
        success: false,
        error: "API_INACCESSIBLE",
        logs: logs
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const apiData = await apiResponse.json()
    const members = apiData.query?.categorymembers || []
    logs.push(`📋 Membres trouvés: ${members.length}`)
    
    // Filtrer les pages OIC
    const oicMembers = members.filter((member: any) => 
      member.title && member.title.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/)
    )
    logs.push(`🎯 Pages OIC trouvées: ${oicMembers.length}`)
    
    if (oicMembers.length === 0) {
      logs.push("❌ Aucune page OIC détectée")
      return new Response(JSON.stringify({
        success: false,
        error: "NO_OIC_PAGES",
        logs: logs
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // 3. Récupérer le contenu d'une page pour test
    logs.push("\n3️⃣ Récupération contenu première page...")
    const firstPage = oicMembers[0]
    const contentUrl = new URL('https://livret.uness.fr/lisa/2025/api.php')
    contentUrl.searchParams.set('action', 'query')
    contentUrl.searchParams.set('prop', 'revisions')
    contentUrl.searchParams.set('rvprop', 'content|timestamp')
    contentUrl.searchParams.set('pageids', firstPage.pageid.toString())
    contentUrl.searchParams.set('format', 'json')
    contentUrl.searchParams.set('formatversion', '2')
    contentUrl.searchParams.set('origin', '*')
    
    const contentResponse = await fetch(contentUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    })
    
    logs.push(`📊 Status contenu: ${contentResponse.status}`)
    
    if (!contentResponse.ok) {
      logs.push(`❌ Erreur récupération contenu: ${contentResponse.status}`)
      return new Response(JSON.stringify({
        success: false,
        error: "CONTENT_ERROR",
        logs: logs
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const contentData = await contentResponse.json()
    const pages = contentData.query?.pages || []
    logs.push(`📄 Pages reçues: ${pages.length}`)
    
    // 4. Parser la première page
    logs.push("\n4️⃣ Parsing avec parser corrigé...")
    let testCompetence = null
    
    if (pages.length > 0) {
      const page = pages[0]
      testCompetence = parseCompetenceFromWikitext(page, logs)
    }
    
    if (!testCompetence) {
      logs.push("❌ Parsing échoué - création données de test")
      testCompetence = {
        objectif_id: 'OIC-001-01-A-01',
        intitule: 'Test insertion directe avec service role',
        item_parent: '001',
        rang: 'A',
        rubrique: 'Test',
        description: 'Test pour débloquer insertion',
        ordre: 1,
        url_source: 'https://test.local',
        extraction_status: 'test',
        date_import: new Date().toISOString()
      }
    }
    
    logs.push('\n🔍 SAMPLE COMPETENCE ➜')
    logs.push(JSON.stringify(testCompetence, null, 2))
    
    // 5. Test insertion avec service_role
    logs.push("\n5️⃣ Test insertion avec SERVICE_ROLE...")
    const { data: insertData, error: insertError } = await supabase
      .from('oic_competences')
      .upsert(testCompetence, { onConflict: 'objectif_id' })
      .select()
    
    if (insertError) {
      logs.push('❌ INSERT_ERR ➜')
      logs.push(`   Code: ${insertError.code}`)
      logs.push(`   Message: ${insertError.message}`)
      logs.push(`   Details: ${insertError.details}`)
      logs.push(`   Hint: ${insertError.hint}`)
      
      return new Response(JSON.stringify({
        success: false,
        error: "INSERT_FAILED",
        insertError: insertError,
        logs: logs
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    logs.push('✅ INSERTION RÉUSSIE !')
    logs.push(`📦 Données insérées: ${insertData?.length || 0}`)
    
    // 6. Vérifier le nouveau count
    const { count: countAfter } = await supabase
      .from('oic_competences')
      .select('*', { count: 'exact', head: true })
    
    logs.push(`📊 Count final: ${countAfter || 0} (+${(countAfter || 0) - (countBefore || 0)})`)
    
    // 7. Lire les données insérées
    const { data: readData } = await supabase
      .from('oic_competences')
      .select('objectif_id, intitule')
      .limit(5)
    
    logs.push('\n📋 Échantillon en base:')
    readData?.forEach((item, i) => {
      logs.push(`   ${i+1}. ${item.objectif_id}: ${item.intitule}`)
    })
    
    logs.push("\n" + "=" .repeat(60))
    logs.push("🎉 SUCCESS: Insertion directe avec service_role FONCTIONNE !")
    logs.push("🔧 Diagnostic: Le problème était bien les permissions RLS")
    logs.push("✅ Solution: Utiliser service_role dans les edge functions d'extraction")
    logs.push("=" .repeat(60))
    
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        countBefore: countBefore || 0,
        countAfter: countAfter || 0,
        inserted: (countAfter || 0) - (countBefore || 0),
        sample: testCompetence,
        sampleInDb: readData?.[0]
      },
      logs: logs
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    logs.push(`💥 Erreur critique: ${error.message}`)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      logs: logs
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Parser corrigé
function parseCompetenceFromWikitext(page: any, logs: string[]): any {
  try {
    const title = page.title || ''
    logs.push(`🔍 Parsing: ${title}`)
    
    // Extraction plus robuste de l'identifiant
    const idMatch = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/)
    if (!idMatch) {
      logs.push(`⚠️ Format invalide pour: ${title}`)
      return null
    }
    
    const [fullId, item, rubriqueCode, rang, ordre] = idMatch
    
    // Récupération du contenu avec gestion des différents formats MediaWiki
    let content = ''
    if (page.revisions?.[0]?.slots?.main?.content) {
      content = page.revisions[0].slots.main.content
    } else if (page.revisions?.[0]?.['*']) {
      content = page.revisions[0]['*']
    } else if (page.revisions?.[0]?.content) {
      content = page.revisions[0].content
    }
    
    logs.push(`📄 Contenu récupéré: ${content.length} caractères`)
    
    // Parser l'intitulé depuis le contenu
    let intitule = title
    const intituleMatch = content.match(/'''(.+?)'''|==\s*(.+?)\s*==/)
    if (intituleMatch) {
      intitule = (intituleMatch[1] || intituleMatch[2]).trim()
    }
    
    // Mapper le code rubrique vers le nom
    const rubriques: Record<string, string> = {
      '01': 'Génétique',
      '02': 'Immunopathologie',
      '03': 'Inflammation',
      '04': 'Cancérologie',
      '05': 'Pharmacologie',
      '06': 'Douleur',
      '07': 'Santé publique',
      '08': 'Thérapeutique',
      '09': 'Urgences',
      '10': 'Vieillissement',
      '11': 'Interprétation'
    }
    
    // Générer hash simple
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    const competence = {
      objectif_id: fullId,
      intitule: intitule.substring(0, 500), // Limiter la longueur
      item_parent: item,
      rang: rang,
      rubrique: rubriques[rubriqueCode] || `Rubrique ${rubriqueCode}`,
      description: extractDescription(content),
      ordre: parseInt(ordre),
      url_source: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(title)}`,
      hash_content: Math.abs(hash).toString(36),
      extraction_status: 'complete',
      date_import: new Date().toISOString()
    }
    
    logs.push(`✅ Parsed: ${competence.objectif_id}`)
    return competence
    
  } catch (error) {
    logs.push(`❌ Erreur parsing: ${error.message}`)
    return null
  }
}

function extractDescription(content: string): string {
  // Nettoyer le wikitext
  let desc = content
    .replace(/\[\[(.+?)\|(.+?)\]\]/g, '$2') // Liens avec texte alternatif
    .replace(/\[\[(.+?)\]\]/g, '$1')         // Liens simples
    .replace(/'''(.+?)'''/g, '$1')           // Gras
    .replace(/''(.+?)''/g, '$1')             // Italique
    .replace(/{{.+?}}/g, '')                 // Templates
    .replace(/<ref.*?\/>/g, '')              // Références
    .replace(/<.*?>/g, '')                   // Autres balises
  
  // Extraire le premier paragraphe
  const firstPara = desc.match(/\n\n(.+?)(?=\n\n|$)/s)
  if (firstPara) {
    desc = firstPara[1].trim()
  }
  
  return desc.substring(0, 1000) // Limiter la longueur
}