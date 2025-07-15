import { CookieJar } from "./cookieJar.ts"

interface CasLoginResult {
  success: boolean
  cookies: string
  error?: string
  debugInfo?: any[]
}

export async function casLogin(email: string, password: string): Promise<CasLoginResult> {
  const jar = new CookieJar()
  const debugInfo: any[] = []
  
  try {
    console.log('[AUTH] Step 1: GET cockpit homepage')
    
    // ÉTAPE 1: Page cockpit d'accueil
    const cockpitResponse = await fetch('https://cockpit.uness.fr/', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      }
    })
    
    jar.addFromResponse(cockpitResponse)
    console.log(`[AUTH] Step 1 completed: ${cockpitResponse.status}`)
    debugInfo.push({ step: 1, status: cockpitResponse.status, cookies: jar.toObject() })

    // ÉTAPE 2: POST email pour déclencher redirection CAS
    console.log('[AUTH] Step 2: POST email')
    const emailFormData = new URLSearchParams()
    emailFormData.append('email', email)

    const emailResponse = await fetch('https://cockpit.uness.fr/login/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cookie': jar.toString(),
        'Referer': 'https://cockpit.uness.fr/',
        'Origin': 'https://cockpit.uness.fr'
      },
      body: emailFormData,
      redirect: 'manual'
    })
    
    jar.addFromResponse(emailResponse)
    const casRedirectUrl = emailResponse.headers.get('Location')
    console.log(`[AUTH] Step 2 completed: ${emailResponse.status}, redirect: ${casRedirectUrl}`)
    debugInfo.push({ step: 2, status: emailResponse.status, location: casRedirectUrl })

    if (!casRedirectUrl) {
      throw new Error('Pas de redirection CAS après POST email')
    }

    // ÉTAPE 3: GET page de login CAS
    console.log('[AUTH] Step 3: GET CAS login page')
    const casPageResponse = await fetch(casRedirectUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cookie': jar.toString(),
        'Referer': 'https://cockpit.uness.fr/'
      }
    })
    
    jar.addFromResponse(casPageResponse)
    const casHtml = await casPageResponse.text()
    
    // Parser les champs cachés CAS
    const ltMatch = casHtml.match(/name="lt" value="([^"]+)"/)
    const executionMatch = casHtml.match(/name="execution" value="([^"]+)"/)
    
    console.log(`[AUTH] Step 3 completed: ${casPageResponse.status}, lt found: ${!!ltMatch}, execution found: ${!!executionMatch}`)
    debugInfo.push({ 
      step: 3, 
      status: casPageResponse.status, 
      lt: ltMatch?.[1]?.substring(0, 20) + '...',
      execution: executionMatch?.[1]?.substring(0, 20) + '...',
      hasLoginForm: casHtml.includes('name="username"') || casHtml.includes('name="password"'),
      casUrl: casPageResponse.url,
      htmlPreview: casHtml.substring(0, 500)
    })

    if (!ltMatch || !executionMatch) {
      throw new Error(`Champs CAS manquants - lt: ${!!ltMatch}, execution: ${!!executionMatch}`)
    }

    // ÉTAPE 4: POST login/password sur la vraie URL CAS
    console.log('[AUTH] Step 4: POST credentials')
    const loginFormData = new URLSearchParams()
    loginFormData.append('username', email)
    loginFormData.append('password', password)
    loginFormData.append('lt', ltMatch[1])
    loginFormData.append('execution', executionMatch[1])
    loginFormData.append('_eventId', 'submit')

    // Utiliser l'URL de la page CAS actuelle pour le POST
    const casLoginUrl = casPageResponse.url
    
    const loginResponse = await fetch(casLoginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cookie': jar.toString(),
        'Referer': casLoginUrl,
        'Origin': new URL(casLoginUrl).origin
      },
      body: loginFormData,
      redirect: 'manual'
    })
    
    jar.addFromResponse(loginResponse)
    const ticketLocation = loginResponse.headers.get('Location')
    const hasTicket = ticketLocation?.includes('ticket=')
    
    console.log(`[AUTH] Step 4 completed: ${loginResponse.status}, ticket found: ${hasTicket}`)
    debugInfo.push({ 
      step: 4, 
      status: loginResponse.status, 
      hasTicket,
      location: ticketLocation?.substring(0, 100) + '...'
    })

    if (!ticketLocation || !hasTicket) {
      const responseText = await loginResponse.text()
      const hasError = responseText.includes('error') || responseText.includes('échec') || responseText.includes('invalid')
      debugInfo.push({ 
        loginError: hasError, 
        responsePreview: responseText.substring(0, 500) 
      })
      throw new Error(`Pas de ticket CAS reçu. Status: ${loginResponse.status}`)
    }

    // ÉTAPE 5: Validation ticket avec LiSA
    console.log('[AUTH] Step 5: Validate ticket with LiSA')
    const lisaResponse = await fetch(ticketLocation, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cookie': jar.toString()
      },
      redirect: 'manual'
    })
    
    jar.addFromResponse(lisaResponse)
    
    // Suivre d'éventuelles redirections finales
    let finalResponse = lisaResponse
    if (finalResponse.status >= 300 && finalResponse.status < 400) {
      const finalLocation = finalResponse.headers.get('Location')
      if (finalLocation) {
        finalResponse = await fetch(finalLocation, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cookie': jar.toString()
          }
        })
        jar.addFromResponse(finalResponse)
      }
    }
    
    const lisaHtml = await finalResponse.text()
    const isAuthenticated = lisaHtml.includes('LiSA') && !lisaHtml.includes('Connexion') && !lisaHtml.includes('login')
    
    console.log(`[AUTH] Step 5 completed: ${finalResponse.status}, authenticated: ${isAuthenticated}`)
    debugInfo.push({ 
      step: 5, 
      status: finalResponse.status, 
      isAuthenticated,
      hasLisaTitle: lisaHtml.includes('LiSA'),
      hasLoginForm: lisaHtml.includes('Connexion'),
      finalUrl: finalResponse.url,
      htmlPreview: lisaHtml.substring(0, 300)
    })

    if (!isAuthenticated) {
      throw new Error('Échec validation ticket avec LiSA')
    }

    console.log('[AUTH] ✅ Authentification CAS réussie')
    return {
      success: true,
      cookies: jar.toString(),
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