import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
}

interface APITestResponse {
  success: boolean
  statistics: {
    total_pages: number
    oic_pages_found: number
    api_accessible: boolean
    timestamp: string
  }
  error?: string
}

Deno.serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Test de connectivité API LiSA démarré')
    
    const body = await req.json().catch(() => ({}))
    console.log('📥 Body reçu:', body)

    // Test simple d'accès à l'API LiSA
    const baseUrl = 'https://livret.uness.fr/lisa/2025'
    
    console.log('🔍 Test d\'accès à l\'API MediaWiki...')
    
    // Test 1: API MediaWiki de base
    const apiUrl = `${baseUrl}/api.php?action=query&meta=siteinfo&format=json`
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'MED-MNG-Test/1.0'
      }
    })
    
    console.log(`📡 Réponse API MediaWiki: ${apiResponse.status}`)
    
    if (!apiResponse.ok) {
      throw new Error(`API MediaWiki inaccessible: ${apiResponse.status}`)
    }

    const apiData = await apiResponse.json()
    console.log('✅ API MediaWiki accessible')

    // Test 2: Catégorie des objectifs
    const categoryUrl = `${baseUrl}/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=10&format=json`
    const categoryResponse = await fetch(categoryUrl, {
      headers: {
        'User-Agent': 'MED-MNG-Test/1.0'
      }
    })

    console.log(`📋 Réponse catégorie: ${categoryResponse.status}`)

    let oicPagesFound = 0
    if (categoryResponse.ok) {
      const categoryData = await categoryResponse.json()
      const members = categoryData.query?.categorymembers || []
      oicPagesFound = members.length
      console.log(`🎯 Pages OIC trouvées: ${oicPagesFound}`)
      
      if (members.length > 0) {
        console.log(`📄 Exemple: ${members[0]?.title}`)
      }
    }

    // Réponse de succès
    const response: APITestResponse = {
      success: true,
      statistics: {
        total_pages: oicPagesFound,
        oic_pages_found: oicPagesFound,
        api_accessible: true,
        timestamp: new Date().toISOString()
      }
    }

    console.log('✅ Test terminé avec succès:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('❌ Erreur dans le test:', error)
    
    const errorResponse: APITestResponse = {
      success: false,
      statistics: {
        total_pages: 0,
        oic_pages_found: 0,
        api_accessible: false,
        timestamp: new Date().toISOString()
      },
      error: error.message
    }

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})