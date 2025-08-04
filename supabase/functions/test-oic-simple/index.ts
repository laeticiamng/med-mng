import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    console.log(`🔍 Test OIC Simple - Action: ${action}`)

    if (action === 'test_simple') {
      // Test 1: API sans authentification
      console.log('📡 Test API public...')
      const publicResponse = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=2&format=json&origin=*')
      
      let publicResult = { accessible: false, data: null, error: null }
      
      if (publicResponse.ok) {
        const publicData = await publicResponse.json()
        console.log('✅ API publique répond:', publicData)
        
        if (publicData.error) {
          publicResult = { 
            accessible: false, 
            error: publicData.error.code,
            message: 'API nécessite authentification'
          }
        } else if (publicData.query && publicData.query.categorymembers) {
          publicResult = { 
            accessible: true, 
            count: publicData.query.categorymembers.length,
            data: publicData.query.categorymembers[0]
          }
        }
      } else {
        publicResult = { 
          accessible: false, 
          error: `HTTP ${publicResponse.status}`,
          message: 'API inaccessible'
        }
      }

      // Test 2: Avec simulation de cookies CAS
      console.log('🔐 Simulation authentification CAS...')
      let authResult = { attempted: false, success: false, error: null }
      
      if (!publicResult.accessible) {
        try {
          // Simuler des cookies CAS (test basique)
          const authResponse = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=2&format=json', {
            headers: {
              'Cookie': 'session_test=1; cas_auth=test',
              'User-Agent': 'Mozilla/5.0 (compatible; OIC-Extractor/1.0)'
            }
          })
          
          authResult.attempted = true
          
          if (authResponse.ok) {
            const authData = await authResponse.json()
            
            if (authData.query && authData.query.categorymembers) {
              authResult.success = true
              authResult.count = authData.query.categorymembers.length
            } else if (authData.error) {
              authResult.error = authData.error.code
            }
          } else {
            authResult.error = `HTTP ${authResponse.status}`
          }
        } catch (error) {
          authResult.error = error.message
        }
      }

      // Diagnostic final
      const diagnosis = {
        api_public: publicResult,
        auth_test: authResult,
        recommendation: '',
        next_steps: []
      }

      if (publicResult.accessible) {
        diagnosis.recommendation = 'API accessible publiquement - extraction possible'
        diagnosis.next_steps = ['Lancer extraction complète', 'Pas besoin d\'authentification']
      } else if (authResult.success) {
        diagnosis.recommendation = 'API nécessite authentification - CAS requis'
        diagnosis.next_steps = ['Implémenter authentification CAS complète', 'Utiliser Playwright/Puppeteer']
      } else {
        diagnosis.recommendation = 'API inaccessible - problème technique'
        diagnosis.next_steps = ['Vérifier connectivité réseau', 'Contacter administrateur UNESS']
      }

      console.log('📋 Diagnostic:', diagnosis)

      return new Response(
        JSON.stringify({
          success: true,
          diagnosis,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Action inconnue',
        available_actions: ['test_simple']
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erreur:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})