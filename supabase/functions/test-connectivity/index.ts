// supabase/functions/test-connectivity/index.ts - DEBUG ULTIMATE
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 LISA ULTIMATE DEBUG - VERSION FINALE')
    console.log('=' .repeat(50))
    
    const debugResults: any = {}
    const baseUrl = 'https://livret.uness.fr/lisa/2025'

    // TEST 1: Page d'accueil simple
    console.log('\n🏠 TEST 1: Page d\'accueil LiSA')
    try {
      const homeResponse = await fetch(`${baseUrl}/`)
      console.log(`Status: ${homeResponse.status}`)
      
      if (homeResponse.ok) {
        const homeHtml = await homeResponse.text()
        const hasObjectif = homeHtml.includes('Objectif') || homeHtml.includes('objectif')
        const hasConnexion = homeHtml.includes('connexion') || homeHtml.includes('login') || homeHtml.includes('Se connecter')
        
        debugResults.homepage = {
          status: homeResponse.status,
          size: homeHtml.length,
          hasObjectif,
          hasConnexion,
          title: homeHtml.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || 'No title'
        }
        
        console.log(`✅ Accueil OK - Taille: ${homeHtml.length}, Objectif: ${hasObjectif}, Login: ${hasConnexion}`)
      }
    } catch (error) {
      debugResults.homepage = { error: error.message }
      console.log(`❌ Erreur accueil: ${error.message}`)
    }

    // TEST 2: API MediaWiki - Version très basique
    console.log('\n🔧 TEST 2: API MediaWiki basique')
    try {
      const apiBasicUrl = `${baseUrl}/api.php`
      const apiResponse = await fetch(apiBasicUrl)
      console.log(`Status: ${apiResponse.status}`)
      
      if (apiResponse.ok) {
        const apiText = await apiResponse.text()
        debugResults.api_basic = {
          status: apiResponse.status,
          isXML: apiText.includes('<?xml'),
          isJSON: apiText.includes('{'),
          hasError: apiText.includes('error'),
          content: apiText.substring(0, 200)
        }
        console.log(`✅ API basique OK - Type: ${apiText.includes('<?xml') ? 'XML' : 'Other'}`)
      }
    } catch (error) {
      debugResults.api_basic = { error: error.message }
      console.log(`❌ Erreur API basique: ${error.message}`)
    }

    // TEST 3: API avec paramètres siteinfo
    console.log('\n📡 TEST 3: API Siteinfo')
    try {
      const siteUrl = `${baseUrl}/api.php?action=query&meta=siteinfo&format=json`
      console.log(`URL: ${siteUrl}`)
      
      const siteResponse = await fetch(siteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MED-MNG-Debug/1.0)',
          'Accept': '*/*'
        }
      })
      
      console.log(`Status: ${siteResponse.status}`)
      console.log(`Headers:`, Object.fromEntries(siteResponse.headers.entries()))
      
      if (siteResponse.ok) {
        const siteText = await siteResponse.text()
        console.log(`Raw response: ${siteText.substring(0, 300)}`)
        
        try {
          const siteData = JSON.parse(siteText)
          debugResults.siteinfo = {
            status: siteResponse.status,
            hasQuery: !!siteData.query,
            sitename: siteData.query?.general?.sitename,
            version: siteData.query?.general?.generator,
            raw: siteText.substring(0, 500)
          }
          console.log(`✅ Siteinfo parsed - Site: ${siteData.query?.general?.sitename}`)
        } catch (parseError) {
          debugResults.siteinfo = {
            status: siteResponse.status,
            parseError: parseError.message,
            raw: siteText.substring(0, 500)
          }
          console.log(`❌ Parse error: ${parseError.message}`)
        }
      } else {
        const errorText = await siteResponse.text()
        debugResults.siteinfo = {
          status: siteResponse.status,
          error: errorText.substring(0, 200)
        }
        console.log(`❌ Siteinfo failed: ${siteResponse.status}`)
      }
    } catch (error) {
      debugResults.siteinfo = { error: error.message }
      console.log(`❌ Erreur siteinfo: ${error.message}`)
    }

    // TEST 4: Test direct URLs de pages connues
    console.log('\n📄 TEST 4: Pages directes')
    const testPages = [
      'Accueil',
      'Catégorie:Objectif_de_connaissance', 
      'Special:AllPages',
      'Objectif_de_connaissance_001_01_A_01'
    ]

    for (const pageName of testPages) {
      try {
        const pageUrl = `${baseUrl}/${encodeURIComponent(pageName)}`
        console.log(`Testing: ${pageUrl}`)
        
        const pageResponse = await fetch(pageUrl)
        console.log(`${pageName}: ${pageResponse.status}`)
        
        if (pageResponse.ok) {
          const pageHtml = await pageResponse.text()
          debugResults[`page_${pageName.replace(/[^a-zA-Z0-9]/g, '_')}`] = {
            status: pageResponse.status,
            size: pageHtml.length,
            hasContent: pageHtml.length > 1000,
            needsLogin: pageHtml.includes('vous devez vous connecter') || pageHtml.includes('login required')
          }
        } else {
          debugResults[`page_${pageName.replace(/[^a-zA-Z0-9]/g, '_')}`] = {
            status: pageResponse.status
          }
        }
        
        // Pause entre requêtes
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        debugResults[`page_${pageName.replace(/[^a-zA-Z0-9]/g, '_')}`] = {
          error: error.message
        }
        console.log(`❌ Erreur page ${pageName}: ${error.message}`)
      }
    }

    // TEST 5: API avec différents paramètres
    console.log('\n🔍 TEST 5: Tests API variés')
    const apiTests = [
      {
        name: 'List all namespaces',
        url: `${baseUrl}/api.php?action=query&meta=siteinfo&siprop=namespaces&format=json`
      },
      {
        name: 'Special pages',
        url: `${baseUrl}/api.php?action=query&list=querypage&qppage=Uncategorizedpages&format=json`
      },
      {
        name: 'Recent changes',
        url: `${baseUrl}/api.php?action=query&list=recentchanges&rclimit=5&format=json`
      },
      {
        name: 'All categories',
        url: `${baseUrl}/api.php?action=query&list=allcategories&aclimit=10&format=json`
      }
    ]

    for (const test of apiTests) {
      try {
        console.log(`Testing: ${test.name}`)
        const response = await fetch(test.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MED-MNG-Debug/1.0)'
          }
        })
        
        console.log(`${test.name}: ${response.status}`)
        
        if (response.ok) {
          const text = await response.text()
          try {
            const data = JSON.parse(text)
            debugResults[`api_${test.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`] = {
              status: response.status,
              hasQuery: !!data.query,
              keys: data.query ? Object.keys(data.query) : [],
              hasData: !!(data.query && Object.keys(data.query).length > 0)
            }
            console.log(`✅ ${test.name} OK - Keys: ${data.query ? Object.keys(data.query) : 'none'}`)
          } catch (parseError) {
            debugResults[`api_${test.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`] = {
              status: response.status,
              parseError: parseError.message
            }
          }
        } else {
          debugResults[`api_${test.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`] = {
            status: response.status
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        debugResults[`api_${test.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`] = {
          error: error.message
        }
        console.log(`❌ Erreur ${test.name}: ${error.message}`)
      }
    }

    // ANALYSE FINALE
    console.log('\n📊 ANALYSE FINALE')
    console.log('=' .repeat(50))

    const analysis = {
      homepage_accessible: debugResults.homepage?.status === 200,
      api_responsive: debugResults.api_basic?.status === 200,
      siteinfo_works: debugResults.siteinfo?.hasQuery === true,
      needs_authentication: false,
      possible_causes: []
    }

    // Détecter les causes probables
    if (!analysis.homepage_accessible) {
      analysis.possible_causes.push('Site LiSA inaccessible')
    } else if (!analysis.api_responsive) {
      analysis.possible_causes.push('API MediaWiki désactivée')
    } else if (!analysis.siteinfo_works) {
      analysis.possible_causes.push('API nécessite authentification')
    } else {
      analysis.possible_causes.push('Pages OIC dans espace privé ou nom incorrect')
    }

    // Détecter besoin d'authentification
    const authIndicators = [
      debugResults.homepage?.hasConnexion,
      debugResults.page_Catégorie_Objectif_de_connaissance?.needsLogin,
      debugResults.page_Objectif_de_connaissance_001_01_A_01?.needsLogin
    ]
    
    if (authIndicators.some(indicator => indicator === true)) {
      analysis.needs_authentication = true
      analysis.possible_causes.push('Authentification CAS requise')
    }

    debugResults.final_analysis = analysis

    console.log('🔍 Causes probables:', analysis.possible_causes)
    console.log('🔐 Auth requise:', analysis.needs_authentication)

    // RÉPONSE FINALE AVEC DIAGNOSTIC COMPLET
    const response = {
      success: false, // Toujours false car 0 pages trouvées
      statistics: {
        total_pages: 0,
        oic_pages_found: 0,
        api_accessible: analysis.api_responsive,
        timestamp: new Date().toISOString(),
        debug_info: debugResults,
        analysis: analysis
      },
      error: `Diagnostic: ${analysis.possible_causes.join(', ')}`,
      next_steps: analysis.needs_authentication 
        ? 'Implémenter authentification CAS'
        : 'Vérifier noms de catégories et espaces de noms'
    }

    console.log('✅ Diagnostic terminé - Envoi réponse complète')

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('💥 ERREUR FATALE DEBUG:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: `Debug failed: ${error.message}`,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})