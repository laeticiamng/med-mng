// supabase/functions/test-connectivity/index.ts - VERSION CORRIGÉE
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
}

interface APITestResponse {
  success: boolean
  statistics: {
    total_pages: number
    oic_pages_found: number
    api_accessible: boolean
    timestamp: string
    debug_info?: any
  }
  error?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 DIAGNOSTIC COMPLET API LiSA')
    
    const body = await req.json().catch(() => ({}))
    console.log('📥 Request body:', body)

    const baseUrl = 'https://livret.uness.fr/lisa/2025'
    let debugInfo: any = {}

    // ÉTAPE 1: Test API MediaWiki de base
    console.log('🔍 ÉTAPE 1: Test API MediaWiki...')
    const siteInfoUrl = `${baseUrl}/api.php?action=query&meta=siteinfo&format=json`
    
    try {
      const siteResponse = await fetch(siteInfoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MED-MNG/1.0)',
          'Accept': 'application/json'
        }
      })
      
      console.log(`📡 Siteinfo response: ${siteResponse.status}`)
      
      if (siteResponse.ok) {
        const siteData = await siteResponse.json()
        debugInfo.siteinfo = {
          status: siteResponse.status,
          sitename: siteData.query?.general?.sitename,
          version: siteData.query?.general?.generator
        }
        console.log('✅ API MediaWiki accessible:', debugInfo.siteinfo)
      } else {
        debugInfo.siteinfo = { status: siteResponse.status, error: 'Non accessible' }
        console.log('❌ API MediaWiki non accessible')
      }
    } catch (error) {
      debugInfo.siteinfo = { error: error.message }
      console.error('❌ Erreur siteinfo:', error.message)
    }

    // ÉTAPE 2: Test recherche de pages
    console.log('🔍 ÉTAPE 2: Test recherche pages...')
    
    // Essayer plusieurs approches pour trouver les pages OIC
    const searchMethods = [
      {
        name: 'Catégorie Standard',
        url: `${baseUrl}/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=50&format=json`
      },
      {
        name: 'Catégorie Alternative 1',
        url: `${baseUrl}/api.php?action=query&list=categorymembers&cmtitle=Category:Objectif_de_connaissance&cmlimit=50&format=json`
      },
      {
        name: 'Recherche Titre',
        url: `${baseUrl}/api.php?action=query&list=search&srsearch=Objectif_de_connaissance&srlimit=50&format=json`
      },
      {
        name: 'All Pages Prefix',
        url: `${baseUrl}/api.php?action=query&list=allpages&apprefix=Objectif_de_connaissance&aplimit=50&format=json`
      }
    ]

    let totalPagesFound = 0
    let bestMethod = null

    for (const method of searchMethods) {
      try {
        console.log(`🔎 Test méthode: ${method.name}`)
        console.log(`📡 URL: ${method.url}`)
        
        const response = await fetch(method.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MED-MNG/1.0)',
            'Accept': 'application/json'
          }
        })

        console.log(`📊 ${method.name} response: ${response.status}`)

        if (response.ok) {
          const data = await response.json()
          console.log(`📄 ${method.name} data keys:`, Object.keys(data))
          
          let pages = []
          
          // Traitement selon le type de requête
          if (data.query?.categorymembers) {
            pages = data.query.categorymembers
            console.log(`📋 ${method.name} - categorymembers: ${pages.length}`)
          } else if (data.query?.search) {
            pages = data.query.search
            console.log(`🔍 ${method.name} - search results: ${pages.length}`)
          } else if (data.query?.allpages) {
            pages = data.query.allpages
            console.log(`📚 ${method.name} - allpages: ${pages.length}`)
          } else {
            console.log(`❓ ${method.name} - structure inconnue:`, data)
          }

          if (pages.length > totalPagesFound) {
            totalPagesFound = pages.length
            bestMethod = {
              name: method.name,
              count: pages.length,
              examples: pages.slice(0, 3).map((p: any) => p.title || p.name),
              data: data
            }
          }

          debugInfo[method.name.toLowerCase().replace(/\s+/g, '_')] = {
            status: response.status,
            pages_count: pages.length,
            has_query: !!data.query,
            query_keys: data.query ? Object.keys(data.query) : [],
            examples: pages.slice(0, 2).map((p: any) => p.title || p.name)
          }

        } else {
          debugInfo[method.name.toLowerCase().replace(/\s+/g, '_')] = {
            status: response.status,
            error: 'Non accessible'
          }
        }

        // Pause entre requêtes
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        console.error(`❌ Erreur ${method.name}:`, error.message)
        debugInfo[method.name.toLowerCase().replace(/\s+/g, '_')] = {
          error: error.message
        }
      }
    }

    // ÉTAPE 3: Test d'accès direct à une page
    console.log('🔍 ÉTAPE 3: Test accès page directe...')
    try {
      const directPageUrl = `${baseUrl}/api.php?action=query&prop=revisions&titles=Objectif_de_connaissance_001_01_A_01&rvprop=content&format=json`
      const directResponse = await fetch(directPageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MED-MNG/1.0)',
          'Accept': 'application/json'
        }
      })

      if (directResponse.ok) {
        const directData = await directResponse.json()
        const pages = directData.query?.pages || {}
        const pageIds = Object.keys(pages)
        
        debugInfo.direct_page_access = {
          status: directResponse.status,
          pages_found: pageIds.length,
          has_content: pageIds.some(id => pages[id].revisions?.length > 0)
        }
        
        console.log('✅ Accès page directe:', debugInfo.direct_page_access)
      }
    } catch (error) {
      debugInfo.direct_page_access = { error: error.message }
      console.error('❌ Erreur accès direct:', error.message)
    }

    // ÉTAPE 4: Résumé et diagnostic
    console.log('📊 RÉSUMÉ DIAGNOSTIC:')
    console.log(`🎯 Meilleure méthode: ${bestMethod?.name || 'Aucune'}`)
    console.log(`📈 Pages trouvées: ${totalPagesFound}`)
    
    if (bestMethod) {
      console.log(`📋 Exemples:`, bestMethod.examples)
    }

    // Construction de la réponse
    const response: APITestResponse = {
      success: totalPagesFound > 0,
      statistics: {
        total_pages: totalPagesFound,
        oic_pages_found: totalPagesFound,
        api_accessible: true,
        timestamp: new Date().toISOString(),
        debug_info: {
          ...debugInfo,
          best_method: bestMethod,
          summary: {
            api_accessible: !!debugInfo.siteinfo?.sitename,
            methods_tested: searchMethods.length,
            pages_found: totalPagesFound,
            recommended_method: bestMethod?.name
          }
        }
      },
      error: totalPagesFound === 0 ? 'Aucune page OIC trouvée malgré API accessible' : undefined
    }

    console.log('✅ Diagnostic terminé')
    console.log('📤 Réponse finale:', {
      success: response.success,
      pages_found: totalPagesFound,
      best_method: bestMethod?.name
    })

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('💥 ERREUR FATALE:', error)
    
    const errorResponse: APITestResponse = {
      success: false,
      statistics: {
        total_pages: 0,
        oic_pages_found: 0,
        api_accessible: false,
        timestamp: new Date().toISOString()
      },
      error: `Erreur fatale: ${error.message}`
    }

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})