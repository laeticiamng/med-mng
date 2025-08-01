import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { casLogin } from '../lib/casLogin.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function testNativeCASAuth(username: string, password: string): Promise<{
  success: boolean
  cookies?: string
  error?: string
  debug_html?: string
  debug_info?: any
}> {
  try {
    const service = "https://livret.uness.fr/login/cas"
    const loginURL = `https://auth.uness.fr/cas/login?service=${encodeURIComponent(service)}`
    
    console.log(`🔍 Test CAS URL: ${loginURL}`)
    
    const response = await fetch(loginURL, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      redirect: 'follow'
    })
    
    console.log(`📡 Response status: ${response.status}`)
    console.log(`📡 Response URL: ${response.url}`)
    
    const html = await response.text()
    console.log(`📄 HTML length: ${html.length}`)
    console.log(`📄 HTML preview: ${html.substring(0, 500)}...`)
    
    // Recherche des champs CAS avec plusieurs patterns
    const ltPatterns = [
      /name=["']lt["'].*?value=["']([^"']+)["']/i,
      /name="lt"\s*value="([^"]+)"/i,
      /<input[^>]*name="lt"[^>]*value="([^"]+)"/i,
      /<input[^>]*value="([^"]+)"[^>]*name="lt"/i
    ]
    
    const executionPatterns = [
      /name=["']execution["'].*?value=["']([^"']+)["']/i,
      /name="execution"\s*value="([^"]+)"/i,
      /<input[^>]*name="execution"[^>]*value="([^"]+)"/i,
      /<input[^>]*value="([^"]+)"[^>]*name="execution"/i
    ]
    
    let lt = null
    let execution = null
    
    // Tester tous les patterns pour lt
    for (const pattern of ltPatterns) {
      const match = html.match(pattern)
      if (match) {
        lt = match[1]
        console.log(`✅ lt trouvé avec pattern: ${pattern}`)
        break
      }
    }
    
    // Tester tous les patterns pour execution
    for (const pattern of executionPatterns) {
      const match = html.match(pattern)
      if (match) {
        execution = match[1]
        console.log(`✅ execution trouvé avec pattern: ${pattern}`)
        break
      }
    }
    
    console.log(`🔑 lt: ${lt ? 'TROUVÉ' : 'ABSENT'} - ${lt?.substring(0, 20)}...`)
    console.log(`🔑 execution: ${execution ? 'TROUVÉ' : 'ABSENT'} - ${execution?.substring(0, 20)}...`)
    
    // Analyser la structure de la page
    const hasForm = html.includes('<form')
    const hasInputs = html.includes('<input')
    const hasLoginField = html.includes('username') || html.includes('email') || html.includes('login')
    const hasPasswordField = html.includes('password')
    const hasErrorMessage = html.includes('error') || html.includes('erreur') || html.includes('échec')
    const isRedirectPage = html.includes('window.location') || html.includes('meta http-equiv="refresh"')
    
    const debugInfo = {
      url_final: response.url,
      status: response.status,
      html_length: html.length,
      has_form: hasForm,
      has_inputs: hasInputs,
      has_login_field: hasLoginField,
      has_password_field: hasPasswordField,
      has_error_message: hasErrorMessage,
      is_redirect_page: isRedirectPage,
      lt_found: !!lt,
      execution_found: !!execution,
      response_headers: Object.fromEntries(response.headers.entries())
    }
    
    if (!lt || !execution) {
      return {
        success: false,
        error: `Champs CAS manquants - lt: ${!!lt}, execution: ${!!execution}`,
        debug_html: html.substring(0, 2000), // Premiers 2000 chars pour analyse
        debug_info: debugInfo
      }
    }
    
    // Si on a les champs, tenter l'authentification
    console.log(`🔐 Tentative authentification avec lt et execution trouvés`)
    
    const body = new URLSearchParams({
      username: username,
      password: password,
      lt: lt,
      execution: execution,
      _eventId: "submit",
      submit: "Se connecter"
    })
    
    const authResponse = await fetch(loginURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: body.toString(),
      redirect: 'manual'
    })
    
    const cookies = authResponse.headers.get('set-cookie') || ''
    const location = authResponse.headers.get('location')
    
    console.log(`🔐 Auth response: ${authResponse.status}`)
    console.log(`🍪 Cookies: ${cookies.substring(0, 100)}...`)
    console.log(`📍 Location: ${location}`)
    
    return {
      success: true,
      cookies: cookies,
      debug_info: {
        ...debugInfo,
        auth_status: authResponse.status,
        auth_location: location,
        cookies_length: cookies.length
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur test CAS:', error)
    return {
      success: false,
      error: error.message,
      debug_info: { error_type: error.name, error_message: error.message }
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer les credentials CAS
    const casUsername = Deno.env.get('CAS_USERNAME')
    const casPassword = Deno.env.get('CAS_PASSWORD')
    
    if (!casUsername || !casPassword) {
      throw new Error('CAS_USERNAME et CAS_PASSWORD doivent être configurés dans les secrets Supabase')
    }
    
    console.log(`🔐 Test authentification CAS pour: ${casUsername}`)
    
    // Test de la fonction native améliorée
    const authResult = await testNativeCASAuth(casUsername, casPassword)
    
    console.log(`🔍 Résultat test: success=${authResult.success}`)
    if (authResult.debug_info) {
      console.log(`📊 Debug info:`, JSON.stringify(authResult.debug_info, null, 2))
    }
    
    return new Response(
      JSON.stringify(authResult, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('💥 Erreur test CAS:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})