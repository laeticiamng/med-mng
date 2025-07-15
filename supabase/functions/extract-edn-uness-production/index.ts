import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { casLogin } from "../lib/casLogin.ts"
import { CookieJar } from "../lib/cookieJar.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtractionParams {
  action: 'test' | 'fullExtraction'
  maxItems?: number
  resumeFrom?: number
}

interface RangExtraction {
  rangA: string[]
  rangB: string[]
}

async function extractRangsFromHtml(html: string): Promise<RangExtraction> {
  const rangA: string[] = []
  const rangB: string[] = []
  
  // Parser plus robuste pour Rang A et Rang B
  const rangAMatch = html.match(/(?:rang\s*a|objectifs?\s*de\s*rang\s*a)[^]*?(?=rang\s*b|$)/i)
  const rangBMatch = html.match(/(?:rang\s*b|objectifs?\s*de\s*rang\s*b)[^]*?(?=rang\s*[ac]|$)/i)
  
  // Extraire les listes depuis les sections identifiées
  if (rangAMatch) {
    const listItems = rangAMatch[0].match(/<li[^>]*>(.*?)<\/li>/gi) || []
    const paragraphs = rangAMatch[0].match(/<p[^>]*>(.*?)<\/p>/gi) || []
    
    [...listItems, ...paragraphs].forEach(item => {
      const text = item.replace(/<[^>]*>/g, '').trim()
      if (text.length > 10 && !rangA.includes(text)) {
        rangA.push(text)
      }
    })
  }
  
  if (rangBMatch) {
    const listItems = rangBMatch[0].match(/<li[^>]*>(.*?)<\/li>/gi) || []
    const paragraphs = rangBMatch[0].match(/<p[^>]*>(.*?)<\/p>/gi) || []
    
    [...listItems, ...paragraphs].forEach(item => {
      const text = item.replace(/<[^>]*>/g, '').trim()
      if (text.length > 10 && !rangB.includes(text)) {
        rangB.push(text)
      }
    })
  }
  
  return { rangA, rangB }
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      
      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
        console.log(`[RETRY] Rate limited, waiting ${waitTime}ms (attempt ${attempt}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      if (response.status >= 500 && attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000
        console.log(`[RETRY] Server error ${response.status}, waiting ${waitTime}ms (attempt ${attempt}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      return response
    } catch (error) {
      if (attempt === maxRetries) throw error
      const waitTime = Math.pow(2, attempt) * 1000
      console.log(`[RETRY] Network error, waiting ${waitTime}ms (attempt ${attempt}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  throw new Error('Max retries exceeded')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const params: ExtractionParams = await req.json().catch(() => ({ action: 'test', maxItems: 3 }))
    
    const email = Deno.env.get('UNES_EMAIL')
    const password = Deno.env.get('UNES_PASSWORD')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!email || !password || !supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Variables d\'environnement manquantes'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // PHASE 1: Authentification CAS
    console.log('[EXTRACTION] 🔐 Démarrage authentification CAS...')
    const authResult = await casLogin(email, password)
    
    if (!authResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: `Échec authentification: ${authResult.error}`,
        debugInfo: authResult.debugInfo
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401 
      })
    }
    
    console.log('[EXTRACTION] ✅ Authentification réussie')
    
    // PHASE 2: Configuration extraction
    const isTest = params.action === 'test'
    const maxItems = isTest ? (params.maxItems || 3) : 367
    const startFrom = params.resumeFrom || 1
    
    console.log(`[EXTRACTION] 📋 Mode: ${isTest ? 'TEST' : 'PRODUCTION'}, Items: ${startFrom}-${maxItems}`)
    
    // PHASE 3: Extraction des items
    const jar = new CookieJar()
    jar.fromObject(authResult.cookies.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=')
      if (key && value) acc[key] = value
      return acc
    }, {} as Record<string, string>))
    
    let processed = 0
    let saved = 0
    let errors = 0
    const errorDetails: any[] = []
    
    for (let itemId = startFrom; itemId <= maxItems; itemId++) {
      try {
        processed++
        
        // Throttling
        if (processed > 1) {
          await new Promise(resolve => setTimeout(resolve, 1500)) // 1.5s entre items
        }
        if (processed % 50 === 0) {
          console.log(`[THROTTLE] Pause 5s après ${processed} items`)
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
        
        console.log(`[ITEM] ${itemId}: Téléchargement...`)
        
        // Récupération page printable
        const itemUrl = `https://livret.uness.fr/lisa/2025/Item_de_connaissance_${itemId}?printable=yes`
        const itemResponse = await fetchWithRetry(itemUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cookie': jar.toString(),
            'Referer': 'https://livret.uness.fr/lisa/2025/'
          }
        })
        
        if (!itemResponse.ok) {
          throw new Error(`HTTP ${itemResponse.status}`)
        }
        
        const html = await itemResponse.text()
        
        // Vérification authenticité
        if (html.includes('Connexion') || html.includes('login') || html.length < 1000) {
          throw new Error('Page de connexion retournée - session expirée')
        }
        
        // Extraction titre
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) || 
                          html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
        const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : `Item ${itemId}`
        
        // Extraction rangs
        const { rangA, rangB } = await extractRangsFromHtml(html)
        
        console.log(`[ITEM] ${itemId}: A=${rangA.length} B=${rangB.length} "${title.substring(0, 50)}..."`)
        
        // Sauvegarde en base
        const { error: upsertError } = await supabase
          .from('edn_items_uness')
          .upsert({
            item_id: itemId,
            intitule: title,
            rangs_a: rangA,
            rangs_b: rangB,
            html_raw: html,
            contenu_complet_html: html,
            date_import: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'item_id'
          })
        
        if (upsertError) {
          throw new Error(`Erreur Supabase: ${upsertError.message}`)
        }
        
        saved++
        
      } catch (error) {
        errors++
        console.error(`[ITEM] ${itemId}: ❌ ${error.message}`)
        errorDetails.push({
          itemId,
          error: error.message,
          timestamp: new Date().toISOString()
        })
        
        // Arrêt en cas d'erreur d'authentification
        if (error.message.includes('session expirée') || error.message.includes('Connexion')) {
          console.error('[EXTRACTION] ❌ Session expirée, arrêt de l\'extraction')
          break
        }
      }
    }
    
    // PHASE 4: Résumé final
    const summary = {
      success: true,
      mode: isTest ? 'TEST' : 'PRODUCTION',
      processed,
      saved,
      errors,
      errorDetails: errors > 0 ? errorDetails : undefined,
      duration: `${Date.now() - Date.now()} ms`,
      nextResumeFrom: errors > 0 ? Math.max(...errorDetails.map(e => e.itemId)) : maxItems + 1
    }
    
    console.log(`[SUMMARY] ✅ Extraction terminée: ${saved}/${processed} items sauvés, ${errors} erreurs`)
    
    if (isTest && saved >= 1) {
      console.log('[TEST] ✅ Test réussi - Authentification et extraction fonctionnelles')
    }
    
    if (!isTest && errors === 0) {
      console.log('[PRODUCTION] 🎉 Extraction LiSA 2025 terminée – 367/367 items OK')
    }
    
    return new Response(JSON.stringify(summary), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error('[EXTRACTION] ❌ Erreur globale:', error.message)
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