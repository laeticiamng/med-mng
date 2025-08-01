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
    
    // ÉTAPE 1: GET initial CAS page
    console.log('[AUTH] Étape 1: GET page CAS initiale')
    let response = await fetch(loginURL, { 
      redirect: "manual",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    addCookie(response.headers.get("set-cookie"))
    const html = await response.text()
    
    console.log(`[AUTH] Status page initiale: ${response.status}`)
    debugInfo.push({ 
      step: 1, 
      status: response.status, 
      url: response.url,
      cookies: Object.keys(jar)
    })
    
    // ÉTAPE 2: POST email (première étape UNESS)
    console.log('[AUTH] Étape 2: POST email')
    const emailFormData = new FormData()
    emailFormData.append('username', email)
    
    response = await fetch(loginURL, {
      method: "POST", 
      redirect: "manual",
      headers: { 
        "Cookie": cookieHeader(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: emailFormData
    })
    
    addCookie(response.headers.get("set-cookie"))
    const emailStepLocation = response.headers.get("location")
    
    console.log(`[AUTH] Étape 2 status: ${response.status}, redirect: ${emailStepLocation?.substring(0, 50)}...`)
    debugInfo.push({ 
      step: 2, 
      status: response.status, 
      redirect: emailStepLocation?.substring(0, 100)
    })
    
    // Si pas de redirection, essayer l'approche classique
    if (!emailStepLocation && response.status === 200) {
      console.log('[AUTH] Fallback: approche CAS classique')
      
      // Parser les champs CAS classiques
      const responseText = await response.text()
      const ltMatch = responseText.match(/name="lt"\s*value="([^"]+)"/i)
      const executionMatch = responseText.match(/name="execution"\s*value="([^"]+)"/i)
      
      if (ltMatch && executionMatch) {
        const lt = ltMatch[1]
        const execution = executionMatch[1]
        
        console.log('[AUTH] Champs CAS trouvés, POST credentials classique')
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
        
        if (ticketLocation?.includes("ticket=ST-")) {
          // Validation du ticket
          response = await fetch(ticketLocation, { 
            redirect: "manual", 
            headers: { 
              "Cookie": cookieHeader(),
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
          
          addCookie(response.headers.get("set-cookie"))
          const homeURL = response.headers.get("location")
          
          if (homeURL) {
            // Vérification finale
            response = await fetch(homeURL, { 
              headers: { 
                "Cookie": cookieHeader(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            })
            
            addCookie(response.headers.get("set-cookie"))
            const finalHtml = await response.text()
            const isAuthenticated = finalHtml.includes("<title>LiSA") || finalHtml.includes("livret.uness.fr")
            
            if (isAuthenticated) {
              console.log('[AUTH] ✅ Authentification CAS classique réussie')
              return {
                success: true,
                cookies: cookieHeader(),
                debugInfo
              }
            }
          }
        }
      }
    }
    
    // ÉTAPE 3: Si redirection, suivre pour la page de mot de passe
    if (emailStepLocation) {
      console.log('[AUTH] Étape 3: GET page mot de passe')
      response = await fetch(emailStepLocation, { 
        redirect: "manual",
        headers: { 
          "Cookie": cookieHeader(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      addCookie(response.headers.get("set-cookie"))
      const passwordPageHtml = await response.text()
      
      // Parser les champs pour la page de mot de passe
      const ltMatch = passwordPageHtml.match(/name="lt"\s*value="([^"]+)"/i)
      const executionMatch = passwordPageHtml.match(/name="execution"\s*value="([^"]+)"/i)
      
      if (ltMatch && executionMatch) {
        const lt = ltMatch[1]
        const execution = executionMatch[1]
        
        console.log('[AUTH] Étape 4: POST mot de passe')
        const body = new URLSearchParams({
          username: email,
          password: password,
          lt,
          execution,
          _eventId: "submit",
          submit: "Se connecter"
        })
        
        response = await fetch(emailStepLocation, {
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
        
        if (ticketLocation?.includes("ticket=ST-")) {
          console.log('[AUTH] Étape 5: Validation ticket')
          response = await fetch(ticketLocation, { 
            redirect: "manual", 
            headers: { 
              "Cookie": cookieHeader(),
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
          
          addCookie(response.headers.get("set-cookie"))
          const homeURL = response.headers.get("location")
          
          if (homeURL) {
            // Vérification finale
            response = await fetch(homeURL, { 
              headers: { 
                "Cookie": cookieHeader(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            })
            
            addCookie(response.headers.get("set-cookie"))
            const finalHtml = await response.text()
            const isAuthenticated = finalHtml.includes("<title>LiSA") || finalHtml.includes("livret.uness.fr")
            
            if (isAuthenticated) {
              console.log('[AUTH] ✅ Authentification CAS deux étapes réussie')
              return {
                success: true,
                cookies: cookieHeader(),
                debugInfo
              }
            }
          }
        }
      }
    }

    throw new Error('Authentification échouée - impossible de récupérer les cookies valides')

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