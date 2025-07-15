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
    
    // ÉTAPE 1: Page cockpit d'accueil pour récupérer les détails du formulaire
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
    const cockpitHtml = await cockpitResponse.text()
    console.log(`[AUTH] Step 1 completed: ${cockpitResponse.status}`)
    debugInfo.push({ step: 1, status: cockpitResponse.status, cookies: jar.toObject() })

    // ÉTAPE 2: POST direct vers auth.uness.fr/cas/login avec l'email
    console.log('[AUTH] Step 2: POST username to CAS')
    const loginFormData = new URLSearchParams()
    loginFormData.append('username', email)

    const casLoginResponse = await fetch('https://auth.uness.fr/cas/login', {
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
      body: loginFormData,
      redirect: 'manual'
    })
    
    jar.addFromResponse(casLoginResponse)
    console.log(`[AUTH] Step 2 completed: ${casLoginResponse.status}`)
    debugInfo.push({ step: 2, status: casLoginResponse.status, cookies: jar.toObject() })

    // ÉTAPE 3: Suivre les redirections pour arriver à la page de mot de passe
    let currentResponse = casLoginResponse
    let currentUrl = casLoginResponse.headers.get('Location')
    let stepCount = 3
    
    while (currentUrl && stepCount < 10) {
      console.log(`[AUTH] Step ${stepCount}: Following redirect to ${currentUrl}`)
      
      currentResponse = await fetch(currentUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
          'Cookie': jar.toString()
        },
        redirect: 'manual'
      })
      
      jar.addFromResponse(currentResponse)
      console.log(`[AUTH] Step ${stepCount} completed: ${currentResponse.status}`)
      debugInfo.push({ step: stepCount, status: currentResponse.status, url: currentUrl })
      
      if (currentResponse.status >= 300 && currentResponse.status < 400) {
        currentUrl = currentResponse.headers.get('Location')
        stepCount++
      } else {
        break
      }
    }

    // ÉTAPE 4: Parser la page finale pour les champs de mot de passe
    const finalHtml = await currentResponse.text()
    console.log(`[AUTH] Step ${stepCount}: Parsing password form`)
    
    // Chercher les champs cachés du formulaire CAS
    const ltMatch = finalHtml.match(/name="lt" value="([^"]+)"/)
    const executionMatch = finalHtml.match(/name="execution" value="([^"]+)"/)
    const passwordFormMatch = finalHtml.match(/name="password"/)
    
    console.log(`[AUTH] Form fields found - lt: ${!!ltMatch}, execution: ${!!executionMatch}, password: ${!!passwordFormMatch}`)
    debugInfo.push({ 
      step: stepCount, 
      status: currentResponse.status, 
      lt: ltMatch?.[1]?.substring(0, 20) + '...',
      execution: executionMatch?.[1]?.substring(0, 20) + '...',
      hasPasswordForm: !!passwordFormMatch,
      finalUrl: currentResponse.url,
      htmlPreview: finalHtml.substring(0, 500)
    })

    if (!ltMatch || !executionMatch || !passwordFormMatch) {
      throw new Error(`Champs de formulaire manquants - lt: ${!!ltMatch}, execution: ${!!executionMatch}, password: ${!!passwordFormMatch}`)
    }

    // ÉTAPE 5: POST mot de passe
    console.log('[AUTH] Step 5: POST password')
    const passwordFormData = new URLSearchParams()
    passwordFormData.append('username', email)
    passwordFormData.append('password', password)
    passwordFormData.append('lt', ltMatch[1])
    passwordFormData.append('execution', executionMatch[1])
    passwordFormData.append('_eventId', 'submit')

    const passwordResponse = await fetch(currentResponse.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cookie': jar.toString(),
        'Referer': currentResponse.url,
        'Origin': new URL(currentResponse.url).origin
      },
      body: passwordFormData,
      redirect: 'manual'
    })
    
    jar.addFromResponse(passwordResponse)
    const ticketLocation = passwordResponse.headers.get('Location')
    const hasTicket = ticketLocation?.includes('ticket=')
    
    console.log(`[AUTH] Step 5 completed: ${passwordResponse.status}, ticket found: ${hasTicket}`)
    debugInfo.push({ 
      step: 5, 
      status: passwordResponse.status, 
      hasTicket,
      location: ticketLocation?.substring(0, 100) + '...'
    })

    if (!ticketLocation || !hasTicket) {
      const responseText = await passwordResponse.text()
      const hasError = responseText.includes('error') || responseText.includes('échec') || responseText.includes('invalid')
      debugInfo.push({ 
        loginError: hasError, 
        responsePreview: responseText.substring(0, 500) 
      })
      throw new Error(`Pas de ticket CAS reçu. Status: ${passwordResponse.status}`)
    }

    // ÉTAPE 6: Validation ticket avec LiSA
    console.log('[AUTH] Step 6: Validate ticket with LiSA')
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
    
    console.log(`[AUTH] Step 6 completed: ${finalResponse.status}, authenticated: ${isAuthenticated}`)
    debugInfo.push({ 
      step: 6, 
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