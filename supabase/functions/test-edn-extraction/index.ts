import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { loginWithCAS, testCASConnectivity } from '../lib/casLogin.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🧪 Test extraction EDN - Validation CAS')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const email = Deno.env.get('UNESS_EMAIL')
    const password = Deno.env.get('UNESS_PASSWORD')
    
    if (!email || !password) {
      throw new Error('Secrets UNESS_EMAIL et UNESS_PASSWORD requis')
    }

    console.log(`👤 Test avec compte: ${email.substring(0, 3)}***`)
    
    // Test 1: Connectivité de base
    console.log('🔍 Test 1: Connectivité Cockpit UNESS...')
    const connectivityTest = await testCASConnectivity()
    console.log(`Connectivité: ${connectivityTest.success ? '✅' : '❌'} ${connectivityTest.message}`)
    
    if (!connectivityTest.success) {
      throw new Error(`Échec connectivité: ${connectivityTest.message}`)
    }
    
    // Test 2: Authentification CAS complète
    console.log('🔐 Test 2: Authentification CAS...')
    const authResult = await loginWithCAS({
      email,
      password,
      debug: true
    })
    
    if (!authResult.success) {
      throw new Error(`Échec authentification: ${authResult.error}`)
    }
    
    console.log('✅ Authentification CAS réussie')
    
    // Test 3: Accès aux items LiSA
    console.log('📚 Test 3: Accès items LiSA...')
    const testResults = await testLisaItemAccess(authResult.cookieJar!)
    
    console.log(`Items testés: ${testResults.totalTested}`)
    console.log(`Items accessibles: ${testResults.accessible}`)
    console.log(`Items avec contenu: ${testResults.withContent}`)
    
    // Test 4: Sauvegarde test en base
    console.log('💾 Test 4: Sauvegarde en base...')
    const saveResults = await testDatabaseSave(supabase, testResults.sampleItems)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tests CAS et extraction terminés avec succès',
        results: {
          connectivity: connectivityTest,
          authentication: { success: true },
          itemAccess: testResults,
          database: saveResults
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erreur test:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function testLisaItemAccess(cookieJar: any) {
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  const testItems = [1, 2, 3]
  const results = {
    totalTested: 0,
    accessible: 0,
    withContent: 0,
    sampleItems: [] as any[]
  }
  
  for (const itemId of testItems) {
    try {
      console.log(`🔍 Test item ${itemId}...`)
      
      const url = `https://livret.uness.fr/lisa/2025/Item_${itemId}?printable=yes`
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Cookie': cookieJar.toString(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      })
      
      results.totalTested++
      
      if (response.ok) {
        const html = await response.text()
        
        // Vérifier qu'on n'est pas sur la page de login
        if (!html.includes('Veuillez saisir votre adresse e-mail') && 
            !html.includes('authentification')) {
          
          results.accessible++
          
          // Extraire le titre
          const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                            html.match(/<title[^>]*>([^<]+)<\/title>/i)
          const title = titleMatch ? titleMatch[1].trim() : `Item ${itemId}`
          
          // Vérifier s'il y a du contenu significatif
          if (html.length > 5000 && 
              (html.includes('Rang A') || html.includes('Rang B') || 
               html.includes('connaissance') || html.includes('objectif'))) {
            results.withContent++
          }
          
          results.sampleItems.push({
            item_id: itemId,
            title,
            hasContent: html.length > 5000,
            size: html.length
          })
          
          console.log(`✅ Item ${itemId}: ${title} (${html.length} chars)`)
        } else {
          console.log(`❌ Item ${itemId}: Page de login détectée`)
        }
      } else {
        console.log(`❌ Item ${itemId}: HTTP ${response.status}`)
      }
      
    } catch (error) {
      console.error(`❌ Erreur item ${itemId}:`, error.message)
    }
    
    // Petite pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  return results
}

async function testDatabaseSave(supabase: any, sampleItems: any[]) {
  try {
    if (sampleItems.length === 0) {
      return { success: false, message: 'Aucun item à sauvegarder' }
    }
    
    // Tenter de sauvegarder un item de test
    const testItem = sampleItems[0]
    
    const { error } = await supabase
      .from('edn_items_uness')
      .upsert({
        item_id: testItem.item_id,
        intitule: `TEST - ${testItem.title}`,
        contenu_complet_html: `<p>Test content for item ${testItem.item_id}</p>`,
        rangs_a: ['Test rang A content'],
        rangs_b: ['Test rang B content'],
        html_raw: `<html><body>Test HTML for item ${testItem.item_id}</body></html>`,
        date_import: new Date().toISOString()
      }, {
        onConflict: 'item_id',
        ignoreDuplicates: false
      })
    
    if (error) {
      return { success: false, message: error.message }
    }
    
    return { 
      success: true, 
      message: `Item test ${testItem.item_id} sauvegardé avec succès`
    }
    
  } catch (error) {
    return { 
      success: false, 
      message: error.message 
    }
  }
}