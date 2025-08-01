import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { casLogin } from '../lib/casLogin.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer les credentials CAS
    const casUsername = Deno.env.get('CAS_USERNAME')
    const casPassword = Deno.env.get('CAS_PASSWORD')
    
    if (!casUsername || !casPassword) {
      throw new Error('CAS_USERNAME et CAS_PASSWORD doivent être configurés')
    }
    
    console.log(`🔐 Test authentification CAS pour: ${casUsername}`)
    
    // Test de la fonction casLogin améliorée
    const authResult = await casLogin(casUsername, casPassword)
    
    console.log(`🔍 Résultat auth: success=${authResult.success}`)
    if (authResult.debugInfo) {
      console.log(`📊 Debug info:`, JSON.stringify(authResult.debugInfo, null, 2))
    }
    
    if (!authResult.success) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: authResult.error,
          debugInfo: authResult.debugInfo
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }
    
    // Test d'appel API avec les cookies
    console.log('🧪 Test API OIC avec cookies...')
    const apiUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Cat%C3%A9gorie:Objectif_de_connaissance&cmlimit=10&format=json'
    
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'Cookie': authResult.cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const apiData = await apiResponse.json()
    console.log(`📡 API status: ${apiResponse.status}`)
    console.log(`📊 API data:`, JSON.stringify(apiData, null, 2))
    
    const oicPages = apiData.query?.categorymembers || []
    
    return new Response(
      JSON.stringify({ 
        success: true,
        auth: {
          cookiesLength: authResult.cookies?.length || 0,
          debugInfo: authResult.debugInfo
        },
        api: {
          status: apiResponse.status,
          pagesFound: oicPages.length,
          samplePages: oicPages.slice(0, 3).map((p: any) => p.title)
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('💥 Erreur test CAS:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})