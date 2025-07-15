import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    console.log('[TEST] 🔐 Test simple CAS step by step...')
    
    // Étape 1: GET cockpit.uness.fr
    console.log('[TEST] Step 1: GET cockpit.uness.fr')
    const cockpitResponse = await fetch('https://cockpit.uness.fr/', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    console.log(`[TEST] Step 1 result: ${cockpitResponse.status}`)
    
    // Étape 2: Vérifier le contenu
    const cockpitHtml = await cockpitResponse.text()
    const hasForm = cockpitHtml.includes('auth.uness.fr/cas/login')
    const hasUsernameField = cockpitHtml.includes('name="username"')
    
    console.log(`[TEST] Form found: ${hasForm}, username field: ${hasUsernameField}`)
    
    // Étape 3: POST simple vers auth.uness.fr/cas/login
    console.log('[TEST] Step 3: POST to CAS')
    const formData = new URLSearchParams()
    formData.append('username', email)
    
    const casResponse = await fetch('https://auth.uness.fr/cas/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://cockpit.uness.fr/'
      },
      body: formData,
      redirect: 'manual'
    })
    
    console.log(`[TEST] Step 3 result: ${casResponse.status}`)
    const location = casResponse.headers.get('Location')
    console.log(`[TEST] Redirect to: ${location}`)
    
    const result = {
      success: true,
      steps: {
        step1: {
          status: cockpitResponse.status,
          hasForm,
          hasUsernameField
        },
        step3: {
          status: casResponse.status,
          location: location,
          hasRedirect: !!location
        }
      },
      email_used: email.substring(0, 3) + '***'
    }
    
    console.log('[TEST] ✅ Test terminé')
    return new Response(JSON.stringify(result), { 
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