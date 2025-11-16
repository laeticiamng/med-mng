interface CasLoginResult {
  success: boolean
  cookies: string
  error?: string
  debugInfo?: any[]
}

export async function casLogin(email: string, password: string): Promise<CasLoginResult> {
  const jar: Record<string, string> = {}
  const debugInfo: any[] = []
  
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
    const service = "https://livret.uness.fr/login/cas"
    const loginURL = `https://auth.uness.fr/cas/login?service=${encodeURIComponent(service)}`
    
    // ÉTAPE 1: GET initial CAS page pour récupérer lt et execution
    console.log('[AUTH] step1: GET CAS login page')
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
    
    console.log(`[AUTH] step1 ${response.status} lt=${lt.substring(0, 10)}* exec=${execution}`)
    debugInfo.push({ 
      step: 1, 
      status: response.status, 
      lt: lt.substring(0, 20) + '...', 
      execution: execution.substring(0, 20) + '...',
      cookies: Object.keys(jar)
    })
    
    if (!lt || !execution) {
      throw new Error(`Champs CAS manquants - lt: ${!!lt}, execution: ${!!execution}`)
    }
    
    // ÉTAPE 2: POST credentials
    console.log('[AUTH] step2: POST credentials')
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
    
    console.log(`[AUTH] step2 ${response.status} ticket found: ${hasTicket}`)
    debugInfo.push({ 
      step: 2, 
      status: response.status, 
      hasTicket,
      location: ticketLocation?.substring(0, 100) + '...'
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
    console.log('[AUTH] step3: Validate ticket')
    response = await fetch(ticketLocation, { 
      redirect: "manual", 
      headers: { 
        "Cookie": cookieHeader(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    addCookie(response.headers.get("set-cookie"))
    const homeURL = response.headers.get("location")
    
    console.log(`[AUTH] step3 ${response.status} redirect to: ${homeURL?.substring(0, 50)}...`)
    debugInfo.push({ 
      step: 3, 
      status: response.status, 
      homeURL: homeURL?.substring(0, 100) + '...'
    })
    
    if (!homeURL) {
      throw new Error(`Pas de redirection après validation ticket. Status: ${response.status}`)
    }
    
    // ÉTAPE 4: Vérification finale LiSA
    console.log('[AUTH] step4: Check LiSA access')
    response = await fetch(homeURL, { 
      headers: { 
        "Cookie": cookieHeader(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    addCookie(response.headers.get("set-cookie"))
    const finalHtml = await response.text()
    const isAuthenticated = finalHtml.includes("<title>LiSA")
    
    console.log(`[AUTH] step4 ${response.status} LiSA OK: ${isAuthenticated}`)
    debugInfo.push({ 
      step: 4, 
      status: response.status, 
      isAuthenticated,
      hasLisaTitle: finalHtml.includes("<title>LiSA"),
      finalUrl: response.url,
      htmlPreview: finalHtml.substring(0, 300)
    })
    
    if (!isAuthenticated) {
      throw new Error('LiSA non accessible - authentification échouée')
    }

    console.log('[AUTH] ✅ Authentification CAS réussie')
    return {
      success: true,
      cookies: cookieHeader(),
      debugInfo
    }

  } catch (error) {
    console.error('[AUTH] ❌ Erreur:', error.message)
    return {
      success: false,
      cookies: '',
      error: error.message,
      debugInfo
    }
  }
}