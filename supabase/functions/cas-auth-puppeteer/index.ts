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

// Authentification CAS complète avec Puppeteer
async function performCASAuthentication(username: string, password: string, testOnly: boolean): Promise<Response> {
  console.log('🎭 Lancement Puppeteer pour auth CAS...')
  
  try {
    // NOTE: Dans Supabase Edge Functions, Puppeteer nécessite une configuration spéciale
    // Pour l'instant, on simule le processus avec fetch
    console.log('⚠️  Puppeteer en Edge Function nécessite une configuration spéciale')
    console.log('🔄 Utilisation d\'une approche fetch pour l\'auth CAS...')

    // Étape 1: Accéder à la page protégée pour déclencher la redirection CAS
    const initialResponse = await fetch('https://livret.uness.fr/lisa/2025/Catégorie:Objectif_de_connaissance', {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CAS-Auth/1.0)'
      }
    })

    console.log(`📊 Réponse initiale: ${initialResponse.status}`)
    
    if (initialResponse.status >= 300 && initialResponse.status < 400) {
      const location = initialResponse.headers.get('location')
      console.log(`🔗 Redirection vers: ${location}`)
      
      if (location?.includes('cas.u-picardie.fr') || location?.includes('auth.uness.fr')) {
        console.log('✅ Redirection CAS détectée')
        
        // Pour l'instant, retourner les instructions pour l'utilisateur
        return new Response(JSON.stringify({
          success: false,
          error: 'Puppeteer non disponible en Edge Function',
          cas_url: location,
          instructions: {
            message: 'Authentification CAS requise - Utiliser le script local',
            next_steps: [
              '1. Utiliser le script local avec Puppeteer',
              '2. Ou obtenir manuellement les cookies depuis le navigateur',
              '3. Puis appeler validate_cookies avec les cookies obtenus'
            ]
          },
          manual_method: {
            url: 'https://livret.uness.fr/lisa/2025/',
            username_field: '#username',
            password_field: '#password',
            submit_button: 'input[type="submit"]'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        
      } else {
        throw new Error(`Redirection inattendue: ${location}`)
      }
    }

    // Si pas de redirection, peut-être déjà accessible
    console.log('🔍 Pas de redirection CAS - Test d\'accès direct...')
    
    const apiTest = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=10&format=json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CAS-Auth/1.0)',
        'Accept': 'application/json'
      }
    })

    const apiData = await apiTest.json()
    const oicPages = apiData.query?.categorymembers?.length || 0

    if (oicPages > 0) {
      console.log(`✅ Accès direct possible - ${oicPages} pages trouvées`)
      
      return new Response(JSON.stringify({
        success: true,
        cookies: 'not_required',
        pages_found: oicPages,
        message: 'Accès direct possible sans authentification CAS'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Accès refusé et authentification CAS requise')

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