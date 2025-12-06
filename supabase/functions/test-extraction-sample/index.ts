import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const logs: string[] = [];
  
  try {
    logs.push("🧪 TEST EXTRACTION ÉCHANTILLON - Diagnostic complet")
    logs.push("=" .repeat(60))
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseClient = createClient(supabaseUrl, supabaseKey)
    
    // 1. Count initial
    logs.push("1️⃣ Vérification count initial...")
    const { count: initialCount, error: countError } = await supabaseClient
      .from('oic_competences')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      logs.push(`❌ Erreur count: ${countError.message}`)
    } else {
      logs.push(`📊 Count initial: ${initialCount}`)
    }
    
    // 2. Test API anonyme
    logs.push("\n2️⃣ Test API MediaWiki anonyme...")
    const apiUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie%3AObjectif_de_connaissance&cmlimit=10&format=json&origin=*'
    logs.push(`🔗 URL: ${apiUrl}`)
    
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OIC-Test/1.0)',
        'Accept': 'application/json'
      }
    })
    
    logs.push(`📊 Status API: ${apiResponse.status}`)
    
    if (!apiResponse.ok) {
      logs.push(`❌ API inaccessible: ${apiResponse.status} ${apiResponse.statusText}`)
      if (apiResponse.status === 302) {
        logs.push("🔐 Redirection CAS détectée - API protégée")
      }
      
      return new Response(JSON.stringify({
        success: false,
        error: "API_PROTECTED",
        status: apiResponse.status,
        logs: logs
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const apiData = await apiResponse.json()
    const members = apiData.query?.categorymembers || []
    logs.push(`📋 Membres trouvés: ${members.length}`)
    
    if (members.length === 0) {
      logs.push("❌ Catégorie vide - authentification probablement requise")
      return new Response(JSON.stringify({
        success: false,
        error: "EMPTY_CATEGORY",
        logs: logs
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Filtrer les pages OIC
    const oicMembers = members.filter((member: any) => 
      member.title && member.title.match(/OIC-\d{3}-\d{2}-[AB]-\d{2}/)
    )
    logs.push(`🎯 Pages OIC trouvées: ${oicMembers.length}`)
    
    if (oicMembers.length === 0) {
      logs.push("❌ Aucune page OIC détectée")
      logs.push("📝 Échantillon de titres trouvés:")
      members.slice(0, 5).forEach((member: any, i: number) => {
        logs.push(`   ${i+1}. ${member.title}`)
      })
      
      return new Response(JSON.stringify({
        success: false,
        error: "NO_OIC_PAGES",
        sampleTitles: members.slice(0, 5).map((m: any) => m.title),
        logs: logs
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // 3. Récupérer le contenu de 3 premières pages
    logs.push("\n3️⃣ Récupération contenu échantillon (3 pages)...")
    const sampleIds = oicMembers.slice(0, 3).map((member: any) => member.pageid)
    logs.push(`📦 IDs testés: ${sampleIds.join(', ')}`)
    
    const contentUrl = new URL('https://livret.uness.fr/lisa/2025/api.php')
    contentUrl.searchParams.set('action', 'query')
    contentUrl.searchParams.set('prop', 'revisions')
    contentUrl.searchParams.set('rvprop', 'content|timestamp')
    contentUrl.searchParams.set('pageids', sampleIds.join('|'))
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
    
    // 4. Parser et tester insertion
    logs.push("\n4️⃣ Parsing et test d'insertion...")
    const sampleCompetences: any[] = []
    
    for (const page of pages) {
      if (page.revisions?.[0]?.content) {
        const title = page.title
        const content = page.revisions[0].content
        logs.push(`\n📋 Page: ${title}`)
        logs.push(`   ID: ${page.pageid}`)
        logs.push(`   Contenu: ${content.length} caractères`)
        logs.push(`   Extrait: ${content.substring(0, 150)}...`)
        
        // Parsing simple
        const match = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/)
        if (match) {
          const [objectif_id, item_parent, rubrique_code, rang, ordre_str] = match
          
          const competence = {
            objectif_id,
            intitule: title,
            item_parent,
            rang,
            rubrique: 'Test',
            description: `Contenu extrait: ${content.substring(0, 100)}...`,
            ordre: parseInt(ordre_str),
            url_source: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(title)}`,
            date_import: new Date().toISOString(),
            extraction_status: 'test'
          }
          
          sampleCompetences.push(competence)
          logs.push(`   ✅ Parsé: ${competence.objectif_id}`)
        } else {
          logs.push(`   ❌ Format titre non conforme`)
        }
      } else {
        logs.push(`\n📋 Page: ${page.title} - ❌ Pas de contenu`)
      }
    }
    
    // 5. Test insertion du premier échantillon
    if (sampleCompetences.length > 0) {
      logs.push("\n5️⃣ Test insertion du premier échantillon...")
      const sample = sampleCompetences[0]
      logs.push('SAMPLE ➜')
      logs.push(JSON.stringify(sample, null, 2))
      
      // Générer hash
      const hashContent = await crypto.subtle.digest('SHA-256', 
        new TextEncoder().encode(JSON.stringify(sample))
      )
      const hashArray = Array.from(new Uint8Array(hashContent))
      sample.hash_content = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      // Tentative d'insertion
      logs.push(`\n📝 Tentative insertion: ${sample.objectif_id}`)
      const { error: insertError } = await supabaseClient
        .from('oic_competences')
        .upsert(sample, { onConflict: 'objectif_id' })
      
      if (insertError) {
        logs.push(`❌ INSERT_ERR: ${insertError.message}`)
        logs.push(`📄 Code: ${insertError.code}`)
        logs.push(`📄 Détails: ${insertError.details}`)
        logs.push(`📄 Hint: ${insertError.hint}`)
      } else {
        logs.push(`✅ Insertion réussie: ${sample.objectif_id}`)
        
        // Vérification count final
        const { count: finalCount } = await supabaseClient
          .from('oic_competences')
          .select('*', { count: 'exact', head: true })
        logs.push(`📊 Count final: ${finalCount}`)
      }
    }
    
    logs.push("\n" + "=" .repeat(60))
    logs.push("🏁 TEST EXTRACTION ÉCHANTILLON TERMINÉ")
    logs.push("=" .repeat(60))
    
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        initialCount: initialCount || 0,
        membersFound: members.length,
        oicPagesFound: oicMembers.length,
        pagesWithContent: pages.filter((p: any) => p.revisions?.[0]?.content).length,
        samplesParsed: sampleCompetences.length
      },
      samples: sampleCompetences.map(s => ({
        objectif_id: s.objectif_id,
        intitule: s.intitule,
        description: s.description?.substring(0, 100) + '...'
      })),
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