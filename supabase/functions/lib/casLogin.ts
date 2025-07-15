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
    
    // ÉTAPE 1: Page cockpit d'accueil - le formulaire fait directement POST vers CAS
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

    // ÉTAPE 2: Reproduire exactement le formulaire de cockpit - POST simple avec username
    console.log('[AUTH] Step 2: POST username via cockpit form')
    const cockpitFormData = new URLSearchParams()
    cockpitFormData.append('username', email)

    const cockpitPostResponse = await fetch('https://auth.uness.fr/cas/login', {
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
      body: cockpitFormData,
      redirect: 'manual'
    })
    
    jar.addFromResponse(cockpitPostResponse)
    console.log(`[AUTH] Step 2 completed: ${cockpitPostResponse.status}`)
    debugInfo.push({ step: 2, status: cockpitPostResponse.status })

    // ÉTAPE 3: Analyser la réponse - c'est soit une redirection, soit directement la page de mot de passe
    let currentResponse = cockpitPostResponse
    let currentUrl = cockpitPostResponse.headers.get('Location')
    let stepCount = 3
    
    // Si on a une redirection, la suivre
    if (currentUrl) {
      console.log(`[AUTH] Step 3: Following redirect to ${currentUrl}`)
      
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
      console.log(`[AUTH] Step 3 completed: ${currentResponse.status}`)
      debugInfo.push({ step: 3, status: currentResponse.status, url: currentUrl })
      stepCount = 4
    }

    // ÉTAPE 4: Parser la page actuelle pour les champs de mot de passe
    const currentHtml = await currentResponse.text()
    console.log(`[AUTH] Step ${stepCount}: Parsing current page for password form`)
    
    // Chercher les champs du formulaire de mot de passe
    const ltMatch = currentHtml.match(/name="lt" value="([^"]+)"/)
    const executionMatch = currentHtml.match(/name="execution" value="([^"]+)"/)
    const passwordFormMatch = currentHtml.includes('name="password"')
    const usernameFormMatch = currentHtml.includes('name="username"')
    
    console.log(`[AUTH] Form analysis - lt: ${!!ltMatch}, execution: ${!!executionMatch}, password: ${passwordFormMatch}, username: ${usernameFormMatch}`)
    debugInfo.push({ 
      step: stepCount, 
      status: currentResponse.status, 
      lt: ltMatch?.[1]?.substring(0, 20) + '...',
      execution: executionMatch?.[1]?.substring(0, 20) + '...',
      hasPasswordForm: passwordFormMatch,
      hasUsernameForm: usernameFormMatch,
      currentUrl: currentResponse.url,
      htmlPreview: currentHtml.substring(0, 800)
    })

    // Si on n'a que le champ username, alors on doit d'abord POST l'email
    if (!passwordFormMatch && usernameFormMatch) {
      console.log('[AUTH] Step 5: Still on username form, posting email again with CAS fields')
      
      if (!ltMatch || !executionMatch) {
        throw new Error(`Champs CAS manquants sur la page username - lt: ${!!ltMatch}, execution: ${!!executionMatch}`)
      }

      const emailFormData = new URLSearchParams()
      emailFormData.append('username', email)
      emailFormData.append('lt', ltMatch[1])
      emailFormData.append('execution', executionMatch[1])
      emailFormData.append('_eventId', 'submit')

      const emailPostResponse = await fetch(currentResponse.url, {
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
        body: emailFormData,
        redirect: 'manual'
      })
      
      jar.addFromResponse(emailPostResponse)
      console.log(`[AUTH] Step 5 completed: ${emailPostResponse.status}`)
      debugInfo.push({ step: 5, status: emailPostResponse.status })

      // Suivre les redirections après POST email
      currentResponse = emailPostResponse
      currentUrl = emailPostResponse.headers.get('Location')
      stepCount = 6
      
      while (currentUrl && currentResponse.status >= 300 && currentResponse.status < 400 && stepCount < 10) {
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

      // Re-parser pour les champs de mot de passe
      const passwordPageHtml = await currentResponse.text()
      const passwordLtMatch = passwordPageHtml.match(/name="lt" value="([^"]+)"/)
      const passwordExecutionMatch = passwordPageHtml.match(/name="execution" value="([^"]+)"/)
      const hasPasswordField = passwordPageHtml.includes('name="password"')
      
      console.log(`[AUTH] Password page analysis - lt: ${!!passwordLtMatch}, execution: ${!!passwordExecutionMatch}, password: ${hasPasswordField}`)
      debugInfo.push({ 
        step: stepCount, 
        status: currentResponse.status, 
        lt: passwordLtMatch?.[1]?.substring(0, 20) + '...',
        execution: passwordExecutionMatch?.[1]?.substring(0, 20) + '...',
        hasPasswordForm: hasPasswordField,
        passwordPageUrl: currentResponse.url,
        htmlPreview: passwordPageHtml.substring(0, 500)
      })

      if (!passwordLtMatch || !passwordExecutionMatch || !hasPasswordField) {
        throw new Error(`Page de mot de passe invalide - lt: ${!!passwordLtMatch}, execution: ${!!passwordExecutionMatch}, password: ${hasPasswordField}`)
      }

      // Utiliser les nouveaux champs pour le POST du mot de passe
      ltMatch = passwordLtMatch
      executionMatch = passwordExecutionMatch
      currentHtml = passwordPageHtml
    }

    // ÉTAPE FINALE: POST mot de passe
    stepCount++
    console.log(`[AUTH] Step ${stepCount}: POST password`)
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
    
    console.log(`[AUTH] Step ${stepCount} completed: ${passwordResponse.status}, ticket found: ${hasTicket}`)
    debugInfo.push({ 
      step: stepCount, 
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

    // ÉTAPE FINALE: Validation ticket avec LiSA
    stepCount++
    console.log(`[AUTH] Step ${stepCount}: Validate ticket with LiSA`)
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
    
    console.log(`[AUTH] Step ${stepCount} completed: ${finalResponse.status}, authenticated: ${isAuthenticated}`)
    debugInfo.push({ 
      step: stepCount, 
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