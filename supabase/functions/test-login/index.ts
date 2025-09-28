import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { casLogin } from "../lib/casLogin.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const email = Deno.env.get('UNES_EMAIL')
    const password = Deno.env.get('UNES_PASSWORD')
    
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Variables UNES_EMAIL et UNES_PASSWORD manquantes'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      })
    }

    console.log('[TEST] 🔐 Test authentification CAS...')
    
    const authResult = await casLogin(email, password)
    
    if (!authResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: `Échec authentification: ${authResult.error}`,
        debugInfo: authResult.debugInfo
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Test accès page d'accueil LiSA
    console.log('[TEST] 🌐 Test accès LiSA...')
    const lisaResponse = await fetch('https://livret.uness.fr/lisa/2025/Accueil', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': authResult.cookies
      }
    })
    
    const lisaHtml = await lisaResponse.text()
    const hasLisaTitle = lisaHtml.includes('LiSA')
    const hasLoginForm = lisaHtml.includes('Connexion') || lisaHtml.includes('login')
    
    console.log(`[TEST] LiSA response: ${lisaResponse.status}, title: ${hasLisaTitle}, loginForm: ${hasLoginForm}`)
    
    const testResult = {
      success: true,
      authentication: {
        success: authResult.success,
        hasCookies: authResult.cookies.length > 0
      },
      lisaAccess: {
        status: lisaResponse.status,
        hasTitle: hasLisaTitle,
        hasLoginForm: hasLoginForm,
        isAuthenticated: hasLisaTitle && !hasLoginForm
      },
      debugInfo: authResult.debugInfo
    }
    
    if (testResult.lisaAccess.isAuthenticated) {
      console.log('[TEST] ✅ Test réussi - Authentification CAS fonctionnelle')
    } else {
      console.log('[TEST] ❌ Test échoué - Problème d\'accès à LiSA')
    }
    
    return new Response(JSON.stringify(testResult), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error('[TEST] ❌ Erreur:', error.message)
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