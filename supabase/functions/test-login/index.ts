// Test d'authentification CAS pour validation rapide
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CASTestResult {
  success: boolean
  step: string
  url?: string
  error?: string
  next_action?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🧪 TEST AUTHENTIFICATION CAS')
    console.log('=' .repeat(40))

    const body = await req.json().catch(() => ({}))
    const { action = 'test_access' } = body

    const baseUrl = 'https://livret.uness.fr/lisa/2025'

    switch (action) {
      case 'test_access':
        return await testBasicAccess(baseUrl)
      
      case 'test_cas_redirect':
        return await testCASRedirect(baseUrl)
      
      case 'validate_auth':
        return await validateAuthentication(baseUrl, body.cookies)
      
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Action non reconnue',
          available_actions: ['test_access', 'test_cas_redirect', 'validate_auth']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
    }

  } catch (error) {
    console.error('❌ ERREUR TEST CAS:', error)
    
    return new Response(JSON.stringify({
      success: false,
      step: 'error',
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

// Test d'accès de base sans authentification
async function testBasicAccess(baseUrl: string) {
  console.log('🔍 Test accès de base...')
  
  try {
    // Test page d'accueil
    const homeResponse = await fetch(`${baseUrl}/index.php`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CAS-Test/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    })

    console.log(`📊 Accueil: ${homeResponse.status}`)
    
    if (homeResponse.status === 200) {
      const content = await homeResponse.text()
      const needsAuth = content.includes('cas.u-picardie.fr') || 
                       content.includes('connexion') || 
                       content.includes('login')
      
      console.log(`🔐 Auth requise: ${needsAuth}`)
      
      // Test API sans auth
      const apiResponse = await fetch(`${baseUrl}/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=10&format=json`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CAS-Test/1.0)',
          'Accept': 'application/json'
        }
      })

      console.log(`📊 API: ${apiResponse.status}`)
      
      const apiData = await apiResponse.json().catch(() => ({}))
      const oicPages = apiData.query?.categorymembers?.length || 0
      
      console.log(`📋 Pages OIC trouvées: ${oicPages}`)

      return new Response(JSON.stringify({
        success: true,
        step: 'basic_access_complete',
        results: {
          homepage_status: homeResponse.status,
          needs_authentication: needsAuth,
          api_status: apiResponse.status,
          oic_pages_found: oicPages,
          can_proceed_without_auth: oicPages > 0
        },
        next_action: oicPages > 0 ? 'Extraction directe possible!' : 'Authentification CAS requise'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
      
    } else {
      throw new Error(`Accueil inaccessible: ${homeResponse.status}`)
    }

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      step: 'basic_access_failed',
      error: error.message,
      next_action: 'Vérifier la connectivité réseau'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
}

// Test de redirection CAS
async function testCASRedirect(baseUrl: string) {
  console.log('🔗 Test redirection CAS...')
  
  try {
    // Suivre les redirections pour voir le flow CAS
    const response = await fetch(`${baseUrl}/index.php`, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CAS-Test/1.0)',
        'Accept': 'text/html'
      }
    })

    console.log(`📊 Status: ${response.status}`)
    console.log(`📍 Location: ${response.headers.get('location') || 'Aucune'}`)

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      
      if (location?.includes('cas.u-picardie.fr')) {
        console.log('✅ Redirection CAS détectée')
        
        return new Response(JSON.stringify({
          success: true,
          step: 'cas_redirect_detected',
          cas_url: location,
          next_action: 'Utiliser Puppeteer pour authentification automatique',
          instructions: {
            manual_login: `1. Ouvrir: ${location}`,
            username_field: 'username',
            password_field: 'password',
            submit_button: 'input[type="submit"]'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        
      } else {
        return new Response(JSON.stringify({
          success: false,
          step: 'unexpected_redirect',
          redirect_url: location,
          error: 'Redirection inattendue (pas vers CAS)'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
    } else if (response.status === 200) {
      const content = await response.text()
      
      return new Response(JSON.stringify({
        success: true,
        step: 'no_redirect_needed',
        next_action: 'Accès direct possible - tester l\'API',
        content_preview: content.substring(0, 200)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
      
    } else {
      throw new Error(`Status inattendu: ${response.status}`)
    }

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      step: 'redirect_test_failed',
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
}

// Validation d'authentification avec cookies
async function validateAuthentication(baseUrl: string, cookies?: string) {
  console.log('🔐 Validation authentification...')
  
  if (!cookies) {
    return new Response(JSON.stringify({
      success: false,
      step: 'no_cookies_provided',
      error: 'Cookies de session requis',
      next_action: 'Fournir les cookies obtenus après login CAS'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }

  try {
    // Test API avec cookies
    const apiResponse = await fetch(`${baseUrl}/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=50&format=json`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CAS-Test/1.0)',
        'Cookie': cookies,
        'Accept': 'application/json'
      }
    })

    console.log(`📊 API avec auth: ${apiResponse.status}`)
    
    const apiData = await apiResponse.json().catch(() => ({}))
    const oicPages = apiData.query?.categorymembers || []
    
    console.log(`📋 Pages OIC avec auth: ${oicPages.length}`)

    if (oicPages.length > 0) {
      // Test quelques exemples
      const examples = oicPages.slice(0, 5).map((page: any) => ({
        title: page.title,
        pageid: page.pageid
      }))

      return new Response(JSON.stringify({
        success: true,
        step: 'authentication_validated',
        results: {
          authenticated: true,
          pages_accessible: oicPages.length,
          total_estimated: oicPages.length < 50 ? oicPages.length : '4000+',
          examples
        },
        next_action: 'Lancer extraction complète avec ces cookies'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
      
    } else {
      return new Response(JSON.stringify({
        success: false,
        step: 'authentication_failed',
        error: 'Cookies invalides ou expirés',
        api_response: apiData,
        next_action: 'Refaire le login CAS pour obtenir de nouveaux cookies'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      step: 'validation_error',
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
}

/*
UTILISATION:

1. Test de base:
POST /functions/v1/test-login
{ "action": "test_access" }

2. Test redirection CAS:
POST /functions/v1/test-login  
{ "action": "test_cas_redirect" }

3. Validation avec cookies:
POST /functions/v1/test-login
{ 
  "action": "validate_auth",
  "cookies": "PHPSESSID=abc123; autre_cookie=def456"
}

Cette fonction aide à diagnostiquer étape par étape le processus d'auth CAS.
*/