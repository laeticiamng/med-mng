import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const debugInfo: any[] = []
  const jar: Record<string, string> = {}
  
  function addCookie(setCookie: string | null) {
    if (!setCookie) return
    setCookie.split(",").forEach(c => {
      const [kv] = c.split(";")
      const [k, v] = kv.split("=")
      if (k && v) {
        jar[k.trim()] = v.trim()
      }
    })
  }
  
  function cookieHeader() {
    return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ")
  }
  
  try {
    const email = Deno.env.get('UNES_EMAIL')
    const password = Deno.env.get('UNES_PASSWORD')
    
    console.log('[DEBUG] Variables env - email:', email ? 'SET' : 'MISSING', 'password:', password ? 'SET' : 'MISSING')
    
    if (!email || !password) {
      const error = {
        success: false,
        error: 'Variables UNES_EMAIL et UNES_PASSWORD manquantes',
        debug: debugInfo,
        env_check: {
          email_set: !!email,
          password_set: !!password,
          all_env_keys: Object.keys(Deno.env.toObject()).filter(k => k.includes('UNES'))
        }
      }
      console.log('[DEBUG] Erreur variables env:', JSON.stringify(error, null, 2))
      return new Response(JSON.stringify(error), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      })
    }

    const service = "https://livret.uness.fr/login/cas"
    const loginURL = `https://auth.uness.fr/cas/login?service=${encodeURIComponent(service)}`
    
    // ÉTAPE 1: GET CAS login page directement
    console.log('[DEBUG] step1: GET CAS login page directement')
    let response = await fetch(loginURL, { 
      redirect: "manual",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    addCookie(response.headers.get("set-cookie"))
    const html = await response.text()
    
    // Parser les champs CAS
    const ltMatch = html.match(/name="lt" value="([^"]+)"/)
    const executionMatch = html.match(/name="execution" value="([^"]+)"/)
    
    const lt = ltMatch?.[1] ?? ""
    const execution = executionMatch?.[1] ?? ""
    
    console.log(`[DEBUG] step1 ${response.status} lt=${lt.substring(0, 10)}* exec=${execution}`)
    debugInfo.push({ 
      step: 1, 
      action: "GET CAS login page directement",
      status: response.status, 
      lt: lt.substring(0, 20) + '...', 
      execution: execution.substring(0, 20) + '...',
      cookies: Object.keys(jar),
      url: loginURL
    })
    
    if (!lt || !execution) {
      throw new Error(`Champs CAS manquants - lt: ${!!lt}, execution: ${!!execution}`)
    }
    
    // ÉTAPE 2: POST credentials directement
    console.log('[DEBUG] step2: POST credentials')
    const body = new URLSearchParams({
      username: email,
      password: password,
      lt,
      execution,
      _eventId: "submit",
      submit: "Se connecter"
    })
    
    response = await fetch(loginURL, {
      method: "POST", 
      redirect: "manual",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookieHeader(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: body.toString()
    })
    
    addCookie(response.headers.get("set-cookie"))
    const ticketLocation = response.headers.get("location")
    const hasTicket = ticketLocation?.includes("ticket=ST-")
    
    console.log(`[DEBUG] step2 ${response.status} ticket found: ${hasTicket}`)
    debugInfo.push({ 
      step: 2, 
      action: "POST credentials",
      status: response.status, 
      hasTicket,
      location: ticketLocation?.substring(0, 100) + '...',
      cookies: Object.keys(jar)
    })
    
    if (!ticketLocation || !hasTicket) {
      const responseText = await response.text()
      const hasError = responseText.includes('error') || responseText.includes('échec')
      debugInfo.push({ 
        loginError: hasError, 
        responsePreview: responseText.substring(0, 500) 
      })
      throw new Error(`Pas de ticket à l'étape 2. Status: ${response.status}`)
    }
    
    // ÉTAPE 3: Validation du ticket
    console.log('[DEBUG] step3: Validate ticket')
    response = await fetch(ticketLocation, { 
      redirect: "manual", 
      headers: { 
        "Cookie": cookieHeader(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    addCookie(response.headers.get("set-cookie"))
    const homeURL = response.headers.get("location")
    
    console.log(`[DEBUG] step3 ${response.status} redirect to: ${homeURL?.substring(0, 50)}...`)
    debugInfo.push({ 
      step: 3, 
      action: "Validate ticket",
      status: response.status, 
      homeURL: homeURL?.substring(0, 100) + '...',
      cookies: Object.keys(jar)
    })
    
    if (!homeURL) {
      throw new Error(`Pas de redirection après validation ticket. Status: ${response.status}`)
    }
    
    // ÉTAPE 4: Vérification finale LiSA
    console.log('[DEBUG] step4: Check LiSA access')
    response = await fetch(homeURL, { 
      headers: { 
        "Cookie": cookieHeader(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    addCookie(response.headers.get("set-cookie"))
    const finalHtml = await response.text()
    const isAuthenticated = finalHtml.includes("<title>LiSA")
    
    console.log(`[DEBUG] step4 ${response.status} LiSA OK: ${isAuthenticated}`)
    debugInfo.push({ 
      step: 4, 
      action: "Check LiSA access",
      status: response.status, 
      isAuthenticated,
      hasLisaTitle: finalHtml.includes("<title>LiSA"),
      finalUrl: response.url,
      htmlPreview: finalHtml.substring(0, 300),
      cookies: Object.keys(jar)
    })

    return new Response(JSON.stringify({
      success: isAuthenticated,
      message: isAuthenticated ? 'Authentification CAS réussie avec approche directe!' : 'Échec authentification',
      finalCookies: cookieHeader(),
      debug: debugInfo
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error('[DEBUG] ❌ Erreur:', error.message)
    debugInfo.push({ error: error.message })
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      debug: debugInfo
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    })
  }
})