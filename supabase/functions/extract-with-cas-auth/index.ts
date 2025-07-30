// supabase/functions/extract-with-cas-auth/index.ts
// Solution basée sur le README : Authentification CAS + Extraction

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
}

interface CASAuthResult {
  success: boolean
  cookies?: string
  error?: string
  session_info?: any
}

interface OICExtractionResult {
  success: boolean
  total_found: number
  extracted: number
  method_used: string
  sample_data?: any[]
  error?: string
  auth_required?: boolean
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 EXTRACTION OIC AVEC AUTHENTIFICATION CAS')
    console.log('=' .repeat(50))
    
    const body = await req.json().catch(() => ({}))
    const { 
      cas_user = Deno.env.get('CAS_USER'),
      cas_pass = Deno.env.get('CAS_PASS'),
      skip_auth = false,
      test_only = true
    } = body

    const baseUrl = 'https://livret.uness.fr/lisa/2025'

    // ÉTAPE 1: Test sans authentification d'abord
    console.log('🔍 ÉTAPE 1: Test sans authentification...')
    
    const unauthedResult = await testOICAccess(baseUrl, '')
    console.log(`📊 Sans auth: ${unauthedResult.total_found} pages trouvées`)

    if (unauthedResult.total_found > 0) {
      console.log('✅ Pas besoin d\'auth - pages accessibles publiquement!')
      return new Response(JSON.stringify(unauthedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // ÉTAPE 2: Authentification CAS nécessaire
    console.log('🔐 ÉTAPE 2: Authentification CAS requise...')
    
    if (skip_auth) {
      return new Response(JSON.stringify({
        success: false,
        auth_required: true,
        error: 'Authentification CAS requise mais skip_auth=true',
        cas_login_url: 'https://cas.u-picardie.fr/cas/login?service=' + encodeURIComponent(`${baseUrl}/index.php`)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    if (!cas_user || !cas_pass) {
      return new Response(JSON.stringify({
        success: false,
        auth_required: true,
        error: 'Credentials CAS manquants',
        required_env: ['CAS_USER', 'CAS_PASS'],
        cas_login_url: 'https://cas.u-picardie.fr/cas/login?service=' + encodeURIComponent(`${baseUrl}/index.php`)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    // ÉTAPE 3: Simulation d'authentification CAS
    console.log('🔑 ÉTAPE 3: Simulation authentification CAS...')
    console.log(`   User: ${cas_user}`)
    console.log(`   Pass: ${cas_pass ? '***' : 'MANQUANT'}`)

    // Note: En réalité, il faudrait Puppeteer pour faire le login CAS complet
    // Ici on simule le processus pour montrer la structure
    
    const casAuthResult = await simulateCASLogin(cas_user, cas_pass, baseUrl)
    
    if (!casAuthResult.success) {
      return new Response(JSON.stringify({
        success: false,
        auth_required: true,
        error: casAuthResult.error,
        simulation_note: 'Auth CAS nécessite Puppeteer pour implémentation complète'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    console.log('✅ Authentification CAS simulée réussie')

    // ÉTAPE 4: Test avec authentification
    console.log('🔍 ÉTAPE 4: Test avec authentification...')
    
    const authedResult = await testOICAccess(baseUrl, casAuthResult.cookies || '')
    console.log(`📊 Avec auth: ${authedResult.total_found} pages trouvées`)

    // ÉTAPE 5: Extraction réelle si test_only=false
    if (!test_only && authedResult.total_found > 0) {
      console.log('📥 ÉTAPE 5: Extraction réelle des données...')
      
      const extractionResult = await performFullExtraction(baseUrl, casAuthResult.cookies || '')
      
      return new Response(JSON.stringify({
        ...extractionResult,
        auth_used: true,
        cas_session: casAuthResult.session_info
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Retour du test avec auth
    return new Response(JSON.stringify({
      ...authedResult,
      auth_used: true,
      test_only: test_only,
      next_step: test_only ? 'Relancer avec test_only=false pour extraction complète' : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('💥 ERREUR FATALE:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: `Erreur extraction: ${error.message}`,
      stack: error.stack?.substring(0, 500)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

// Test d'accès aux pages OIC avec ou sans auth
async function testOICAccess(baseUrl: string, cookies: string): Promise<OICExtractionResult> {
  const methods = [
    {
      name: 'Category Members',
      url: `${baseUrl}/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=50&format=json`
    },
    {
      name: 'AllPages Prefix',
      url: `${baseUrl}/api.php?action=query&list=allpages&apprefix=Objectif_de_connaissance&aplimit=50&format=json`
    },
    {
      name: 'Search OIC',
      url: `${baseUrl}/api.php?action=query&list=search&srsearch="OIC" OR "Objectif de connaissance"&srlimit=50&format=json`
    },
    {
      name: 'Recent Changes Filter',
      url: `${baseUrl}/api.php?action=query&list=recentchanges&rcnamespace=0&rclimit=50&format=json`
    }
  ]

  let bestResult = {
    success: false,
    total_found: 0,
    extracted: 0,
    method_used: 'none',
    error: 'Aucune méthode n\'a fonctionné'
  }

  for (const method of methods) {
    try {
      console.log(`🧪 Test méthode: ${method.name}`)
      
      const response = await fetch(method.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MED-MNG-CAS/1.0)',
          'Cookie': cookies,
          'Accept': 'application/json',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
        }
      })

      if (response.ok) {
        const data = await response.json()
        let pages = []
        let oicPages = []

        // Extraction selon le type
        if (data.query?.categorymembers) {
          pages = data.query.categorymembers
          oicPages = pages.filter((p: any) => 
            p.title && (
              p.title.includes('Objectif') || 
              p.title.includes('OIC') ||
              p.title.match(/\d{3}_\d{2}_[AB]_\d{2}/)
            )
          )
        } else if (data.query?.allpages) {
          pages = data.query.allpages
          oicPages = pages.filter((p: any) => p.title && p.title.includes('Objectif'))
        } else if (data.query?.search) {
          pages = data.query.search
          oicPages = pages.filter((p: any) => p.title && (p.title.includes('Objectif') || p.title.includes('OIC')))
        } else if (data.query?.recentchanges) {
          pages = data.query.recentchanges
          oicPages = pages.filter((p: any) => p.title && p.title.includes('Objectif'))
        }

        console.log(`   📊 ${method.name}: ${pages.length} total, ${oicPages.length} OIC`)

        if (oicPages.length > bestResult.total_found) {
          bestResult = {
            success: oicPages.length > 0,
            total_found: oicPages.length,
            extracted: 0,
            method_used: method.name,
            sample_data: oicPages.slice(0, 3).map((p: any) => ({
              title: p.title,
              pageid: p.pageid || p.id
            }))
          }
        }

        // Log exemples
        if (oicPages.length > 0) {
          console.log(`   📋 Exemples trouvés:`)
          oicPages.slice(0, 3).forEach((page: any, i: number) => {
            console.log(`      ${i + 1}. ${page.title}`)
          })
        }

      } else {
        console.log(`   ❌ ${method.name}: HTTP ${response.status}`)
        
        if (response.status === 403 || response.status === 401) {
          console.log(`   🔐 ${method.name}: Authentification requise`)
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`   ❌ Erreur ${method.name}:`, error.message)
    }
  }

  return bestResult
}

// Simulation d'authentification CAS
async function simulateCASLogin(casUser: string, casPass: string, baseUrl: string): Promise<CASAuthResult> {
  try {
    console.log('🔑 Simulation du processus CAS...')
    
    // ÉTAPE 1: Récupérer la page de login CAS
    const serviceUrl = encodeURIComponent(`${baseUrl}/index.php`)
    const casLoginUrl = `https://cas.u-picardie.fr/cas/login?service=${serviceUrl}`
    
    console.log(`   → URL CAS: ${casLoginUrl}`)
    
    // En réalité, il faudrait :
    // 1. Fetch de la page de login CAS
    // 2. Extraction du token CSRF/LT
    // 3. POST avec credentials
    // 4. Suivi des redirections
    // 5. Récupération des cookies de session
    
    // Pour la démonstration, on simule une réponse positive
    console.log('   ⚠️ SIMULATION - En production, utiliser Puppeteer')
    
    const mockCookies = 'PHPSESSID=simulated_session_id; cas_session=authenticated'
    
    return {
      success: true,
      cookies: mockCookies,
      session_info: {
        user: casUser,
        authenticated_at: new Date().toISOString(),
        session_type: 'simulated',
        note: 'Production nécessite Puppeteer pour vraie auth CAS'
      }
    }

  } catch (error) {
    return {
      success: false,
      error: `Erreur simulation CAS: ${error.message}`
    }
  }
}

// Extraction complète des données
async function performFullExtraction(baseUrl: string, cookies: string): Promise<OICExtractionResult> {
  console.log('📥 Extraction complète des pages OIC...')
  
  try {
    // Récupération de toutes les pages via la meilleure méthode
    const allPagesUrl = `${baseUrl}/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=500&format=json`
    
    const response = await fetch(allPagesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MED-MNG-CAS/1.0)',
        'Cookie': cookies,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const pages = data.query?.categorymembers || []
    
    console.log(`📊 ${pages.length} pages trouvées pour extraction`)

    // Pour le test, on limite à 10 pages
    const pagesToExtract = pages.slice(0, 10)
    const extractedData = []

    // Extraction du contenu
    for (const page of pagesToExtract) {
      try {
        const contentUrl = `${baseUrl}/api.php?action=query&prop=revisions&rvprop=content&titles=${encodeURIComponent(page.title)}&format=json`
        
        const contentResponse = await fetch(contentUrl, {
          headers: {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0 (compatible; MED-MNG-CAS/1.0)'
          }
        })

        if (contentResponse.ok) {
          const contentData = await contentResponse.json()
          const pageData = Object.values(contentData.query?.pages || {})[0] as any
          
          if (pageData?.revisions?.[0]?.content) {
            extractedData.push({
              title: page.title,
              content: pageData.revisions[0].content.substring(0, 200),
              url: `${baseUrl}/${page.title}`
            })
          }
        }

        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        console.error(`❌ Erreur extraction ${page.title}:`, error.message)
      }
    }

    return {
      success: true,
      total_found: pages.length,
      extracted: extractedData.length,
      method_used: 'category_members_authenticated',
      sample_data: extractedData.slice(0, 3)
    }

  } catch (error) {
    return {
      success: false,
      total_found: 0,
      extracted: 0,
      method_used: 'extraction_failed',
      error: error.message
    }
  }
}