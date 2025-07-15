import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { CookieJar } from "../lib/cookieJar.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const debugInfo: any[] = []
  
  try {
    const email = Deno.env.get('UNES_EMAIL')
    const password = Deno.env.get('UNES_PASSWORD')
    
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Variables UNES_EMAIL et UNES_PASSWORD manquantes',
        debug: debugInfo
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      })
    }

    const jar = new CookieJar()
    
    // ÉTAPE 1: Page cockpit
    debugInfo.push({ step: 1, action: "GET cockpit" })
    const cockpitResponse = await fetch('https://cockpit.uness.fr/', {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
    
    jar.addFromResponse(cockpitResponse)
    debugInfo.push({ 
      step: 1, 
      status: cockpitResponse.status, 
      cookies: jar.toObject(),
      url: cockpitResponse.url
    })

    // ÉTAPE 2: POST email
    debugInfo.push({ step: 2, action: "POST email" })
    const emailResponse = await fetch('https://cockpit.uness.fr/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': jar.toString()
      },
      body: `email=${encodeURIComponent(email)}`,
      redirect: 'manual'
    })
    
    jar.addFromResponse(emailResponse)
    debugInfo.push({ 
      step: 2, 
      status: emailResponse.status, 
      location: emailResponse.headers.get('Location'),
      cookies: jar.toObject()
    })

    // ÉTAPE 3: Suivre redirection vers CAS
    const casLoginUrl = emailResponse.headers.get('Location')
    if (!casLoginUrl) {
      throw new Error('Pas de redirection vers CAS après POST email')
    }

    debugInfo.push({ step: 3, action: "GET CAS login page", url: casLoginUrl })
    const casPageResponse = await fetch(casLoginUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': jar.toString()
      }
    })
    
    jar.addFromResponse(casPageResponse)
    const casHtml = await casPageResponse.text()
    
    // Parser les champs cachés
    const ltMatch = casHtml.match(/name="lt" value="([^"]+)"/)
    const executionMatch = casHtml.match(/name="execution" value="([^"]+)"/)
    
    debugInfo.push({ 
      step: 3, 
      status: casPageResponse.status,
      lt: ltMatch?.[1] || 'NOT_FOUND',
      execution: executionMatch?.[1] || 'NOT_FOUND',
      hasPasswordField: casHtml.includes('name="password"'),
      cookies: jar.toObject()
    })

    if (!ltMatch || !executionMatch) {
      debugInfo.push({ error: "Champs lt ou execution non trouvés dans la page CAS" })
      return new Response(JSON.stringify({
        success: false,
        error: 'Champs CAS manquants',
        debug: debugInfo,
        casHtmlPreview: casHtml.substring(0, 500)
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // ÉTAPE 4: POST login/password
    debugInfo.push({ step: 4, action: "POST login/password" })
    const loginData = new URLSearchParams({
      username: email,
      password: password,
      lt: ltMatch[1],
      execution: executionMatch[1],
      _eventId: 'submit'
    })

    const loginResponse = await fetch(casLoginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': jar.toString()
      },
      body: loginData,
      redirect: 'manual'
    })
    
    jar.addFromResponse(loginResponse)
    const location = loginResponse.headers.get('Location')
    
    debugInfo.push({ 
      step: 4, 
      status: loginResponse.status,
      location: location,
      cookies: jar.toObject(),
      hasTicket: location?.includes('ticket=') || false
    })

    // ÉTAPE 5: Test accès LiSA
    if (location?.includes('ticket=')) {
      debugInfo.push({ step: 5, action: "GET LiSA with ticket", url: location })
      const lisaResponse = await fetch(location, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Cookie': jar.toString()
        },
        redirect: 'manual'
      })
      
      jar.addFromResponse(lisaResponse)
      const lisaHtml = await lisaResponse.text()
      
      debugInfo.push({ 
        step: 5, 
        status: lisaResponse.status,
        hasLisaTitle: lisaHtml.includes('LiSA'),
        hasConnexion: lisaHtml.includes('Connexion'),
        cookies: jar.toObject(),
        htmlPreview: lisaHtml.substring(0, 300)
      })
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Debug complet de l\'authentification UNESS',
      debug: debugInfo
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
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