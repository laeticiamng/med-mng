// 🚀 Edge Function - Authentification CAS avec Puppeteer
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CASAuthResult {
  success: boolean
  cookies?: string
  sessionId?: string
  error?: string
  debug?: any
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔐 AUTHENTIFICATION CAS AVEC PUPPETEER')
    console.log('=' .repeat(50))

    const body = await req.json().catch(() => ({}))
    const { action = 'authenticate', testOnly = false } = body

    // Récupérer les credentials depuis les secrets Supabase
    const casUsername = Deno.env.get('CAS_USERNAME') || Deno.env.get('CAS_USER')
    const casPassword = Deno.env.get('CAS_PASSWORD') || Deno.env.get('CAS_PASS')

    if (!casUsername || !casPassword) {
      console.error('❌ Credentials CAS manquants')
      return new Response(JSON.stringify({
        success: false,
        error: 'Credentials CAS non configurés dans les secrets Supabase',
        required_secrets: ['CAS_USERNAME', 'CAS_PASSWORD']
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    console.log(`🔑 Utilisateur CAS: ${casUsername}`)

    switch (action) {
      case 'authenticate':
        return await performCASAuthentication(casUsername, casPassword, testOnly)
      
      case 'validate_cookies':
        return await validateCASCookies(body.cookies)
      
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Action non reconnue',
          available_actions: ['authenticate', 'validate_cookies']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
    }

  } catch (error) {
    console.error('❌ ERREUR EDGE FUNCTION:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

// Authentification CAS complète avec simulation fetch (en attendant Puppeteer)
async function performCASAuthentication(username: string, password: string, testOnly: boolean): Promise<Response> {
  console.log('🎭 Simulation authentification CAS...')
  console.log(`🔑 Utilisateur: ${username}`)
  
  try {
    // NOTE: Dans un environnement réel, ici on utiliserait Puppeteer
    // Pour l'instant, on simule et on retourne des cookies factices pour test
    console.log('⚠️  SIMULATION - En production, utiliser Puppeteer local')
    
    // Test d'accès AVEC cookies simulés pour voir la différence
    const mockCookies = 'PHPSESSID=simulation_test_cookie_cas; path=/; domain=.uness.fr'
    console.log('🍪 Test avec cookies simulés...')
    
    const apiTestWithCookies = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=10&format=json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CAS-Auth/1.0)',
        'Cookie': mockCookies,
        'Accept': 'application/json'
      }
    })

    console.log(`📊 Test avec cookies: ${apiTestWithCookies.status}`)
    const apiDataWithCookies = await apiTestWithCookies.json()
    const oicPagesWithCookies = apiDataWithCookies.query?.categorymembers?.length || 0
    
    console.log(`📋 Pages avec cookies simulés: ${oicPagesWithCookies}`)

    // Test d'accès SANS cookies pour comparaison
    const apiTestWithoutCookies = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=10&format=json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CAS-Auth/1.0)',
        'Accept': 'application/json'
      }
    })

    const apiDataWithoutCookies = await apiTestWithoutCookies.json()
    const oicPagesWithoutCookies = apiDataWithoutCookies.query?.categorymembers?.length || 0
    
    console.log(`📋 Pages SANS cookies: ${oicPagesWithoutCookies}`)

    // Si différence significative, c'est que l'auth est requise
    if (oicPagesWithCookies > oicPagesWithoutCookies) {
      console.log('✅ Différence détectée - Authentification CAS améliore l\'accès')
      
      return new Response(JSON.stringify({
        success: false,
        needsPuppeteer: true,
        error: 'Puppeteer requis pour obtenir de vrais cookies CAS',
        comparison: {
          with_cookies: oicPagesWithCookies,
          without_cookies: oicPagesWithoutCookies,
          improvement: oicPagesWithCookies - oicPagesWithoutCookies
        },
        instructions: {
          message: 'Authentification CAS réelle requise',
          next_steps: [
            '1. Utiliser le script Puppeteer local avec vos credentials',
            '2. Récupérer les vrais cookies CAS depuis le navigateur',
            '3. Utiliser validate_cookies pour tester les vrais cookies',
            '4. Une fois validés, lancer l\'extraction complète'
          ]
        },
        puppeteer_example: {
          command: 'node generate-cas-cookie.js',
          expected_output: 'Cookie CAS récupéré et sauvegardé'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Si pas de différence, peut-être accès public
    if (oicPagesWithoutCookies > 0) {
      console.log(`✅ Accès public possible - ${oicPagesWithoutCookies} pages trouvées`)
      
      return new Response(JSON.stringify({
        success: true,
        cookies: 'not_required',
        pages_found: oicPagesWithoutCookies,
        message: 'Accès direct possible sans authentification CAS'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Aucun accès possible
    throw new Error('Accès refusé - Authentification CAS réelle requise')

  } catch (error) {
    console.error('❌ Erreur auth CAS:', error.message)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      recommendation: 'Utiliser le script Puppeteer local pour l\'authentification CAS'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
}

// Validation des cookies CAS
async function validateCASCookies(cookies?: string): Promise<Response> {
  console.log('🔐 Validation des cookies CAS...')
  
  if (!cookies) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Cookies requis pour validation'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }

  try {
    // Test avec les cookies fournis
    const response = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=50&format=json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CAS-Validator/1.0)',
        'Cookie': cookies,
        'Accept': 'application/json'
      }
    })

    console.log(`📊 Test avec cookies: ${response.status}`)
    
    const data = await response.json()
    const oicPages = data.query?.categorymembers || []
    
    console.log(`📋 Pages OIC trouvées: ${oicPages.length}`)

    if (oicPages.length > 0) {
      // Cookies valides !
      const examples = oicPages.slice(0, 5).map((page: any) => ({
        title: page.title,
        pageid: page.pageid
      }))

      return new Response(JSON.stringify({
        success: true,
        valid: true,
        pages_accessible: oicPages.length,
        total_estimated: oicPages.length < 50 ? oicPages.length : '4000+',
        examples,
        cookies_work: true,
        message: 'Cookies CAS valides - Extraction possible'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
      
    } else {
      return new Response(JSON.stringify({
        success: false,
        valid: false,
        error: 'Cookies invalides ou expirés',
        api_response: data,
        recommendation: 'Refaire l\'authentification CAS pour obtenir de nouveaux cookies'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      recommendation: 'Vérifier le format des cookies'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
}

/*
UTILISATION:

1. Authentification CAS:
POST /functions/v1/cas-auth-puppeteer
{ "action": "authenticate", "testOnly": true }

2. Validation de cookies:
POST /functions/v1/cas-auth-puppeteer
{ 
  "action": "validate_cookies",
  "cookies": "PHPSESSID=abc123; autre_cookie=def456"
}

Cette fonction aide à gérer l'authentification CAS étape par étape.
*/