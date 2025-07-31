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

// Authentification CAS réelle via fetch - séquence complète
async function performCASAuthentication(username: string, password: string, testOnly: boolean): Promise<Response> {
  console.log('🔐 Authentification CAS RÉELLE via fetch...')
  console.log(`🔑 Utilisateur: ${username}`)
  
  try {
    // ÉTAPE 1: Aller sur la page protégée pour déclencher la redirection CAS
    console.log('🌐 Étape 1: Accès page protégée...')
    const initialResponse = await fetch('https://livret.uness.fr/lisa/2025/OIC-001', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      redirect: 'manual' // Important: intercepter les redirections
    })
    
    console.log(`📊 Statut initial: ${initialResponse.status}`)
    
    // Vérifier si redirection vers CAS
    if (initialResponse.status === 302 || initialResponse.status === 301) {
      const locationHeader = initialResponse.headers.get('location')
      console.log(`🔄 Redirection détectée vers: ${locationHeader}`)
      
      if (locationHeader && locationHeader.includes('cas') || locationHeader.includes('auth')) {
        // ÉTAPE 2: Suivre la redirection vers CAS
        console.log('🔐 Étape 2: Accès formulaire CAS...')
        const casResponse = await fetch(locationHeader, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        })
        
        const casHtml = await casResponse.text()
        console.log('📄 Formulaire CAS récupéré')
        
        // ÉTAPE 3: Extraire les paramètres du formulaire (lt, execution, etc.)
        const ltMatch = casHtml.match(/name="lt"\s+value="([^"]+)"/)
        const executionMatch = casHtml.match(/name="execution"\s+value="([^"]+)"/)
        const eventIdMatch = casHtml.match(/name="_eventId"\s+value="([^"]+)"/)
        
        if (!ltMatch || !executionMatch) {
          throw new Error('Paramètres CAS introuvables dans le formulaire')
        }
        
        const lt = ltMatch[1]
        const execution = executionMatch[1]
        const eventId = eventIdMatch ? eventIdMatch[1] : 'submit'
        
        console.log(`🔑 Paramètres CAS extraits: lt=${lt.substring(0, 10)}..., execution=${execution}`)
        
        // ÉTAPE 4: Soumettre les credentials
        console.log('📤 Étape 4: Soumission credentials...')
        const loginData = new URLSearchParams({
          username: username,
          password: password,
          lt: lt,
          execution: execution,
          _eventId: eventId,
          submit: 'LOGIN'
        })
        
        const loginResponse = await fetch(casResponse.url, {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': casResponse.url
          },
          body: loginData.toString(),
          redirect: 'manual'
        })
        
        console.log(`📊 Statut login: ${loginResponse.status}`)
        
        // ÉTAPE 5: Récupérer les cookies de session
        const setCookieHeaders = loginResponse.headers.get('set-cookie')
        console.log(`🍪 Set-Cookie reçu: ${setCookieHeaders ? 'Oui' : 'Non'}`)
        
        if (setCookieHeaders && (loginResponse.status === 302 || loginResponse.status === 301)) {
          // Parse des cookies
          const cookies = setCookieHeaders
            .split(',')
            .map(cookie => cookie.split(';')[0].trim())
            .filter(cookie => cookie.includes('='))
            .join('; ')
          
          console.log(`✅ Cookies CAS obtenus: ${cookies.substring(0, 50)}...`)
          
          // ÉTAPE 6: Tester l'accès avec les cookies
          console.log('🧪 Étape 6: Test accès OIC avec cookies...')
          const testResponse = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=50&format=json', {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)',
              'Cookie': cookies,
              'Accept': 'application/json'
            }
          })
          
          const testData = await testResponse.json()
          const oicPages = testData.query?.categorymembers || []
          
          console.log(`🎯 ${oicPages.length} pages OIC accessibles avec cookies CAS`)
          
          if (oicPages.length > 0) {
            return new Response(JSON.stringify({
              success: true,
              cookies: cookies,
              pages_found: oicPages.length,
              examples: oicPages.slice(0, 5).map(page => ({
                title: page.title,
                pageid: page.pageid
              })),
              message: 'Authentification CAS réussie - Cookies opérationnels'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }
      }
    }
    
    // Si on arrive ici, l'authentification a échoué
    throw new Error('Échec authentification CAS - Vérifier les credentials')

  } catch (error) {
    console.error('❌ Erreur auth CAS:', error.message)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      recommendation: 'Vérifier les credentials CAS dans les secrets Supabase'
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